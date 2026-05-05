<template>
  <div>
    <!--  -->
    <router-view />
    <!--  -->
    <ToastContainer />
    <SupportModal />
  </div>

  <template v-if="isAuthenticated && !isInternational">
    <ConfirmationModal
      v-model="showPlanLimit"
      header="Plan Limit Reached"
      paragraph="You've reached the limit for this action on your current plan. Upgrade to unlock more and keep growing."
      action-label="Upgrade Plan"
      :loading="false"
      info-message="Click the button below to upgrade"
      variant="warning"
      z-class="z-[9999]"
      @confirm="onPlanLimitConfirm"
    />

    <PlansModal :model-value="showPlans" @update:model-value="settingsStore.setPlanUpgradeModal" />
  </template>
</template>

<script setup lang="ts">
import ConfirmationModal from "@components/ConfirmationModal.vue"
import SupportModal from "@components/core/SupportModal.vue"
import ToastContainer from "@components/core/ToastContainer.vue"
import { useAuthStore } from "@modules/auth/store"
import PlansModal from "@modules/settings/components/PlansModal.vue"
import { useSettingsStore } from "@modules/settings/store"
import { computed } from "vue"

const settingsStore = useSettingsStore()

const isAuthenticated = computed(() => useAuthStore().isAuthenticated)
const isInternational = computed(() => settingsStore.isInternational)

const showPlans = computed(() => settingsStore.showPlanUpgradeModal)
const showPlanLimit = computed({
  get: () => settingsStore.showPlanLimitModal,
  set: (val) => settingsStore.setPlanLimitModal(val),
})

const onPlanLimitConfirm = () => {
  settingsStore.setPlanLimitModal(false)
  settingsStore.setPlanUpgradeModal(true)
}
</script>
