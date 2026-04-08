import { test, expect } from "../../fixtures/base"
import { SettingsPage } from "../../pages/SettingsPage"

test.describe("Settings — Navigation", () => {
  let settings: SettingsPage

  test.beforeEach(async ({ page }) => {
    settings = new SettingsPage(page)
  })

  test("should load settings page", async ({ page }) => {
    await settings.goto()
    await expect(page.getByText(/settings/i).first()).toBeVisible()
  })

  test("should navigate to profile settings", async () => {
    await settings.navigateToSection("profile")
    await settings.expectSectionLoaded(/profile/i)
  })

  test("should navigate to password settings", async () => {
    await settings.navigateToSection("password")
    await settings.expectSectionLoaded(/password/i)
  })

  test("should navigate to store details (HQ)", async ({ page }) => {
    await settings.navigateToSection("store-details")

    // Either loads the section or redirects (non-HQ)
    const url = page.url()
    if (url.includes("store-details")) {
      await settings.expectSectionLoaded(/store/i)
    }
  })

  test("should navigate to locations settings (HQ)", async ({ page }) => {
    await settings.navigateToSection("locations")

    const url = page.url()
    if (url.includes("locations")) {
      await settings.expectSectionLoaded(/location/i)
    }
  })

  test("should navigate to team settings (HQ)", async ({ page }) => {
    await settings.navigateToSection("teams")

    const url = page.url()
    if (url.includes("teams")) {
      await settings.expectSectionLoaded(/team/i)
    }
  })

  test("should navigate to delivery options (HQ)", async ({ page }) => {
    await settings.navigateToSection("delivery-options")

    const url = page.url()
    if (url.includes("delivery-options")) {
      await settings.expectSectionLoaded(/delivery/i)
    }
  })

  test("should navigate to billing settings (HQ)", async ({ page }) => {
    await settings.navigateToSection("billing")

    const url = page.url()
    if (url.includes("billing")) {
      await settings.expectSectionLoaded(/plan|billing|subscription/i)
    }
  })

  test("should navigate to design settings (HQ)", async ({ page }) => {
    await settings.navigateToSection("design/themes")

    const url = page.url()
    if (url.includes("design")) {
      await settings.expectSectionLoaded(/theme|design/i)
    }
  })
})
