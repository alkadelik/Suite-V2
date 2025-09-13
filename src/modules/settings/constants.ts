import { TableColumn } from "@components/DataTable.vue"
import { TLocation, TSubscription, TTeam } from "./types"

type colorType = "primary" | "success" | "warning" | "error" | "alt" | "blue" | "purple" | undefined

export const LOCATION_COLUMNS: TableColumn<TLocation>[] = [
  { header: "Name", accessor: "name" },
  { header: "Address", accessor: "address" },
  { header: "Phone", accessor: "phone" },
  { header: "Status", accessor: "status" },
  { header: "Members", accessor: "membersCount", class: "pl-8" },
  { header: "", accessor: "action" },
]

export const LOCATIONS: TLocation[] = [
  {
    uid: "1",
    name: "Headquarters",
    address: "123 Main St",
    is_hq: false,
    created_at: "2023-10-01T12:00:00Z",
  },
  {
    uid: "2",
    name: "Branch Office",
    address: "456 Side St",
    is_hq: true,
    created_at: "2023-11-15T09:30:00Z",
  },
  {
    uid: "3",
    name: "Remote Office",
    address: "789 Remote Rd",
    is_hq: false,
    created_at: "2024-01-20T14:45:00Z",
  },
  {
    uid: "4",
    name: "Warehouse",
    address: "321 Warehouse Rd",
    is_hq: false,
    created_at: "2024-02-10T09:00:00Z",
  },
]

export const TEAMS_COLUMN: TableColumn<TTeam>[] = [
  { header: "Name", accessor: "firstName" },
  {
    header: "Locations",
    accessor: "locations",
    cell: ({ value }) => {
      const locations = value as TLocation[] | undefined
      return locations && Array.isArray(locations)
        ? locations.map((loc) => loc.name).join(", ")
        : "No locations"
    },
  },
  { header: "Roles", accessor: "role" },
  { header: "", accessor: "action" },
]

export const TEAMS: TTeam[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "Active",
    locations: [LOCATIONS[0], LOCATIONS[1]],
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    role: "Member",
    status: "Invited",
    locations: [LOCATIONS[1], LOCATIONS[2]],
  },
  {
    id: 3,
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.johnson@example.com",
    role: "Member",
    status: "Active",
    locations: [LOCATIONS[1]],
  },
]

export const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Assistant", value: "assistant" },
  { label: "Finance", value: "finance" },
  { label: "Sales", value: "sales" },
]

export const SUBSCRIPTION_COLUMN: TableColumn<TSubscription>[] = [
  {
    header: "Date",
    accessor: "date",
  },
  { header: "Plan name", accessor: "planName" },
  { header: "Amount", accessor: "amount" },
  { header: "Billing Period", accessor: "billingPeriod" },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "action" },
]

export const SUBSCRIPTIONS: TSubscription[] = [
  {
    id: 1,
    date: "23-08-2025",
    planName: "Bloom",
    amount: 100000,
    billingPeriod: "Monthly",
    status: "Success",
  },
  {
    id: 2,
    date: "23-07-2025",
    planName: "Bud",
    amount: 500000,
    billingPeriod: "Yearly",
    status: "Failed",
  },
  {
    id: 3,
    date: "23-06-2025",
    planName: "Burst",
    amount: 1000000,
    billingPeriod: "Yearly",
    status: "Success",
  },
]

export const getPlanColor = (planName: string): colorType => {
  const planColors: Record<string, colorType> = {
    Burst: "purple",
    Bloom: "blue",
    Bud: "success",
  }
  return planColors[planName] || "primary"
}
