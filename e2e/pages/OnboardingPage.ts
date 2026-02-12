import { type Page, type Locator, expect } from "@playwright/test"

export class OnboardingPage {
  readonly page: Page
  readonly heading: Locator
  readonly tasksHeader: Locator
  readonly storefrontChip: Locator
  readonly completionPercentage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole("heading", { name: /welcome to leyyow/i })
    this.tasksHeader = page.getByText(/tasks/i).first()
    this.storefrontChip = page.getByText(/storefront/i).first()
    this.completionPercentage = page.getByText(/% completed/i)
  }

  async goto() {
    await this.page.goto("/onboarding")
  }

  async expectPageLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 })
    await expect(this.completionPercentage).toBeVisible()
  }

  // ─── Task locators ─────────────────────────────────────

  private taskRow(titlePattern: string | RegExp) {
    return this.page.locator(`div`).filter({ hasText: titlePattern }).first()
  }

  /** Get the button for a specific onboarding task (desktop buttons) */
  taskButton(label: string | RegExp) {
    return this.page.getByRole("button", { name: label })
  }

  // ─── Task 1: Bank Details ─────────────────────────────

  get addBankButton() {
    return this.taskButton(/add bank/i)
  }

  get bankAccountModal() {
    return this.page.getByText(/add bank details/i)
  }

  get accountNumberInput() {
    return this.page.getByPlaceholder("e.g. 0123456789")
  }

  get bankSelect() {
    return this.page.getByText(/choose your bank/i)
  }

  get saveBankDetailsButton() {
    return this.page.getByRole("button", { name: /save bank details/i })
  }

  async openBankAccountModal() {
    await this.addBankButton.click()
    await expect(this.bankAccountModal).toBeVisible({ timeout: 5_000 })
  }

  async fillBankAccountForm(accountNumber: string, bankName: string) {
    await this.accountNumberInput.fill(accountNumber)
    // Open bank dropdown and select
    await this.page.getByText(/choose your bank/i).click()
    // Type to search for the bank
    const searchInput = this.page.locator("input[placeholder*='Search']").first()
    if (await searchInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await searchInput.fill(bankName)
    }
    await this.page.getByText(bankName, { exact: false }).first().click()
  }

  async expectAccountResolved() {
    // Wait for account name to appear (green text) or "Validating..."
    await expect(this.page.getByText(/validating/i)).toBeVisible({ timeout: 5_000 })
    // Then wait for resolution
    await expect(this.page.getByText(/validating/i)).not.toBeVisible({ timeout: 15_000 })
  }

  async submitBankDetails() {
    await this.saveBankDetailsButton.click()
  }

  // ─── Task 2: KYC Verification ─────────────────────────

  get verifyIdentityButton() {
    return this.taskButton(/verify identity/i)
  }

  get verifyIdentityModal() {
    return this.page.getByText(/verify identity/i).first()
  }

  get idTypeSelect() {
    return this.page.locator("[name='id_type']").first()
  }

  get idNumberInput() {
    return this.page.getByPlaceholder("e.g. 1234567890")
  }

  get bvnInput() {
    return this.page.getByPlaceholder("e.g. 12345678901")
  }

  get kycSubmitButton() {
    return this.page.getByRole("button", { name: /^submit$/i })
  }

  async openVerifyIdentityModal() {
    await this.verifyIdentityButton.click()
    await expect(
      this.page.getByText(/we require your bvn and id/i),
    ).toBeVisible({ timeout: 5_000 })
  }

  async selectIdType(idType: string) {
    // Click the "Select" placeholder in the ID type dropdown
    await this.page.getByText("Select").first().click()
    await this.page.getByText(idType, { exact: false }).first().click()
  }

  async fillKYCForm(data: {
    idType: string
    idNumber: string
    bvn: string
    filePath?: string
  }) {
    await this.selectIdType(data.idType)

    // Upload file if provided
    if (data.filePath) {
      const fileInput = this.page.locator("input[type='file']")
      await fileInput.setInputFiles(data.filePath)
    }

    await this.idNumberInput.fill(data.idNumber)
    await this.bvnInput.fill(data.bvn)
  }

  async submitKYC() {
    await this.kycSubmitButton.click()
  }

  // ─── Task 3: Add a Product ────────────────────────────

  get addProductButton() {
    return this.taskButton(/add product/i)
  }

  async clickAddProduct() {
    await this.addProductButton.click()
    await expect(this.page).toHaveURL(/\/inventory\?create=true/, { timeout: 10_000 })
  }

  // ─── Task 4: Allow Pickup ─────────────────────────────

  get pickupSwitch() {
    // The pickup task uses a Switch component, not a button
    return this.page
      .locator("div")
      .filter({ hasText: /allow pickup/i })
      .getByRole("switch")
      .first()
  }

  get pickupModal() {
    return this.page.getByText(/set up pickup/i)
  }

  get pickupAddressInput() {
    return this.page.getByPlaceholder(/enter a keyword to get suggestions/i)
  }

  get savePickupButton() {
    return this.page.getByRole("button", { name: /save settings/i })
  }

  async openPickupModal() {
    // Click on the "Allow Pickup?" row (works on both mobile and desktop)
    await this.page.getByText(/allow pickup/i).first().click()
    await expect(this.pickupModal).toBeVisible({ timeout: 5_000 })
  }

  async fillPickupForm(address: string) {
    await this.pickupAddressInput.fill(address)
    // Wait for Google Places suggestions
    await this.page.waitForTimeout(1_500)
    // Select the first suggestion if it appears
    const suggestion = this.page.locator(".pac-item").first()
    if (await suggestion.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await suggestion.click()
    }
  }

  async submitPickup() {
    await this.savePickupButton.click()
  }

  // ─── Task 5: Allow Delivery ───────────────────────────

  get deliverySwitch() {
    return this.page
      .locator("div")
      .filter({ hasText: /allow delivery/i })
      .getByRole("switch")
      .first()
  }

  get deliveryModal() {
    return this.page.getByText(/set up delivery/i)
  }

  get shipbubbleOption() {
    return this.page.getByText(/shipbubble/i).first()
  }

  get manualDeliveryOption() {
    return this.page.getByText(/manual delivery/i).first()
  }

  get deliveryContinueButton() {
    return this.page.getByRole("button", { name: /continue/i })
  }

  async openDeliveryModal() {
    await this.page.getByText(/allow delivery/i).first().click()
    await expect(this.deliveryModal).toBeVisible({ timeout: 5_000 })
  }

  async selectShipbubble() {
    await this.shipbubbleOption.click()
  }

  async selectManualDelivery() {
    await this.manualDeliveryOption.click()
  }

  async submitDeliverySelection() {
    await this.deliveryContinueButton.click()
  }

  // ─── Task 6: Add a Customer ───────────────────────────

  get addCustomerButton() {
    return this.taskButton(/add customer/i)
  }

  async clickAddCustomer() {
    await this.addCustomerButton.click()
    await expect(this.page).toHaveURL(/\/customers\?create=true/, { timeout: 10_000 })
  }

  // ─── Task 7: Record an Order ──────────────────────────

  get recordOrderButton() {
    return this.taskButton(/record order/i)
  }

  async clickRecordOrder() {
    await this.recordOrderButton.click()
    await expect(this.page).toHaveURL(/\/orders\?create=true/, { timeout: 10_000 })
  }

  // ─── Task 8: Take a Tour ─────────────────────────────

  get startTourButton() {
    return this.taskButton(/start tour/i)
  }

  // ─── Assertions ───────────────────────────────────────

  async expectTaskCompleted(taskTitle: string | RegExp) {
    // Completed tasks show a green tick-circle icon and have opacity-30
    const taskRow = this.page.locator("div").filter({ hasText: taskTitle })
    await expect(taskRow.locator("[class*='opacity-30']").first()).toBeVisible()
  }

  async expectTaskIncomplete(taskTitle: string | RegExp) {
    // Incomplete tasks should have a button or switch visible
    const taskRow = this.page.locator("div").filter({ hasText: taskTitle })
    const hasAction = await taskRow
      .locator("button, [role='switch']")
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)
    expect(hasAction).toBeTruthy()
  }

  async expectLiveStatus(isLive: boolean) {
    if (isLive) {
      await expect(this.page.getByText("Live")).toBeVisible()
    } else {
      await expect(this.page.getByText("Not live")).toBeVisible()
    }
  }

  async expectCompletionPercentage(percentage: number) {
    await expect(this.page.getByText(`${percentage}% completed`)).toBeVisible()
  }

  async getCompletionText(): Promise<string> {
    const text = await this.completionPercentage.textContent()
    return text || ""
  }

  async expectModalClosed() {
    // All modals should be hidden
    const modals = this.page.locator("[role='dialog']")
    const count = await modals.count()
    for (let i = 0; i < count; i++) {
      await expect(modals.nth(i)).not.toBeVisible({ timeout: 5_000 })
    }
  }

  async expectSuccessToast(message: string | RegExp) {
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 10_000 })
  }

  /** Count how many tasks show the green checkmark */
  async countCompletedTasks(): Promise<number> {
    // Completed tasks render a tick-circle icon
    const ticks = this.page.locator("[class*='text-green-500']")
    return await ticks.count()
  }

  /** Get all visible task titles */
  async getTaskTitles(): Promise<string[]> {
    const titles = [
      "Add Bank Details",
      "Verify Your Identity",
      "Add a product",
      "Allow Pickup?",
      "Allow Delivery?",
      "Add a customer",
      "Record your first order",
      "Take a tour",
    ]
    const visibleTitles: string[] = []
    for (const title of titles) {
      const el = this.page.getByText(title, { exact: false }).first()
      if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
        visibleTitles.push(title)
      }
    }
    return visibleTitles
  }
}
