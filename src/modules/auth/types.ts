export interface IUserRole {
  uid: string
  name: string
  description: string
  type: string
}

export interface ISubscription {
  uid: string
  plan_name: string
  plan_price: string
  plan_frequency: string
  active_until: string
  is_active: boolean
  trial_mode: boolean
  subscription_id: string
}

export interface IUser {
  uid: string
  avatar?: string | null
  avatar_url?: string | null
  first_name: string
  last_name: string
  email?: string
  is_email_verified: boolean
  assigned_locations: { uid: string; name: string }[]
  roles: IUserRole[]
  subscription: ISubscription | null
  store_slug?: string
  store_uid: string
  gender?: string | null
  address?: string | null
  state?: string | null
  country?: string | null
  store?: {
    business_name: string
    address: string
    phone: string
    store_name: string
    phone1: string
  }
}

export interface IkycInfo {
  uid: string
  doc_type: DocumentType
  bvn: string
  doc_number: string
  file: string
  created_at: string
  updated_at: string
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}

export type TLoginPayload = { email: string; password: string }

export interface ILoginResponse {
  data: {
    uid: string
    access: string
    refresh: string
    avatar_url?: string | null
    first_name: string
    last_name: string
    is_email_verified: boolean
    assigned_locations: { uid: string; name: string }[]
    roles: IUserRole[]
    subscription: ISubscription | null
    store_uid: string
    store_slug: string
  }
}

export type TSignupPayload = {
  first_name: string
  last_name: string
  email: string
  password: string
  confirm_password: string
}

export type TResetPasswordPayload = {
  password: string
  forgot_password_token: string
}

export interface IStoreFormData {
  name: string
  slug: string
  industry: { label: string; value: string }
  currency: { label: string; value: string }
}

export interface ICreateStorePayload {
  name: string
  industry: string
  slug: string
  currency: string
}

export interface IStoreApiResponse {
  data: {
    uid: string
    name: string
    slug: string
    logo: string | null
    industry: string
    industry_name: string
    created_at: string
    locations: {
      uid: string
      name: string
      address: string | null
      created_at: string
    }[]
  }
}

export type TSignupWithInvitePayload = {
  first_name: string
  last_name: string
  password: string
  invite_code: string
}
