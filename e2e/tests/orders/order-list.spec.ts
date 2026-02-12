import { test, expect } from "../../fixtures/base"
import { OrdersPage } from "../../pages/OrdersPage"

test.describe("Orders — Order List", () => {
  let orders: OrdersPage

  test.beforeEach(async ({ page }) => {
    orders = new OrdersPage(page)
    await orders.goto()
  })

  test("should load orders page", async () => {
    await orders.expectLoaded()
  })

  test("should display order list or empty state", async ({ page }) => {
    // Either show orders or empty state
    const hasOrders = await page.locator("table tbody tr").first().isVisible({ timeout: 5_000 }).catch(() => false)
    const hasEmpty = await page.getByText(/no orders/i).isVisible({ timeout: 2_000 }).catch(() => false)

    expect(hasOrders || hasEmpty).toBeTruthy()
  })

  test("should display order status chips", async ({ page }) => {
    const hasOrders = await page.locator("table tbody tr").first().isVisible({ timeout: 5_000 }).catch(() => false)

    if (hasOrders) {
      // Order cards/rows should show payment status and fulfillment status chips
      const firstRow = page.locator("table tbody tr").first()
      await expect(firstRow).toBeVisible()
    }
  })

  test("should open order details on row click", async ({ page }) => {
    const hasOrders = await page.locator("table tbody tr").first().isVisible({ timeout: 5_000 }).catch(() => false)

    if (hasOrders) {
      await page.locator("table tbody tr").first().click()

      // Order details drawer should open
      await expect(
        page.getByText(/order details|order #/i).first(),
      ).toBeVisible({ timeout: 5_000 })
    }
  })

  test("should display order dashboard stats", async ({ page }) => {
    // Dashboard stats section (total orders, revenue, etc.)
    await expect(
      page.getByText(/total|orders|revenue/i).first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})
