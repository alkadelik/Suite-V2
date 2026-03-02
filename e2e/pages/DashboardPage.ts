import { type Page, type Locator, expect } from "@playwright/test"

export class DashboardPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto("/dashboard")
  }

  async expectLoaded() {
    // Dashboard shows a greeting with the user's first name
    await expect(this.page.getByText(/what would you like to do today/i)).toBeVisible()
  }

  async expectQuickActionsVisible() {
    // Quick actions section should have clickable cards
    await expect(this.page.getByText(/add product/i).first()).toBeVisible()
  }

  async expectStoreGlance() {
    await expect(this.page.getByText(/your store at a glance/i)).toBeVisible()
  }

  /** Navigate to a module via the sidebar */
  async navigateTo(path: string) {
    await this.page.goto(path)
  }
}
