import { test, expect } from "../../fixtures/base"
import { InventoryPage } from "../../pages/InventoryPage"
import { ProductDetailPage } from "../../pages/ProductDetailPage"

test.describe("Inventory — Product CRUD", () => {
  const testProductName = `E2E Test Product ${Date.now()}`
  let createdProductUid: string | null = null

  test("should create a new product", async ({ page }) => {
    const inventory = new InventoryPage(page)
    await inventory.goto()
    await inventory.expectLoaded()

    // Open add product drawer
    await inventory.openAddProduct()

    // Fill product name
    await page.getByPlaceholder(/product name/i).fill(testProductName)

    // Fill variant price
    const priceInput = page.getByPlaceholder(/price/i).first()
    if (await priceInput.isVisible()) {
      await priceInput.fill("5000")
    }

    // Fill variant stock
    const stockInput = page.getByPlaceholder(/stock|quantity/i).first()
    if (await stockInput.isVisible()) {
      await stockInput.fill("10")
    }

    // Submit
    await page.getByRole("button", { name: /save|create|add product/i }).click()

    // Wait for success
    await expect(page.getByText(/success|created/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test("should search and find the created product", async ({ page }) => {
    const inventory = new InventoryPage(page)
    await inventory.goto()
    await inventory.expectProductList()

    await inventory.searchProduct(testProductName.substring(0, 15))
    await inventory.expectProductVisible(testProductName)
  })

  test("should open product detail page", async ({ page }) => {
    const inventory = new InventoryPage(page)
    await inventory.goto()
    await inventory.expectProductList()

    await inventory.searchProduct(testProductName.substring(0, 15))
    await inventory.openProduct(testProductName)

    const detail = new ProductDetailPage(page)
    await detail.expectLoaded()

    const name = await detail.getProductName()
    expect(name?.trim()).toContain(testProductName)
  })

  test("should hide and unhide product from storefront", async ({ page }) => {
    const inventory = new InventoryPage(page)
    await inventory.goto()
    await inventory.expectProductList()

    await inventory.searchProduct(testProductName.substring(0, 15))
    await inventory.openProduct(testProductName)

    const detail = new ProductDetailPage(page)
    await detail.expectLoaded()

    // Hide the product
    await detail.toggleVisibility()
    await detail.confirmToggleVisibility()
    await expect(page.getByText(/hidden from storefront/i)).toBeVisible({ timeout: 10_000 })

    // Verify hidden badge appears
    await detail.expectHiddenBadge()

    // Unhide the product
    await detail.toggleVisibility()
    await detail.confirmToggleVisibility()
    await expect(page.getByText(/visible on storefront/i)).toBeVisible({ timeout: 10_000 })
  })
})
