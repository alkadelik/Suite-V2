import { describe, expect, it } from "vitest"
import { getSettingsNavigationLinks } from "./navigation"

const labels = (options: Parameters<typeof getSettingsNavigationLinks>[0]) =>
  getSettingsNavigationLinks(options).map((link) => link.label)

describe("settings navigation", () => {
  it("keeps Taxes available to eligible merchants on desktop and mobile", () => {
    const base = { isHq: true, isInternational: false } as const

    expect(labels({ ...base, surface: "desktop" })).toContain("Taxes")
    expect(labels({ ...base, surface: "mobile" })).toContain("Taxes")
  })

  it("preserves the restricted-location menu on both surfaces", () => {
    for (const surface of ["desktop", "mobile"] as const) {
      expect(labels({ isHq: false, isInternational: false, surface })).toEqual([
        "Profile",
        "Password",
      ])
    }
  })

  it("keeps international visibility rules while retaining Taxes", () => {
    const mobileLabels = labels({
      isHq: true,
      isInternational: true,
      surface: "mobile",
    })

    expect(mobileLabels).toContain("Taxes")
    expect(mobileLabels).not.toContain("Plans & Billing")
    expect(mobileLabels).not.toContain("Storefront Design")
    expect(mobileLabels).not.toContain("Delivery Options")
  })
})
