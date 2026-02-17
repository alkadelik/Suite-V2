import { test, expect } from "../../fixtures/base"
import { DashboardPage } from "../../pages/DashboardPage"

test.describe("Dashboard", () => {
  let dashboard: DashboardPage

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page)
    await dashboard.goto()
  })

  test("should load the dashboard", async () => {
    await dashboard.expectLoaded()
  })

  test("should display quick action cards", async () => {
    await dashboard.expectQuickActionsVisible()
  })

  test("should display store at a glance section", async () => {
    await dashboard.expectStoreGlance()
  })

  test("should navigate to inventory from quick action", async ({ page }) => {
    // Click the "Add Product" quick action
    const addProduct = page.getByText(/add product/i).first()
    if (await addProduct.isVisible()) {
      await addProduct.click()
      await expect(page).toHaveURL(/\/inventory/)
    }
  })

  test("should navigate to orders from quick action", async ({ page }) => {
    const createOrder = page.getByText(/create order/i).first()
    if (await createOrder.isVisible()) {
      await createOrder.click()
      await expect(page).toHaveURL(/\/orders/)
    }
  })
})
