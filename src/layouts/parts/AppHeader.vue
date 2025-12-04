<template>
  <header class="fixed top-0 right-0 left-0 z-20 border-b border-gray-200 bg-white">
    <div class="flex h-16 items-center gap-1.5 px-4">
      <img
        v-if="showLogo"
        :src="`${isMobile ? '/LYW-icon.svg' : '/LYW.svg'}`"
        alt="Leyyow"
        class="h-8 w-auto"
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
      <DropdownMenu v-if="!isMobile" :items="profileMenuItems" menuClass="w-56">
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
      <DropdownMenu v-if="!isMobile" :items="actionMenuItems">
        <template #trigger>
          <AppButton size="md" class="!ring-primary-200 !rounded-full !ring-4" icon="add-circle" />
        </template>
      </DropdownMenu>
    </div>

    <!-- Notifications Drawer -->
    <NotificationsDrawer
      :open="showNotifications"
      :notifications="notifications"
      @close="showNotifications = false"
      @mark-all-read="handleMarkAllRead"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useMediaQuery } from "@vueuse/core"
import { useQueryClient } from "@tanstack/vue-query"
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import NotificationsDrawer from "@/components/NotificationsDrawer.vue"
import { useGetNotifications, useMarkAllNotificationsRead } from "@/modules/shared/api"
import { useNotificationsWebSocket } from "@/composables/useNotificationsWebSocket"
import LocationDropdown from "./LocationDropdown.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { toast } from "@/composables/useToast"
import { useRouter } from "vue-router"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"

defineProps<{ showLogo?: boolean; logo?: "full" | "icon"; isLive?: boolean }>()
const emit = defineEmits<{
  (e: "logout", confirm: boolean): void
}>()

const isMobile = useMediaQuery("(max-width: 1024px)")

const showNotifications = ref(false)
const queryClient = useQueryClient()

// Fetch notifications from API
const { data: notificationsResponse } = useGetNotifications()
const { mutate: markAllRead } = useMarkAllNotificationsRead()
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

const isHQ = computed(() => useSettingsStore().activeLocation?.is_hq ?? true)

const actionMenuItems = computed(() => {
  const allActions = [
    {
      label: "Add a product",
      icon: "box",
      color: "bg-blue-50 text-blue-700",
      action: () => router.push("/inventory?create=true"),
      hqOnly: true,
    },
    {
      label: "Record a sale",
      icon: "bag",
      color: "bg-green-50 text-green-700",
      action: () => router.push("/orders?create=true"),
    },
    {
      label: "Create popup",
      icon: "calendar-tick",
      color: "bg-purple-50 text-purple-700",
      action: () => router.push("/popups?create=true"),
      hqOnly: true,
    },
    {
      label: "Add a customer",
      icon: "profile-add",
      color: "bg-primary-50 text-primary-700",
      action: () => router.push("/customers?create=true"),
    },
    {
      label: "Record expense",
      icon: "receipt-add",
      color: "bg-pink-50 text-pink-700",
      action: () => {
        toast.info("Expense module is coming soon!")
      },
    },
  ]

  return allActions.filter((action) => !action.hqOnly || isHQ.value)
})

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
