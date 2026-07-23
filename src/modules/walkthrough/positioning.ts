import type {
  WalkthroughDesktopPosition,
  WalkthroughMobileDock,
  WalkthroughPlacement,
} from "./types"

export interface CoachmarkLayout {
  left: number
  top: number
  side: WalkthroughPlacement
  tailOffset: number
  width: number
}

const GAP = 14
const VIEWPORT_MARGIN = 16
const DESKTOP_WIDTH = 380
const MIN_SIDE_WIDTH = 280

export interface CoachmarkLayoutOptions {
  mobileDock?: WalkthroughMobileDock
  desktopPosition?: WalkthroughDesktopPosition
}

function cardWidth(
  anchor: DOMRect,
  preferred: WalkthroughPlacement,
  viewportWidth: number,
): number {
  const viewportWidthLimit = Math.max(0, viewportWidth - VIEWPORT_MARGIN * 2)
  const maximum = Math.min(DESKTOP_WIDTH, viewportWidthLimit)
  if (viewportWidth < 1024 || (preferred !== "left" && preferred !== "right")) return maximum

  const spaceOnLeft = anchor.left - GAP - VIEWPORT_MARGIN
  const spaceOnRight = viewportWidth - anchor.right - GAP - VIEWPORT_MARGIN
  const availableSideWidth = Math.max(spaceOnLeft, spaceOnRight)
  return availableSideWidth >= MIN_SIDE_WIDTH ? Math.min(maximum, availableSideWidth) : maximum
}

function opposite(side: WalkthroughPlacement): WalkthroughPlacement {
  if (side === "top") return "bottom"
  if (side === "bottom") return "top"
  if (side === "left") return "right"
  return "left"
}

function positionFor(
  anchor: DOMRect,
  side: WalkthroughPlacement,
  width: number,
  height: number,
): { left: number; top: number } {
  const centerX = anchor.left + anchor.width / 2
  const centerY = anchor.top + anchor.height / 2
  switch (side) {
    case "top":
      return { left: centerX - width / 2, top: anchor.top - GAP - height }
    case "bottom":
      return { left: centerX - width / 2, top: anchor.bottom + GAP }
    case "left":
      return { left: anchor.left - GAP - width, top: centerY - height / 2 }
    case "right":
      return { left: anchor.right + GAP, top: centerY - height / 2 }
  }
}

function fits(
  position: { left: number; top: number },
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
): boolean {
  return (
    position.left >= VIEWPORT_MARGIN &&
    position.top >= VIEWPORT_MARGIN &&
    position.left + width <= viewportWidth - VIEWPORT_MARGIN &&
    position.top + height <= viewportHeight - VIEWPORT_MARGIN
  )
}

export function computeCoachmarkLayout(
  anchor: DOMRect,
  preferred: WalkthroughPlacement,
  cardHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  options: CoachmarkLayoutOptions = {},
): CoachmarkLayout {
  const width = cardWidth(anchor, preferred, viewportWidth)
  const mobile = viewportWidth < 1024
  if (mobile && options.mobileDock === "bottom") {
    return {
      left: Math.max(VIEWPORT_MARGIN, (viewportWidth - width) / 2),
      top: Math.max(VIEWPORT_MARGIN, viewportHeight - cardHeight - VIEWPORT_MARGIN),
      side: "bottom",
      tailOffset: 32,
      width,
    }
  }
  if (mobile && options.mobileDock === "above-target") {
    const left = Math.max(VIEWPORT_MARGIN, (viewportWidth - width) / 2)
    const top = Math.max(VIEWPORT_MARGIN, anchor.top - GAP - cardHeight)
    const anchorCenterX = anchor.left + anchor.width / 2
    const tailOffset = Math.min(Math.max(anchorCenterX - left, 24), width - 24)
    return { left, top, side: "top", tailOffset, width }
  }
  if (!mobile && options.desktopPosition) {
    const maxLeft = Math.max(VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN)
    const maxTop = Math.max(VIEWPORT_MARGIN, viewportHeight - cardHeight - VIEWPORT_MARGIN)
    const left = Math.min(Math.max(options.desktopPosition.left, VIEWPORT_MARGIN), maxLeft)
    const top = Math.min(Math.max(options.desktopPosition.top, VIEWPORT_MARGIN), maxTop)
    const anchorCenterX = anchor.left + anchor.width / 2
    const anchorCenterY = anchor.top + anchor.height / 2
    const tailOffset =
      preferred === "top" || preferred === "bottom"
        ? Math.min(Math.max(anchorCenterX - left, 24), width - 24)
        : Math.min(Math.max(anchorCenterY - top, 24), cardHeight - 24)
    return { left, top, side: preferred, tailOffset, width }
  }
  const candidates: WalkthroughPlacement[] = mobile
    ? [preferred, "top", "bottom", opposite(preferred)]
    : [preferred, opposite(preferred), "bottom", "top", "right", "left"]

  let side = candidates[0]
  let position = positionFor(anchor, side, width, cardHeight)
  for (const candidate of [...new Set(candidates)]) {
    const next = positionFor(anchor, candidate, width, cardHeight)
    if (fits(next, width, cardHeight, viewportWidth, viewportHeight)) {
      side = candidate
      position = next
      break
    }
  }

  const maxLeft = Math.max(VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN)
  const maxTop = Math.max(VIEWPORT_MARGIN, viewportHeight - cardHeight - VIEWPORT_MARGIN)
  const left = Math.min(Math.max(position.left, VIEWPORT_MARGIN), maxLeft)
  const top = Math.min(Math.max(position.top, VIEWPORT_MARGIN), maxTop)
  const anchorCenterX = anchor.left + anchor.width / 2
  const anchorCenterY = anchor.top + anchor.height / 2
  const tailOffset =
    side === "top" || side === "bottom"
      ? Math.min(Math.max(anchorCenterX - left, 24), width - 24)
      : Math.min(Math.max(anchorCenterY - top, 24), cardHeight - 24)

  return { left, top, side, tailOffset, width }
}
