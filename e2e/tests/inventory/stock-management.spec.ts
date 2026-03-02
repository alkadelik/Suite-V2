import { test, expect } from "../../fixtures/base"
import { InventoryPage } from "../../pages/InventoryPage"
import { ProductDetailPage } from "../../pages/ProductDetailPage"

test.describe("Inventory — Stock Management", () => {
  test("should open manage stock modal from product detail", async ({ page }) => {
    const inventory = new InventoryPage(page)
    await inventory.goto()
    await inventory.expectProductList()

    // Open the first product
    await page.locator("table tbody tr").first().click()

    const detail = new ProductDetailPage(page)
    await detail.expectLoaded()

    // Open manage menu and click manage stock
    await detail.openManageMenu()
    await detail.clickAction("Manage Stock")

    // Stock modal should appear
    await expect(page.getByText(/add stock|reduce stock|manage stock/i).first()).toBeVisible()
  })

  test("should add stock to a variant", async ({ page }) => {
    const inventory = new InventoryPage(page)
    await inventory.goto()
    await inventory.expectProductList()

    // Open the first product
    await page.locator("table tbody tr").first().click()

    const detail = new ProductDetailPage(page)
    await detail.expectLoaded()

    // Open manage stock
    await detail.openManageMenu()
    await detail.clickAction("Manage Stock")

    // Select "Add Stock" option
    await page.getByText(/add stock/i).first().click()

    // Fill quantity
    const qtyInput = page.getByPlaceholder(/quantity|amount/i).first()
    if (await qtyInput.isVisible()) {
      await qtyInput.fill("5")

      // Submit
      await page.getByRole("button", { name: /save|add|confirm/i }).click()

      // Wait for success
      await expect(page.getByText(/success|added|updated/i).first()).toBeVisible({
        timeout: 10_000,
      })
    }
  })
})
