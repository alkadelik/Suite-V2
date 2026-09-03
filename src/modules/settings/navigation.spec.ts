import { describe, expect, it } from "vitest"
import { getSettingsNavigationLinks } from "./navigation"

const labels = (options: Parameters<typeof getSettingsNavigationLinks>[0]) =>
  getSettingsNavigationLinks(options).map((link) => link.label)

describe("settings navigation", () => {
  it("keeps Taxes available to eligible merchants on desktop and mobile", () => {
    const base = { isHq: true, isInternational: false, isOwner: true } as const

    expect(labels({ ...base, surface: "desktop" })).toContain("Taxes")
    expect(labels({ ...base, surface: "mobile" })).toContain("Taxes")
  })

  it("preserves the restricted-location menu on both surfaces", () => {
    for (const surface of ["desktop", "mobile"] as const) {
      expect(labels({ isHq: false, isInternational: false, isOwner: true, surface })).toEqual([
        "Profile",
        "Password",
      ])
    }
  })

  it("keeps international visibility rules while retaining Taxes", () => {
    const mobileLabels = labels({
      isHq: true,
      isInternational: true,
      isOwner: true,
      surface: "mobile",
    })

    expect(mobileLabels).toContain("Taxes")
    expect(mobileLabels).not.toContain("Plans & Billing")
    expect(mobileLabels).not.toContain("Storefront Design")
    expect(mobileLabels).not.toContain("Delivery Options")
  })

  it("shows API Key to an owner at HQ on both surfaces", () => {
    const base = { isHq: true, isInternational: false, isOwner: true } as const

    expect(labels({ ...base, surface: "desktop" })).toContain("API Key")
    expect(labels({ ...base, surface: "mobile" })).toContain("API Key")
  })

  it("hides API Key from non-owners even at HQ", () => {
    for (const surface of ["desktop", "mobile"] as const) {
      const result = labels({ isHq: true, isInternational: false, isOwner: false, surface })

      expect(result).not.toContain("API Key")
      // The rest of the HQ menu is unaffected by the owner gate.
      expect(result).toContain("Taxes")
      expect(result).toContain("Locations")
    }
  })

  it("hides API Key outside HQ even for an owner", () => {
    for (const surface of ["desktop", "mobile"] as const) {
      expect(labels({ isHq: false, isInternational: false, isOwner: true, surface })).not.toContain(
        "API Key",
      )
    }
  })

  it("keeps API Key available to an international owner at HQ", () => {
    // API Key is not in INTERNATIONAL_HIDDEN_LINKS — the Public API is not
    // region-specific, so international merchants keep it.
    expect(
      labels({ isHq: true, isInternational: true, isOwner: true, surface: "desktop" }),
    ).toContain("API Key")
  })
})
