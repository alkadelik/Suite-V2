import type { TCustomer } from "@modules/customers/types"
import type {
  TOrder,
  TOrderChannel,
  TOrderPaymentMethod,
  TOrderPaymentStatus,
  TOrderShippingCompany,
} from "./types"
import { TableColumn } from "@components/DataTable.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { formatCurrency } from "@/utils/format-currency"

export const ORDERS: TOrder[] = []

export const ORDER_CHANNELS: TOrderChannel[] = [
  { label: "Store/Walk-in", value: 0, icon: "Shop" },
  { label: "Instagram", value: 1, icon: "Instagram" },
  { label: "Facebook", value: 5, icon: "Facebook" },
  { label: "X", value: 6, icon: "Box1" },
  { label: "Whatsapp", value: 2, icon: "Whatsapp" },
  { label: "Website", value: 3, icon: "Global" },
  { label: "Other", value: 4, icon: "Box2" },
]

export const ORDER_SHIPPING_COMPANIES: TOrderShippingCompany[] = [
  { label: "DHL", value: 1 },
  { label: "GUO Transport", value: 2 },
  { label: "GIG", value: 3 },
  { label: "Uber", value: 4 },
  { label: "Bolt", value: 5 },
  { label: "Gokada", value: 6 },
  { label: "Other", value: 0 },
]

export const ORDER_PAYMENT_METHODS: TOrderPaymentMethod[] = [
  { label: "Cash", value: 0, icon: "Moneys" },
  { label: "POS", value: 1, icon: "CardPos" },
  { label: "Transfer", value: 2, icon: "MoneyChange" },
  { label: "Other", value: 3, icon: "WalletMoney" },
]

export const ORDER_PAYMENT_STATUS: TOrderPaymentStatus[] = [
  { label: "Paid", value: "paid", icon: "card-tick", color: "success" },
  { label: "Unpaid", value: "unpaid", icon: "card-remove", color: "error" },
  { label: "Partially paid", value: "partially_paid", icon: "card-pos", color: "primary" },
]

export const anonymousCustomer: TCustomer = {
  uid: "0.1",
  id: 0.1,
  first_name: "Unknown",
  last_name: "Anonymous",
  full_name: "Unknown Anonymous",
  email: "",
  phone: "",
  total_orders: 0,
  last_order_date: "",
}

export const ORDER_COLUMNS: TableColumn<TOrder>[] = [
  { header: "Order ID", accessor: "order_number" },
  { header: "Customer", accessor: "customer_info", class: "max-w-[200px]" },
  {
    header: "Amount",
    accessor: "total_amount",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  { header: "Order", accessor: "items" },
  { header: "Status", accessor: "payment_status" },
  {
    header: "Order Date",
    accessor: "created_at",
    cell: ({ value }) => getSmartDateLabel(value as string),
  },
  { header: "Actions", accessor: "actions" },
]

export const ORDER_STATUS_TAB = [
  { title: "All", key: "all" },
  { title: "Paid", key: "paid" },
  { title: "Unpaid", key: "unpaid" },
  { title: "Voided", key: "voided" },
  // { title: "Shipments", key: "shipments" },
  { title: "Fulfilled", key: "fulfilled" },
  { title: "Ongoing", key: "unfulfilled" },
  { title: "Returned", key: "returned" },
]
