import { ref, onUnmounted, watch } from "vue"
import { useAuthStore } from "@modules/auth/store"
import type { INotification } from "@/modules/shared/types"

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

export function useNotificationsWebSocket(options?: UseNotificationsWebSocketOptions) {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const { user, accessToken } = useAuthStore()

  const connect = () => {
    // Don't connect if no user or token
    if (!user || !accessToken) {
      return
    }

    // Get base URL and convert http(s) to ws(s)
    const baseURL = import.meta.env.VITE_API_BASE_URL as string
    const wsProtocol = baseURL.startsWith("https") ? "wss" : "ws"
    const wsBaseURL = baseURL.replace(/^https?:\/\//, "")

    // Construct WebSocket URL with user UID and token
    const wsUrl = `${wsProtocol}://${wsBaseURL}/ws/notifications/${user.uid}/?token=${accessToken}`

    try {
      socket.value = new WebSocket(wsUrl)

      socket.value.onopen = () => {
        isConnected.value = true
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

        // Attempt to reconnect after 5 seconds if connection was not closed cleanly
        if (!event.wasClean) {
          setTimeout(() => {
            if (user && accessToken) {
              connect()
            }
          }, 5000)
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
      isConnected.value = false
    }
  }

  // Watch for user/token changes and reconnect if needed
  watch(
    () => [user, accessToken],
    ([newUser, newToken]) => {
      if (newUser && newToken && !socket.value) {
        connect()
      } else if (!newUser || !newToken) {
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
