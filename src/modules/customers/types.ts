export type TCustomer = {
  uid: string
  id: number
  store?: number
  first_name: string
  last_name: string
  full_name: string
  photo?: string | null
  house_no?: string
  email: string
  phone?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  date_of_birth?: string | null
  lifetime_orders?: number
  is_customer?: boolean
  paystack_code?: string
  paystack_id?: string
  last_purchase?: string
  net_spend?: number
  created?: string
  address_code?: string | null
  full_address?: string | null
  address?: string
  country?: string
  instagram_handle?: string
  last_order_date?: string // ISO date string, e.g., "2023-09-15"
  total_orders?: number
}

export interface ICustomer extends Record<string, unknown> {
  uid: string
  full_name?: string
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  date_of_birth?: string | null
  instagram_handle?: string | null
  location_name?: string
  total_orders?: number
  default_address?: string | null
  default_city?: string | null
  is_active?: boolean
  created_at?: string
  last_active?: string
}

export type TCustomerFormMode = "add" | "edit" | "view"

export interface ICustomerFormPayload {
  uid?: string
  first_name: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  address?: string
  state?: string
  city?: string
  date_of_birth?: string
  instagram_handle?: string
  location: string
}

export interface IExportPayload {
  export_fields: string[]
  period: string
  activity: string
  start_date?: string
  end_date?: string
}

export interface ICustomersApiResponse {
  data: {
    results: ICustomer[]
    stats: {
      total_customers: number
      active_customers: number
    }
  }
  message?: string
  error?: boolean
}

export interface ICustomerAddress {
  uid: string
  customer: string
  customer_name: string
  name: string
  phone: string
  address: string
  address_code: string
  city: string
  state: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ICustomerOrderItem {
  uid: string
  variant: string
  variant_name: string
  variant_sku: string
  product_name: string
  popup_inventory: string | null
  quantity: number
  unit_price: string
  total_price: string
  fulfilment_status: string
  qty_fulfilled: number
  notes: string
}

export interface ICustomerOrder {
  uid: string
  order_number: string
  source: string
  store: string
  store_name: string
  location: string
  location_name: string
  total_amount: string
  total_paid: number
  outstanding_balance: number
  payment_status: string
  payment_status_display: string
  fulfilment_status: string
  fulfilment_status_display: string
  delivery_fee: string
  created_at: string
  order_date: string
  items: ICustomerOrderItem[]
  // Additional fields for compatibility with OrderCard
  user_name?: string
  customer_name?: string
  fulfilment_method?: "pickup" | "delivery"
  subtotal?: string
}

export interface ICustomerDetail {
  uid: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  date_of_birth: string | null
  instagram_handle: string | null
  is_active: boolean
  notes: string | null
  location: string
  location_name: string
  full_name: string
  total_orders: number
  total_spent: number
  total_credits: number
  total_returns: number
  store_owner_uid: string
  default_address: string
  default_city: string
  recent_addresses: ICustomerAddress[]
  created_at: string
  updated_at: string
  recent_orders: ICustomerOrder[]
}
