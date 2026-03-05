import Chip from "@components/Chip.vue"
import { TableColumn } from "@components/DataTable.vue"
import { h } from "vue"
import { TEodAbandoned, TEodOrders, TEodProductsSold, TMonthlyProductRow } from "./types"
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { IReportStat } from "./components/ReportStatCard.vue"

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

export const MONTHLY_SUMMARY_STATS: IReportStat[] = [
  {
    label: "Total Sales Revenue",
    value: 120560000000,
    percentage: 20,
    percentageText: "vs Dec",
    caption: "43.9% of revenue",
  },
  {
    label: "Cost of Goods Sold",
    value: 45000000000,
    percentage: -10,
    percentageText: "vs Dec",
    caption: "37.3% of revenue",
  },
  {
    label: "Total Expenses",
    value: 15000000000,
    percentage: -5,
    percentageText: "vs Dec",
    caption: "12.4% of revenue",
  },
  {
    label: "Refunds",
    value: 5000000000,
    percentage: 15,
    percentageText: "vs Dec",
    caption: "4.1% of revenue",
  },
  {
    label: "Shipping Costs",
    value: 2000000000,
    percentage: -2,
    percentageText: "vs Dec",
    caption: "1.6% of revenue",
  },
  {
    label: "Net Revenue (EBITDA)",
    value: 8000000000,
    percentage: 10,
    percentageText: "vs Dec",
    caption: "6.5% of revenue",
  },
]

export const MONTHLY_PERFOMANCE_INSIGHTS: IReportStat[] = [
  {
    label: "Gross Margin",
    value: 62.7,
    percentage: 5.2,
    percentageText: "vs Dec",
    note: "Margin is healthy and improving. Focus on maintaining this trajectory.",
  },
  {
    label: "Avg Order Value",
    value: 12500,
    caption: "Customers are spending more",
    note: "Strong AOV growth indicates successful upselling or premium product adoption.",
  },
  {
    label: "Avg Items/Order",
    value: 2.3,
    percentage: -3.1,
    percentageText: "vs Dec",
    note: "Consider bundling strategies to increase items per transaction.",
  },
  {
    label: "Inventory Turnonver",
    value: 4.5,
    caption: "Faster inventory turnover",
    note: "Efficient stock movement reduces holding costs and improves cash flow.",
  },
  {
    label: "Sell-through Rate",
    value: 78.2,
    percentage: 3.4,
    percentageText: "vs Dec",
    note: "Strong sell-through indicates good product-market fit and inventory planning.",
  },
  {
    label: "Conversion Rate",
    value: 5.6,
    caption: "Slight decrease in conversion rate",
    note: "Review checkout flow and product page optimization to improve conversions.",
  },
  {
    label: "Cart Abandonment",
    value: 23.4,
    percentage: -2.1,
    percentageText: "vs Dec",
    note: "Improvement in cart abandonment shows better checkout experience.",
  },
  {
    label: "Discount Impact",
    value: 12.5,
    caption: "Discounts are having a positive impact",
    note: "Monitor profit margins to ensure discounting strategy remains sustainable.",
  },
]

export const MONTHLY_TOP_PRODUCTS: TMonthlyProductRow[] = [
  {
    sn: 1,
    product_name: "Classic Ankara Dress",
    amount: 485000,
    units_sold: 92,
    avg_price: 5272,
    margin: 58,
    sell_through: 89,
    inventory_turnover: 5.2,
  },
  {
    sn: 2,
    product_name: "Lagos Life Tote Bag",
    amount: 412000,
    units_sold: 154,
    avg_price: 2675,
    margin: 52,
    sell_through: 76,
    inventory_turnover: 4.8,
  },
  {
    sn: 3,
    product_name: "Adire Bucket Hat",
    amount: 358000,
    units_sold: 179,
    avg_price: 2000,
    margin: 62,
    sell_through: 94,
    inventory_turnover: 6.1,
  },
  {
    sn: 4,
    product_name: "Aso-Oke Cap",
    amount: 296000,
    units_sold: 148,
    avg_price: 2000,
    margin: 48,
    sell_through: 71,
    inventory_turnover: 4.2,
  },
  {
    sn: 5,
    product_name: "Naija Pride T-Shirt",
    amount: 267000,
    units_sold: 178,
    avg_price: 1500,
    margin: 55,
    sell_through: 82,
    inventory_turnover: 5.5,
  },
  {
    sn: 6,
    product_name: "Dashiki Shirt - Unisex",
    amount: 234000,
    units_sold: 78,
    avg_price: 3000,
    margin: 49,
    sell_through: 68,
    inventory_turnover: 3.9,
  },
  {
    sn: 7,
    product_name: "Kente Print Sneakers",
    amount: 198000,
    units_sold: 44,
    avg_price: 4500,
    margin: 44,
    sell_through: 61,
    inventory_turnover: 3.4,
  },
  {
    sn: 8,
    product_name: "Agbada Set - Premium",
    amount: 184000,
    units_sold: 8,
    avg_price: 23000,
    margin: 42,
    sell_through: 48,
    inventory_turnover: 2.1,
  },
  {
    sn: 9,
    product_name: "Yoruba Print Scarf",
    amount: 156000,
    units_sold: 104,
    avg_price: 1500,
    margin: 60,
    sell_through: 73,
    inventory_turnover: 4.5,
  },
  {
    sn: 10,
    product_name: "Afrobeat Hoodie",
    amount: 142000,
    units_sold: 71,
    avg_price: 2000,
    margin: 51,
    sell_through: 66,
    inventory_turnover: 3.7,
  },
]
