import { type Page, type Locator, expect } from "@playwright/test"

export class InventoryPage {
  readonly page: Page
  readonly searchInput: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByPlaceholder(/search/i)
  }

  async goto() {
    await this.page.goto("/inventory")
  }

  async expectLoaded() {
    await expect(this.page.getByText(/products/i).first()).toBeVisible()
  }

  async expectProductList() {
    // Wait for products to load (table rows or product cards)
    await expect(
      this.page.locator("table tbody tr, [data-testid='product-card']").first(),
    ).toBeVisible({ timeout: 10_000 })
  }

  async searchProduct(query: string) {
    await this.searchInput.fill(query)
    // Debounce wait
    await this.page.waitForTimeout(500)
  }

  async expectEmptyState() {
    await expect(this.page.getByText(/no products found/i)).toBeVisible()
  }

  async expectProductVisible(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible()
  }

  async expectProductNotVisible(name: string) {
    await expect(this.page.getByText(name)).not.toBeVisible()
  }

  /** Click on a product row/card to navigate to details */
  async openProduct(name: string) {
    await this.page.getByText(name).first().click()
  }

  /** Open the add product drawer */
  async openAddProduct() {
    await this.page.getByRole("button", { name: /add product/i }).click()
  }

  /** Check if the hidden eye icon is visible for a product in the table */
  async expectHiddenIcon(productName: string) {
    const row = this.page.locator("tr", { hasText: productName })
    await expect(row.locator('[class*="eye-slash"]')).toBeVisible()
  }

  /** Open the dropdown menu for a product and click an action */
  async openProductAction(productName: string, actionLabel: string) {
    const row = this.page.locator("tr", { hasText: productName })
    // Click the dots menu
    await row.locator("button").filter({ hasText: "" }).last().click()
    // Click the action
    await this.page.getByText(actionLabel, { exact: false }).click()
  }
}
