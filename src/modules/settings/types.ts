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

export type TTeam = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: "Admin" | "Member"
  status: "Active" | "Invited" | "Inactive"
  locations: TLocation[]
}

export type TSubscription = {
  id: number
  date: string
  planName: string
  amount: number
  billingPeriod: "Yearly" | "Monthly"
  status: "Success" | "Pending" | "Failed"
}
