import { formatError } from "@/utils/error-handler"
import { useAuthStore } from "@modules/auth/store"
import { useQuery } from "@tanstack/vue-query"
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { toast } from "./useToast"
import { useSettingsStore } from "@modules/settings/store"
import { toValue, MaybeRefOrGetter, computed } from "vue"
import * as Sentry from "@sentry/vue"

const baseURL = import.meta.env.VITE_API_BASE_URL as string

const baseApi = axios.create({
  baseURL: baseURL + "/api/v2",
  headers: { "Content-Type": "application/json" },
})

baseApi.interceptors.request.use((config) => {
  const { accessToken, user } = useAuthStore()
  const { activeLocation } = useSettingsStore()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  if (user && user.store_uid !== "") {
    config.headers["X-Store-Id"] = user.store_uid
  }
  if (user?.store_uid && activeLocation && activeLocation.uid !== "") {
    config.headers["X-Location-Id"] = activeLocation?.uid || ""
  }
  return config
})

// Singleton promise to prevent multiple simultaneous refresh attempts
let refreshTokenPromise: Promise<string> | null = null

const refreshToken = async (): Promise<string> => {
  // If a refresh is already in progress, return that promise
  if (refreshTokenPromise) {
    return refreshTokenPromise
  }

  // Create a new refresh promise
  refreshTokenPromise = (async () => {
    try {
      const { refreshToken, setTokens } = useAuthStore()
      const { data } = await baseApi.post("/token/refresh/", { refresh: refreshToken }, { baseURL })
      const { access, refresh } = data?.data as { access: string; refresh: string }
      setTokens({ accessToken: access, refreshToken: refresh })
      return access
    } finally {
      // Clear the promise when done (success or failure)
      refreshTokenPromise = null
    }
  })()

  return refreshTokenPromise
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
        useAuthStore().logout(true)
        return Promise.reject(refreshError as Error)
      }
    }

    // check if error is a Plan_Limit_Error
    const errorData = error.response?.data as { error?: { error?: string } }
    if (error.response?.status === 402 && errorData.error?.error === "PLAN_LIMIT_EXCEEDED") {
      const { setPlanUpgradeModal } = useSettingsStore()
      setPlanUpgradeModal(true)
      return Promise.reject(error)
    }

    // Capture error with Sentry
    Sentry.captureException(error, { tags: { section: "API" } })

    // For all other errors, just return the error
    return Promise.reject(error)
  },
)

export type TQueryArg = {
  url: MaybeRefOrGetter<string>
  params?: MaybeRefOrGetter<Record<string, string | number | boolean> | undefined>
  enabled?: MaybeRefOrGetter<boolean>
  key: MaybeRefOrGetter<string>
  selectData?: boolean
  refetchOnWindowFocus?: boolean
}
export const useApiQuery = <T>({
  url,
  params,
  enabled,
  key,
  selectData,
  refetchOnWindowFocus = false,
}: TQueryArg) => {
  return useQuery<T>({
    queryKey: computed(() => [toValue(key), toValue(params)]),
    queryFn: async () => {
      // Use toValue to handle both reactive and non-reactive values
      const urlValue = toValue(url)
      const paramValue = toValue(params)
      const { data } = await baseApi.get<T>(urlValue, paramValue ? { params: paramValue } : {})
      return data
    },
    retry: false,
    refetchOnWindowFocus,
    enabled: enabled !== undefined ? computed(() => toValue(enabled)) : undefined,
    select: selectData
      ? (response: T) => {
          if (response && typeof response === "object" && "data" in response) {
            return (response as Record<string, unknown>).data as T
          }
          return response
        }
      : undefined,
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
