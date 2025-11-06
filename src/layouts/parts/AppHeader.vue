<template>
  <header class="fixed top-0 right-0 left-0 z-20 border-b border-gray-200 bg-white">
    <div class="flex h-16 items-center gap-1.5 px-4">
      <img
        v-if="showLogo"
        :src="`${isMobile ? '/LYW-icon.svg' : '/LYW.svg'}`"
        alt="Leyyow"
        class="h-8 w-auto"
      />
      <div class="flex-1" />
      <DropdownMenu
        v-if="isMobile"
        trigger-class="w-full"
        :items="storedLocations?.map((item) => ({ id: item.uid, label: item.name }))"
        menuClass="!w-[160px]"
        @select="({ id }) => $router.push('/settings/locations?id=' + id)"
      >
        <template #trigger="{ open }">
          <button
            type="button"
            :class="[
              'bg-core-100 text-core-800 hover:bg-core-200 mt-4 w-full rounded-xl px-2 py-1.5',
              'flex items-center gap-2 text-sm font-medium',
            ]"
          >
            <Avatar :name="storeDetails?.name || ''" size="sm" />
            {{ currentLocation?.name }}
            <Icon
              name="arrow-down-double"
              size="20"
              :class="['ml-auto', 'transition-transform', open ? 'rotate-180' : '']"
            />
          </button>
        </template>

        <template #prepend>
          <div class="bg-primary-50 border-primary-300 mb-1 rounded-t-lg border-b px-2.5 py-3">
            <Avatar :name="storeDetails?.name || ''" backgroundColor="var(--color-core-950)" />
            <div class="mt-2 flex items-end gap-2">
              <p class="truncate font-medium">{{ storeDetails?.name }}</p>
              <Chip label="HQ" />
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <p class="truncate">{{ storefrontUrl }}</p>
              <Icon
                name="copy"
                size="24"
                class="text-primary-600 cursor-pointer"
                @click="clipboardCopy('https://' + storefrontUrl)"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <AppButton
            variant="text"
            label="Add New Location"
            size="sm"
            icon="add"
            class="!w-full flex-row-reverse !justify-between !px-2.5"
          />
        </template>
      </DropdownMenu>

      <!-- Storefront status -->
      <Chip
        v-if="!isMobile && liveStatusData"
        color="alt"
        size="md"
        label="Storefront"
        class="!pr-1"
      >
        <template #append>
          <Chip
            showDot
            :label="isLive ? 'Live' : 'Not live'"
            :color="isLive ? 'success' : 'error'"
          />
        </template>
      </Chip>
      <!-- Notifications -->
      <button class="rounded-xl p-2 hover:bg-gray-100">
        <Icon name="bell" size="20" />
      </button>
      <!-- Settings -->
      <button class="rounded-xl p-2 hover:bg-gray-100" @click="$router.push('/settings')">
        <Icon name="setting" size="20" />
      </button>
      <!-- User or CTA -->
      <Avatar
        v-if="isMobile"
        name="John Doe"
        clickable
        @click="$router.push('/settings/profile')"
      />
      <AppButton
        v-else
        size="md"
        class="!ring-primary-200 !rounded-full !ring-4"
        icon="add-circle"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core"
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import { computed } from "vue"
import { useGetLiveStatus } from "@modules/shared/api"
import { useAuthStore } from "@modules/auth/store"
import DropdownMenu from "@components/DropdownMenu.vue"
import { useSettingsStore } from "@modules/settings/store"
import { useGetStoreDetails } from "@modules/settings/api"
import { clipboardCopy } from "@/utils/others"

defineProps<{ showLogo?: boolean; logo?: "full" | "icon" }>()

const isMobile = useMediaQuery("(max-width: 1024px)")

const storeSlug = useAuthStore().user?.store_slug || ""
const { data: liveStatusData } = useGetLiveStatus(storeSlug)
const isLive = computed(() => liveStatusData.value?.data?.is_live || false)

const { locations, activeLocation } = useSettingsStore()

const storedLocations = computed(() => locations?.map((loc) => ({ ...loc })))
const currentLocation = computed(() => activeLocation)

const user = computed(() => useAuthStore().user)
const { data: storeDetails } = useGetStoreDetails(user.value?.store_uid || "")

const storefrontUrl = computed(() => {
  return `shop.leyyow.com/${storeDetails.value?.slug || "your-store"}`
})
</script>
