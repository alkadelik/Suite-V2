export interface IUser {
  avatar_url?: string | null
  first_name: string
  last_name: string
  email?: string
  is_email_verified: boolean
  assigned_locations: { id: number }[]
  roles: string[]
  subscription: string | null
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ILoginResponse {
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
