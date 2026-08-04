// Pure announcement logic: release-file validation and per-merchant resolution.
// No I/O — runs client-side against the bundled release list. Callers assume
// releases are ordered oldest → newest, which `parseReleasesFile` enforces.

import type {
  AnnouncementUser,
  Release,
  ReleaseFeature,
  ReleaseTemplate,
  ResolveResult,
} from "./types"

// Defined here (with `resolve`, their only consumer) and re-exported from
// `constants.ts` to avoid an import cycle.
/** A release stops being the active push surface 30 days after publish. */
export const PUSH_WINDOW = 30 * 864e5
/** Banner lifespan: 60 days from publish. */
export const BANNER_WINDOW = 60 * 864e5

// Structural shape of a release from a JSON import (string literals widen to
// `string`); typing `parseReleasesFile`'s param as this makes `vue-tsc` catch
// structural drift at build time.
type Padding = number | Partial<Record<"top" | "right" | "bottom" | "left", number>>

interface RawHighlight {
  mode: string
  color?: string
  width?: number
  padding?: Padding
  radius?: number | string
  mobile?: {
    mode?: string
    color?: string
    width?: number
    padding?: Padding
    radius?: number | string
  }
}

interface RawWalkthroughStep {
  id: string
  route: string
  anchor: string
  fallbackAnchor?: string
  placement: string
  mobileDock?: string
  desktopPosition?: { left: number; top: number }
  mobileStandalone?: boolean
  mobileHideTail?: boolean
  title: string
  body: string
  instruction?: string
  fallbackTitle?: string
  fallbackBody?: string
  highlight: RawHighlight
  advanceOn?: string
  nextCommand?: string
  hideNext?: boolean
  showBack?: boolean
}

export interface RawReleaseFeature {
  key: string
  route: string
  label?: string
  title?: string
  description?: string
  banner?: string
  bannerRetiredAt?: string | null
  deltaTour?: { anchor: string; text: string }[]
  walkthrough?: { version: string; backdrop?: boolean; steps: RawWalkthroughStep[] }
}

export interface RawRelease {
  id: string
  published_at: string
  retired_at: string | null
  announce: boolean
  template: string
  title: string
  body: string
  media?: string | null
  changelog: string
  features: RawReleaseFeature[]
}

const TEMPLATES: readonly ReleaseTemplate[] = ["single", "multi"]
const PLACEMENTS = ["top", "bottom", "left", "right"] as const
const HIGHLIGHT_MODES = ["spotlight", "outline", "circle"] as const

function fail(id: string, message: string): never {
  throw new Error(`releases.json: release "${id}" ${message}`)
}

function assertIso(id: string, field: string, value: string): void {
  if (Number.isNaN(Date.parse(value))) fail(id, `has an invalid ISO date in "${field}": ${value}`)
}

function validateWalkthrough(
  id: string,
  key: string,
  w: NonNullable<RawReleaseFeature["walkthrough"]>,
): void {
  if (!w.version) fail(id, `has a walkthrough on feature "${key}" with no version`)
  if (!Array.isArray(w.steps) || w.steps.length === 0) {
    fail(id, `has a walkthrough on feature "${key}" with no steps`)
  }
  const seen = new Set<string>()
  for (const step of w.steps) {
    for (const field of ["id", "route", "anchor", "title", "body"] as const) {
      if (!step[field]) fail(id, `has a walkthrough step on feature "${key}" missing "${field}"`)
    }
    if (seen.has(step.anchor))
      fail(id, `has a duplicate walkthrough anchor "${step.anchor}" on feature "${key}"`)
    seen.add(step.anchor)
    if (!PLACEMENTS.includes(step.placement as (typeof PLACEMENTS)[number])) {
      fail(id, `has walkthrough step "${step.id}" with invalid placement "${step.placement}"`)
    }
    if (!HIGHLIGHT_MODES.includes(step.highlight?.mode as (typeof HIGHLIGHT_MODES)[number])) {
      fail(
        id,
        `has walkthrough step "${step.id}" with invalid highlight mode "${step.highlight?.mode}"`,
      )
    }
  }
}

/** Validate enums, dates, ordering and uniqueness; return the frozen, typed list. Throws on the first problem. */
export function parseReleasesFile(data: RawRelease[]): readonly Release[] {
  if (!Array.isArray(data)) throw new Error("releases.json: top level must be an array")

  const seen = new Set<string>()
  let prevPublished = -Infinity

  for (const r of data) {
    const id = r.id
    if (!id || typeof id !== "string") throw new Error("releases.json: a release is missing its id")
    if (seen.has(id)) fail(id, "is a duplicate id")
    seen.add(id)

    if (!TEMPLATES.includes(r.template as ReleaseTemplate)) {
      fail(id, `has an unknown template "${r.template}" (expected "single" or "multi")`)
    }
    if (typeof r.announce !== "boolean") fail(id, 'has a non-boolean "announce"')
    for (const field of ["title", "body", "changelog"] as const) {
      if (typeof r[field] !== "string" || r[field].length === 0) {
        fail(id, `has an empty or missing "${field}"`)
      }
    }

    assertIso(id, "published_at", r.published_at)
    if (r.retired_at !== null) assertIso(id, "retired_at", r.retired_at)

    const published = Date.parse(r.published_at)
    if (published < prevPublished) {
      fail(id, "is out of order — releases must be listed oldest to newest by published_at")
    }
    prevPublished = published

    if (!Array.isArray(r.features)) fail(id, 'has a non-array "features"')
    for (const f of r.features) {
      if (!f.key) fail(id, "has a feature with no key")
      if (!f.route) fail(id, `has feature "${f.key}" with no route`)
      if (f.bannerRetiredAt != null)
        assertIso(id, `features.${f.key}.bannerRetiredAt`, f.bannerRetiredAt)
      if (f.deltaTour !== undefined) {
        if (!Array.isArray(f.deltaTour)) fail(id, `has a non-array deltaTour on feature "${f.key}"`)
        for (const step of f.deltaTour) {
          if (!step.anchor || !step.text) {
            fail(id, `has a delta tour step on feature "${f.key}" missing anchor or text`)
          }
        }
      }
      if (f.walkthrough !== undefined) validateWalkthrough(id, f.key, f.walkthrough)
    }
  }

  return Object.freeze(data as readonly Release[])
}

/** The single active release (newest live one within the push window), or null. */
export function activeRelease(releases: readonly Release[], now: number): Release | null {
  const live = releases.filter((r) => r.announce && r.published_at && !r.retired_at)
  const newest = live.at(-1)
  if (!newest) return null
  return now - Date.parse(newest.published_at) < PUSH_WINDOW ? newest : null
}

/** Release-level push/pull state for one merchant. `announce: false` releases never appear. */
export function resolve(
  releases: readonly Release[],
  user: AnnouncementUser,
  flags: ReadonlySet<string>,
  now: number = Date.now(),
): ResolveResult {
  const active = activeRelease(releases, now)
  if (!active) return { showPill: false, autoOpen: false, dot: false }

  const isNew = Date.parse(active.published_at) > Date.parse(user.created_at)
  const unseen = !flags.has(`modal:${active.id}`)

  return {
    release: active,
    showPill: isNew,
    dot: isNew && unseen,
    // Onboarding holds the auto-open back; the pill still shows.
    autoOpen: isNew && unseen && user.onboarding_complete,
  }
}

/**
 * Whether a feature's banner renders for this merchant. Retires when: no banner;
 * release retired; `bannerRetiredAt` set; a newer release names the same key;
 * 60 days elapsed; merchant predates the release; banner dismissed or tour done.
 */
export function showBanner(
  release: Release,
  feature: ReleaseFeature,
  releases: readonly Release[],
  user: AnnouncementUser,
  flags: ReadonlySet<string>,
  now: number = Date.now(),
): boolean {
  if (!feature.banner || release.retired_at || feature.bannerRetiredAt) return false
  const pub = Date.parse(release.published_at)

  // Feature-scoped: a newer release naming this key retires the banner, this key only.
  const superseded = releases.some(
    (r) =>
      r.published_at &&
      Date.parse(r.published_at) > pub &&
      r.features.some((f) => f.key === feature.key),
  )

  return (
    !superseded &&
    now - pub < BANNER_WINDOW &&
    pub > Date.parse(user.created_at) &&
    !flags.has(`banner:${release.id}:${feature.key}`) &&
    !flags.has(`tour:${release.id}:${feature.key}`)
  )
}
