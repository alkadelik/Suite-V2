import { test, expect } from "../../fixtures/base"
import { OrdersPage } from "../../pages/OrdersPage"

test.describe("Orders — Create Order Wizard", () => {
  test("should open create order drawer", async ({ page }) => {
    const orders = new OrdersPage(page)
    await orders.goto()
    await orders.expectLoaded()

    await orders.openCreateOrder()

    // Step 0: Product selection should appear
    await expect(page.getByText(/select what they are buying/i)).toBeVisible({ timeout: 5_000 })
  })

  test("should complete the full create order flow", async ({ page }) => {
    const orders = new OrdersPage(page)
    await orders.goto()
    await orders.expectLoaded()

    await orders.openCreateOrder()

    // ── Step 0: Select Products ──
    await expect(page.getByText(/select what they are buying/i)).toBeVisible({ timeout: 5_000 })

    // Select the first available product
    const productCards = page.locator("[class*='cursor-pointer']").filter({ hasText: /var\./i })
    const firstProduct = productCards.first()
    if (await firstProduct.isVisible({ timeout: 5_000 })) {
      await firstProduct.click()
    }

    // Click Next
    await page.getByRole("button", { name: /next/i }).click()

    // ── Step 1: Select Variants & Qty ──
    await expect(page.getByText(/quantity|how many/i).first()).toBeVisible({ timeout: 5_000 })

    // Set quantity to 1 for the first variant
    const qtyInput = page.locator('input[type="number"]').first()
    if (await qtyInput.isVisible()) {
      await qtyInput.fill("1")
    }

    // Click Next
    await page.getByRole("button", { name: /next/i }).click()

    // ── Step 2: Customer Details ──
    await expect(
      page.getByText(/customer|who is buying/i).first(),
    ).toBeVisible({ timeout: 5_000 })

    // Select existing customer or skip (anonymous)
    const skipBtn = page.getByRole("button", { name: /skip|anonymous|next/i })
    if (await skipBtn.isVisible()) {
      await skipBtn.click()
    }

    // ── Step 3: Shipping Info ──
    await expect(
      page.getByText(/shipping|delivery|fulfil/i).first(),
    ).toBeVisible({ timeout: 5_000 })

    // Select pickup option if available, then next
    const pickupOption = page.getByText(/pick up/i).first()
    if (await pickupOption.isVisible()) {
      await pickupOption.click()
    }

    await page.getByRole("button", { name: /next/i }).click()

    // ── Step 4: Payment ──
    await expect(page.getByText(/payment/i).first()).toBeVisible({ timeout: 5_000 })

    // Select "Pay Later" or set payment to unpaid
    const payLater = page.getByText(/pay later|unpaid/i).first()
    if (await payLater.isVisible()) {
      await payLater.click()
    }

    await page.getByRole("button", { name: /next/i }).click()

    // ── Step 5: Review & Confirm ──
    await expect(page.getByText(/review|summary|confirm/i).first()).toBeVisible({ timeout: 5_000 })

    // Confirm order
    await page.getByRole("button", { name: /confirm|create|place order/i }).click()

    // Wait for success
    await expect(page.getByText(/success|created|order placed/i).first()).toBeVisible({
      timeout: 15_000,
    })
  })
})
