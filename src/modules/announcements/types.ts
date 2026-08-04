// Content model for the announcement system. `releases.json` is the single
// source of truth; these types describe it and the surfaces derived from it.

export type ReleaseTemplate = "single" | "multi"

export interface DeltaTourStep {
  anchor: string
  text: string
}

export interface ReleaseFeature {
  /** Stable feature key. Supersession is scoped to this key. */
  key: string
  /** The feature's own page, where its banner renders and its tour runs. */
  route: string
  /** Presentation for the What's New modal / walkthrough card. Set on features that own a walkthrough. */
  label?: string
  title?: string
  description?: string
  banner?: string
  bannerRetiredAt?: string | null
  deltaTour?: DeltaTourStep[]
  /** Orientation tour for this feature. Newest release defining it wins (see `WALKTHROUGHS`). */
  walkthrough?: FeatureWalkthrough
}

/** A feature's orientation tour, authored inline in releases.json. */
export interface FeatureWalkthrough {
  version: string
  backdrop?: boolean
  steps: WalkthroughStep[]
}

export interface Release {
  id: string
  /** When the PM decided to announce (ISO 8601), not when code merged. */
  published_at: string
  /** Stops announcing with no successor. Keeps the changelog entry. */
  retired_at: string | null
  /** `false` = changelog only, never pushes. */
  announce: boolean
  template: ReleaseTemplate
  title: string
  body: string
  media?: string | null
  /** The permanent record shown on the changelog page. Authored independently of title/body. */
  changelog: string
  features: ReleaseFeature[]
}

export type ReleasesFile = readonly Release[]

/** User fields `resolve()` needs, read once per session from `GET /api/me`. */
export interface AnnouncementUser {
  created_at: string
  onboarding_complete: boolean
}

export interface ResolveResult {
  release?: Release
  showPill: boolean
  autoOpen: boolean
  dot: boolean
}

// ─── Walkthroughs (orientation & delta tours) ──────────────────────────────

export type WalkthroughId = "pickup-times" | "discounts" | "shipments"

export type WalkthroughStatus = "unseen" | "active" | "completed" | "dismissed"

export type WalkthroughPlacement = "top" | "bottom" | "left" | "right"
export type WalkthroughMobileDock = "bottom" | "above-target"

export interface WalkthroughDesktopPosition {
  left: number
  top: number
}

export type WalkthroughEvent =
  | "pickup-settings-saved"
  | "discount-create-opened"
  | "discount-targeting-opened"
  | "discount-created"
  | "discount-row-opened"
  | "shipment-row-opened"
  | "shipment-create-opened"
  | "shipment-created"
  | "shipment-success-done"

export type WalkthroughCommand =
  | "discount-next-form"
  | "discount-open-create"
  | "discount-submit-form"
  | "discount-open-row"

export interface WalkthroughHighlight {
  mode: "spotlight" | "outline" | "circle"
  color?: string
  width?: number
  padding?: number | Partial<Record<"top" | "right" | "bottom" | "left", number>>
  radius?: number | "target"
  mobile?: Partial<Omit<WalkthroughHighlight, "mobile">>
}

export interface WalkthroughStep {
  id: string
  route: string
  anchor: string
  fallbackAnchor?: string
  placement: WalkthroughPlacement
  mobileDock?: WalkthroughMobileDock
  desktopPosition?: WalkthroughDesktopPosition
  mobileStandalone?: boolean
  mobileHideTail?: boolean
  title: string
  body: string
  instruction?: string
  fallbackTitle?: string
  fallbackBody?: string
  highlight: WalkthroughHighlight
  advanceOn?: WalkthroughEvent
  nextCommand?: WalkthroughCommand
  hideNext?: boolean
  showBack?: boolean
}

export interface WalkthroughDefinition {
  id: WalkthroughId
  version: string
  label: string
  title: string
  description: string
  backdrop?: boolean
  steps: readonly WalkthroughStep[]
}

export interface WalkthroughProgress {
  version: string
  status: WalkthroughStatus
  stepIndex: number
  updatedAt: number
  context?: {
    createdDiscountUid?: string
  }
}

export interface WalkthroughFeature {
  id: WalkthroughId
  label: string
  title: string
  description: string
}

export interface AnchorTarget {
  element: HTMLElement
  rect: DOMRect
  usingFallback: boolean
}
