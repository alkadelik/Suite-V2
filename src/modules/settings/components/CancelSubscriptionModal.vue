<template>
  <MessageModal
    :open="modelValue"
    max-width="4xl"
    :handle-padding="false"
    @close="emit('update:modelValue', false)"
  >
    <div class="flex flex-col items-center rounded-2xl px-8 py-10 text-center">
      <!-- X Image -->
      <img src="@/assets/images/x-image.png" alt="Cancel" class="mb-8 h-24 w-24" />

      <!-- Heading -->
      <h2 class="text-core-900 mb-4 text-2xl font-bold md:text-3xl">We Are Sorry To See You Go</h2>

      <!-- Question -->
      <p class="text-core-700 mb-3 text-base md:text-lg">
        Are you sure you want to cancel your subscription?
      </p>

      <!-- Description -->
      <p class="text-core-700 mb-8 text-base md:text-lg">
        You will no longer be able to monitor and grow your business with Leyyow. You will have
        access to all features of your current plan until
        <span class="font-semibold">{{ nextPaymentDate }}</span
        >.
      </p>

      <!-- Downgrade Option (for Bloom and Burst plans) -->
      <div
        v-if="showDowngradeOption"
        class="text-warning-700 bg-warning-25 border-warning-300 mb-8 w-full rounded-lg border p-5 text-left"
      >
        <p class="mb-2 text-base font-semibold md:text-lg">I Want To Downgrade My Plan Instead</p>
        <p class="mb-4 text-sm md:text-base">
          Instead of cancelling your plan, you can choose to downgrade instead to a lesser plan.
        </p>
        <AppButton
          label="View Plans"
          variant="text"
          icon="arrow-right"
          size="lg"
          class="flex-row-reverse underline underline-offset-4"
          @click="emit('viewPlans')"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
        <AppButton
          label="Take Me Back"
          variant="outlined"
          class="!border-gray-300 bg-white !text-gray-700 hover:!bg-gray-50"
          @click="emit('update:modelValue', false)"
        />
        <AppButton
          label="Cancel Subscription"
          variant="filled"
          class="!bg-error-600 hover:!bg-error-500 !text-white"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </div>
  </MessageModal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import MessageModal from "@/components/MessageModal.vue"
import AppButton from "@components/AppButton.vue"

export interface CancelSubscriptionModalProps {
  modelValue: boolean
  nextPaymentDate: string
  loading: boolean
  currentPlan?: string
}

const props = defineProps<CancelSubscriptionModalProps>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  confirm: []
  viewPlans: []
}>()

// Show downgrade option only for Bloom and Burst plans
const showDowngradeOption = computed(() => {
  const planName = props.currentPlan?.toLowerCase() || ""
  return planName.includes("bloom") || planName.includes("burst")
})
</script>
