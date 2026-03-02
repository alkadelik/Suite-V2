import Chip from "@components/Chip.vue"
import { TableColumn } from "@components/DataTable.vue"
import { h } from "vue"
import { TEodAbandoned, TEodOrders, TEodProductsSold } from "./types"
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"

export const EOD_REPORT_SECTIONS = [
  { title: "Summary", key: "summary" },
  { title: "Payments", key: "payments" },
  { title: "Expenses", key: "expenses" },
  { title: "Customers", key: "customers" },
  { title: "Origin", key: "origin" },
  { title: "Fulfillment", key: "fulfillment" },
  { title: "Inventory", key: "inventory" },
  { title: "Abandoned", key: "abandoned" },
  { title: "Issues", key: "issues" },
  { title: "Products", key: "products" },
  { title: "Orders", key: "orders" },
]

export const EOD_FINANCIAL_DATA = [
  {
    label: "Gross Revenue",
    value: "₦218,400",
    meta: "17 orders",
    percentage: 11.3,
  },
  {
    label: "Refunds",
    value: "₦8,500",
    meta: "1 order",
    percentage: null,
  },
  {
    label: "Discounts",
    value: "₦6,250",
    meta: "4 orders",
    percentage: -2.9,
  },
  {
    label: "Shipping Costs",
    value: "₦14,000",
    meta: "₦1,167 avg / order",
    percentage: null,
  },
  {
    label: "Net Revenue",
    value: "₦189,650",
    meta: "86.8% net margin",
    percentage: 14.7,
  },
  {
    label: "Avg Order Value",
    value: "₦12,847",
    meta: "86.8% net margin",
    percentage: null,
  },
]

export const EOD_ORDERS: TEodOrders[] = [
  {
    order_number: "1001",
    order_date: "2024-06-01T10:15:00Z",
    customer_name: "John Doe",
    customer_type: "New",
    status: "fulfilled",
    items: 3,
    total_amount: 4500,
    payment_method: "card",
  },
  {
    order_number: "1002",
    order_date: "2024-06-01T11:30:00Z",
    customer_name: "Jane Smith",
    customer_type: "Returning",
    status: "unfulfilled",
    items: 1,
    total_amount: 1500,
    payment_method: "cash",
  },
  {
    order_number: "1003",
    order_date: "2024-06-01T12:45:00Z",
    customer_name: "Alice Johnson",
    customer_type: "New",
    status: "shipped",
    items: 2,
    total_amount: 3000,
    payment_method: "bank_transfer",
  },
]

export const EOD_ORDER_COLUMNS: TableColumn<TEodOrders>[] = [
  { header: "Order ID", accessor: "order_number" },
  {
    header: "Time",
    accessor: "order_date",
    cell: ({ value }) =>
      new Date(value as string).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
  },
  { header: "Customer", accessor: "customer_name" },
  {
    header: "Type",
    accessor: "customer_type",
    cell: ({ item }) =>
      h(Chip, {
        label: item.customer_type,
        color: item.customer_type === "New" ? "blue" : "success",
      }),
  },
  {
    header: "Amount",
    accessor: "total_amount",
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  {
    header: "Payment",
    accessor: "payment_method",
    cell: ({ value }) => startCase(String(value)),
  },
  { header: "Items", accessor: "items" },
  {
    header: "Status",
    accessor: "status",
    cell: ({ item }) =>
      h(Chip, {
        label: startCase(String(item.status)),
        color:
          item.status === "fulfilled"
            ? "success"
            : item.status === "unfulfilled"
              ? "error"
              : "warning",
      }),
  },
]

export const EOD_PRODUCTS_SOLD_COLUMNS: TableColumn<TEodProductsSold>[] = [
  { header: "Product", accessor: "product_name", class: "max-w-[200px] truncate" },
  { header: "Quantity", accessor: "quantity" },
  {
    header: "Revenue",
    accessor: "revenue",
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  {
    header: "Avg. Price",
    accessor: "avg_price",
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  { header: "Stock After", accessor: "stock_after_sale" },
  {
    header: "Status",
    accessor: "status",
    cell: ({ item }) =>
      h(Chip, {
        label: startCase(String(item.status)),
        color: item.status === "ok" ? "success" : item.status === "critical" ? "error" : "warning",
      }),
  },
]

export const EOD_PRODUCTS_SOLD: TEodProductsSold[] = [
  {
    product_name: "Adire Bucket Hat",
    quantity: 5,
    revenue: 25000,
    avg_price: 5000,
    stock_after_sale: 2,
    status: "critical",
  },
  {
    product_name: "Lagos Life Tote",
    quantity: 3,
    revenue: 15000,
    avg_price: 5000,
    stock_after_sale: 4,
    status: "critical",
  },
  {
    product_name: "Eko Cap",
    quantity: 8,
    revenue: 40000,
    avg_price: 5000,
    stock_after_sale: 15,
    status: "ok",
  },
  {
    product_name: "Naija Tee",
    quantity: 10,
    revenue: 50000,
    avg_price: 5000,
    stock_after_sale: 25,
    status: "ok",
  },
  {
    product_name: "Yoruba Print Dress",
    quantity: 2,
    revenue: 30000,
    avg_price: 15000,
    stock_after_sale: 1,
    status: "low",
  },
]

export const EOD_ABANDONED: TEodAbandoned[] = [
  {
    customer_name: "Michael Brown",
    items: ["Adire Bucket Hat", "Lagos Life Tote"],
    amount: 7500,
    drop_off: "shipping_info",
  },
  {
    customer_name: "Emily Davis",
    items: ["Eko Cap"],
    amount: 5000,
    drop_off: "payment_page",
  },
  {
    customer_name: "David Wilson",
    items: ["Naija Tee", "Yoruba Print Dress"],
    amount: 20000,
    drop_off: "shipping_info",
  },
]

export const EOD_ABANDONED_COLUMNS: TableColumn<TEodAbandoned>[] = [
  { header: "Customer", accessor: "customer_name" },
  {
    header: "Items",
    accessor: "items",
    cell: ({ value }) => (value as string[]).join(", "),
  },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  {
    header: "Drop-off Point",
    accessor: "drop_off",
    cell: ({ value }) =>
      startCase(
        String(value)
          .replace("shipping_info", "Shipping Info")
          .replace("payment_page", "Payment Page"),
      ),
  },
]

export const MONTHLY_REPORT_SECTIONS = [
  { title: "Summary", key: "summary" },
  { title: "Performance", key: "performance" },
  { title: "Customers", key: "customers" },
  { title: "Products", key: "products" },
  { title: "Operations", key: "operations" },
]
