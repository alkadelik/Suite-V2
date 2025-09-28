export type TCreateAccountPayload = {
  account_number: string
  bank_code: string
  bank_name: string
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
