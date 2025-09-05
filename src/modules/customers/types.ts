export type TCustomer = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  state?: string
  country?: string
  dateOfBirth?: string // ISO date string
  instagramHandle?: string
  lastOrderDate: string // ISO date string, e.g., "2023-09-15"
  totalOrders: number
}

export type TCustomerFormMode = "add" | "edit"

export interface ICustomerFormPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  state?: string
  country?: string
  dateOfBirth?: string
  instagramHandle?: string
}
