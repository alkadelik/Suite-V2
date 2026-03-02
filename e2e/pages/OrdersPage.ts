import { type Page, type Locator, expect } from "@playwright/test"

export class OrdersPage {
  readonly page: Page
  readonly searchInput: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByPlaceholder(/search/i)
  }

  async goto() {
    await this.page.goto("/orders")
  }

  async expectLoaded() {
    await expect(this.page.getByText(/orders/i).first()).toBeVisible()
  }

  async expectOrderList() {
    // Wait for order cards or table rows to appear
    await expect(
      this.page.locator("table tbody tr, [class*='rounded-xl border']").first(),
    ).toBeVisible({ timeout: 10_000 })
  }

  async searchOrder(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500)
  }

  async expectOrderVisible(orderNumber: string) {
    await expect(this.page.getByText(orderNumber).first()).toBeVisible()
  }

  /** Click on an order to open details */
  async openOrder(orderNumber: string) {
    await this.page.getByText(orderNumber).first().click()
  }

  /** Open the create order drawer (FAB or button) */
  async openCreateOrder() {
    await this.page.getByRole("button", { name: /create order|new order/i }).click()
  }

  /** Open the dropdown for an order row and click an action */
  async openOrderAction(orderNumber: string, actionLabel: string) {
    const row = this.page.locator("tr", { hasText: orderNumber })
    // Click dots menu
    await row.locator("button").filter({ hasText: "" }).last().click()
    // Click action
    await this.page.getByText(actionLabel, { exact: false }).click()
  }

  /** Wait for the async dropdown spinner to complete */
  async waitForDropdownActionComplete() {
    // Wait for the spinner to disappear (async action complete)
    await expect(this.page.locator(".animate-spin")).not.toBeVisible({ timeout: 15_000 })
  }
}
