import type { TExpense } from "./types"
import { TableColumn } from "@components/DataTable.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { formatCurrency } from "@/utils/format-currency"
import { TChipColor } from "@modules/shared/types"

export const EXPENSE_COLUMN: TableColumn<TExpense>[] = [
  { header: "Name", accessor: "name" },
  { header: "Category", accessor: "category_name" },
  { header: "Subcategory", accessor: "sub_category_name" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  {
    header: "Date",
    accessor: "date",
    cell: ({ item }) => getSmartDateLabel(String(item.date || item.created_at)),
  },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "actions" },
]

export const getExpenseStatusColor = (status: string): TChipColor => {
  switch (status) {
    case "paid":
      return "success"
    case "unpaid":
      return "error"
    case "pending":
      return "primary"
    default:
      return "primary"
  }
}

export const EXPENSE_CATEGORY_ICON: Record<string, string> = {
  "Cost of Goods Sold (COGS)": "box",
  "Labor Costs": "people",
  "Rent and Utilities": "flash-alt",
  "Marketing and Advertising": "volume-high",
  "Sales Expenses": "money-send",
  Insurance: "shield-tick",
  "Office Supplies and Equipment": "building",
  "Professional Fees and Services": "briefcase-tick",
  "Travel and Entertainment": "airplane",
  "Technology and IT Expenses": "cpu",
  "Financial Expenses": "wallet-money",
  "Research and Development (R&D)": "task-square",
  "Depreciation and Amortization": "trend-down",
  Taxes: "receipt-text",
  "Employee and Contractor Payments": "profile-circle",
  "Miscellaneous Expenses": "category",
  "Inventory Management and Storage": "box-search",
  "Business Expansion Costs": "trend-up",
  // old categories
  Tax: "receipt-text",
  Shipping: "truck-fast",
}
