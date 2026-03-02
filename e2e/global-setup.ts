import { test as setup, expect } from "@playwright/test"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.resolve(__dirname, ".auth/user.json")

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    throw new Error(
      "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set. " +
        "Create e2e/.env.test or pass them as environment variables.",
    )
  }

  // Navigate to login page
  await page.goto("/login")
  await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 10_000 })

  // Fill login form
  await page.getByPlaceholder(/example@gmail/i).fill(email)
  await page.locator('input[type="password"]').fill(password)

  // Submit
  await page.getByRole("button", { name: /log in/i }).click()

  // Wait for redirect away from login (dashboard, onboarding, or any authenticated route)
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 })

  // Save signed-in state
  await page.context().storageState({ path: authFile })
})
