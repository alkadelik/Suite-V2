import type { TExpense } from "./types"
import { TableColumn } from "@components/DataTable.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { TChipColor } from "@modules/shared/types"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

export const EXPENSE_COLUMN: TableColumn<TExpense>[] = [
  { header: "Name", accessor: "name" },
  { header: "Category", accessor: "category_name" },
  { header: "Subcategory", accessor: "sub_category_name" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => {
      const { format } = useFormatCurrency()
      return format(Number(value), { kobo: true })
    },
  },
  {
    header: "Date",
    accessor: "date",
    cell: ({ item }) => getSmartDateLabel(String(item.date || item.created_at)),
  },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "actions" },
]

/**
 * What the Payables tab counts as outstanding. Sent as repeated query params
 * (`?status=pending&status=unpaid`) — see the serializer note in `baseApi`.
 */
export const PAYABLE_STATUSES = ["pending", "unpaid"]

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

/**
 * Tax expenses are logged automatically but remitted off-platform, so they still
 * need the manual "Mark as paid" action that other auto entries don't get.
 * Matches both the current "Taxes" category and the legacy "Tax" one.
 */
export const isTaxCategory = (value?: string | null): boolean =>
  !!value && value.toLowerCase().includes("tax")

/**
 * Shipping payables aren't a category of their own — they're the "Shipping and
 * handling" sub-category under Sales Expenses.
 */
export const isShippingSubcategory = (value?: string | null): boolean =>
  !!value && value.toLowerCase().includes("shipping and handling")

/** Payables is segmented by what the money is owed for, not by status. */
export const PAYABLE_SUB_TABS = [
  { title: "All", key: "all" },
  { title: "Taxes", key: "taxes" },
  { title: "Shipping", key: "shipping" },
]

/** Plural noun each payables sub-tab counts, for headings and confirmations */
export const PAYABLE_SUB_TAB_NOUN: Record<string, string> = {
  all: "payables",
  taxes: "taxes",
  shipping: "shipping payables",
}

export const isTaxLikeSubcategory = (value?: string | null) => {
  if (!value) return false
  const normalized = value.toLowerCase()
  if (normalized.includes("tax")) return "VAT"
  if (normalized.includes("vat")) return "VAT"
  if (normalized.includes("shipping")) return "Shipping"
}
