// Static data for the announcement system: time windows, the bundled release
// list, and the walkthrough registry — all derived from releases.json. Logic
// lives in `utils.ts`.

import releasesData from "./releases.json"
import { parseReleasesFile } from "./utils"
import type { Release, WalkthroughDefinition, WalkthroughFeature, WalkthroughId } from "./types"

// Defined in `utils.ts`; re-exported here so they read as constants without an import cycle.
export { PUSH_WINDOW, BANNER_WINDOW } from "./utils"

/** All releases ever published, ordered oldest → newest. */
export const RELEASES: readonly Release[] = parseReleasesFile(releasesData)

/** Every release, newest first, unfiltered — retired and `announce: false` included. */
export const CHANGELOG_RELEASES: readonly Release[] = [...RELEASES].reverse()

export const WALKTHROUGH_RELEASE_VERSION = "pickup-discounts-v1"

const WALKTHROUGH_IDS: readonly WalkthroughId[] = ["pickup-times", "discounts", "shipments"]

function isWalkthroughId(key: string): key is WalkthroughId {
  return (WALKTHROUGH_IDS as readonly string[]).includes(key)
}

// Orientation tours, sourced from the `walkthrough` block on release features.
// The newest release that defines a feature wins; throws at load if one is missing.
export const WALKTHROUGHS: Record<WalkthroughId, WalkthroughDefinition> = (() => {
  const map = {} as Record<WalkthroughId, WalkthroughDefinition>
  for (const release of RELEASES) {
    for (const f of release.features) {
      if (isWalkthroughId(f.key) && f.walkthrough && f.label && f.title && f.description) {
        map[f.key] = {
          id: f.key,
          label: f.label,
          title: f.title,
          description: f.description,
          version: f.walkthrough.version,
          backdrop: f.walkthrough.backdrop,
          steps: f.walkthrough.steps,
        }
      }
    }
  }
  for (const id of WALKTHROUGH_IDS) {
    if (!map[id]) throw new Error(`releases.json is missing the walkthrough for feature "${id}"`)
  }
  return map
})()

/** Feature cards for the What's New modal, projected from the derived walkthroughs. */
export const WALKTHROUGH_FEATURES: Record<WalkthroughId, WalkthroughFeature> = Object.fromEntries(
  WALKTHROUGH_IDS.map((id) => {
    const { label, title, description } = WALKTHROUGHS[id]
    return [id, { id, label, title, description }]
  }),
) as Record<WalkthroughId, WalkthroughFeature>

export function getWalkthrough(id: WalkthroughId): WalkthroughDefinition {
  return WALKTHROUGHS[id]
}
