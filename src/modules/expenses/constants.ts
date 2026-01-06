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
