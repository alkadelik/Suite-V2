import { test, expect } from "../../fixtures/base"

test.describe("Marketing — Email List", () => {
  test("should load email list page", async ({ page }) => {
    await page.goto("/email-list")
    await expect(page.getByText(/email|subscriber/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test("should display subscriber list or empty state", async ({ page }) => {
    await page.goto("/email-list")

    const hasList = await page
      .locator("table tbody tr")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)
    const hasEmpty = await page
      .getByText(/no subscriber|no email/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(hasList || hasEmpty).toBeTruthy()
  })

  test("should have export button", async ({ page }) => {
    await page.goto("/email-list")

    const exportBtn = page.getByRole("button", { name: /export/i })
    await expect(exportBtn).toBeVisible({ timeout: 10_000 })
  })
})
