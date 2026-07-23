export type WalkthroughId = "pickup-times" | "discounts"

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

export type WalkthroughCommand = "discount-next-form"

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
