import { type Page, type Locator, expect } from "@playwright/test"

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly forgotPasswordLink: Locator
  readonly signUpLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByPlaceholder(/example@gmail/i)
    this.passwordInput = page.locator('input[type="password"]')
    this.submitButton = page.getByRole("button", { name: /log in/i })
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot password/i })
    this.signUpLink = page.getByRole("link", { name: /sign up/i })
  }

  async goto() {
    await this.page.goto("/login")
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password)
  }

  async submit() {
    await this.submitButton.click()
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  async expectPageLoaded() {
    await expect(this.page.getByText(/welcome back/i)).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  async expectRedirectAway() {
    await expect(this.page).not.toHaveURL(/\/login/, { timeout: 15_000 })
  }

  async expectValidationError(message: string | RegExp) {
    await expect(this.page.getByText(message)).toBeVisible()
  }
}
