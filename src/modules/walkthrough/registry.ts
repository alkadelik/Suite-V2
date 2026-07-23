import type { WalkthroughDefinition, WalkthroughFeature, WalkthroughId } from "./types"

export const WALKTHROUGH_RELEASE_VERSION = "pickup-discounts-v1"

export const WALKTHROUGH_FEATURES: Record<WalkthroughId, WalkthroughFeature> = {
  "pickup-times": {
    id: "pickup-times",
    label: "Pickup Times",
    title: "Pickup times just got more flexible",
    description:
      "You can now manage pickup availability by day of the week. Turn pickup on or off for individual days and set pickup hours that work for your business.",
  },
  discounts: {
    id: "discounts",
    label: "Discounts & Coupons",
    title: "Create discounts in minutes",
    description:
      "Reward loyal customers or run promotions using percentage, fixed amount, or coupon discounts.",
  },
}

export const WALKTHROUGHS: Record<WalkthroughId, WalkthroughDefinition> = {
  "pickup-times": {
    ...WALKTHROUGH_FEATURES["pickup-times"],
    version: "pickup-times-v1",
    backdrop: false,
    steps: [
      {
        id: "pickup-day-availability",
        route: "/settings/delivery-options",
        anchor: "pickup-day-toggle",
        placement: "bottom",
        title: "Control pickup availability by day",
        body: "Use the toggle beside each day to choose when pickup is available.",
        showBack: true,
        highlight: {
          mode: "circle",
          color: "#F9B324",
          width: 1,
          padding: 7,
          radius: 999,
        },
      },
      {
        id: "pickup-hours",
        route: "/settings/delivery-options",
        anchor: "pickup-time-range",
        fallbackAnchor: "pickup-day-toggle",
        placement: "left",
        title: "Set pickup hours",
        body: "For active days, select the pickup start and end times that work for your business.",
        fallbackTitle: "Enable a pickup day",
        fallbackBody: "Turn on at least one day to choose its pickup start and end times.",
        highlight: {
          mode: "spotlight",
          padding: 4,
          radius: "target",
          mobile: {
            mode: "outline",
            color: "#F9B324",
            width: 1,
            padding: 4,
            radius: 14,
          },
        },
      },
      {
        id: "pickup-save",
        route: "/settings/delivery-options",
        anchor: "pickup-save",
        placement: "top",
        title: "Save your schedule",
        body: "Review your pickup days and hours, then save your changes when you're ready.",
        highlight: {
          mode: "spotlight",
          padding: 3,
          radius: "target",
          mobile: {
            mode: "outline",
            color: "#F9B324",
            width: 2,
            padding: 4,
            radius: 14,
          },
        },
        advanceOn: "pickup-settings-saved",
      },
    ],
  },
  discounts: {
    ...WALKTHROUGH_FEATURES.discounts,
    version: "discounts-v1",
    backdrop: false,
    steps: [
      {
        id: "discounts-welcome",
        route: "/discounts",
        anchor: "discounts-nav",
        placement: "right",
        mobileDock: "bottom",
        mobileStandalone: true,
        mobileHideTail: true,
        title: "Welcome to Discounts",
        body: "Manage all your discounts and promotional offers from one place. You'll be able to create, track, and update promotions anytime.",
        highlight: { mode: "spotlight", padding: 4, radius: 12 },
      },
      {
        id: "discount-create",
        route: "/discounts",
        anchor: "discount-add",
        placement: "top",
        title: "Create your first discount",
        body: "Create discounts to encourage more purchases and reward your customers.",
        instruction: 'Click the "Add Discount" button to continue.',
        highlight: {
          mode: "outline",
          color: "#F9B324",
          width: 1,
          padding: 5,
          radius: 12,
        },
        advanceOn: "discount-create-opened",
        hideNext: true,
      },
      {
        id: "discount-type",
        route: "/discounts",
        anchor: "discount-type",
        placement: "left",
        mobileDock: "bottom",
        title: "Choose the discount type",
        body: "Select the kind of promotion you want to offer. Discounts can be percentage-based, fixed amount, or other supported types.",
        highlight: { mode: "spotlight", padding: 4, radius: "target" },
        advanceOn: "discount-targeting-opened",
        nextCommand: "discount-next-form",
      },
      {
        id: "discount-submit",
        route: "/discounts",
        anchor: "discount-submit",
        placement: "left",
        mobileDock: "above-target",
        title: "Create your discount",
        body: "Everything looks ready. Save your discount to make it available for customers.",
        instruction: 'Click the "Create Discount" button to continue.',
        highlight: {
          mode: "outline",
          color: "#F9B324",
          width: 1,
          padding: 5,
          radius: 12,
        },
        advanceOn: "discount-created",
        hideNext: true,
      },
      {
        id: "discount-list",
        route: "/discounts",
        anchor: "discount-row",
        placement: "bottom",
        title: "Manage all your discounts in one place",
        body: "View each discount's status, type and performance from this list. Select any discount to see more details or make changes.",
        instruction: "Click the discount row to continue.",
        highlight: { mode: "spotlight", padding: 3, radius: "target" },
        advanceOn: "discount-row-opened",
        hideNext: true,
      },
      {
        id: "discount-manage",
        route: "/discounts/discount/",
        anchor: "discount-manage",
        placement: "left",
        mobileDock: "bottom",
        desktopPosition: { left: 18, top: 260 },
        title: "Review and manage your discount",
        body: "Track your discount details, monitor activity and update the promotion whenever your campaign changes.",
        highlight: { mode: "spotlight", padding: 4, radius: "target" },
      },
    ],
  },
}

export function getWalkthrough(id: WalkthroughId): WalkthroughDefinition {
  return WALKTHROUGHS[id]
}
