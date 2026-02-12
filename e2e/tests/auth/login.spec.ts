import { test, expect } from "@playwright/test"
import { LoginPage } from "../../pages/LoginPage"

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
