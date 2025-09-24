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
