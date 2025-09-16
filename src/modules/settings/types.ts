import { IRole } from "@modules/shared/types"

export type TLocation = {
  uid: string
  name: string
  address: string
  phone: string
  membersCount: number
  status: "Active" | "Archived"
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
