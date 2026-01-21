<template>
  <div
    v-if="!isLive && !isLoadingLiveStatus"
    class="bg-primary-25 text-warning-700 border-warning-300 flex flex-col items-start gap-3 border-b px-6 py-3 lg:flex-row lg:items-center"
  >
    <span
      class="border-primary-200 ring-primary-100 hidden size-8 items-center justify-center rounded-full border-2 p-0.5 ring-2 ring-offset-2 lg:flex"
    >
      <Icon name="info-circle" size="20" />
    </span>
    <div class="flex flex-1 flex-col gap-1 text-sm lg:flex-row">
      <span v-if="!hasSubscription" class="font-medium">Your storefront is no longer live! </span>
      <span v-else class="font-medium">Your storefront isn't live yet! </span>
      <span v-if="!hasSubscription">Upgrade to a new plan to start selling online again.</span>
      <span v-else
        >Complete your bank details, delivery options, and KYC to start selling online.</span
      >
    </div>
    <AppButton
      v-if="!hasSubscription"
      variant="text"
      label="Upgrade now"
      icon="arrow-right"
      size="sm"
      class="flex-row-reverse underline underline-offset-4"
      @click="setPlanUpgradeModal(true)"
    />
    <AppButton
      v-else
      variant="text"
      label="Complete Setup"
      icon="arrow-right"
      size="sm"
      class="flex-row-reverse underline underline-offset-4"
      @click="$router.push('/onboarding')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { useGetLiveStatus } from "@modules/shared/api"
import { useAuthStore } from "@modules/auth/store"
import { useSettingsStore } from "@modules/settings/store"

const { setPlanUpgradeModal } = useSettingsStore()
const storeSlug = useAuthStore().user?.store_slug || ""
const { data: liveStatusData, isPending: isLoadingLiveStatus } = useGetLiveStatus(storeSlug)

const isLive = computed(() => useSettingsStore().liveStatus?.is_live || false)
const hasSubscription = computed(
  () => liveStatusData.value?.data?.criteria?.subscription?.status || false,
)
</script>
