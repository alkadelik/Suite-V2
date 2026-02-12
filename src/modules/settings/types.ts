import { IRole } from "@modules/shared/types"

export type TLocation = {
  uid: string
  name: string
  is_hq: boolean
  address: string
  created_at: string
}

export type TLocationFormData = {
  name: string
  address: string
}

export type TAssignedLocation = {
  uid: string
  name: string
  is_hq: boolean
  address: string | null
  created_at: string
}

export type TTeam = {
  uid: string
  first_name: string
  last_name: string
  email: string
  roles: IRole[]
  assigned_locations: TAssignedLocation[]
  is_suspended: boolean
  suspended_at: string | null
}

export type TSubscription = {
  uid: string
  amount: string
  status: "pending" | "completed" | "failed" // Based on API response
  date_paid: Date | null
  is_payment_for: string
  transaction_id: string | null
  user_name: string
  store_name: string
}

export interface IInvitePayload {
  email: string
  roles: string[]
  locations: string[]
}

export interface IUpdateMemberPayload {
  uid: string
  roles: string[]
  locations: string[]
}

export interface IStoreDetails {
  uid: string
  name: string
  slug: string
  logo: string | File | null
  industry: string
  industry_name: string
  delivery_enabled: boolean
  manual_delivery_enabled?: boolean
  express_delivery_enabled?: boolean
  created_at: string
  locations: TLocation[]
  store_email: string
  store_phone: string
  support_email: string
  support_phone: string
  instagram_handle: string
  currency: string
  pickup_location?: string
  pickup_weekday_start_time?: string
  pickup_weekday_end_time?: string
  pickup_weekend_start_time?: string
  pickup_weekend_end_time?: string
  collect_vat?: boolean
  tax_collection_enabled?: boolean
  tax_rate?: string
  add_tax_to_product_price?: boolean
  material_type?: string
}

export interface IUpdateStoreDetailsPayload {
  store_name?: string
  logo?: string | null
  industry?: string
  currency?: string
  store_email?: string
  store_phone?: string
  support_email?: string
  support_phone?: string
  instagram_handle?: string
  delivery_enabled?: boolean
  manual_delivery_enabled?: boolean
  express_delivery_enabled?: boolean
  pickup_location?: string
  pickup_weekday_start_time?: string
  pickup_weekday_end_time?: string
  pickup_weekend_start_time?: string
  pickup_weekend_end_time?: string
  collect_vat?: boolean
  tax_collection_enabled?: boolean
  add_tax_to_product_price?: boolean
  material_type?: string
}

export type TIndustry = {
  uid: string
  name: string
  description: string
  is_active: boolean
}

export type TIndustriesResponse = {
  results: TIndustry[]
  count: number
  next: string | null
  previous: string | null
}

export interface IStoreDetailsForm {
  store_name: string
  currency: { label: string; value: string }
  store_email: string
  store_phone: string
  support_email: string
  support_phone: string
  industry: { label: string; value: string }
  instagram_handle?: string
  logo?: File | null
}

export interface IStoreMembersResponse {
  data: {
    results: TTeam[]
    stats: {
      total_customers: number
      active_customers: number
    }
  }
  message?: string
  success?: boolean
}

export interface IPlan {
  uid: string
  name: string
  price: string
  frequency: "monthly" | "annually"
  description: string
}

export interface IPlansResponse {
  data: {
    results: IPlan[]
  }
  message?: string
  success?: boolean
}

export interface IPopupSettings {
  uid: string
  is_published: boolean
  headline: string
  body: string
  cta_text: string
  cta_link: string
}

export interface IStoreTheme {
  uid: string
  name: string
  description: string
  preview_image: string
  in_use: boolean
}

export interface ILandingPageItem {
  id: string
  label: string
  icon: string
  order: number
  is_visible: boolean
}

export interface ILandingPageItemsOrder {
  uid: string
  items: ILandingPageItem[]
}

export interface IThemeSettings {
  uid: string
  logo: string | null
  favicon: string | null
  color_scheme: {
    primary: string
    secondary: string
    tertiary: string
  }
  typography: string
  button: string
  button_text_color: string
  show_button_outline: boolean
  footer_email: string
  footer_phone: string
  terms_and_conditions_url: string
  instagram_url: string
  facebook_url: string
  x_url: string
  tiktok_url: string
  size_chart_url: string
}

export type SectionType =
  | "hero"
  | "hero_carousel"
  | "about"
  | "featured_products"
  | "cta_block_1"
  | "cta_block_2"
  | "cta_block_3"
  | "highlight_banner"
  | "testimonials"
  | "newsletter_signup"

export interface ThemeSection {
  uid: string
  storefront: string
  section_type: SectionType
  section_type_display: string
  selection_mode: "default" | "custom"
  title: string
  subtitle: string | null
  content: string | null
  is_hidden: boolean
  featured_products: string[] // array of product UIDs for featured_products section
  testimonials: {
    uid: string
    name: string
    role: string
    comment: string
    image: string | null
  }[]
  image: string | null
  background_image: string | null
  cta_text: string | null
  cta_link: string | null
  position: number
  created_at: string
  updated_at: string
  //
  hero_carousel_items?: {
    uid: string
    image?: string
    video?: string
    title: string
    subtitle: string
    cta_text: string
    cta_link: string
  }[]
}

export interface IVersionHistory {
  uid: string
  version: number
  previous_version: number
  change_type: string
  changed_fields: string
  changed_by_name: string
  snapshot: string
  created_at: string
}
