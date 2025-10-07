import { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"
import { PopupEvent } from "./types"

export const POPUP_COLUMN: TableColumn<PopupEvent>[] = [
  { header: "Name", accessor: "name" },
  {
    header: "Fee",
    accessor: "participant_fee",
    cell: ({ value }) => (value ? formatCurrency(value as number) : "Free"),
  },
  { header: "Sales", accessor: "items_sold_count" },
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
