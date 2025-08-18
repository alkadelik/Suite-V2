<template>
  <div
    v-if="onboardingStore.modalIsVisible"
    class="fixed inset-0 z-30 flex items-start justify-center"
  >
    <!-- Backdrop -->
    <div v-if="showBackdrop" class="fixed inset-0 bg-black/30 backdrop-blur-sm"></div>

    <!-- Modal -->
    <div
      class="relative z-30 w-[95vw] max-w-[350px] rounded-xl bg-white p-3 shadow-lg"
      :style="{ top: top }"
    >
      <!-- Header Slot -->
      <div
        v-if="$slots.header"
        class="mb-2 min-h-[100px] rounded-md"
        :style="{
          backgroundImage: `url(${ModalBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      >
        <slot name="header" />
      </div>

      <!-- Body Slot -->
      <div class="mb-3">
        <slot name="body" />
      </div>

      <!-- Close Button -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <span
            v-for="step in totalSteps"
            :key="step"
            :class="[
              'h-1 w-6 rounded-full transition-colors duration-200',
              step <= currentStep ? 'bg-primary-500' : 'bg-gray-300',
            ]"
          ></span>
        </div>
        <AppButton
          v-if="showButton"
          class="!h-10 !px-3"
          variant="tonal"
          @click="onboardingStore.closeModal"
        >
          {{ buttonText }}
        </AppButton>
        <div v-else></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOnboardingStore } from "../../stores/onboarding"
import AppButton from "./app-button.vue"
import ModalBg from "../../assets/images/onboarding-modal-bg.png"

defineProps({
  buttonText: {
    type: String,
    required: false,
  },
  showBackdrop: {
    type: Boolean,
    required: false,
  },
  showButton: {
    type: Boolean,
    default: true,
  },
  top: {
    type: String,
    required: false,
  },
  currentStep: {
    type: Number,
    required: false,
  },
  totalSteps: {
    type: Number,
    required: false,
  },
})

const onboardingStore = useOnboardingStore()
</script>
