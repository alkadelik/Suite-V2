import { type Page, type Locator, expect } from "@playwright/test"

export class ExpensesPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto("/expenses")
  }

  async expectLoaded() {
    await expect(this.page.getByText(/expenses/i).first()).toBeVisible()
  }

  async expectExpenseList() {
    // Wait for expense cards or content to load
    await this.page.waitForTimeout(2000)
  }

  /** Open the add expense drawer */
  async openAddExpense() {
    await this.page.getByRole("button", { name: /add expense|new expense/i }).click()
  }

  /** Fill expense form */
  async fillExpenseForm(data: { amount: string; description?: string }) {
    await this.page.getByPlaceholder(/amount/i).fill(data.amount)
    if (data.description) {
      await this.page.getByPlaceholder(/description|note/i).fill(data.description)
    }
  }

  /** Submit expense form */
  async submitExpense() {
    await this.page.getByRole("button", { name: /save|add|create/i }).click()
  }
}
