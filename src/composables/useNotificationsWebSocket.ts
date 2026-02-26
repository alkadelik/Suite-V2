import { ref, onUnmounted, watch, computed } from "vue"
import { useAuthStore } from "@modules/auth/store"
import { storeToRefs } from "pinia"
import type { INotification } from "@/modules/shared/types"
import baseApi from "@/composables/baseApi"

interface WebSocketNotification {
  title: string
  message: string
  type: string
  extras?: Record<string, unknown>
  timestamp: string
}

interface UseNotificationsWebSocketOptions {
  onNotification?: (notification: INotification) => void
}

const MAX_RECONNECT_DELAY = 30_000 // 30 seconds
const BASE_RECONNECT_DELAY = 2_000 // 2 seconds

export function useNotificationsWebSocket(options?: UseNotificationsWebSocketOptions) {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  const authStore = useAuthStore()
  const { user, accessToken } = storeToRefs(authStore)

  const canConnect = computed(() => Boolean(user.value && accessToken.value))

  const connect = () => {
    // Don't connect if no user or token
    if (!canConnect.value) return

    // Close existing socket if any
    if (socket.value) {
      socket.value.onclose = null // prevent triggering reconnect
      socket.value.close()
      socket.value = null
    }

    // Get base URL and convert http(s) to ws(s)
    const baseURL = import.meta.env.VITE_API_BASE_URL as string
    const wsProtocol = baseURL.startsWith("https") ? "wss" : "ws"
    const wsBaseURL = baseURL.replace(/^https?:\/\//, "")

    // Construct WebSocket URL with fresh token from store
    const wsUrl = `${wsProtocol}://${wsBaseURL}/ws/notifications/${user.value!.uid}/?token=${accessToken.value}`

    try {
      socket.value = new WebSocket(wsUrl)

      socket.value.onopen = () => {
        isConnected.value = true
        reconnectAttempts.value = 0 // reset backoff on successful connection
      }

      socket.value.onmessage = (event) => {
        try {
          const rawData = event.data as string
          const data = JSON.parse(rawData) as WebSocketNotification

          // Transform WebSocket notification to INotification format
          const notification: INotification = {
            uid: crypto.randomUUID(), // Generate a temporary UID
            title: data.title,
            message: data.message,
            type: data.type,
            extras: data.extras || null,
            is_read: false,
            created_at: data.timestamp,
          }

          // Call the callback if provided
          if (options?.onNotification) {
            options.onNotification(notification)
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      socket.value.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      socket.value.onclose = (event) => {
        isConnected.value = false
        socket.value = null

        // Don't reconnect if deliberately disconnected or user logged out
        if (event.wasClean || !canConnect.value) return

        scheduleReconnect()
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
    }
  }

  const scheduleReconnect = async () => {
    // Try refreshing the token first — the disconnect may be due to expiry
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL as string
      const { refreshToken, setTokens } = useAuthStore()
      if (refreshToken) {
        const { data } = await baseApi.post(
          "/token/refresh/",
          { refresh: refreshToken },
          { baseURL },
        )
        const { access, refresh } = data?.data as { access: string; refresh: string }
        setTokens({ accessToken: access, refreshToken: refresh })
      }
    } catch {
      // Token refresh failed — user may need to log in again
      // Don't reconnect if we can't get a valid token
      if (!canConnect.value) return
    }

    // Exponential backoff: 2s, 4s, 8s, 16s, 30s, 30s, ...
    const delay = Math.min(BASE_RECONNECT_DELAY * 2 ** reconnectAttempts.value, MAX_RECONNECT_DELAY)
    reconnectAttempts.value++

    reconnectTimer = setTimeout(() => {
      if (canConnect.value) {
        connect()
      }
    }, delay)
  }

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (socket.value) {
      socket.value.onclose = null // prevent triggering reconnect
      socket.value.close()
      socket.value = null
      isConnected.value = false
    }
  }

  // Watch for auth state changes with reactive refs
  watch(
    canConnect,
    (canNow, couldBefore) => {
      if (canNow && !couldBefore) {
        connect()
      } else if (!canNow && couldBefore) {
        disconnect()
      }
    },
    { immediate: true },
  )

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  }
}
