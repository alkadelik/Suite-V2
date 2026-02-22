import { test, expect } from "../../fixtures/base"
import { CustomersPage } from "../../pages/CustomersPage"

test.describe("Customers — CRUD", () => {
  const testCustomer = {
    firstName: `E2ETest`,
    lastName: `Customer${Date.now()}`,
    phone: "08012345678",
    email: `e2e-${Date.now()}@test.com`,
  }

  test("should create a new customer", async ({ page }) => {
    const customers = new CustomersPage(page)
    await customers.goto()
    await customers.expectLoaded()

    await customers.openAddCustomer()

    // Fill the form
    await customers.fillCustomerForm(testCustomer)

    // Submit
    await customers.submitCustomer()

    // Wait for success
    await expect(page.getByText(/success|created|added/i).first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test("should find the created customer by search", async ({ page }) => {
    const customers = new CustomersPage(page)
    await customers.goto()
    await customers.expectLoaded()

    await customers.searchCustomer(testCustomer.firstName)
    await customers.expectCustomerVisible(testCustomer.firstName)
  })

  test("should open customer detail page", async ({ page }) => {
    const customers = new CustomersPage(page)
    await customers.goto()
    await customers.expectLoaded()

    await customers.searchCustomer(testCustomer.firstName)
    await customers.openCustomer(testCustomer.firstName)

    // Should navigate to customer detail
    await expect(page).toHaveURL(/\/customers\//)

    // Customer name should be visible
    await expect(page.getByText(testCustomer.firstName).first()).toBeVisible()
  })

  test("should display customer order history section", async ({ page }) => {
    const customers = new CustomersPage(page)
    await customers.goto()
    await customers.expectLoaded()

    await customers.searchCustomer(testCustomer.firstName)
    await customers.openCustomer(testCustomer.firstName)

    // Order history section should exist (even if empty)
    await expect(
      page.getByText(/order|history|recent/i).first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})
