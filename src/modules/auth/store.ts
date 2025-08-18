import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { IUser, TAuthTokens } from "./types"

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<IUser | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  // Actions
  const setAuthUser = (userData: IUser) => {
    user.value = user.value ? { ...user.value, ...userData } : userData
  }

  const setTokens = (tokens: TAuthTokens) => {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
  }

  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
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
    setTokens,
    clearAuth,
    setLoading,
  }
})
