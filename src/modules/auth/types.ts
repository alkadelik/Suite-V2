export interface IUser {
  avatar_url?: string
  first_name: string
  last_name: string
  is_email_verified: boolean
  assigned_locations: { id: number }[]
  roles: string[]
  subscription: string | null
  store_id: number
}

export type TAuthTokens = {
  accessToken: string
  refreshToken: string
}
