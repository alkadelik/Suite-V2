import { type Page, expect } from "@playwright/test"

export class ProductDetailPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(uid: string) {
    await this.page.goto(`/inventory/${uid}`)
  }

  async expectLoaded() {
    // Product detail page has a product name heading
    await expect(this.page.locator("h5").first()).toBeVisible({ timeout: 10_000 })
  }

  async getProductName() {
    return this.page.locator("h5").first().textContent()
  }

  async expectHiddenBadge() {
    // Eye-slash icon indicates the product is hidden from storefront
    await expect(this.page.locator('[class*="eye-slash"]').first()).toBeVisible()
  }

  async expectNotHidden() {
    await expect(this.page.locator('[class*="eye-slash"]')).not.toBeVisible()
  }

  /** Open the "Manage Product" dropdown menu */
  async openManageMenu() {
    await this.page.getByText(/manage product/i).click()
  }

  /** Click an action in the manage menu */
  async clickAction(label: string) {
    await this.page.getByText(label, { exact: false }).click()
  }

  /** Toggle product visibility (hide/unhide) via the manage menu */
  async toggleVisibility() {
    await this.openManageMenu()
    // Click either "Hide Product" or "Unhide Product"
    const hideBtn = this.page.getByText(/hide product|unhide product/i)
    await hideBtn.click()
  }

  /** Confirm the hide/unhide modal */
  async confirmToggleVisibility() {
    const confirmBtn = this.page.getByRole("button", { name: /^hide$|^unhide$/i })
    await confirmBtn.click()
  }
}
