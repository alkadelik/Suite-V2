import { createPinia, setActivePinia } from "pinia"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { activeRelease, parseReleasesFile, resolve, showBanner, type RawRelease } from "./utils"
import { RELEASES } from "./constants"
import type { AnnouncementUser, Release, ReleaseFeature } from "./types"

/** A complete release with sensible defaults; override only what a test cares about. */
function makeRelease(over: Partial<Release> & Pick<Release, "id" | "published_at">): Release {
  return {
    retired_at: null,
    announce: true,
    template: "single",
    title: "Title",
    body: "Body",
    changelog: "Changelog entry.",
    features: [],
    ...over,
  }
}

function feature(over: Partial<ReleaseFeature> & Pick<ReleaseFeature, "key">): ReleaseFeature {
  return { route: `/${over.key}`, banner: `${over.key} banner`, bannerRetiredAt: null, ...over }
}

// Worked example: shipping-v2 published 2 July; discounts 9 July 09:00; now 9 July 14:00.
describe("worked example — two releases, three merchants", () => {
  const NOW = Date.parse("2026-07-09T14:00:00Z")

  const shipping = feature({
    key: "shipping",
    route: "/settings/shipping",
    banner: "Shipping setup has changed",
  })
  const shippingV2 = makeRelease({
    id: "shipping-v2",
    published_at: "2026-07-02T16:00:00Z",
    title: "Faster shipping setup",
    changelog: "Shipping settings consolidated into a single screen.",
    features: [shipping],
  })
  const discounts = makeRelease({
    id: "discounts",
    published_at: "2026-07-09T09:00:00Z",
    title: "Create discounts in minutes",
    changelog: "Discounts and coupons added.",
    features: [feature({ key: "discounts", route: "/discounts", banner: "Discounts are here" })],
  })
  // Ordered oldest → newest, exactly as releases.json is authored.
  const releases: Release[] = [shippingV2, discounts]

  it("active = discounts; shipping's modal and pill are retired at 09:00", () => {
    const active = activeRelease(releases, NOW)
    expect(active?.id).toBe("discounts")
    // Shipping is superseded — it can never resolve as the active release again.
    expect(active?.id).not.toBe("shipping-v2")
  })

  it("shipping's banner is 7 days into its 60-day window and unaffected", () => {
    // Not superseded (discounts names 'discounts', not 'shipping'); still in window.
    const merchant: AnnouncementUser = {
      created_at: "2026-01-01T00:00:00Z",
      onboarding_complete: true,
    }
    expect(showBanner(shippingV2, shipping, releases, merchant, new Set(), NOW)).toBe(true)
  })

  it("Merchant A — joined 15 Jan, saw & dismissed shipping's modal", () => {
    const A: AnnouncementUser = { created_at: "2026-01-15T00:00:00Z", onboarding_complete: true }
    const flags = new Set(["modal:shipping-v2"])

    const r = resolve(releases, A, flags, NOW)
    // Discounts modal auto-opens.
    expect(r.release?.id).toBe("discounts")
    expect(r.autoOpen).toBe(true)
    expect(r.showPill).toBe(true)
    expect(r.dot).toBe(true)
    // Shipping banner on /settings/shipping.
    expect(showBanner(shippingV2, shipping, releases, A, flags, NOW)).toBe(true)
  })

  it("Merchant B — joined 1 May, was away, missed shipping's modal", () => {
    const B: AnnouncementUser = { created_at: "2026-05-01T00:00:00Z", onboarding_complete: true }
    const flags = new Set<string>()

    const r = resolve(releases, B, flags, NOW)
    // Discounts modal auto-opens.
    expect(r.release?.id).toBe("discounts")
    expect(r.autoOpen).toBe(true)
    // Shipping banner on /settings/shipping.
    expect(showBanner(shippingV2, shipping, releases, B, flags, NOW)).toBe(true)
    // Never sees shipping's modal again — only one release is ever active.
    expect(r.release?.id).not.toBe("shipping-v2")
  })

  it("Merchant C — new, joined 9 Jul 11:00: nothing", () => {
    const C: AnnouncementUser = { created_at: "2026-07-09T11:00:00Z", onboarding_complete: true }
    const flags = new Set<string>()

    const r = resolve(releases, C, flags, NOW)
    // No modal, no pill.
    expect(r.showPill).toBe(false)
    expect(r.autoOpen).toBe(false)
    expect(r.dot).toBe(false)
    // No banner — the release predates nothing for C; C predates the release.
    expect(showBanner(shippingV2, shipping, releases, C, flags, NOW)).toBe(false)
    expect(showBanner(discounts, discounts.features[0], releases, C, flags, NOW)).toBe(false)
  })
})

// ─── Acceptance criteria ───────────────────────────────────────────────────
describe("eligibility gates", () => {
  const NOW = Date.parse("2026-07-09T14:00:00Z")

  it("a release older than a merchant's created_at produces no push surfaces", () => {
    const rel = makeRelease({
      id: "rel",
      published_at: "2026-07-02T00:00:00Z",
      features: [feature({ key: "x" })],
    })
    // Joined the day AFTER the release published.
    const late: AnnouncementUser = { created_at: "2026-07-03T00:00:00Z", onboarding_complete: true }

    const r = resolve([rel], late, new Set(), NOW)
    expect(r.showPill).toBe(false)
    expect(r.dot).toBe(false)
    expect(r.autoOpen).toBe(false)
    expect(showBanner(rel, rel.features[0], [rel], late, new Set(), NOW)).toBe(false)
  })

  it("onboarding_complete holds the auto-open back but not the pill", () => {
    const rel = makeRelease({ id: "rel", published_at: "2026-07-02T00:00:00Z" })
    const setting: AnnouncementUser = {
      created_at: "2026-07-01T00:00:00Z",
      onboarding_complete: false,
    }

    const r = resolve([rel], setting, new Set(), NOW)
    expect(r.showPill).toBe(true)
    expect(r.dot).toBe(true)
    expect(r.autoOpen).toBe(false)
  })
})

describe("supersession is the retirement mechanism", () => {
  const NOW = Date.parse("2026-07-09T14:00:00Z")
  const older = makeRelease({ id: "older", published_at: "2026-07-02T16:00:00Z" })
  const newer = makeRelease({ id: "newer", published_at: "2026-07-09T09:00:00Z" })
  const user: AnnouncementUser = { created_at: "2026-01-01T00:00:00Z", onboarding_complete: true }

  it("publishing a newer release makes the older one's modal and pill resolve to nothing", () => {
    expect(activeRelease([older], NOW)?.id).toBe("older")
    // Publishing 'newer' flips the active release with no state change anywhere.
    expect(activeRelease([older, newer], NOW)?.id).toBe("newer")
  })

  it("resolving writes no flags and mutates no input", () => {
    const flags = new Set(["modal:older"])
    resolve([older, newer], user, flags, NOW)
    // Pure: the flag set is untouched — supersession needs no cron, flag, or archive step.
    expect(flags.size).toBe(1)
    expect([...flags]).toEqual(["modal:older"])
  })
})

describe("feature-scoped banner supersession", () => {
  const NOW = Date.parse("2026-07-09T14:00:00Z")
  const user: AnnouncementUser = { created_at: "2026-01-01T00:00:00Z", onboarding_complete: true }

  it("a newer release naming X retires the older banner for X, and only for X", () => {
    const shipping = feature({ key: "shipping" })
    const labels = feature({ key: "labels" })
    const older = makeRelease({
      id: "older",
      published_at: "2026-07-02T00:00:00Z",
      features: [shipping, labels],
    })
    // A newer release names only 'shipping'.
    const newer = makeRelease({
      id: "newer",
      published_at: "2026-07-05T00:00:00Z",
      features: [feature({ key: "shipping" })],
    })
    const releases = [older, newer]

    // Shipping banner on the older release is superseded…
    expect(showBanner(older, shipping, releases, user, new Set(), NOW)).toBe(false)
    // …but the sibling 'labels' banner in the same release is untouched.
    expect(showBanner(older, labels, releases, user, new Set(), NOW)).toBe(true)
  })

  it("a dismissal or a completed tour retires the banner", () => {
    const shipping = feature({ key: "shipping" })
    const rel = makeRelease({
      id: "rel",
      published_at: "2026-07-02T00:00:00Z",
      features: [shipping],
    })

    expect(showBanner(rel, shipping, [rel], user, new Set(["banner:rel:shipping"]), NOW)).toBe(
      false,
    )
    expect(showBanner(rel, shipping, [rel], user, new Set(["tour:rel:shipping"]), NOW)).toBe(false)
  })

  it("bannerRetiredAt takes one banner down without touching the release", () => {
    const retired = feature({ key: "a", bannerRetiredAt: "2026-07-08T00:00:00Z" })
    const sibling = feature({ key: "b" })
    const rel = makeRelease({
      id: "rel",
      published_at: "2026-07-02T00:00:00Z",
      features: [retired, sibling],
    })
    expect(showBanner(rel, retired, [rel], user, new Set(), NOW)).toBe(false)
    expect(showBanner(rel, sibling, [rel], user, new Set(), NOW)).toBe(true)
    // Modal/pill are unaffected.
    expect(resolve([rel], user, new Set(), NOW).showPill).toBe(true)
  })
})

describe("retire_at kills every push surface but not the changelog", () => {
  const NOW = Date.parse("2026-07-09T14:00:00Z")
  const user: AnnouncementUser = { created_at: "2026-01-01T00:00:00Z", onboarding_complete: true }

  it("a retired release resolves to nothing and shows no banner", () => {
    const rel = makeRelease({
      id: "rel",
      published_at: "2026-07-02T00:00:00Z",
      retired_at: "2026-07-08T00:00:00Z",
      features: [feature({ key: "x" })],
    })
    expect(activeRelease([rel], NOW)).toBeNull()
    expect(resolve([rel], user, new Set(), NOW).showPill).toBe(false)
    expect(showBanner(rel, rel.features[0], [rel], user, new Set(), NOW)).toBe(false)
  })
})

describe("announce: false never pushes", () => {
  const NOW = Date.parse("2026-07-09T14:00:00Z")
  const user: AnnouncementUser = { created_at: "2026-01-01T00:00:00Z", onboarding_complete: true }

  it("an announce:false release is never the resolved release", () => {
    const quiet = makeRelease({
      id: "quiet",
      published_at: "2026-07-09T09:00:00Z",
      announce: false,
    })
    const loud = makeRelease({ id: "loud", published_at: "2026-07-02T16:00:00Z" })
    // Even though 'quiet' is newer, it can never be active.
    const active = activeRelease([loud, quiet], NOW)
    expect(active?.id).toBe("loud")
    expect(active?.announce).toBe(true)

    const r = resolve([loud, quiet], user, new Set(), NOW)
    expect(r.release?.id).not.toBe("quiet")
  })

  it("a file of only announce:false releases produces no active release", () => {
    const quiet = makeRelease({
      id: "quiet",
      published_at: "2026-07-09T09:00:00Z",
      announce: false,
    })
    expect(activeRelease([quiet], NOW)).toBeNull()
    expect(resolve([quiet], user, new Set(), NOW)).toEqual({
      showPill: false,
      autoOpen: false,
      dot: false,
    })
  })
})

// ─── Bundled file validation ─────────────────
describe("releases.json", () => {
  it("loads, validates, and is ordered oldest → newest", () => {
    // RELEASES is the parsed file; importing it would have thrown if invalid.
    const times = RELEASES.map((r) => Date.parse(r.published_at))
    const sorted = [...times].sort((a, b) => a - b)
    expect(times).toEqual(sorted)
    expect(new Set(RELEASES.map((r) => r.id)).size).toBe(RELEASES.length)
  })

  it("rejects an unknown template", () => {
    const bad = [{ ...baseRaw("x"), template: "carousel" }]
    expect(() => parseReleasesFile(bad)).toThrow(/unknown template/)
  })

  it("rejects an out-of-order file", () => {
    const bad = [baseRaw("a", "2026-07-09T00:00:00Z"), baseRaw("b", "2026-07-02T00:00:00Z")]
    expect(() => parseReleasesFile(bad)).toThrow(/out of order/)
  })

  it("rejects duplicate ids", () => {
    const bad = [baseRaw("dup", "2026-07-02T00:00:00Z"), baseRaw("dup", "2026-07-03T00:00:00Z")]
    expect(() => parseReleasesFile(bad)).toThrow(/duplicate/)
  })

  it("rejects an invalid date", () => {
    expect(() => parseReleasesFile([{ ...baseRaw("x"), published_at: "not-a-date" }])).toThrow(
      /invalid ISO date/,
    )
  })
})

function baseRaw(id: string, published_at = "2026-07-02T00:00:00Z"): RawRelease {
  return {
    id,
    published_at,
    retired_at: null,
    announce: true,
    template: "single",
    title: "t",
    body: "b",
    changelog: "c",
    features: [],
  }
}

// ─── setFlag: immediate local state, idempotent ────────────────────
const postFlag = vi.fn<(key: string) => Promise<void>>()
const fetchMe = vi.fn()
vi.mock("./api", () => ({
  postFlag: (key: string) => postFlag(key),
  fetchMe: () => fetchMe(),
}))

describe("setFlag", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postFlag.mockReset().mockResolvedValue(undefined)
    fetchMe.mockReset()
  })

  it("updates local state immediately, with no refetch", async () => {
    const { useAnnouncementsStore } = await import("./store")
    const store = useAnnouncementsStore()

    await store.setFlag("modal:discounts-v1")

    expect(store.flags.has("modal:discounts-v1")).toBe(true)
    expect(postFlag).toHaveBeenCalledTimes(1)
    // Local state came from the write path, never from re-reading /api/me.
    expect(fetchMe).not.toHaveBeenCalled()
  })

  it("is harmless when called twice — one write, one flag", async () => {
    const { useAnnouncementsStore } = await import("./store")
    const store = useAnnouncementsStore()

    await store.setFlag("banner:discounts-v1:discounts")
    await store.setFlag("banner:discounts-v1:discounts")

    expect(postFlag).toHaveBeenCalledTimes(1)
    expect([...store.flags]).toEqual(["banner:discounts-v1:discounts"])
  })
})
