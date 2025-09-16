import { formatError } from "@/utils/error-handler"
import { useAuthStore } from "@modules/auth/store"
import { useQuery } from "@tanstack/vue-query"
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { toast } from "./useToast"

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || ""

const baseApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

baseApi.interceptors.request.use((config) => {
  const { accessToken, user } = useAuthStore()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  if (user && user.store_uid !== "") {
    config.headers["X-Store-Id"] = user.store_uid
  }
  config.headers["X-Location-Id"] = "b7c211bd-7c03-4754-8828-18081abd076e"
  return config
})

const refreshToken = async (): Promise<string> => {
  const { refreshToken, setTokens } = useAuthStore()
  const response = await baseApi.post("/token/refresh/", { refresh: refreshToken })
  const { access, refresh } = response.data as { access: string; refresh: string }
  setTokens({ accessToken: access, refreshToken: refresh })
  return access
}

baseApi.interceptors.response.use(
  // If the request is successful, just return the response
  (response) => response,
  // If the request fails, handle the error
  async (error: AxiosError) => {
    // Add a custom property to the config type to track retries
    interface CustomRequestConfig extends InternalAxiosRequestConfig {
      _retry?: boolean
    }
    const originalRequest = error.config as CustomRequestConfig

    const errorMsg = formatError(error)

    // Check if the error is a 401 and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      errorMsg.includes("token not valid") &&
      !originalRequest._retry
    ) {
      console.log("Access token expired. Attempting to refresh...")
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true

      try {
        const newAccessToken = await refreshToken()
        // Update the header with the new token and retry the request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return baseApi(originalRequest)
      } catch (refreshError) {
        // If refresh fails, perform a logout or redirect
        toast.error("Session expired. Please log in again.")
        useAuthStore().clearAuth()
        // redirect to login page with the current path as redirect query
        const redirectPath = window.location.pathname + window.location.search
        window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`
        return Promise.reject(refreshError as Error)
      }
    }

    // For all other errors, just return the error
    return Promise.reject(error)
  },
)

export type TQueryArg = {
  url: string
  params?: Record<string, string | number | boolean>
  enabled?: boolean
}
export const useApiQuery = <T>({ url, params, enabled }: TQueryArg) => {
  return useQuery<T>({
    queryKey: ["apiData", params],
    queryFn: async () => {
      const { data } = await baseApi.get<T>(url, { params })
      return data
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled,
  })
}

export type TApiPromise<T> = Promise<AxiosResponse<T>>

export type TPaginatedResponse<T> = AxiosResponse<{
  count: number
  next: string | null
  previous: string | null
  results: T[]
}>

export default baseApi
