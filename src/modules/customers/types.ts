export type TCustomer = {
  id: number
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
  dob?: string | null
  instagram?: string
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
  dateOfBirth?: string // ISO date string
  instagramHandle?: string
  lastOrderDate?: string // ISO date string, e.g., "2023-09-15"
  totalOrders?: number
}

export type TCustomerFormMode = "add" | "edit" | "view"

export interface ICustomerFormPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  address?: string
  state?: string
  country?: string
  dateOfBirth?: string
  instagramHandle?: string
}
