<script setup lang="ts">
import { clipboardCopy } from "@/utils/others"
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Icon from "@components/Icon.vue"
import { useAuthStore } from "@modules/auth/store"
import { useGetLocations, useGetStoreDetails } from "@modules/settings/api"
import { useSettingsStore } from "@modules/settings/store"
import { useLocationSwitch } from "@/composables/useLocationSwitch"
import { computed, watch } from "vue"

const { data: locations } = useGetLocations()
const { setLocations, setActiveLocation } = useSettingsStore()
const { requestLocationSwitch } = useLocationSwitch()

const locationItems = computed(
  () =>
    locations.value?.results?.map((loc) => ({
      ...loc,
      id: loc.uid,
      label: loc.name,
      active: loc.uid === currentLocation.value?.uid,
    })) || [],
)
const currentLocation = computed(() => useSettingsStore().activeLocation)

const user = computed(() => useAuthStore().user)
const { data: storeDetails } = useGetStoreDetails(user.value?.store_uid || "")

const storefrontUrl = computed(() => {
  return `buy.leyyow.com/${storeDetails.value?.slug || "your-store"}`
})

watch(
  locationItems,
  (locs) => {
    setLocations(locs)
    if (!currentLocation.value?.uid) {
      setActiveLocation(locs[0])
    }
  },
  { immediate: true },
)

const onLocationSelect = (id: string) => {
  const selectedLocation = locationItems.value.find((loc) => loc.id === id) || null
  if (selectedLocation && selectedLocation.uid !== currentLocation.value?.uid) {
    requestLocationSwitch(selectedLocation)
  }
}
</script>

<template>
  <div>
    <DropdownMenu
      trigger-class="w-full"
      :items="locationItems"
      menuClass="!w-[240px]"
      @select="({ id }) => onLocationSelect(id as string)"
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
          <div class="mt-2 mb-1 flex min-w-0 items-end gap-2">
            <p class="min-w-0 truncate font-medium capitalize">
              {{ storeDetails?.name }}
            </p>
            <div class="min-w-0 flex-shrink-0">
              <Chip v-if="currentLocation?.is_hq" size="sm" label="HQ" class="w-full" />
            </div>
          </div>
          <div class="flex min-w-0 items-center gap-2 text-sm text-gray-600">
            <p class="min-w-0 truncate">{{ storefrontUrl }}</p>
            <Icon
              name="copy"
              size="20"
              class="text-primary-600 flex-shrink-0 cursor-pointer"
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
  </div>
</template>
