import type { TExpense } from "./types"
import { TableColumn } from "@components/DataTable.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { formatCurrency } from "@/utils/format-currency"
import { TChipColor } from "@modules/shared/types"

export const EXPENSE_COLUMN: TableColumn<TExpense>[] = [
  { header: "Name", accessor: "name" },
  { header: "Category", accessor: "category_name" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => formatCurrency(Number(value)),
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
  "Rent and Utilities": "box",
  "Marketing and Advertising": "box",
  "Sales Expenses": "box",
  Insurance: "box",
  "Office Supplies and Equipment": "box",
  "Professional Fees and Services": "box",
  "Travel and Entertainment": "box",
  "Technology and IT Expenses": "box",
  "Financial Expenses": "wallet-money",
  "Research and Development (R&D)": "box",
  "Depreciation and Amortization": "box",
  Taxes: "receipt-text",
  "Employee and Contractor Payments": "profile-circle",
  "Miscellaneous Expenses": "box",
  "Inventory Management and Storage": "box",
  "Business Expansion Costs": "box",
}
