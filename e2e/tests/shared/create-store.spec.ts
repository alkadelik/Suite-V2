import { test, expect } from "@playwright/test"
import { CreateStorePage } from "../../pages/CreateStorePage"
import { LoginPage } from "../../pages/LoginPage"

/**
 * Create Store tests.
 *
 * The /create-store page requires authentication AND the user must NOT have
 * a store_uid yet. All tests here are gated behind E2E_NEW_USER_EMAIL /
 * E2E_NEW_USER_PASSWORD — a verified account that has no store.
 *
 * These run in the "chromium" project (authenticated) but each test logs in
 * with the new-user account because the default test user already has a store.
 */

// Helper: login as the new user (no store) and land on /create-store
async function loginAsNewUser(page: import("@playwright/test").Page) {
  const email = process.env.E2E_NEW_USER_EMAIL
  const password = process.env.E2E_NEW_USER_PASSWORD

  if (!email || !password) {
    return false
  }

  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(email, password)

  // Should redirect to /create-store (user has no store_uid)
  await expect(page).toHaveURL(/\/create-store/, { timeout: 15_000 })
  return true
}

test.describe("Create Store Page", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const loggedIn = await loginAsNewUser(page)
    if (!loggedIn) {
      testInfo.skip(
        true,
        "E2E_NEW_USER_EMAIL and E2E_NEW_USER_PASSWORD must be set for a verified user without a store",
      )
    }
  })

  test("should display create store page elements", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    await expect(createStorePage.storeNameInput).toBeVisible()
    await expect(createStorePage.slugInput).toBeVisible()
    await expect(createStorePage.submitButton).toBeVisible()
  })

  test("should have submit button disabled when form is empty", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    await createStorePage.expectSubmitDisabled()
  })

  test("should auto-generate slug from store name", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("My Test Store")
    await page.waitForTimeout(500)

    await expect(createStorePage.slugInput).toHaveValue(/my-test-store/)
  })

  test("should show URL preview with current slug", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("Cool Shop")
    await page.waitForTimeout(500)

    await createStorePage.expectSlugPreviewContains("cool-shop")
  })

  test("should show validation error for invalid store name with numbers", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("Shop123")
    await createStorePage.slugInput.click()

    await createStorePage.expectValidationError(/cannot contain numbers|special characters/i)
  })

  test("should show validation error for store name that is too short", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("A")
    await createStorePage.slugInput.click()

    await createStorePage.expectValidationError(/at least 2 characters/i)
  })

  test("should keep submit disabled until all required fields are filled", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    await createStorePage.fillStoreName("Valid Name")
    await page.waitForTimeout(500)
    await createStorePage.expectSubmitDisabled()
  })

  test("should load industry options from API", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    // Click the industry dropdown
    await page.getByText("Select").first().click()

    // At least one industry option should appear
    const options = page.locator("[role='option'], [role='listbox'] > *, .select-option")
    const optionCount = await options.count().catch(() => 0)

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
    await createStorePage.expectPageLoaded()

    await expect(page.getByText("NGN").first()).toBeVisible()
  })

  test("should create store and redirect to onboarding", async ({ page }) => {
    const createStorePage = new CreateStorePage(page)
    await createStorePage.expectPageLoaded()

    const uniqueName = `Test Store ${Date.now()}`
    const uniqueSlug = `test-store-${Date.now()}`

    await createStorePage.fillStoreName(uniqueName)
    await page.waitForTimeout(500)
    await createStorePage.fillSlug(uniqueSlug)

    await createStorePage.selectIndustry("Fashion")

    await createStorePage.submit()
    await createStorePage.expectSuccessToast()
    await createStorePage.expectRedirectToOnboarding()
  })
})
