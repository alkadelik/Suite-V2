import { TableColumn } from "@components/DataTable.vue"
import { IStoreTheme, TLocation, TSubscription, TTeam } from "./types"

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
    uid: "b7c211bd-7c03-4754-8828-18081abd076e",
    name: "Headquarters",
    address: "123 Main St",
    is_hq: false,
    created_at: "2023-10-01T12:00:00Z",
  },
  // {
  //   uid: "2",
  //   name: "Branch Office",
  //   address: "456 Elm St",
  //   phone: "555-5678",
  //   membersCount: 5,
  //   status: "Archived",
  // },
  // {
  //   uid: "3",
  //   name: "Remote Office",
  //   address: "789 Oak St",
  //   phone: "555-9012",
  //   membersCount: 8,
  //   status: "Active",
  // },
  // {
  //   uid: "4",
  //   name: "Warehouse",
  //   address: "321 Pine St",
  //   phone: "555-3456",
  //   membersCount: 3,
  //   status: "Active",
  // },
]

export const TEAMS_COLUMN: TableColumn<TTeam>[] = [
  { header: "Name", accessor: "first_name" },
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
  { header: "Plan name", accessor: "plan_name" },
  { header: "Amount", accessor: "amount" },
  { header: "Billing Period", accessor: "date_paid" },
  { header: "Status", accessor: "status" },
  { header: "", accessor: "action" },
]

export const THEME_OPTIONS = [
  {
    title: "Themes",
    key: "themes",
    desc: " Pick a theme that reflects your brand. You can always change it later.",
  },
  {
    title: "Theme Settings",
    key: "theme-settings",
    desc: "Customize your theme settings",
    action: "Publish Settings",
  },
  {
    title: "Landing Page",
    key: "landing-page",
    desc: "Configure your landing page",
    action: "Publish Page",
  },
  {
    title: "Pop Up",
    key: "popup",
    desc: "Set up your pop-up preferences",
    action: "Publish PopUp",
  },
]

export const STORE_THEMES: IStoreTheme[] = [
  {
    uid: "1",
    name: "Dawn",
    description: "A clean, modern theme with plenty of white space and focus on your products.",
    image: "/images/themes/dawn.png",
    is_active: true,
  },
  {
    uid: "2",
    name: "Ember",
    description: "A bold, high-contrast theme designed to make your brand unforgettable.",
    image: "/images/themes/ember.png",
    is_active: false,
  },
  {
    uid: "3",
    name: "Heritage",
    description: "A timeless, structured theme with a familiar layout customers trust.",
    image: "/images/themes/heritage.png",
    is_active: false,
  },
  {
    uid: "4",
    name: "Grace",
    description: "A refined, elegant theme with soft typography and subtle detailing.",
    image: "/images/themes/grace.png",
    is_active: false,
  },
  {
    uid: "5",
    name: "Bloom",
    description:
      "A vibrant, colorful theme with playful layouts that bring energy to your storefront.",
    image: "/images/themes/bloom.png",
    is_active: false,
  },
]
