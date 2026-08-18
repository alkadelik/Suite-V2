export type SettingsNavigationSurface = "desktop" | "mobile"

export interface SettingsNavigationLink {
  label: string
  path: string
  icon: string
  mobile?: boolean
  subLinks?: readonly SettingsNavigationLink[]
}

const INTERNATIONAL_HIDDEN_LINKS = new Set([
  "Plans & Billing",
  "Storefront Design",
  "Delivery Options",
  "Domains",
])

export const SETTINGS_NAVIGATION_LINKS: readonly SettingsNavigationLink[] = [
  { label: "Profile", path: "/settings/profile", icon: "profile-circle" },
  { label: "Store Details", path: "/settings/store-details", icon: "shop-outline" },
  { label: "Password", path: "/settings/password", icon: "key" },
  { label: "Teams", path: "/settings/teams", icon: "people" },
  { label: "Plans & Billing", path: "/settings/billing", icon: "star-fast" },
  { label: "Locations", path: "/settings/locations", icon: "map" },
  { label: "Taxes", path: "/settings/taxes", icon: "receipt-text" },
  {
    label: "Storefront Design",
    path: "/settings/design",
    icon: "designtools",
    subLinks: [
      { label: "Themes", path: "/settings/design/themes", icon: "shapes-02" },
      {
        label: "Theme Settings",
        path: "/settings/design/theme-settings",
        icon: "shapes-01",
      },
      {
        label: "Landing Page",
        path: "/settings/design/landing-page",
        icon: "message-text",
      },
    ],
  },
  {
    label: "Domains",
    path: "/settings/domains",
    icon: "global",
    mobile: false,
  },
  {
    label: "Delivery Options",
    path: "/settings/delivery-options",
    icon: "truck-fast-outline",
  },
  { label: "API Key", path: "/settings/api-key", icon: "key" },
  { label: "Production", path: "/settings/production", icon: "building-outline" },
]

export function getSettingsNavigationLinks(options: {
  isHq: boolean
  isInternational: boolean
  surface: SettingsNavigationSurface
}): SettingsNavigationLink[] {
  return SETTINGS_NAVIGATION_LINKS.filter((link) => {
    if (options.surface === "mobile" && link.mobile === false) return false
    if (!options.isHq) return link.label === "Profile" || link.label === "Password"
    if (options.isInternational && INTERNATIONAL_HIDDEN_LINKS.has(link.label)) return false
    return true
  })
}
