<script setup lang="ts">
import { clipboardCopy } from "@/utils/others"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Icon from "@components/Icon.vue"
import { useAuthStore } from "@modules/auth/store"
import { useGetLocations, useGetStoreDetails } from "@modules/settings/api"
import { useSettingsStore } from "@modules/settings/store"
import { useLocationSwitch } from "@/composables/useLocationSwitch"
import { computed, watch } from "vue"

const settingsStore = useSettingsStore()
const { setLocations } = settingsStore
const { requestLocationSwitch } = useLocationSwitch()
const user = computed(() => useAuthStore().user)
const isStoreOwner = computed(() => user.value?.roles.some((role) => role.type === "owner"))

const { data: locationsData } = useGetLocations(isStoreOwner.value)

const locationItems = computed(() =>
  (settingsStore.locations || []).map((loc) => ({
    ...loc,
    id: loc.uid,
    label: loc.name,
    active: loc.uid === settingsStore.activeLocation?.uid,
  })),
)
const currentLocation = computed(() => useSettingsStore().activeLocation)

const { data: storeData } = useGetStoreDetails(user.value?.store_uid || "")
const storeDetails = computed(() => settingsStore.storeDetails)

watch(
  storeData,
  (details) => {
    if (details) {
      useSettingsStore().setStoreDetails(details)
    }
  },
  { immediate: true },
)

const storefrontUrl = computed(() => useSettingsStore().storefrontUrl)

watch(
  locationsData,
  (locs) => {
    if (locs?.results?.length) {
      const locations = locs.results.map((loc) => ({
        ...loc,
        uid: loc.uid,
        id: loc.uid,
        label: loc.name,
        active: loc.uid === settingsStore.activeLocation?.uid,
      }))

      setLocations(locations)
    }
  },
  { immediate: true },
)

const onLocationSelect = (id: string) => {
  const selectedLocation = locationItems.value.find((loc) => loc.uid === id) || null
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
            'lg:bg-core-100 text-core-800 hover:bg-core-200 w-full rounded-xl px-2 py-1.5',
            'flex items-center gap-2 text-sm font-medium',
          ]"
        >
          <div class="bg-core-200 flex size-6 items-center justify-center rounded-xl">
            <Icon name="shop" class="text-primary-800" size="14" />
          </div>
          <span class="max-w-[120px] truncate">
            {{ currentLocation?.name }}
          </span>
          <Icon
            name="arrow-down-double"
            size="20"
            :class="['ml-auto !flex-shrink-0 transition-transform', open ? 'rotate-180' : '']"
          />
        </button>
      </template>

      <template #prepend>
        <div class="bg-primary-50 border-primary-300 mb-1 rounded-t-lg border-b px-2.5 py-3">
          <div class="bg-core-200 flex size-8 items-center justify-center rounded-xl">
            <Icon name="shop" class="text-primary-800" />
          </div>

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

      <template v-if="isStoreOwner" #footer>
        <AppButton
          variant="text"
          label="Add New Location"
          size="sm"
          icon="add"
          class="!w-full flex-row-reverse !justify-between !px-2.5"
          @click="settingsStore.setAddLocationModal(true)"
        />
      </template>
    </DropdownMenu>
  </div>
</template>
