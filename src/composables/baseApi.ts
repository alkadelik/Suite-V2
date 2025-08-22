import { formatError } from "@/utils/error-handler"
import { useAuthStore } from "@modules/auth/store"
import { useMutation, useQuery } from "@tanstack/vue-query"
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
// import axios from "axios"

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || ""

const baseApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

baseApi.interceptors.request.use((config) => {
  //user
  const { accessToken } = useAuthStore()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  //   if (user && user.store_id) {
  //     config.headers["X-Store-ID"] = user.store_id.toString()
  //   }
  return config
})

const refreshToken = async (): Promise<string> => {
  const { refreshToken, setTokens } = useAuthStore()
  const response = await baseApi.post("/auth/refresh", { refreshToken })
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
        console.error("Token refresh failed:", refreshError)
        const authStore = useAuthStore()
        authStore.clearAuth()
        window.location.href = "/login"
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

export type TMutationArg = {
  url: string
  method?: "post" | "put" | "patch" | "delete" | "get"
}

export type TMutationData =
  | Record<string, unknown>
  | { url: string; body: Record<string, unknown> | undefined }

export const useApiMutation = ({ url, method = "post" }: TMutationArg) => {
  return useMutation({
    mutationKey: ["apiMutation"],
    mutationFn: async (data?: TMutationData) => {
      // Check if data contains a custom URL (for dynamic URLs like with ID)
      if (data && typeof data === "object" && "url" in data && "body" in data) {
        const customData = data as { url: string; body: Record<string, unknown> | undefined }
        const response = await baseApi[method](customData.url, customData.body)
        return response
      }
      // Default behavior
      const response = await baseApi[method](url, data as Record<string, unknown>)
      return response
    },
  })
}

export default baseApi
