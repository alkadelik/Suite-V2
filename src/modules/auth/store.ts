import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { IUser, IAuthTokens } from "./types"

export const useAuthStore = defineStore(
  "auth",
  () => {
    // State
    const user = ref<IUser | null>(null)
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const isLoading = ref<boolean>(false)

    // Getters
    const isAuthenticated = computed(() => Boolean(accessToken.value) && Boolean(user.value))

    // Actions
    const setAuthUser = (userData: IUser) => {
      console.log("Setting auth user with:", userData)
      user.value = user.value ? { ...user.value, ...userData } : userData
      console.log("Auth user is now:", user.value)
    }

    const updateAuthUser = (userData: Partial<IUser>) => {
      if (user.value) {
        console.log("Updating auth user with:", userData)
        user.value = { ...user.value, ...userData }
        console.log("Updated user is now:", user.value)
      }
    }

    const setTokens = (tokens: IAuthTokens) => {
      accessToken.value = tokens.accessToken
      refreshToken.value = tokens.refreshToken
    }

    const clearAuth = () => {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
    }

    const logout = () => {
      clearAuth()
      // redirect to login page
      localStorage.removeItem("auth")
      localStorage.removeItem("settings")
      window.location.href = "/login"
    }

    const setLoading = (loading: boolean) => {
      isLoading.value = loading
    }

    return {
      // State
      user,
      accessToken,
      refreshToken,
      isLoading,

      // Getters
      isAuthenticated,

      // Actions
      setAuthUser,
      updateAuthUser,
      setTokens,
      clearAuth,
      setLoading,
      logout,
    }
  },
  { persist: true },
)
