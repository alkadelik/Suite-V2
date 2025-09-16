import { ICustomer } from "./types"
import { TableColumn } from "@components/DataTable.vue"

export const CUSTOMER_COLUMNS: TableColumn<ICustomer>[] = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  {
    header: "Last Order Date",
    accessor: "lastOrderDate",
    cell: ({ value }) => {
      const date = new Date(value as string)
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    },
  },
  { header: "Phone", accessor: "phone" },
  { header: "Total Orders", accessor: "totalOrders", class: "pl-8" },
  { header: "", accessor: "action" },
]

// export const CUSTOMERS: TCustomer[] = [
//   {
//     id: 1,
//     first_name: "John",
//     last_name: "Doe",
//     email: "john.doe@example.com",
//     lastOrderDate: "2023-09-15",
//     phone: "555-1234",
//     totalOrders: 5,
//     address: "12, Adeola Odeku Street, Victoria Island Annex",
//     city: "Lagos, Victoria Island",
//     dateOfBirth: "19 Jan, 1998",
//     instagramHandle: "Adebolapumping99",
//   },
//   {
//     id: 2,
//     first_name: "Jane",
//     last_name: "Smith",
//     email: "jane.smith@example.com",
//     lastOrderDate: "2023-09-16",
//     phone: "555-5678",
//     totalOrders: 3,
//   },
//   {
//     id: 3,
//     first_name: "Alice",
//     last_name: "Johnson",
//     email: "alice.johnson@example.com",
//     lastOrderDate: "2023-09-17",
//     phone: "555-9012",
//     totalOrders: 8,
//   },
// ]

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
