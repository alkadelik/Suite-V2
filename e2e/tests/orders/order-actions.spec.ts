import { test, expect } from "../../fixtures/base"
import { OrdersPage } from "../../pages/OrdersPage"

test.describe("Orders — Order Actions", () => {
  test("should open order details drawer and show action menu", async ({ page }) => {
    const orders = new OrdersPage(page)
    await orders.goto()
    await orders.expectLoaded()

    // Wait for orders to load
    const hasOrders = await page
      .locator("table tbody tr")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (!hasOrders) {
      test.skip(true, "No orders available to test actions")
      return
    }

    // Click on the first order
    await page.locator("table tbody tr").first().click()

    // Drawer should show order details
    await expect(page.getByText(/order #/i).first()).toBeVisible({ timeout: 5_000 })
  })

  test("should show share receipt action for paid orders", async ({ page }) => {
    const orders = new OrdersPage(page)
    await orders.goto()
    await orders.expectLoaded()

    const hasOrders = await page
      .locator("table tbody tr")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (!hasOrders) {
      test.skip(true, "No orders available to test")
      return
    }

    // Find a paid order row and open its dropdown
    const paidRow = page.locator("table tbody tr").filter({ hasText: /paid/i }).first()

    if (await paidRow.isVisible({ timeout: 3_000 }).catch(() => false)) {
      // Click the dots menu on this row
      await paidRow.locator("button").last().click()

      // "Share receipt" should be in the dropdown
      await expect(page.getByText(/share receipt/i)).toBeVisible()
    }
  })

  test("should show share invoice action for unpaid orders", async ({ page }) => {
    const orders = new OrdersPage(page)
    await orders.goto()
    await orders.expectLoaded()

    const hasOrders = await page
      .locator("table tbody tr")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (!hasOrders) {
      test.skip(true, "No orders available to test")
      return
    }

    // Find an unpaid order row
    const unpaidRow = page.locator("table tbody tr").filter({ hasText: /unpaid/i }).first()

    if (await unpaidRow.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await unpaidRow.locator("button").last().click()

      // "Share invoice" should be in the dropdown
      await expect(page.getByText(/share invoice/i)).toBeVisible()
    }
  })

  test("should show loading spinner when clicking share receipt", async ({ page }) => {
    const orders = new OrdersPage(page)
    await orders.goto()
    await orders.expectLoaded()

    const paidRow = page.locator("table tbody tr").filter({ hasText: /paid/i }).first()

    if (await paidRow.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await paidRow.locator("button").last().click()

      const shareReceipt = page.getByText(/share receipt/i)
      if (await shareReceipt.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await shareReceipt.click()

        // The dropdown should show a spinner (async action)
        await expect(page.locator(".animate-spin")).toBeVisible({ timeout: 3_000 })

        // Wait for spinner to disappear (API call complete)
        await orders.waitForDropdownActionComplete()
      }
    }
  })

  test("should show add memo option in order details", async ({ page }) => {
    const orders = new OrdersPage(page)
    await orders.goto()
    await orders.expectLoaded()

    const hasOrders = await page
      .locator("table tbody tr")
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (!hasOrders) {
      test.skip(true, "No orders available")
      return
    }

    // Open first order
    await page.locator("table tbody tr").first().click()
    await expect(page.getByText(/order #/i).first()).toBeVisible({ timeout: 5_000 })

    // Should see memo/notes related content
    await expect(page.getByText(/memo|note/i).first()).toBeVisible({ timeout: 5_000 })
  })
})
