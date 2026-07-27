import { createPinia, setActivePinia } from "pinia"
import { readFileSync } from "node:fs"
import { beforeEach, describe, expect, it } from "vitest"
import { WALKTHROUGHS } from "./constants"
import { useWalkthroughStore } from "./store"
import { hasVisibleModalDialog } from "./dom"
import {
  buildDriverSteps,
  buildPopover,
  isMobileViewport,
  placementToSide,
  resolveAnchor,
} from "./driverAdapter"

describe("walkthrough registry", () => {
  it("locks the coachmark's exact design colors", () => {
    const css = readFileSync(`${process.cwd()}/src/modules/announcements/walkthrough.css`, "utf8")
    expect(css).toContain("--walkthrough-surface: #1a1919")
    expect(css).toContain("--walkthrough-divider: #312623")
    expect(css).toContain("--walkthrough-close: #866f6e")
    expect(css).toContain("--walkthrough-body: #ccc8c8")
    expect(css).toContain("--walkthrough-step: #9d8c8c")
    expect(css).toContain("--walkthrough-action: #bb5a02")
    expect(css).toContain("--walkthrough-highlight: #f9b324")
  })

  it("keeps the approved step counts, ordering, and unique anchors", () => {
    expect(WALKTHROUGHS["pickup-times"].steps.map((step) => step.id)).toEqual([
      "pickup-day-availability",
      "pickup-hours",
      "pickup-save",
    ])
    expect(WALKTHROUGHS.discounts.steps).toHaveLength(6)
    expect(WALKTHROUGHS.shipments.steps).toHaveLength(7)
    for (const definition of Object.values(WALKTHROUGHS)) {
      expect(new Set(definition.steps.map((step) => step.anchor)).size).toBe(
        definition.steps.length,
      )
    }
  })

  it("keeps every coachmark title and body identical to the saved design", () => {
    expect(WALKTHROUGHS["pickup-times"].steps.map(({ title, body }) => ({ title, body }))).toEqual([
      {
        title: "Control pickup availability by day",
        body: "Use the toggle beside each day to choose when pickup is available.",
      },
      {
        title: "Set pickup hours",
        body: "For active days, select the pickup start and end times that work for your business.",
      },
      {
        title: "Save your schedule",
        body: "Review your pickup days and hours, then save your changes when you're ready.",
      },
    ])
    expect(WALKTHROUGHS.discounts.steps.map(({ title, body }) => ({ title, body }))).toEqual([
      {
        title: "Welcome to Discounts",
        body: "Manage all your discounts and promotional offers from one place. You'll be able to create, track, and update promotions anytime.",
      },
      {
        title: "Create your first discount",
        body: "Create discounts to encourage more purchases and reward your customers.",
      },
      {
        title: "Choose the discount type",
        body: "Select the kind of promotion you want to offer. Discounts can be percentage-based, fixed amount, or other supported types.",
      },
      {
        title: "Create your discount",
        body: "Everything looks ready. Save your discount to make it available for customers.",
      },
      {
        title: "Manage all your discounts in one place",
        body: "View each discount's status, type and performance from this list. Select any discount to see more details or make changes.",
      },
      {
        title: "Review and manage your discount",
        body: "Track your discount details, monitor activity and update the promotion whenever your campaign changes.",
      },
    ])
    expect(WALKTHROUGHS.discounts.steps.map((step) => step.instruction)).toEqual([
      undefined,
      'Click the "Add Discount" button to continue.',
      undefined,
      'Click the "Create Discount" button to continue.',
      "Click the discount row to continue.",
      undefined,
    ])
  })
})

describe("walkthrough progress", () => {
  beforeEach(() => setActivePinia(createPinia()))

  it("isolates progress per user and ignores stale versions on resume", () => {
    const store = useWalkthroughStore()
    store.start("pickup-times", "merchant-a")
    store.advance()
    expect(store.activeProgress?.stepIndex).toBe(1)

    store.start("discounts", "merchant-b")
    expect(store.progressByUser["merchant-a"]?.["pickup-times"]?.stepIndex).toBe(1)
    const pickupProgress = store.progressByUser["merchant-a"]?.["pickup-times"]
    expect(pickupProgress).toBeDefined()
    if (pickupProgress) pickupProgress.version = "old-version"
    store.resumeForUser("merchant-a")
    expect(store.activeId).toBeNull()
  })

  it("only crosses semantic gates and retains the created UID", () => {
    const store = useWalkthroughStore()
    store.start("discounts", "merchant")
    store.advance()
    store.report("discount-created", { uid: "too-early" })
    expect(store.activeProgress?.stepIndex).toBe(1)
    store.report("discount-create-opened")
    expect(store.activeProgress?.stepIndex).toBe(2)
    store.report("discount-targeting-opened")
    expect(store.activeProgress?.stepIndex).toBe(3)
    store.report("discount-created")
    expect(store.activeProgress?.stepIndex).toBe(3)
    store.report("discount-created", { uid: "discount-123" })
    expect(store.activeProgress?.context?.createdDiscountUid).toBe("discount-123")
    expect(store.activeProgress?.stepIndex).toBe(4)
  })

  it("tracks release acknowledgement per user", () => {
    const store = useWalkthroughStore()
    expect(store.hasSeenRelease("a")).toBe(false)
    store.markReleaseSeen("a")
    expect(store.hasSeenRelease("a")).toBe(true)
    expect(store.hasSeenRelease("b")).toBe(false)
  })

  it("completes an active pickup walkthrough after a successful settings save", () => {
    const store = useWalkthroughStore()
    store.start("pickup-times", "merchant")

    store.report("pickup-settings-saved")

    expect(store.progressByUser.merchant?.["pickup-times"]?.status).toBe("completed")
    expect(store.activeId).toBeNull()
    expect(store.completedId).toBe("pickup-times")
    store.clearCompletion()
    expect(store.completedId).toBeNull()
  })
})

describe("driver adapter", () => {
  const discountSteps = WALKTHROUGHS.discounts.steps

  it("maps placement to a driver side", () => {
    expect(placementToSide({ placement: "top" } as never)).toBe("top")
    expect(placementToSide({ placement: "left" } as never)).toBe("left")
    expect(placementToSide({ placement: "right" } as never)).toBe("right")
    expect(placementToSide({ placement: "bottom" } as never)).toBe("bottom")
  })

  it("flags small viewports as mobile", () => {
    expect(isMobileViewport(500)).toBe(true)
    expect(isMobileViewport(1023)).toBe(true)
    expect(isMobileViewport(1024)).toBe(false)
    expect(isMobileViewport(1440)).toBe(false)
  })

  it("renders the body and, when present, a bold instruction line with Back hidden on step one", () => {
    const welcome = buildPopover(discountSteps[0], {
      stepNumber: 1,
      totalSteps: 6,
      usingFallback: false,
      showBack: false,
      isLast: false,
    })
    expect(welcome.title).toBe("Welcome to Discounts")
    expect(welcome.description).toContain("driver-lw-body")
    expect(welcome.description).not.toContain("driver-lw-instruction")
    expect(welcome.showButtons).not.toContain("previous")

    const create = buildPopover(discountSteps[1], {
      stepNumber: 2,
      totalSteps: 6,
      usingFallback: false,
      showBack: true,
      isLast: false,
    })
    expect(create.description).toContain("driver-lw-instruction")
    expect(create.description).toContain("Add Discount")
    expect(create.showButtons).toContain("previous")
    expect(create.side).toBe("top")
  })

  it("swaps to the fallback copy when the fallback anchor is used", () => {
    const pickupHours = WALKTHROUGHS["pickup-times"].steps[1]
    const popover = buildPopover(pickupHours, {
      stepNumber: 2,
      totalSteps: 3,
      usingFallback: true,
      showBack: true,
      isLast: false,
    })
    expect(popover.title).toBe(pickupHours.fallbackTitle)
    expect(popover.description).toContain("Turn on at least one day")
    // The instruction is suppressed while on the fallback anchor.
    expect(popover.description).not.toContain("driver-lw-instruction")
  })

  it("builds one driver step per definition step and resolves live anchors", () => {
    const steps = buildDriverSteps(WALKTHROUGHS.discounts, {
      getProgress: () => null,
      currentIndex: 1,
      showBackFor: () => true,
    })
    expect(steps).toHaveLength(6)
    expect(typeof steps[1].element).toBe("function")

    const anchor = document.createElement("button")
    anchor.setAttribute("data-walkthrough", "discount-add")
    anchor.getBoundingClientRect = () =>
      ({
        left: 10,
        top: 10,
        right: 90,
        bottom: 42,
        width: 80,
        height: 32,
        x: 10,
        y: 10,
        toJSON: () => ({}),
      }) as DOMRect
    document.body.append(anchor)
    expect(resolveAnchor(discountSteps[1]).element).toBe(anchor)
    anchor.remove()
  })
})

describe("announcement dialog detection", () => {
  it("ignores closed drawers translated outside the viewport", () => {
    const drawer = document.createElement("aside")
    drawer.setAttribute("role", "dialog")
    drawer.setAttribute("aria-modal", "true")
    drawer.getBoundingClientRect = () =>
      ({
        left: window.innerWidth,
        right: window.innerWidth + 448,
        top: 0,
        bottom: window.innerHeight,
        width: 448,
        height: window.innerHeight,
        x: window.innerWidth,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect
    document.body.append(drawer)
    expect(hasVisibleModalDialog()).toBe(false)
    drawer.remove()
  })

  it("detects a genuinely visible modal", () => {
    const dialog = document.createElement("section")
    dialog.setAttribute("role", "dialog")
    dialog.setAttribute("aria-modal", "true")
    dialog.getBoundingClientRect = () =>
      ({
        left: 20,
        right: 420,
        top: 20,
        bottom: 320,
        width: 400,
        height: 300,
        x: 20,
        y: 20,
        toJSON: () => ({}),
      }) as DOMRect
    document.body.append(dialog)
    expect(hasVisibleModalDialog()).toBe(true)
    dialog.remove()
  })
})
