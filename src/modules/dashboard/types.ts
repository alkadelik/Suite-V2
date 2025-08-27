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
