export interface IUser {
  avatar_url?: string | null
  first_name: string
  last_name: string
  email?: string
  is_email_verified: boolean
  assigned_locations: { id: number }[]
  roles: string[]
  subscription: string | null
  store_uid: string
  store?: {
    business_name: string
    address: string
    phone: string
    store_name: string
    phone1: string
  }
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}

export type TLoginPayload = { email: string; password: string }

export interface ILoginResponse {
  data: {
    access: string
    refresh: string
    avatar_url?: string | null
    first_name: string
    last_name: string
    is_email_verified: boolean
    assigned_locations: { id: number }[]
    roles: string[]
    subscription: string | null
    store_uid: string
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
