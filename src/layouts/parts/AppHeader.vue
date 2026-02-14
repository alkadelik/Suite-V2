<template>
  <header class="fixed top-0 right-0 left-0 z-20 h-16 border-b border-gray-200 bg-white">
    <component :is="fullWidth ? 'div' : Container">
      <div class="flex h-16 items-center gap-1.5 px-4">
        <img
          v-if="showLogo"
          :src="`${isMobile ? '/LYW-icon.svg' : '/LYW.svg'}`"
          alt="Leyyow"
          class="h-8 w-auto cursor-pointer"
          @click="router.push('/dashboard')"
        />
        <div class="hidden flex-1 lg:block" />

        <div v-if="isMobile" class="mx-auto">
          <LocationDropdown />
        </div>

        <!-- Storefront status -->
        <Chip v-if="!isMobile" color="alt" size="md" label="Storefront" class="!pr-1">
          <template #append>
            <Chip
              showDot
              :label="isLive ? 'Live' : 'Not live'"
              :color="isLive ? 'success' : 'error'"
            />
          </template>
        </Chip>
        <!-- Notifications -->
        <button class="rounded-xl p-2 hover:bg-gray-100" @click="showNotifications = true">
          <Icon name="bell" size="20" />
        </button>

        <!-- User or CTA -->
        <DropdownMenu :items="profileMenuItems" menuClass="w-56">
          <template #prepend>
            <div class="max-w-xs overflow-hidden border-b border-gray-200 px-4 py-2">
              <p class="text-core-800 block w-full max-w-xs truncate text-sm font-medium">
                {{ user?.first_name + " " + user?.last_name }}
              </p>
              <p class="text-core-600 block w-full max-w-xs truncate text-xs">
                {{ user?.email }}
              </p>
            </div>
          </template>
          <template #trigger>
            <Avatar
              :name="user?.first_name + ' ' + user?.last_name"
              backgroundColor="var(--color-core-950)"
            />
          </template>
        </DropdownMenu>
      </div>
    </component>

    <!-- Notifications Drawer -->
    <NotificationsDrawer
      :open="showNotifications"
      :notifications="notifications"
      @close="showNotifications = false"
      @mark-all-read="handleMarkAllRead"
      @mark-read="handleMarkRead"
      @navigate="handleNotificationNavigate"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useMediaQuery } from "@vueuse/core"
import { useQueryClient } from "@tanstack/vue-query"
import Avatar from "@components/Avatar.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import NotificationsDrawer from "@/components/NotificationsDrawer.vue"
import {
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationAsRead,
} from "@/modules/shared/api"
import type { INotification } from "@/modules/shared/types"
import { useNotificationsWebSocket } from "@/composables/useNotificationsWebSocket"
import LocationDropdown from "./LocationDropdown.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@modules/auth/store"
import Container from "@components/Container.vue"

defineProps<{ showLogo?: boolean; logo?: "full" | "icon"; isLive?: boolean; fullWidth?: boolean }>()
const emit = defineEmits<{
  (e: "logout", confirm: boolean): void
}>()

const isMobile = useMediaQuery("(max-width: 1024px)")

const showNotifications = ref(false)
const queryClient = useQueryClient()

// Fetch notifications from API
const { data: notificationsResponse } = useGetNotifications()
const { mutate: markAllRead } = useMarkAllNotificationsRead()
const { mutate: markRead } = useMarkNotificationAsRead()
const user = computed(() => useAuthStore().user)

// Initialize WebSocket connection for real-time notifications
useNotificationsWebSocket({
  onNotification: () => {
    // Refetch notifications to include the new one
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
  },
})

// Extract notifications from response
const notifications = computed(() => {
  return notificationsResponse.value?.notifications || []
})

const handleMarkAllRead = () => {
  // Call API to mark all as read
  markAllRead(undefined, {
    onSuccess: () => {
      // Refetch notifications after marking all as read
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

const router = useRouter()

const handleMarkRead = (uid: string) => {
  markRead(uid, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

const handleNotificationNavigate = (notification: INotification) => {
  showNotifications.value = false

  const extras = (notification.extras || {}) as Record<string, string>

  switch (notification.type) {
    case "order":
      router.push({ path: "/orders", query: { order_id: extras.order_id } })
      break
    case "event":
      if (extras.popup_event_id) {
        const eventPath = `/popups/${extras.popup_event_id}`
        // Force re-mount if already on a popup detail page
        if (router.currentRoute.value.path.startsWith("/popups/")) {
          router.replace("/popups").then(() => router.push(eventPath))
        } else {
          router.push(eventPath)
        }
      }
      break
    case "billing":
      router.push("/settings/billing")
      break
  }
}

const profileMenuItems = [
  {
    label: "Settings",
    icon: "setting",
    action: () => router.push("/settings"),
  },
  { divider: true },
  {
    label: "Logout",
    icon: "signoutt",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => emit("logout", true),
  },
]
</script>
