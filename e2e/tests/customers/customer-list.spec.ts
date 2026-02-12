import { test, expect } from "../../fixtures/base"
import { CustomersPage } from "../../pages/CustomersPage"

test.describe("Customers — Customer List", () => {
  let customers: CustomersPage

  test.beforeEach(async ({ page }) => {
    customers = new CustomersPage(page)
    await customers.goto()
  })

  test("should load customers page", async () => {
    await customers.expectLoaded()
  })

  test("should display customer list or empty state", async ({ page }) => {
    const hasList = await page
      .locator("table tbody tr")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)
    const hasEmpty = await page
      .getByText(/no customers found/i)
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    expect(hasList || hasEmpty).toBeTruthy()
  })

  test("should filter customers by search", async ({ page }) => {
    const hasList = await page
      .locator("table tbody tr")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (hasList) {
      // Get first customer name
      const firstName = await page.locator("table tbody tr td").first().textContent()

      if (firstName) {
        await customers.searchCustomer(firstName.trim().substring(0, 5))
        await expect(page.getByText(firstName.trim()).first()).toBeVisible()
      }
    }
  })

  test("should show empty state for non-matching search", async () => {
    await customers.searchCustomer("xyznonexistentcustomer999")
    // Should show no results (either empty state or no table rows)
    await expect(
      customers.page.getByText(/no customers|no results/i).first(),
    ).toBeVisible({ timeout: 5_000 })
  })
})
