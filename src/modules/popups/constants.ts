import { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"
import { PopupEvent, PopupInventory } from "./types"
import { getSmartDateLabel } from "@/utils/formatDate"
import { TOrder } from "@modules/orders/types"

export const POPUP_COLUMN: TableColumn<PopupEvent>[] = [
  { header: "Name", accessor: "name" },
  {
    header: "Fee",
    accessor: "participation_fee",
    cell: ({ value }) => (Number(value) ? formatCurrency(value as number) : "Free"),
  },
  { header: "Sales", accessor: "items_sold_count" },
  { header: "Status", accessor: "status" },
  {
    header: "Start Date",
    accessor: "start_date",
    cell: ({ value }) =>
      new Date(value as string).toLocaleDateString("en-US", { dateStyle: "medium" }),
  },
  {
    header: "End Date",
    accessor: "end_date",
    cell: ({ value }) => new Date(value as string).toLocaleString("en-US", { dateStyle: "medium" }),
  },
  { header: "", accessor: "action" },
]

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

export const POPUP_INVENTORY_COLUMNS: TableColumn<PopupInventory>[] = [
  { header: "Name", accessor: "name" },
  {
    header: "Price",
    accessor: "price",
    cell: ({ item }) => getPopupPriceRange(item as PopupInventory),
  },
  {
    header: "Stock Available",
    accessor: "quantity",
    cell: ({ item }) => getInventoryQty(item as PopupInventory) || 0,
  },
  { header: "Status", accessor: "is_visible" },
  { header: "", accessor: "action" },
]

export const POPUP_ORDER_COLUMNS: TableColumn<TOrder>[] = [
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

export const getInventoryQty = (item: PopupInventory) => {
  const qty = item.variants?.reduce((acc, variant) => acc + variant.quantity, 0)
  return qty || 0
}

export const getInventoryVisibility = (item: PopupInventory) => {
  const allVisible = item.variants?.every((variant) => variant.is_visible)
  const someVisible = item.variants?.some((variant) => variant.is_visible)
  if (allVisible) return "Available"
  if (someVisible) return "Partially Visible"
  return "Unavailable"
}

export const getPopupPriceRange = (item: PopupInventory) => {
  const prices = item.variants?.map((variant) => Number(variant.event_price)) || []

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const value =
    minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`

  return value
}
