<script setup lang="ts">
import { clipboardCopy } from "@/utils/others"
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Icon from "@components/Icon.vue"
import { useAuthStore } from "@modules/auth/store"
import { useGetStoreDetails } from "@modules/settings/api"
import { useSettingsStore } from "@modules/settings/store"
import { computed } from "vue"

const { locations, activeLocation } = useSettingsStore()

const storedLocations = computed(() => locations?.map((loc) => ({ ...loc })))
const currentLocation = computed(() => activeLocation)

const user = computed(() => useAuthStore().user)
const { data: storeDetails } = useGetStoreDetails(user.value?.store_uid || "")

const storefrontUrl = computed(() => {
  return `buy.leyyow.com/${storeDetails.value?.slug || "your-store"}`
})
</script>

<template>
  <DropdownMenu
    trigger-class="w-full"
    :items="storedLocations?.map((item) => ({ id: item.uid, label: item.name }))"
    menuClass="!w-[240px]"
    @select="({ id }) => $router.push('/settings/locations?id=' + id)"
  >
    <template #trigger="{ open }">
      <button
        type="button"
        :class="[
          'bg-core-100 text-core-800 hover:bg-core-200 w-full rounded-xl px-2 py-1.5',
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
          <Chip v-if="currentLocation?.is_hq" label="HQ" />
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
        @click="$router.push('/settings/locations?create=true')"
      />
    </template>
  </DropdownMenu>
</template>
