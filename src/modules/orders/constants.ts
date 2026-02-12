import type { TCustomer } from "@modules/customers/types"
import type {
  TOrder,
  TOrderChannel,
  TOrderPaymentMethod,
  TOrderPaymentStatus,
  TOrderShippingCompany,
  TShipment,
} from "./types"
import { TableColumn } from "@components/DataTable.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { formatCurrency } from "@/utils/format-currency"

export const ORDERS: TOrder[] = []

export const ORDER_CHANNELS: TOrderChannel[] = [
  { label: "Store/Walk-in", value: "walkin", icon: "Shop" },
  { label: "Instagram", value: "instagram", icon: "Instagram" },
  { label: "X", value: "x", icon: "Box1" },
  { label: "Whatsapp", value: "whatsapp", icon: "Whatsapp" },
  { label: "Website", value: "website", icon: "Global" },
  { label: "Other", value: "others", icon: "Box2" },
]

export const DELIVERY_PAYMENT_OPTION = [
  { label: "Customer pays courier directly", value: "customer_pays_courier" },
  { label: "Customer pays you", value: "customer_pays_merchant" },
  { label: "Free Shipping", value: "free_shipping" },
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
  { label: "Cash", value: "cash", icon: "Moneys" },
  { label: "POS", value: "pos", icon: "CardPos" },
  { label: "Transfer", value: "transfer", icon: "MoneyChange" },
]

export const ORDER_PAYMENT_STATUS: TOrderPaymentStatus[] = [
  { label: "Fully paid", value: "paid", icon: "card-tick", color: "success" },
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
  { header: "Items", accessor: "items" },
  { header: "Customer", accessor: "customer_info", class: "max-w-[200px]" },
  {
    header: "Amount",
    accessor: "total_amount",
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  { header: "Status", accessor: "payment_status" },
  { header: "Fulfilled", accessor: "fulfilment_status" },
  {
    header: "Order Date",
    accessor: "order_date",
    cell: ({ item }) => getSmartDateLabel(String(item.order_date || item.created_at || "")),
  },
  { header: "Actions", accessor: "actions" },
]

export const ORDER_STATUS_TAB = [
  { title: "All", key: "all" },
  { title: "Unpaid", key: "unpaid" },
  { title: "Shipments", key: "shipments" },
  { title: "Ongoing", key: "unfulfilled" },
  { title: "Paid", key: "paid" },
  { title: "Fulfilled", key: "fulfilled" },
  { title: "Voided", key: "voided" },
  { title: "Returned", key: "returned" },
]

export const orderSourceMap: Record<string, string> = {
  internal: "Internal",
  storefront: "Storefront",
  popup_storefront: "Popup",
  popup_internal: "Popup Internal",
}

export const SAMPLE_SHIPMENTS: TShipment[] = [
  {
    uid: "SHP-001",
    customer_name: "John Doe",
    courier: {
      name: "DHL",
      image_url: "https://example.com/dhl-logo.png",
    },
    delivery_fee: 1500,
    pickup_date: "2024-07-01",
    delivery_date: "2024-07-03",
    status: "in_transit",
  },
  {
    uid: "SHP-002",
    customer_name: "Jane Smith",
    courier: {
      name: "Uber",
      image_url: "",
    },
    delivery_fee: 800,
    pickup_date: "2024-07-02",
    delivery_date: "2026-02-04",
    status: "delivered",
  },
]

export const ORDER_SHIPMENT_COLUMNS: TableColumn<TShipment>[] = [
  { header: "Name", accessor: "customer_name" },
  { header: "Courier", accessor: "courier" },
  {
    header: "Delivery Fee",
    accessor: "delivery_fee",
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  {
    header: "Pickup Date",
    accessor: "pickup_date",
    cell: ({ value }) => getSmartDateLabel(String(value)),
  },
  {
    header: "Delivery Date",
    accessor: "delivery_date",
    cell: ({ value }) => getSmartDateLabel(String(value)),
  },
  { header: "Status", accessor: "status" },
]
