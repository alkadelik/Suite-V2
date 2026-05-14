import { TableColumn } from "@components/DataTable.vue"
import {
  IStoreTheme,
  TLocation,
  TSubscription,
  TTeam,
  TCustomDomainStatus,
  TDnsRecord,
} from "./types"

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
  // { header: "Email", accessor: "email" },
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
  { header: "Status", accessor: "status" },
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
  // {
  //   title: "Popup Modal",
  //   key: "popup",
  //   desc: "Show a popup modal with ongoing offers to your visitors",
  //   action: "Publish Popup",
  // },
]

export const STORE_THEMES: IStoreTheme[] = [
  {
    uid: "1",
    name: "Dawn",
    description: "A clean, modern theme with plenty of white space and focus on your products.",
    preview_image: "/images/themes/dawn.png",
    in_use: true,
  },
  {
    uid: "2",
    name: "Ember",
    description: "A bold, high-contrast theme designed to make your brand unforgettable.",
    preview_image: "/images/themes/ember.png",
    in_use: false,
  },
  {
    uid: "3",
    name: "Heritage",
    description: "A timeless, structured theme with a familiar layout customers trust.",
    preview_image: "/images/themes/heritage.png",
    in_use: false,
  },
  {
    uid: "4",
    name: "Grace",
    description: "A refined, elegant theme with soft typography and subtle detailing.",
    preview_image: "/images/themes/grace.png",
    in_use: false,
  },
  {
    uid: "5",
    name: "Bloom",
    description:
      "A vibrant, colorful theme with playful layouts that bring energy to your storefront.",
    preview_image: "/images/themes/bloom.png",
    in_use: false,
  },
]

// --- Domains ---

export type TChipColor = "primary" | "success" | "warning" | "error" | "alt" | "blue" | "purple"

export const DNS_RECORD_COLUMNS: TableColumn<TDnsRecord>[] = [
  { header: "Host", accessor: "host", class: "min-w-[72px]" },
  { header: "Type", accessor: "type", class: "min-w-[80px]" },
  { header: "Value", accessor: "value", class: "min-w-[220px]" },
  { header: "Status", accessor: "status", class: "min-w-[150px]" },
  { header: "", accessor: "action", class: "min-w-[48px]" },
]

/** Status → chips + optional setup banner shown on the card and detail page. */
export const DOMAIN_STATUS_META: Record<
  TCustomDomainStatus,
  {
    chips: { label: string; color: TChipColor }[]
    banner?: { title: string; message: string }
  }
> = {
  PENDING: {
    chips: [
      { label: "Connected", color: "purple" },
      { label: "SSL Inactive", color: "alt" },
      { label: "Missing records", color: "warning" },
    ],
    banner: {
      title: "Finish setting up your domain",
      message:
        "We couldn't detect your DNS records yet. Add the required records in your domain provider to connect your domain.",
    },
  },
  VERIFYING: {
    chips: [
      { label: "Connected", color: "purple" },
      { label: "SSL Inactive", color: "alt" },
      { label: "Pending", color: "warning" },
    ],
    banner: {
      title: "Verifying your domain",
      message: "We're checking your DNS records. This usually takes a few minutes.",
    },
  },
  ACTIVE: {
    chips: [
      { label: "Connected", color: "purple" },
      { label: "SSL Active", color: "success" },
      { label: "All Records Correct", color: "blue" },
    ],
  },
  FAILED: {
    chips: [
      { label: "Connection Failed", color: "error" },
      { label: "SSL Inactive", color: "alt" },
      { label: "Missing records", color: "warning" },
    ],
    banner: {
      title: "Connection failed",
      message:
        "We couldn't verify your DNS records. Add the required records in your domain provider and try again.",
    },
  },
}

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Enter your domain",
    description: "Type your domain and we'll show you exactly what to add",
    duration: "1 min",
  },
  {
    step: 2,
    title: "Add DNS records",
    description: "Copy the records into your registrar's DNS settings",
    duration: "5 min",
  },
  {
    step: 3,
    title: "We verify each one",
    description: "Watch each record confirm in real time — or simply close the tab",
    duration: "30–60 min",
  },
  {
    step: 4,
    title: "Your domain goes live",
    description: "We email you when it's done — SSL active, www redirect on",
    duration: "Done",
  },
]

export const DNS_INSTRUCTION_STEPS = [
  "Sign in to your domain registrar and open your domain's DNS settings.",
  "Add a new record for each row in the table above (Host, Type, Value).",
  "Save your changes — DNS updates can take up to 48 hours, but usually finish within a few minutes.",
  "Come back here and continue to the next step to verify the connection.",
]

export const DOMAIN_BENEFITS = [
  "Free SSL certificate — included and auto-renewed",
  "Works with any registrar — GoDaddy, Cloudflare and more",
  "Step-by-step guidance for your provider",
  "We'll email you when it's live — you don't need to wait",
]

/** "Get A Domain" has no destination yet — keep the button rendered but inert. */
export const GET_A_DOMAIN_ENABLED = false

/**
 * Fallback fixture used when the backend hasn't populated `dns_records` yet.
 * Remove once the live API reliably returns DNS records.
 */
export const MOCK_DNS_RECORDS: TDnsRecord[] = [
  { host: "@", type: "A", value: "64.225.111.78", status: "not_found" },
  { host: "www", type: "CNAME", value: "shop.your-domain.com", status: "not_found" },
  { host: "@", type: "TXT", value: "leyyow-verify=abc123", status: "not_found" },
]
