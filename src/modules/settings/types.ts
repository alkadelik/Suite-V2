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
  id: number
  date: string
  planName: string
  amount: number
  billingPeriod: "Yearly" | "Monthly"
  status: "Success" | "Pending" | "Failed"
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
  logo: string | null
  industry: string
  industry_name: string
  delivery_enabled: boolean
  created_at: string
  locations: TLocation[]
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
