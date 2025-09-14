export type TCustomer = {
  uid: number
  store?: number
  first_name: string
  last_name: string
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

export interface ICustomerResponse {
  uid: string
  full_name: string
  phone: string
  email: string
  total_orders: number
  last_active?: string | null
  is_active: boolean
  created_at: string
}

export type TCustomerFormMode = "add" | "edit" | "view"

export interface ICustomerFormPayload {
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  state?: string
  city?: string
  date_of_birth?: string
  instagram_handle?: string
  location: string
}
