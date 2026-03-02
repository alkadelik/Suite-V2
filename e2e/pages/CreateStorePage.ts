import { type Page, type Locator, expect } from "@playwright/test"

export class CreateStorePage {
  readonly page: Page
  readonly heading: Locator
  readonly storeNameInput: Locator
  readonly slugInput: Locator
  readonly industrySelect: Locator
  readonly currencySelect: Locator
  readonly submitButton: Locator
  readonly slugPreview: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByText(/create your store/i)
    this.storeNameInput = page.getByPlaceholder("e.g. smile socks")
    this.slugInput = page.getByPlaceholder("smile-socks")
    this.industrySelect = page.getByText("Select").first()
    this.currencySelect = page.getByText("NGN").first()
    this.submitButton = page.getByRole("button", { name: /create store/i })
    this.slugPreview = page.locator("text=/buy\\.leyyow\\.com|storefronts-v2\\.vercel\\.app/")
  }

  async goto() {
    await this.page.goto("/create-store")
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 })
    await expect(this.storeNameInput).toBeVisible()
    await expect(this.slugInput).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  async fillStoreName(name: string) {
    await this.storeNameInput.fill(name)
  }

  async fillSlug(slug: string) {
    await this.slugInput.fill(slug)
  }

  async selectIndustry(industryName: string) {
    // Click the industry dropdown to open it
    await this.page.getByText("Select").first().click()
    // Wait for options to appear and click the matching one
    await this.page.getByText(industryName, { exact: false }).first().click()
  }

  async fillForm(data: { name: string; slug: string; industry: string }) {
    await this.fillStoreName(data.name)
    // Wait for slug auto-generation then override if needed
    await this.page.waitForTimeout(500)
    await this.fillSlug(data.slug)
    await this.selectIndustry(data.industry)
  }

  async submit() {
    await this.submitButton.click()
  }

  async expectSubmitDisabled() {
    await expect(this.submitButton).toBeDisabled()
  }

  async expectSubmitEnabled() {
    await expect(this.submitButton).toBeEnabled()
  }

  async expectSlugPreviewContains(slug: string) {
    await expect(this.slugPreview).toContainText(slug)
  }

  async expectRedirectToOnboarding() {
    await expect(this.page).toHaveURL(/\/onboarding/, { timeout: 15_000 })
  }

  async expectSuccessToast() {
    await expect(this.page.getByText(/store created successfully/i)).toBeVisible({
      timeout: 10_000,
    })
  }

  async expectValidationError(message: string | RegExp) {
    await expect(this.page.getByText(message)).toBeVisible()
  }
}
