import type { DriveStep, Popover, Side } from "driver.js"
import type { WalkthroughDefinition, WalkthroughProgress, WalkthroughStep } from "./types"

const MOBILE_BREAKPOINT = 1024

export function isMobileViewport(width: number = window.innerWidth): boolean {
  return width < MOBILE_BREAKPOINT
}

function escapeSelectorValue(value: string): string {
  return typeof CSS !== "undefined" && CSS.escape
    ? CSS.escape(value)
    : value.replace(/["\\]/g, "\\$&")
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Resolve the DOM selector for a step anchor, handling the discount-row UID case. */
export function selectorForAnchor(anchor: string, progress?: WalkthroughProgress | null): string {
  if (anchor === "discount-row" && progress?.context?.createdDiscountUid) {
    return `[data-walkthrough-discount-row="${escapeSelectorValue(progress.context.createdDiscountUid)}"]`
  }
  return `[data-walkthrough="${escapeSelectorValue(anchor)}"]`
}

/** First on-screen (rendered, non-hidden) element matching the selector. */
export function firstVisible(selector: string): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      )
    }) ?? null
  )
}

/** Resolve a step's anchor, falling back to its `fallbackAnchor` when the primary is absent. */
export function resolveAnchor(
  step: WalkthroughStep,
  progress?: WalkthroughProgress | null,
): { element: HTMLElement | null; usingFallback: boolean } {
  let element = firstVisible(selectorForAnchor(step.anchor, progress))
  let usingFallback = false
  if (!element && step.fallbackAnchor) {
    element = firstVisible(selectorForAnchor(step.fallbackAnchor, progress))
    usingFallback = Boolean(element)
  }
  return { element, usingFallback }
}

export function placementToSide(step: WalkthroughStep): Side {
  switch (step.placement) {
    case "top":
      return "top"
    case "left":
      return "left"
    case "right":
      return "right"
    case "bottom":
    default:
      return "bottom"
  }
}

export interface PopoverContext {
  stepNumber: number
  totalSteps: number
  usingFallback: boolean
  showBack: boolean
  isLast: boolean
}

/**
 * Build the driver.js popover for a step. Title/body flip to their fallback copy when the
 * fallback anchor is in use; the optional instruction renders as a bold line under the body.
 */
export function buildPopover(step: WalkthroughStep, ctx: PopoverContext): Popover {
  const title = ctx.usingFallback ? (step.fallbackTitle ?? step.title) : step.title
  const body = ctx.usingFallback ? (step.fallbackBody ?? step.body) : step.body
  const instruction = ctx.usingFallback ? undefined : step.instruction

  const description = instruction
    ? `<span class="driver-lw-body">${escapeHtml(body)}</span>` +
      `<span class="driver-lw-instruction">${escapeHtml(instruction)}</span>`
    : `<span class="driver-lw-body">${escapeHtml(body)}</span>`

  const showButtons: ("next" | "previous" | "close")[] = ["next", "close"]
  if (ctx.showBack) showButtons.push("previous")

  return {
    title: escapeHtml(title),
    description,
    side: placementToSide(step),
    align: "start",
    showButtons,
  }
}

export interface BuildStepsOptions {
  /** Read live progress so a step's anchor (e.g. the created discount row UID) resolves correctly. */
  getProgress: () => WalkthroughProgress | null
  currentIndex: number
  /** App-specific rule for whether a given step index shows Back. */
  showBackFor: (index: number) => boolean
}

/**
 * Translate a whole walkthrough definition into driver.js steps. Elements are resolved lazily
 * (so drawers that mount after a step advances still get picked up via driver's waitForElement),
 * and `mobileStandalone` steps resolve to no element → a centered popover on small screens.
 * The array is built once per tour; navigation is done with driver's `moveTo`.
 */
export function buildDriverSteps(
  definition: WalkthroughDefinition,
  options: BuildStepsOptions,
): DriveStep[] {
  const total = definition.steps.length
  return definition.steps.map((step, index) => {
    const { usingFallback } =
      index === options.currentIndex
        ? resolveAnchor(step, options.getProgress())
        : { usingFallback: false }

    // driver types the resolver as `() => Element`; returning undefined (→ wait / centered
    // popover) is supported at runtime, so widen via a cast.
    const element = (() => {
      if (isMobileViewport() && step.mobileStandalone) return undefined
      return resolveAnchor(step, options.getProgress()).element ?? undefined
    }) as DriveStep["element"]

    return {
      element,
      popover: buildPopover(step, {
        stepNumber: index + 1,
        totalSteps: total,
        usingFallback,
        showBack: options.showBackFor(index),
        isLast: index === total - 1,
      }),
    }
  })
}
