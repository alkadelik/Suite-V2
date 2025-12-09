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
    accessor: "event_price",
    cell: ({ value }) => formatCurrency(value as number),
  },
  { header: "Stock Available", accessor: "available_quantity" },
  { header: "Status", accessor: "is_visible" },
  { header: "", accessor: "action" },
]

export const POPUP_ORDER_COLUMNS: TableColumn<TOrder>[] = [
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

export const getEventStatus = (event: { start_date?: string; end_date?: string } | null) => {
  if (!event?.start_date || !event?.end_date) return "ended"
  const now = new Date()
  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  if (now < startDate) return "upcoming"
  if (now >= startDate && now <= endDate) return "ongoing"
  return "ended"
}
