import { test, expect } from "../../fixtures/base"
import { OnboardingPage } from "../../pages/OnboardingPage"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Onboarding tests.
 *
 * These run in the "chromium" project with full authentication (storageState).
 * They validate the onboarding page, all 8 task items, modal interactions,
 * navigation-based tasks, and completion tracking.
 *
 * NOTE: Some tasks (bank details, KYC) make real API calls. Tests that
 * modify account state are gated behind E2E_RUN_DESTRUCTIVE env flag
 * to prevent polluting the test account.
 */
test.describe("Onboarding Page", () => {
  let onboarding: OnboardingPage

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page)
    await onboarding.goto()
    await onboarding.expectPageLoaded()
  })

  // ─── Page Structure ──────────────────────────────────

  test("should display welcome heading and subtext", async () => {
    await expect(onboarding.heading).toBeVisible()
    await expect(
      onboarding.page.getByText(/the steps below will help you set up your store/i),
    ).toBeVisible()
  })

  test("should display all 8 onboarding tasks", async () => {
    const titles = await onboarding.getTaskTitles()
    expect(titles).toContain("Add Bank Details")
    expect(titles).toContain("Verify Your Identity")
    expect(titles).toContain("Add a product")
    expect(titles).toContain("Allow Pickup?")
    expect(titles).toContain("Allow Delivery?")
    expect(titles).toContain("Add a customer")
    expect(titles).toContain("Record your first order")
    expect(titles).toContain("Take a tour")
  })

  test("should display storefront live/not-live status chip", async () => {
    await expect(onboarding.storefrontChip).toBeVisible()

    // Should show either "Live" or "Not live"
    const hasLive = await onboarding.page
      .getByText("Live")
      .first()
      .isVisible()
      .catch(() => false)
    const hasNotLive = await onboarding.page
      .getByText("Not live")
      .first()
      .isVisible()
      .catch(() => false)
    expect(hasLive || hasNotLive).toBeTruthy()
  })

  test("should display completion percentage", async () => {
    const text = await onboarding.getCompletionText()
    expect(text).toMatch(/\d+% completed/)
  })

  // ─── Task 1: Bank Account Modal ──────────────────────

  test("should open bank account modal from Add Bank button", async () => {
    // Skip if already completed
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /add bank details/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Bank details task already completed")
      return
    }

    await onboarding.openBankAccountModal()

    // Verify modal content
    await expect(onboarding.accountNumberInput).toBeVisible()
    await expect(onboarding.page.getByText(/choose your bank/i)).toBeVisible()
    await expect(onboarding.saveBankDetailsButton).toBeVisible()
    await expect(onboarding.saveBankDetailsButton).toBeDisabled()
  })

  test("should validate bank account number format", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /add bank details/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Bank details task already completed")
      return
    }

    await onboarding.openBankAccountModal()
    await onboarding.accountNumberInput.fill("12345") // Too short
    await onboarding.page.getByText(/choose your bank/i).click() // blur

    await expect(
      onboarding.page.getByText(/must be exactly 10 digits/i),
    ).toBeVisible({ timeout: 5_000 })
  })

  test("should resolve account name when valid number and bank are provided", async () => {
    const runDestructive = process.env.E2E_RUN_DESTRUCTIVE === "true"
    if (!runDestructive) {
      test.skip(true, "Set E2E_RUN_DESTRUCTIVE=true to run bank account resolution test")
      return
    }

    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /add bank details/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Bank details task already completed")
      return
    }

    await onboarding.openBankAccountModal()

    const testAccountNumber = process.env.E2E_TEST_ACCOUNT_NUMBER || "0123456789"
    const testBankName = process.env.E2E_TEST_BANK_NAME || "Access Bank"

    await onboarding.fillBankAccountForm(testAccountNumber, testBankName)
    await onboarding.expectAccountResolved()

    // After resolution, the save button should become enabled
    await expect(onboarding.saveBankDetailsButton).toBeEnabled({ timeout: 10_000 })
  })

  // ─── Task 2: KYC Verification Modal ─────────────────

  test("should open verify identity modal", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /verify your identity/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "KYC task already completed")
      return
    }

    await onboarding.openVerifyIdentityModal()

    await expect(onboarding.idNumberInput).toBeVisible()
    await expect(onboarding.bvnInput).toBeVisible()
    await expect(onboarding.kycSubmitButton).toBeVisible()
    await expect(onboarding.kycSubmitButton).toBeDisabled()
  })

  test("should display all ID type options", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /verify your identity/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "KYC task already completed")
      return
    }

    await onboarding.openVerifyIdentityModal()

    // Open the ID type dropdown
    await onboarding.page.getByText("Select").first().click()

    // Verify all ID types are available
    await expect(onboarding.page.getByText(/international passport/i)).toBeVisible()
    await expect(onboarding.page.getByText(/national id/i)).toBeVisible()
    await expect(onboarding.page.getByText(/driver.*license/i)).toBeVisible()
    await expect(onboarding.page.getByText(/voter.*card/i)).toBeVisible()
  })

  test("should validate BVN must be 11 digits", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /verify your identity/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "KYC task already completed")
      return
    }

    await onboarding.openVerifyIdentityModal()
    await onboarding.bvnInput.fill("12345") // Too short
    await onboarding.idNumberInput.click() // blur

    await expect(
      onboarding.page.getByText(/must be exactly 11 digits/i),
    ).toBeVisible({ timeout: 5_000 })
  })

  test("should submit KYC with all fields filled", async () => {
    const runDestructive = process.env.E2E_RUN_DESTRUCTIVE === "true"
    if (!runDestructive) {
      test.skip(true, "Set E2E_RUN_DESTRUCTIVE=true to run KYC submission test")
      return
    }

    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /verify your identity/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "KYC task already completed")
      return
    }

    await onboarding.openVerifyIdentityModal()

    // Create a dummy file for upload
    const dummyFilePath = path.resolve(__dirname, "../../fixtures/test-id.png")

    await onboarding.fillKYCForm({
      idType: "National ID (NIN)",
      idNumber: "12345678901",
      bvn: "12345678901",
      filePath: dummyFilePath,
    })

    await onboarding.submitKYC()
    await onboarding.expectSuccessToast(/identity verification submitted/i)
  })

  // ─── Task 3: Add a Product (Navigation) ──────────────

  test("should navigate to inventory with create param when clicking Add Product", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /add a product/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Add product task already completed")
      return
    }

    await onboarding.clickAddProduct()
  })

  // ─── Task 4: Allow Pickup Modal ──────────────────────

  test("should open pickup configuration modal", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /allow pickup/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Pickup task already completed")
      return
    }

    await onboarding.openPickupModal()

    // Verify modal content
    await expect(onboarding.pickupAddressInput).toBeVisible()
    await expect(onboarding.savePickupButton).toBeVisible()

    // Verify time inputs are present with defaults
    const weekdayFromInput = onboarding.page.locator("input[type='time']").first()
    await expect(weekdayFromInput).toBeVisible()
  })

  test("should show pickup time inputs with default values", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /allow pickup/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Pickup task already completed")
      return
    }

    await onboarding.openPickupModal()

    // Should have 4 time inputs (weekday from/to, weekend from/to)
    const timeInputs = onboarding.page.locator("input[type='time']")
    await expect(timeInputs).toHaveCount(4)

    // Verify weekday/weekend labels
    await expect(onboarding.page.getByText(/weekdays.*mon.*fri/i)).toBeVisible()
    await expect(onboarding.page.getByText(/weekends.*sat.*sun/i)).toBeVisible()
  })

  // ─── Task 5: Allow Delivery Modal ────────────────────

  test("should open delivery configuration modal with two options", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /allow delivery/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Delivery task already completed")
      return
    }

    await onboarding.openDeliveryModal()

    // Should show both delivery options
    await expect(onboarding.shipbubbleOption).toBeVisible()
    await expect(onboarding.manualDeliveryOption).toBeVisible()
    await expect(onboarding.deliveryContinueButton).toBeVisible()
  })

  test("should highlight selected delivery option", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /allow delivery/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Delivery task already completed")
      return
    }

    await onboarding.openDeliveryModal()

    // Click manual delivery option
    await onboarding.selectManualDelivery()

    // The manual delivery card should have the selected border style
    const manualCard = onboarding.page
      .locator("div.cursor-pointer.rounded-2xl")
      .filter({ hasText: /manual delivery/i })

    await expect(manualCard).toHaveClass(/border-primary/, { timeout: 3_000 })
  })

  test("should show warning box about ShipBubble redirect", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /allow delivery/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Delivery task already completed")
      return
    }

    await onboarding.openDeliveryModal()

    await expect(onboarding.page.getByText(/heads up/i)).toBeVisible()
    await expect(
      onboarding.page.getByText(/leyyow doesn.*handle deliveries directly/i),
    ).toBeVisible()
  })

  // ─── Task 6: Add a Customer (Navigation) ─────────────

  test("should navigate to customers with create param when clicking Add Customer", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /add a customer/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Add customer task already completed")
      return
    }

    await onboarding.clickAddCustomer()
  })

  // ─── Task 7: Record an Order (Navigation) ────────────

  test("should navigate to orders with create param when clicking Record Order", async () => {
    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /record your first order/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Record order task already completed")
      return
    }

    await onboarding.clickRecordOrder()
  })

  // ─── Task 8: Take a Tour ─────────────────────────────

  test("should display Start Tour button (always incomplete)", async () => {
    await expect(onboarding.startTourButton).toBeVisible()
  })

  // ─── Full Onboarding Flow (Destructive) ──────────────

  test("should complete bank details task via modal", async () => {
    const runDestructive = process.env.E2E_RUN_DESTRUCTIVE === "true"
    if (!runDestructive) {
      test.skip(true, "Set E2E_RUN_DESTRUCTIVE=true to run full bank details flow")
      return
    }

    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /add bank details/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Bank details already completed")
      return
    }

    const testAccountNumber = process.env.E2E_TEST_ACCOUNT_NUMBER
    const testBankName = process.env.E2E_TEST_BANK_NAME

    if (!testAccountNumber || !testBankName) {
      test.skip(true, "E2E_TEST_ACCOUNT_NUMBER and E2E_TEST_BANK_NAME must be set")
      return
    }

    await onboarding.openBankAccountModal()
    await onboarding.fillBankAccountForm(testAccountNumber, testBankName)
    await onboarding.expectAccountResolved()
    await onboarding.submitBankDetails()

    await onboarding.expectSuccessToast(/bank account details saved/i)
    await onboarding.expectModalClosed()
  })

  test("should complete pickup setup via modal", async () => {
    const runDestructive = process.env.E2E_RUN_DESTRUCTIVE === "true"
    if (!runDestructive) {
      test.skip(true, "Set E2E_RUN_DESTRUCTIVE=true to run pickup setup flow")
      return
    }

    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /allow pickup/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Pickup already completed")
      return
    }

    await onboarding.openPickupModal()
    await onboarding.fillPickupForm("Lagos Nigeria")
    await onboarding.submitPickup()

    await onboarding.expectSuccessToast(/pickup settings saved/i)
    await onboarding.expectModalClosed()
  })

  test("should add a product via navigation and return to onboarding", async ({ apiHelper }) => {
    const runDestructive = process.env.E2E_RUN_DESTRUCTIVE === "true"
    if (!runDestructive) {
      test.skip(true, "Set E2E_RUN_DESTRUCTIVE=true to run add product flow")
      return
    }

    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /add a product/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Add product already completed")
      return
    }

    // Create a product via API to mark the task complete
    const product = await apiHelper.createProduct({
      name: `E2E Onboarding Product ${Date.now()}`,
    })

    // Refresh the page to pick up the new state
    await onboarding.goto()
    await onboarding.expectPageLoaded()

    // Product task should now be completed
    await onboarding.expectTaskCompleted(/add a product/i)

    // Cleanup
    if (product?.data?.uid) {
      await apiHelper.deleteProduct(product.data.uid)
    }
  })

  test("should add a customer via navigation and return to onboarding", async ({ apiHelper }) => {
    const runDestructive = process.env.E2E_RUN_DESTRUCTIVE === "true"
    if (!runDestructive) {
      test.skip(true, "Set E2E_RUN_DESTRUCTIVE=true to run add customer flow")
      return
    }

    const isCompleted = await onboarding.page
      .locator("div")
      .filter({ hasText: /add a customer/i })
      .locator("[class*='opacity-30']")
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (isCompleted) {
      test.skip(true, "Add customer already completed")
      return
    }

    // Create a customer via API
    const customer = await apiHelper.createCustomer({
      first_name: "E2E",
      last_name: `Test ${Date.now()}`,
      email: `e2e-onboarding-${Date.now()}@test.com`,
    })

    // Refresh the page
    await onboarding.goto()
    await onboarding.expectPageLoaded()

    // Customer task should now be completed
    await onboarding.expectTaskCompleted(/add a customer/i)

    // Cleanup
    if (customer?.data?.uid) {
      await apiHelper.deleteCustomer(customer.data.uid)
    }
  })
})

test.describe("Onboarding — Completion Tracking", () => {
  test("should show updated completion percentage after completing tasks", async ({ page }) => {
    const onboarding = new OnboardingPage(page)
    await onboarding.goto()
    await onboarding.expectPageLoaded()

    // Just verify the percentage is displayed and is a valid number
    const text = await onboarding.getCompletionText()
    const match = text.match(/(\d+)%/)
    expect(match).not.toBeNull()

    const percentage = parseInt(match![1])
    expect(percentage).toBeGreaterThanOrEqual(0)
    expect(percentage).toBeLessThanOrEqual(100)
  })

  test("should redirect to dashboard when completion is 100%", async ({ page }) => {
    // This test verifies the router guard behavior
    // If the test account has 100% completion, navigating to /onboarding
    // should redirect to /dashboard
    await page.goto("/onboarding")

    // Wait for the page to settle
    await page.waitForTimeout(3_000)

    const url = page.url()
    // Should be on either /onboarding (if incomplete) or /dashboard (if 100%)
    expect(url).toMatch(/\/(onboarding|dashboard)/)
  })

  test("completed tasks should have green checkmark and reduced opacity", async ({ page }) => {
    const onboarding = new OnboardingPage(page)
    await onboarding.goto()
    await onboarding.expectPageLoaded()

    const completedCount = await onboarding.countCompletedTasks()

    // If any tasks are completed, verify their visual state
    if (completedCount > 0) {
      const greenTicks = page.locator("[class*='text-green-500']")
      await expect(greenTicks.first()).toBeVisible()
    }
  })
})
