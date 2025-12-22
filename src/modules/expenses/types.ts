export type TExpense = {
  uid: string
  name: string
  category: string
  amount: string
  expense_date: string
  created_at: string
  reciept_image: string | null
  status: "pending" | "completed"
}

export type TExpenseResponse = {
  results: TExpense[]
  count: number
  next: string | null
  previous: string | null
}

export interface ExpensePayload {
  date: string
  amount: string
  currency: string
  category: string
  sub_category: string
  vendor?: string
  notes?: string
  attachment_url: File | string | null
  status: string
}

export interface ExpenseDashboardStats {
  period: {
    year: number
    month: number
  }
  current: {
    total_amount: number
    expense_count: number
    average_expense: number
  }
  previous: {
    total_amount: number
    expense_count: number
    average_expense: number
  }
  change: {
    total_amount_pct: number
    expense_count_pct: number
  }
  cogs: {
    current: {
      total_sales: number
      total_expenses: number
      gross_profit: number
    }
    previous: {
      total_sales: number
      total_expenses: number
      gross_profit: number
    }
    change: {
      total_sales_pct: number
      total_expenses_pct: number
      gross_profit_pct: number
    }
  }
  trend: Array<{
    year: number
    month: number
    total_expenses: number
    total_sales: number
  }>
  category_breakdown: Array<{
    category: string
    total_amount: number
    expense_count: number
  }>
  top_vendors: Array<{
    vendor: string
    total_amount: number
    expense_count: number
  }>
}

export interface ExpenseCategory {
  category: string
  total_amount: string
  expense_count: number
}

export interface ExpenseSubCategory {
  sub_category: string
  total_amount: string
  expense_count: number
}

export interface TExpenseSubCategory {
  uid: string
  category: string
  category_name: string
  name: string
  sort_order: number
  is_default: boolean
  store: string
  store_name: string
  created_at: string
}

export interface TExpenseCategory {
  uid: string
  name: string
  description: string
  sort_order: number
  is_default: boolean
  store_name: string
  sub_categories: TExpenseSubCategory[]
  created_at: string
}

export interface TExpenseCategoryResponse {
  results: TExpenseCategory[]
  count: number
  next: string | null
  previous: string | null
}
