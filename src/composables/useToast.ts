import { ref } from "vue"

export interface Toast {
  id: string
  type: "success" | "error" | "info"
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

interface ToastOptions {
  message?: string
  duration?: number
  persistent?: boolean
}

// Global toast state
const toasts = ref<Toast[]>([])

// Generate unique ID for each toast
const generateId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Auto-remove toast after duration
const autoRemove = (id: string, duration: number) => {
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

// Add toast to the list
const addToast = (toast: Omit<Toast, "id">): string => {
  const id = generateId()
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration ?? 5000, // Default 5 seconds
  }

  toasts.value.push(newToast)

  // Auto-remove if not persistent
  if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
    autoRemove(id, newToast.duration)
  }

  return id
}

// Remove toast by ID
const removeToast = (id: string) => {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Clear all toasts
const clearAllToasts = () => {
  toasts.value = []
}

// Toast methods
const toast = {
  success: (title: string, options?: ToastOptions): string => {
    return addToast({
      type: "success",
      title,
      message: options?.message,
      duration: options?.duration,
      persistent: options?.persistent,
    })
  },

  error: (title: string, options?: ToastOptions): string => {
    return addToast({
      type: "error",
      title,
      message: options?.message,
      duration: options?.duration ?? 7000, // Errors stay longer by default
      persistent: options?.persistent,
    })
  },

  info: (title: string, options?: ToastOptions): string => {
    return addToast({
      type: "info",
      title,
      message: options?.message,
      duration: options?.duration,
      persistent: options?.persistent,
    })
  },

  // Direct method to add custom toast
  add: addToast,

  // Remove specific toast
  remove: removeToast,

  // Clear all toasts
  clear: clearAllToasts,
}

// Composable function
export const useToast = () => {
  return {
    toasts: toasts.value,
    toast,
    removeToast,
    clearAllToasts,
  }
}

// Export toast methods for direct import
export { toast }
