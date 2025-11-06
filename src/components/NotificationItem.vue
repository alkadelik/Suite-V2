<template>
  <div
    class="flex gap-3 p-4 md:p-8"
    :class="notification.is_read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'"
  >
    <!-- Icon -->
    <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
      <Icon :name="notificationIcon" size="20" />
    </div>

    <!-- Content -->
    <div class="flex-1">
      <!-- Title and Time -->
      <div class="mb-1 flex items-center justify-between gap-2">
        <h4 class="text-sm font-semibold text-gray-900">{{ notification.title }}</h4>
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-500">{{ formattedTime }}</span>
          <div
            v-if="!notification.is_read"
            class="bg-primary-600 h-2 w-2 flex-shrink-0 rounded-full"
            aria-label="Unread"
          />
        </div>
      </div>

      <!-- Message -->
      <p class="text-sm text-gray-600">{{ notification.message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "./Icon.vue"
import type { INotification } from "@/modules/shared/types"

interface Props {
  notification: INotification
}

const props = defineProps<Props>()

// Map notification type to icon
const notificationIcon = computed(() => {
  const iconMap: Record<string, string> = {
    general: "bell",
    order: "bag",
    shipping: "truck-fast",
    inventory: "package",
    payment: "credit-card",
    alert: "info-circle",
    event: "calendar",
  }
  return iconMap[props.notification.type] || "bell"
})

// Format the time ago
const formattedTime = computed(() => {
  const now = new Date()
  const createdAt = new Date(props.notification.created_at)
  const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return `${Math.floor(diffInSeconds / 604800)}w ago`
})
</script>
