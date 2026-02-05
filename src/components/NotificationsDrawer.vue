<template>
  <Teleport to="body">
    <Drawer
      :open="open"
      :title="`Notifications (${unreadCount})`"
      position="right"
      :max-width="isMobile ? 'full' : '2xl'"
      @close="emit('close')"
      :handle-padding="false"
    >
      <div>
        <!-- Header with unread count -->
        <div
          v-if="unreadCount > 0"
          class="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 md:p-8"
        >
          <Chip :label="`${unreadCount} unread`" class="rounded-sm" />
          <button
            class="text-sm font-medium text-gray-600 hover:underline"
            @click="emit('mark-all-read')"
          >
            Mark all as read
          </button>
        </div>

        <!-- Notifications List -->
        <div v-if="notifications.length > 0" class="divide-y divide-gray-200">
          <NotificationItem
            v-for="notification in notifications"
            :key="notification.uid"
            :notification="notification"
            @click="handleNotificationClick"
            @action="handleNotificationAction"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col justify-center p-8 text-center">
          <EmptyState
            icon="bell"
            title="No notifications yet"
            description="You'll see notifications here when you have updates"
          />
        </div>
      </div>
    </Drawer>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useMediaQuery } from "@vueuse/core"
import Chip from "./Chip.vue"
import Drawer from "./Drawer.vue"
import EmptyState from "./EmptyState.vue"
import NotificationItem from "./NotificationItem.vue"
import type { INotification } from "@/modules/shared/types"

interface Props {
  open: boolean
  notifications?: INotification[]
}

const props = withDefaults(defineProps<Props>(), {
  notifications: () => [],
})

const emit = defineEmits<{
  close: []
  "mark-all-read": []
  "mark-read": [uid: string]
  navigate: [notification: INotification]
}>()

// Check if mobile
const isMobile = useMediaQuery("(max-width: 768px)")

// Calculate unread count
const unreadCount = computed(() => {
  return props.notifications.filter((n) => !n.is_read).length
})

const handleNotificationClick = (notification: INotification) => {
  if (!notification.is_read) {
    emit("mark-read", notification.uid)
  }
}

const handleNotificationAction = (notification: INotification) => {
  if (!notification.is_read) {
    emit("mark-read", notification.uid)
  }
  emit("navigate", notification)
}
</script>
