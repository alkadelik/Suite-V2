import type { TCustomer } from "@modules/customers/types"
import type {
  TOrder,
  TOrderChannel,
  TOrderPaymentMethod,
  TOrderPaymentStatus,
  TOrderShippingCompany,
  TShipmentRow,
} from "./types"
import { TableColumn } from "@components/DataTable.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import type { TChipColor } from "@modules/shared/types"

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
    cell: ({ value }) => {
      const { format } = useFormatCurrency()
      return format(Number(value), { kobo: true })
    },
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
  { title: "Ongoing", key: "unfulfilled" },
  { title: "Paid", key: "paid" },
  { title: "Fulfilled", key: "fulfilled" },
  { title: "Voided", key: "voided" },
  { title: "Returned", key: "returned" },
]

export const orderSourceMap: Record<string, string> = {
  internal: "Manual Sale",
  storefront: "Website",
  popup_storefront: "Popup Website",
  popup_internal: "Manual Popup Sale",
}

const shipmentCurrencyCell = ({ value }: { value: unknown }) => {
  const { format } = useFormatCurrency()
  return format(Number(value), { kobo: true })
}

const shipmentDateCell = ({ value }: { value: unknown }) =>
  getSmartDateLabel(typeof value === "string" ? value : "")

const SHIPMENT_BASE_COLUMNS: TableColumn<TShipmentRow>[] = [
  { header: "Order ID", accessor: "order_number" },
  { header: "Customer", accessor: "customer_name", class: "max-w-[200px]" },
]

export const SHIPBUBBLE_SHIPMENT_COLUMNS: TableColumn<TShipmentRow>[] = [
  ...SHIPMENT_BASE_COLUMNS,
  { header: "Courier", accessor: "courier_name" },
  { header: "Shipping Cost", accessor: "fee", cell: shipmentCurrencyCell },
  { header: "Delivery Estimate", accessor: "date", cell: shipmentDateCell },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "actions" },
]

export const MANUAL_SHIPMENT_COLUMNS: TableColumn<TShipmentRow>[] = [
  ...SHIPMENT_BASE_COLUMNS,
  { header: "Courier", accessor: "courier_name" },
  { header: "Delivery Fee", accessor: "fee", cell: shipmentCurrencyCell },
  { header: "Order Date", accessor: "date", cell: shipmentDateCell },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "actions" },
]

export const PICKUP_SHIPMENT_COLUMNS: TableColumn<TShipmentRow>[] = [
  ...SHIPMENT_BASE_COLUMNS,
  { header: "Amount", accessor: "amount", cell: shipmentCurrencyCell },
  { header: "Order Date", accessor: "date", cell: shipmentDateCell },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "actions" },
]

export const SHIPMENT_STATUS_COLORS: Record<string, TChipColor> = {
  awaiting_shipment: "warning",
  awaiting_pickup: "warning",
  unfulfilled: "warning",
  partially_fulfilled: "warning",
  picked_up: "blue",
  in_transit: "blue",
  delivered: "success",
  fulfilled: "success",
  cancelled: "error",
  voided: "error",
}

export const SHIPMENT_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "Awaiting Shipment", value: "awaiting_shipment" },
  { label: "Awaiting Pickup", value: "awaiting_pickup" },
  { label: "Picked Up", value: "picked_up" },
  { label: "In Transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
]
