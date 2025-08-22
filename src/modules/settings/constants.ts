import { TableColumn } from "@components/DataTable.vue"
import { TLocation } from "./types"

export const LOCATION_COLUMNS: TableColumn<TLocation>[] = [
  { header: "Name", accessor: "name" },
  { header: "Address", accessor: "address" },
  { header: "Phone", accessor: "phone" },
  { header: "Status", accessor: "status" },
  { header: "Members", accessor: "membersCount" },
  { header: "", accessor: "action" },
]

export const LOCATIONS: TLocation[] = [
  {
    id: 1,
    name: "Headquarters",
    address: "123 Main St",
    phone: "555-1234",
    membersCount: 10,
    status: "Active",
  },
  {
    id: 2,
    name: "Branch Office",
    address: "456 Elm St",
    phone: "555-5678",
    membersCount: 5,
    status: "Archived",
  },
  {
    id: 3,
    name: "Remote Office",
    address: "789 Oak St",
    phone: "555-9012",
    membersCount: 8,
    status: "Active",
  },
  {
    id: 4,
    name: "Warehouse",
    address: "321 Pine St",
    phone: "555-3456",
    membersCount: 3,
    status: "Active",
  },
]
