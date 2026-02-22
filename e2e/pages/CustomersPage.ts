import { type Page, type Locator, expect } from "@playwright/test"

export class CustomersPage {
  readonly page: Page
  readonly searchInput: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByPlaceholder(/search/i)
  }

  async goto() {
    await this.page.goto("/customers")
  }

  async expectLoaded() {
    await expect(this.page.getByText(/customers/i).first()).toBeVisible()
  }

  async expectCustomerList() {
    await expect(
      this.page.locator("table tbody tr, [data-testid='customer-card']").first(),
    ).toBeVisible({ timeout: 10_000 })
  }

  async searchCustomer(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500)
  }

  async expectCustomerVisible(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible()
  }

  async expectEmptyState() {
    await expect(this.page.getByText(/no customers found/i)).toBeVisible()
  }

  /** Open add customer modal */
  async openAddCustomer() {
    await this.page.getByRole("button", { name: /add customer/i }).click()
  }

  /** Fill the customer form fields */
  async fillCustomerForm(data: {
    firstName: string
    lastName: string
    phone?: string
    email?: string
  }) {
    await this.page.getByPlaceholder(/first name/i).fill(data.firstName)
    await this.page.getByPlaceholder(/last name/i).fill(data.lastName)
    if (data.phone) {
      await this.page.getByPlaceholder(/phone/i).fill(data.phone)
    }
    if (data.email) {
      await this.page.getByPlaceholder(/email/i).last().fill(data.email)
    }
  }

  /** Submit customer form */
  async submitCustomer() {
    await this.page.getByRole("button", { name: /save|add|create/i }).click()
  }

  /** Click on a customer row to open details */
  async openCustomer(name: string) {
    await this.page.getByText(name).first().click()
  }
}
