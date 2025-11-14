import { ICustomer } from "./types"
import { TableColumn } from "@components/DataTable.vue"

export const CUSTOMER_COLUMNS: TableColumn<ICustomer>[] = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  {
    header: "Last Order Date",
    accessor: "last_order_date",
    cell: ({ value }) => {
      if (!value) return "--"
      const date = new Date(value as string)
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    },
  },
  { header: "Phone", accessor: "phone" },
  {
    header: "Total Orders",
    accessor: "total_orders",
    class: "pl-8",
  },
  { header: "", accessor: "action" },
]

export const EXPORT_FIELD_OPTIONS = [
  { label: "First Name", value: "first_name" },
  { label: "Last Name", value: "last_name" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Last Order Date", value: "last_order_date" },
  { label: "Order Count", value: "order_count" },
]

export const EXPORT_PERIOD_OPTIONS = [
  { label: "All", value: "all" },
  { label: "This month", value: "this_month" },
  { label: "Last month", value: "last_month" },
  // { label: "Last 7 days", value: "last_7_days" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "Last 90 days", value: "last_90_days" },
  { label: "Custom", value: "custom" },
]
