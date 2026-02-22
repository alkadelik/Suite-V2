import { test, expect } from "../../fixtures/base"
import { InventoryPage } from "../../pages/InventoryPage"

test.describe("Inventory — Product List", () => {
  let inventory: InventoryPage

  test.beforeEach(async ({ page }) => {
    inventory = new InventoryPage(page)
    await inventory.goto()
  })

  test("should load inventory page", async () => {
    await inventory.expectLoaded()
  })

  test("should display product list", async () => {
    await inventory.expectProductList()
  })

  test("should filter products by search query", async ({ page }) => {
    await inventory.expectProductList()

    // Get the first product name for search
    const firstProductName = await page.locator("table tbody tr td").first().textContent()

    if (firstProductName) {
      await inventory.searchProduct(firstProductName.trim().substring(0, 5))
      // The product should still be visible after filtering
      await expect(page.getByText(firstProductName.trim()).first()).toBeVisible()
    }
  })

  test("should show empty state for no search results", async () => {
    await inventory.searchProduct("xyznonexistentproduct12345")
    await inventory.expectEmptyState()
  })

  test("should navigate to product detail on click", async ({ page }) => {
    await inventory.expectProductList()

    // Click first product row
    await page.locator("table tbody tr").first().click()
    await expect(page).toHaveURL(/\/inventory\//)
  })
})
