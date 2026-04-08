import { test, expect } from "../../fixtures/base"
import { ExpensesPage } from "../../pages/ExpensesPage"

test.describe("Expenses", () => {
  let expenses: ExpensesPage

  test.beforeEach(async ({ page }) => {
    expenses = new ExpensesPage(page)
    await expenses.goto()
  })

  test("should load expenses page", async () => {
    await expenses.expectLoaded()
  })

  test("should display expense list or empty state", async ({ page }) => {
    await expenses.expectExpenseList()

    const hasExpenses = await page
      .locator("[class*='rounded-xl']")
      .filter({ hasText: /₦|\$/ })
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)
    const hasEmpty = await page
      .getByText(/no expense|no data/i)
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    expect(hasExpenses || hasEmpty).toBeTruthy()
  })

  test("should open add expense drawer", async ({ page }) => {
    await expenses.openAddExpense()

    // Expense form should appear
    await expect(
      page.getByText(/add expense|new expense|create expense/i).first(),
    ).toBeVisible({ timeout: 5_000 })
  })
})
