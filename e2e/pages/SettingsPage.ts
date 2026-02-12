import { type Page, expect } from "@playwright/test"

export class SettingsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto("/settings")
  }

  async navigateToSection(path: string) {
    await this.page.goto(`/settings/${path}`)
  }

  async expectSectionLoaded(heading: string | RegExp) {
    await expect(this.page.getByText(heading).first()).toBeVisible({ timeout: 10_000 })
  }

  async expectRedirectedToLogin() {
    await expect(this.page).toHaveURL(/\/login/)
  }

  async expectRedirectedToDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/)
  }
}
