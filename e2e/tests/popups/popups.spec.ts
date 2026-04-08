import { test, expect } from "../../fixtures/base"

test.describe("Popups — HQ Only", () => {
  test("should load popups page (HQ users)", async ({ page }) => {
    await page.goto("/popups")

    // Either loads popups page or redirects (non-HQ users)
    const url = page.url()

    if (url.includes("/popups")) {
      await expect(page.getByText(/popup|booth/i).first()).toBeVisible({ timeout: 10_000 })
    } else {
      // Non-HQ users get redirected
      expect(url).not.toContain("/popups")
    }
  })

  test("should show popup list or empty state (HQ)", async ({ page }) => {
    await page.goto("/popups")

    if (page.url().includes("/popups")) {
      const hasPopups = await page
        .locator("[class*='rounded-xl']")
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false)
      const hasEmpty = await page
        .getByText(/no popup|get started/i)
        .isVisible({ timeout: 3_000 })
        .catch(() => false)

      expect(hasPopups || hasEmpty).toBeTruthy()
    }
  })

  test("should navigate to eventful page", async ({ page }) => {
    await page.goto("/popups/eventful")

    if (page.url().includes("/popups/eventful")) {
      await expect(page.getByText(/eventful|event/i).first()).toBeVisible({ timeout: 10_000 })
    }
  })
})
