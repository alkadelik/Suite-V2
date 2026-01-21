export type TCreateAccountPayload = {
  account_number: string
  bank_code: string
  bank_name: string
}

// Live Status Types
export interface ILiveStatusCriteria {
  bank_account: {
    status: boolean
    description: string
  }
  kyc_verification: {
    status: boolean
    description: string
  }
  delivery_options: {
    status: boolean
    description: string
    details: {
      delivery_enabled: boolean
      shipping_account: boolean
      pickup_location: boolean
    }
  }
  products: {
    status: boolean
    description: string
  }
  subscription: {
    status: boolean
    description: string
  }
}

export interface ILiveStatusData {
  store_slug: string
  store_name: string
  is_live: boolean
  show_live_status_banner: boolean
  completion_percentage: number
  criteria: ILiveStatusCriteria
  missing_requirements: string[]
  has_subscription: boolean
}

export interface ILiveStatusResponse {
  error: string | null
  message: string
  data: ILiveStatusData
}

export interface IAccount {
  id: number
  name: string
  slug: string
  code: string
  longcode: string
  gateway: string
  pay_with_bank: boolean
  supports_transfer: boolean
  available_for_direct_debit: boolean
  active: boolean
  country: string
  currency: string
  type: string
  is_deleted: boolean
  createdAt: string
  updatedAt: string
}

export type TGetSupportedAccountsResponse = {
  data: IAccount[]
}

export interface ISettlementBank {
  uid: string
  bank_name: string
  bank_code: string
  account_number: string
  account_name: string | null
  subaccount_code: string
  created_at: string
}

export type TSetupShippingPayload = {
  store_name: string
  store_address: string
  email: string
  password: string
  phone: string
  preferred_couriers: string[]
}

export type TUpdateShippingPayload = {
  store_name?: string
  store_address?: string
  email?: string
  password?: string
  phone?: string
  preferred_courier_ids?: string[]
}

export interface IIndustry {
  uid: string
  name: string
  description: string
  is_active: boolean
}

export interface IIndustriesApiResponse {
  data: {
    count: number
    next: string | null
    previous: string | null
    results: IIndustry[]
  }
}

export interface ISelectOption extends Record<string, unknown> {
  label: string
  value: string
  color?: TChipColor
}

export interface IRole {
  uid: string
  name: string
  description: string
  type: string
}

export interface IRolesApiResponse {
  data: IRole[]
}

export type TChipColor =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "alt"
  | "blue"
  | "purple"
  | "pink"
  | undefined

export interface INotification {
  uid: string
  title: string
  message: string
  type: string
  extras?: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

export interface INotificationsData {
  notifications: INotification[]
  total_count: number
  unread_count: number
}

export interface INotificationsResponse {
  error: string | null
  message: string
  data: INotificationsData
}

export interface IPackageCategory {
  id: number
  category: string
}

export interface ICourier {
  uid: string
  service_code: string
  name: string
  pin_image: string
  origin_country: string
  international: boolean
  domestic: boolean
  express: boolean
  status: string
  package_categories: IPackageCategory[]
  description: string
  is_active: boolean
  created_at: string
}

export interface ICouriersResponse {
  error: string | null
  message: string
  data: {
    count: number
    next: string | null
    previous: string | null
    results: ICourier[]
  }
}

export interface IShippingProfileData {
  uid: string
  store_name: string
  store_address: string
  preferred_couriers: ICourier[]
  email: string
  is_active: boolean
  created_at: string
}

export interface IShippingProfileResponse {
  error: string | null
  message: string
  data: IShippingProfileData
}

export interface IShippingCourier {
  courier_id: string
  courier_name: string
  courier_image?: string
  total_amount?: number
  total?: number
  ratings: number
  votes: number
  estimated_days?: string
}

export interface IShippingRatesResponse {
  error: string | null
  message: string
  data: {
    rates: {
      request_token: string
      couriers: IShippingCourier[]
    }
  }
}

// Manual/Express Delivery Option Types
export type TDeliveryOptionType = "manual" | "express"

export interface IDeliveryOption {
  uid: string
  location: string
  amount: string
  delivery_type: TDeliveryOptionType
  created_at: string
}

export interface IDeliveryOptionsResponse {
  error: string | null
  message: string
  data: IDeliveryOption[]
}

export type TCreateDeliveryOptionPayload = {
  location: string
  amount: string
}

export type TUpdateDeliveryOptionPayload = {
  location?: string
  amount?: string
}
