import type { TExpense } from "./types"
import { TableColumn } from "@components/DataTable.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { formatCurrency } from "@/utils/format-currency"

export const EXPENSE_COLUMN: TableColumn<TExpense>[] = [
  { header: "Name", accessor: "name" },
  { header: "Category", accessor: "category" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  {
    header: "Date",
    accessor: "date",
    cell: ({ item }) => getSmartDateLabel(String(item.expense_date || item.created_at)),
  },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "actions" },
]

export const SAMPLE_EXPENSE: TExpense[] = [
  {
    uid: "1",
    name: "Office Supplies",
    category: "Stationery",
    amount: "150.00",
    expense_date: "2024-06-01",
    created_at: "2024-06-01T10:00:00Z",
    reciept_image: null,
    status: "completed",
  },
  {
    uid: "2",
    name: "Client Lunch",
    category: "Entertainment",
    amount: "85.50",
    expense_date: "2024-06-03",
    created_at: "2024-06-03T12:30:00Z",
    reciept_image: null,
    status: "pending",
  },
  {
    uid: "3",
    name: "Travel Expenses",
    category: "Transportation",
    amount: "300.00",
    expense_date: "2024-06-05",
    created_at: "2024-06-05T09:15:00Z",
    reciept_image: null,
    status: "completed",
  },
]
