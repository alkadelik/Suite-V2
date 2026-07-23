import { createPinia, setActivePinia } from "pinia"
import { readFileSync } from "node:fs"
import { mount } from "@vue/test-utils"
import { defineComponent } from "vue"
import { beforeEach, describe, expect, it } from "vitest"
import { WALKTHROUGHS } from "./registry"
import { computeCoachmarkLayout } from "./positioning"
import { useWalkthroughStore } from "./store"
import WalkthroughCoachmark from "./components/WalkthroughCoachmark.vue"
import WalkthroughSpotlight from "./components/WalkthroughSpotlight.vue"
import { hasVisibleModalDialog } from "./dom"

describe("walkthrough registry", () => {
  it("locks the coachmark's exact design colors", () => {
    const css = readFileSync(`${process.cwd()}/src/modules/walkthrough/walkthrough.css`, "utf8")
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
    for (const definition of Object.values(WALKTHROUGHS)) {
      expect(new Set(definition.steps.map((step) => step.anchor)).size).toBe(
        definition.steps.length,
      )
    }
  })

  it("encodes the required circular and mobile outline treatments", () => {
    const pickup = WALKTHROUGHS["pickup-times"].steps
    expect(pickup[0].highlight).toMatchObject({ mode: "circle", color: "#F9B324" })
    expect(pickup.map((step) => step.highlight.mode)).toEqual(["circle", "spotlight", "spotlight"])
    expect(pickup[1].highlight.mobile).toMatchObject({ mode: "outline" })
    expect(pickup[2].highlight.mobile).toMatchObject({ mode: "outline", width: 2 })
    expect(WALKTHROUGHS.discounts.steps.map((step) => step.highlight.mode)).toEqual([
      "spotlight",
      "outline",
      "spotlight",
      "outline",
      "spotlight",
      "spotlight",
    ])
  })

  it("keeps both current walkthroughs clear of a dimming backdrop", () => {
    expect(WALKTHROUGHS["pickup-times"].backdrop).toBe(false)
    expect(WALKTHROUGHS.discounts.backdrop).toBe(false)
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
    expect(WALKTHROUGHS.discounts.steps[2]).toMatchObject({
      id: "discount-type",
      anchor: "discount-type",
      mobileDock: "bottom",
    })
    expect(WALKTHROUGHS.discounts.steps[0]).toMatchObject({
      mobileDock: "bottom",
      mobileStandalone: true,
      mobileHideTail: true,
    })
    expect(WALKTHROUGHS.discounts.steps[3]).toMatchObject({
      mobileDock: "above-target",
    })
    expect(WALKTHROUGHS.discounts.steps[5]).toMatchObject({
      mobileDock: "bottom",
      desktopPosition: { left: 18, top: 260 },
    })
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

describe("coachmark positioning", () => {
  const rect = (left: number, top: number, width: number, height: number) =>
    ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect

  it("flips and clamps a card inside narrow and wide viewports", () => {
    const desktop = computeCoachmarkLayout(rect(30, 300, 50, 40), "left", 220, 1440, 900)
    expect(desktop.side).toBe("right")
    expect(desktop.left).toBeGreaterThanOrEqual(16)

    const mobile = computeCoachmarkLayout(rect(350, 700, 40, 40), "bottom", 260, 375, 740)
    expect(mobile.width).toBe(343)
    expect(mobile.left).toBeGreaterThanOrEqual(16)
    expect(mobile.top).toBeLessThanOrEqual(464)
  })

  it("shrinks beside a drawer when a docked side panel narrows the desktop viewport", () => {
    const drawerField = rect(354, 220, 654, 48)
    const layout = computeCoachmarkLayout(drawerField, "left", 250, 1024, 768)

    expect(layout.side).toBe("left")
    expect(layout.width).toBe(324)
    expect(layout.left + layout.width + 14).toBeLessThanOrEqual(drawerField.left)
  })

  it("docks a requested mobile coachmark at the viewport bottom with an upward tail", () => {
    const layout = computeCoachmarkLayout(rect(16, 220, 343, 48), "left", 210, 375, 740, {
      mobileDock: "bottom",
    })

    expect(layout).toMatchObject({ left: 16, top: 514, side: "bottom", tailOffset: 32, width: 343 })
  })

  it("keeps a requested mobile coachmark above its action with a downward tail", () => {
    const target = rect(16, 680, 343, 48)
    const layout = computeCoachmarkLayout(target, "left", 210, 375, 740, {
      mobileDock: "above-target",
    })

    expect(layout).toMatchObject({ left: 16, top: 456, side: "top", width: 343 })
    expect(layout.top + 210 + 14).toBeLessThanOrEqual(target.top)
  })

  it("uses a design-specific desktop position while retaining the requested tail side", () => {
    const layout = computeCoachmarkLayout(rect(1260, 100, 180, 52), "left", 212, 1502, 1067, {
      desktopPosition: { left: 18, top: 260 },
    })

    expect(layout).toMatchObject({ left: 18, top: 260, side: "left", width: 380 })
  })
})

describe("coachmark anatomy", () => {
  it("keeps the close control in a separate header above the divider", () => {
    const IconStub = defineComponent({
      props: { name: String },
      template: '<span class="icon" :data-name="name" />',
    })
    const anchor = {
      left: 100,
      top: 100,
      right: 144,
      bottom: 124,
      width: 44,
      height: 24,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect
    const wrapper = mount(WalkthroughCoachmark, {
      props: {
        stepId: "sample-step",
        anchorRect: anchor,
        placement: "bottom",
        title: "Sample title",
        body: "Sample body",
        stepNumber: 1,
        totalSteps: 3,
      },
      global: { stubs: { Icon: IconStub } },
    })
    const header = wrapper.find("header")
    expect(header.text()).toContain("Sample title")
    expect(header.find('button[aria-label="Close walkthrough"]').exists()).toBe(true)
    expect(header.find('[data-name="x-close"]').exists()).toBe(true)
    expect(header.element.nextElementSibling?.className).toContain("walkthrough-divider")
    expect(wrapper.find("[data-walkthrough-tail]").exists()).toBe(true)

    wrapper.setProps({ hideTail: true })
    return wrapper.vm.$nextTick().then(() => {
      expect(wrapper.find("[data-walkthrough-tail]").exists()).toBe(false)
    })
  })
})

describe("target highlighting", () => {
  it("turns a rectangular switch target into a true circular ring", () => {
    const rect = {
      left: 100,
      top: 100,
      right: 144,
      bottom: 124,
      width: 44,
      height: 24,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect
    const wrapper = mount(WalkthroughSpotlight, {
      props: {
        rect,
        highlight: { mode: "circle", color: "#F9B324", padding: 7 },
      },
    })
    const ringStyle = wrapper.find(".border-solid").attributes("style")
    expect(ringStyle).toContain("width: 58px")
    expect(ringStyle).toContain("height: 58px")
    expect(ringStyle).toContain("border-radius: 9999px")
  })

  it("can keep an outline while omitting every dimming panel", () => {
    const rect = {
      left: 100,
      top: 100,
      right: 220,
      bottom: 140,
      width: 120,
      height: 40,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect
    const wrapper = mount(WalkthroughSpotlight, {
      props: {
        rect,
        backdrop: false,
        highlight: { mode: "outline", color: "#F9B324", padding: 4 },
      },
    })

    expect(wrapper.findAll("[data-walkthrough-backdrop-panel]")).toHaveLength(0)
    expect(wrapper.find(".border-solid").exists()).toBe(true)
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
