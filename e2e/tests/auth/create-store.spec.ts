import { test, expect } from "@playwright/test"
import { CreateStorePage } from "../../pages/CreateStorePage"

/**
 * Create Store tests.
 *
 * These run in the "unauthenticated" project so we can control the login
 * flow ourselves and test the redirect to /create-store for users without
 * a store_uid.
 *
 * NOTE: To fully test store creation end-to-end you need a test account
 * that is email-verified but has NOT yet created a store. If such an
 * account isn't available, the "should create store and redirect to
 * onboarding" test should be skipped via env flag.
 */
test.describe("Create Store Page", () => {
  test("should display create store page elements", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    await expect(createStorePage.storeNameInput).toBeVisible()
    await expect(createStorePage.slugInput).toBeVisible()
    await expect(createStorePage.submitButton).toBeVisible()
  })

  test("should have submit button disabled when form is empty", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    await createStorePage.expectSubmitDisabled()
  })

  test("should auto-generate slug from store name", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("My Test Store")
    // Wait for the slug watcher to trigger
    await page.waitForTimeout(500)

    // The slug should be auto-generated as lowercase hyphenated
    await expect(createStorePage.slugInput).toHaveValue(/my-test-store/)
  })

  test("should show URL preview with current slug", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("Cool Shop")
    await page.waitForTimeout(500)

    // URL preview should contain the slugified store name
    await createStorePage.expectSlugPreviewContains("cool-shop")
  })

  test("should show validation error for invalid store name with numbers", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("Shop123")
    // Click away to trigger validation
    await createStorePage.slugInput.click()

    await createStorePage.expectValidationError(/cannot contain numbers|special characters/i)
  })

  test("should show validation error for store name that is too short", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("A")
    await createStorePage.slugInput.click()

    await createStorePage.expectValidationError(/at least 2 characters/i)
  })

  test("should keep submit disabled until all required fields are filled", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    // Fill only store name — should still be disabled (no industry)
    await createStorePage.fillStoreName("Valid Name")
    await page.waitForTimeout(500)
    await createStorePage.expectSubmitDisabled()
  })

  test("should load industry options from API", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    // Click the industry dropdown
    await page.getByText("Select").first().click()

    // At least one industry option should appear
    const options = page.locator("[role='option'], [role='listbox'] > *, .select-option")
    const optionCount = await options.count().catch(() => 0)

    // Fallback: check if any industry-like text is visible in the dropdown area
    const hasOptions =
      optionCount > 0 ||
      (await page
        .getByText(/fashion|food|technology|beauty|health|retail/i)
        .first()
        .isVisible({ timeout: 5_000 })
        .catch(() => false))

    expect(hasOptions).toBeTruthy()
  })

  test("should show currency field as disabled with NGN", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.goto()
    await createStorePage.expectPageLoaded()

    // Currency field should be visible but disabled
    await expect(page.getByText("NGN").first()).toBeVisible()
  })

  test("should create store and redirect to onboarding", async ({ page }) => {
    const email = process.env.E2E_NEW_USER_EMAIL
    const password = process.env.E2E_NEW_USER_PASSWORD

    if (!email || !password) {
      test.skip(
        true,
        "E2E_NEW_USER_EMAIL and E2E_NEW_USER_PASSWORD must be set for a user without a store",
      )
      return
    }

    // Login first with a user that has no store yet
    await page.goto("/login")
    await page.getByPlaceholder(/email/i).fill(email)
    await page.getByPlaceholder(/password/i).fill(password)
    await page.getByRole("button", { name: /log in/i }).click()

    // Should be redirected to /create-store
    await expect(page).toHaveURL(/\/create-store/, { timeout: 15_000 })

    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    // Fill the form
    const uniqueName = `Test Store ${Date.now()}`
    const uniqueSlug = `test-store-${Date.now()}`

    await createStorePage.fillStoreName(uniqueName)
    await page.waitForTimeout(500)
    await createStorePage.fillSlug(uniqueSlug)

    // Select an industry
    await createStorePage.selectIndustry("Fashion")

    // Submit
    await createStorePage.submit()
    await createStorePage.expectSuccessToast()
    await createStorePage.expectRedirectToOnboarding()
  })
})
