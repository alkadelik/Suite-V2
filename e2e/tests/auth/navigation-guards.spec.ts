import { test, expect } from "@playwright/test"

// These tests run in the "unauthenticated" project (no storageState)
test.describe("Navigation Guards — Unauthenticated", () => {
  test("should redirect unauthenticated users to /login when accessing /dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })

  test("should redirect unauthenticated users to /login when accessing /inventory", async ({
    page,
  }) => {
    await page.goto("/inventory")
    await expect(page).toHaveURL(/\/login/)
  })

  test("should redirect unauthenticated users to /login when accessing /orders", async ({
    page,
  }) => {
    await page.goto("/orders")
    await expect(page).toHaveURL(/\/login/)
  })

  test("should redirect unauthenticated users to /login when accessing /customers", async ({
    page,
  }) => {
    await page.goto("/customers")
    await expect(page).toHaveURL(/\/login/)
  })

  test("should redirect unauthenticated users to /login when accessing /settings", async ({
    page,
  }) => {
    await page.goto("/settings")
    await expect(page).toHaveURL(/\/login/)
  })

  test("should preserve redirect query param when redirecting to login", async ({ page }) => {
    await page.goto("/inventory")
    await expect(page).toHaveURL(/\/login\?redirect=/)
  })
})
