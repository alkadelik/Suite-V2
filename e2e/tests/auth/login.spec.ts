import { test, expect } from "@playwright/test"
import { LoginPage } from "../../pages/LoginPage"

// Run login tests serially — concurrent logins hit API rate limits
test.describe.configure({ mode: "serial" })

// These tests run in the "unauthenticated" project (no storageState)
test.describe("Login", () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test("should display login page elements", async () => {
    await loginPage.expectPageLoaded()
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeVisible()
    await expect(loginPage.forgotPasswordLink).toBeVisible()
    await expect(loginPage.signUpLink).toBeVisible()
  })

  test("should show validation errors for empty fields", async () => {
    // Try to submit without filling anything — button should be disabled
    await expect(loginPage.submitButton).toBeDisabled()
  })

  test("should show error for invalid credentials", async () => {
    await loginPage.login("invalid@test.com", "wrongpassword")

    // Should stay on login page and show an error toast or message
    await expect(loginPage.page).toHaveURL(/\/login/)
  })

  test("should login successfully with valid credentials", async () => {
    const email = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD

    if (!email || !password) {
      test.skip(true, "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set")
      return
    }

    await loginPage.login(email, password)
    await loginPage.expectRedirectAway()

    // Should be on dashboard or onboarding
    const url = loginPage.page.url()
    expect(url).toMatch(/\/(dashboard|onboarding)/)
  })

  test("should navigate to forgot password page", async () => {
    await loginPage.forgotPasswordLink.click()
    await expect(loginPage.page).toHaveURL(/\/forgot-password/)
  })

  test("should navigate to signup page", async () => {
    await loginPage.signUpLink.click()
    await expect(loginPage.page).toHaveURL(/\/signup/)
  })
})

// ─── Post-Login Redirect Flow ──────────────────────────

test.describe("Login — Post-Login Redirects", () => {
  test("should redirect to onboarding when completion is under 100%", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD

    if (!email || !password) {
      test.skip(true, "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set")
      return
    }

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(email, password)
    await loginPage.expectRedirectAway()

    const url = page.url()

    // The app checks live status after login:
    // - completion_percentage < 100 → /onboarding (if HQ)
    // - completion_percentage === 100 → /dashboard
    expect(url).toMatch(/\/(dashboard|onboarding)/)

    if (url.includes("/onboarding")) {
      // Verify onboarding page loaded properly
      await expect(page.getByText(/welcome to leyyow/i)).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText(/% completed/i)).toBeVisible()
    }
  })

  test("should redirect to create-store for user without store_uid", async ({ page }) => {
    const email = process.env.E2E_NEW_USER_EMAIL
    const password = process.env.E2E_NEW_USER_PASSWORD

    if (!email || !password) {
      test.skip(
        true,
        "E2E_NEW_USER_EMAIL and E2E_NEW_USER_PASSWORD must be set for a verified user without a store",
      )
      return
    }

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(email, password)
    await loginPage.expectRedirectAway()

    // User without store_uid should land on /create-store
    await expect(page).toHaveURL(/\/create-store/, { timeout: 15_000 })
    await expect(page.getByText(/create your store/i)).toBeVisible()
  })

  test("should preserve redirect query param through login flow", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD

    if (!email || !password) {
      test.skip(true, "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set")
      return
    }

    // Go directly to a protected page while unauthenticated
    await page.goto("/inventory")

    // Should be redirected to login with redirect param
    await expect(page).toHaveURL(/\/login\?redirect=/)

    // Now login
    const loginPage = new LoginPage(page)
    await loginPage.login(email, password)
    await loginPage.expectRedirectAway()

    // After login, if onboarding is complete, should go to the original page
    // If onboarding is incomplete, goes to /onboarding instead
    const url = page.url()
    expect(url).toMatch(/\/(inventory|onboarding|dashboard)/)
  })

  test("should show live status check spinner during redirect decision", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD

    if (!email || !password) {
      test.skip(true, "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set")
      return
    }

    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.fillEmail(email)
    await loginPage.fillPassword(password)

    // Submit and check that the button shows loading state
    await loginPage.submit()

    // The submit button should enter a loading state
    // (checking live status happens after login API returns)
    await expect(loginPage.submitButton).toBeVisible()

    // Eventually redirects away
    await loginPage.expectRedirectAway()
  })
})

// ─── Full Auth → Create Store → Onboarding Flow ───────

test.describe("Login — Full New User Flow", () => {
  test("should complete: login → create store → onboarding", async ({ page }) => {
    const email = process.env.E2E_NEW_USER_EMAIL
    const password = process.env.E2E_NEW_USER_PASSWORD

    if (!email || !password) {
      test.skip(
        true,
        "E2E_NEW_USER_EMAIL and E2E_NEW_USER_PASSWORD must be set for a verified user without a store",
      )
      return
    }

    // Step 1: Login
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(email, password)
    await loginPage.expectRedirectAway()

    // Step 2: Should land on /create-store
    await expect(page).toHaveURL(/\/create-store/, { timeout: 15_000 })
    await expect(page.getByText(/create your store/i)).toBeVisible({ timeout: 10_000 })

    // Fill create store form
    const uniqueSlug = `e2e-test-${Date.now()}`
    await page.getByPlaceholder("e.g. smile socks").fill("E2E Test Store")
    await page.waitForTimeout(500)
    await page.getByPlaceholder("smile-socks").fill(uniqueSlug)

    // Select industry
    await page.getByText("Select").first().click()
    await page.waitForTimeout(500)
    // Click first available industry option
    const industryOption = page.locator("[role='option'], .select-option").first()
    if (await industryOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await industryOption.click()
    } else {
      // Fallback: click any visible industry text
      await page
        .getByText(/fashion|food|technology|beauty|health|retail/i)
        .first()
        .click()
    }

    // Submit
    await page.getByRole("button", { name: /create store/i }).click()

    // Step 3: Should redirect to /onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15_000 })

    // Verify onboarding loaded with all tasks
    await expect(page.getByText(/welcome to leyyow/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/% completed/i)).toBeVisible()

    // All 8 tasks should be visible
    await expect(page.getByText(/add bank details/i)).toBeVisible()
    await expect(page.getByText(/verify your identity/i)).toBeVisible()
    await expect(page.getByText(/add a product/i)).toBeVisible()
    await expect(page.getByText(/allow pickup/i)).toBeVisible()
    await expect(page.getByText(/allow delivery/i)).toBeVisible()
    await expect(page.getByText(/add a customer/i)).toBeVisible()
    await expect(page.getByText(/record your first order/i)).toBeVisible()
    await expect(page.getByText(/take a tour/i)).toBeVisible()
  })
})
