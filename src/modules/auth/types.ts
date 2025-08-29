export interface IUser {
  avatar_url?: string | null
  first_name: string
  last_name: string
  email?: string
  is_email_verified: boolean
  assigned_locations: { id: number }[]
  roles: string[]
  subscription: string | null
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
  confirm_password: string
  forgot_password_token: string
}
