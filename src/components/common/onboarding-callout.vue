<template>
  <!-- Backdrop Overlay -->
  <div
    v-if="onboardingStore.calloutIsVisible && showBackdrop"
    class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
    @click="onboardingStore.closeCallout"
  ></div>

  <!-- Callout Box -->
  <div
    v-if="onboardingStore.calloutIsVisible"
    class="fixed z-50 w-[90vw] max-w-[300px] -translate-x-1/2 rounded-lg bg-white p-4 shadow-lg"
    :class="positionClass"
  >
    <!-- Arrow -->
    <div
      class="absolute z-[-1] h-3 w-3 bg-white"
      :style="[arrowStyle, { transform: 'translateX(-50%) rotate(45deg)' }]"
      :class="arrowPositionClass"
    ></div>

    <!-- Callout Content -->
    <div class="mb-4 text-sm text-gray-700">
      <slot />
    </div>

    <!-- Step Dots + Button -->
    <div class="flex items-center justify-between">
      <div v-if="totalSteps && currentStep" class="flex items-center gap-1">
        <span
          v-for="step in totalSteps"
          :key="step"
          :class="[
            'h-1 w-6 rounded-full transition-colors duration-200',
            step <= currentStep ? 'bg-primary-500' : 'bg-gray-300',
          ]"
        ></span>
      </div>
      <button
        v-else
        type="button"
        class="text-primary-300 text-sm underline"
        @click="onboardingStore.closeCallout"
      >
        Don't show this again
      </button>

      <AppButton class="!h-10 !px-3" variant="tonal" @click="onboardingStore.closeCallout">
        {{ buttonText }}
      </AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useOnboardingStore } from "../../stores/onboarding"
import AppButton from "./app-button.vue"

const props = defineProps({
  positionClass: {
    type: String,
    default: "bottom-6", // Tailwind class: e.g. 'top-10' or 'bottom-4'
  },
  arrowDirection: {
    type: String,
    default: "top",
    validator: (val) => ["top", "bottom"].includes(val),
  },
  arrowOffset: {
    type: Number,
    default: 50, // percentage from left
  },
  buttonText: {
    type: String,
    default: "Okay",
  },
  currentStep: {
    type: Number,
    required: false,
  },
  totalSteps: {
    type: Number,
    required: false,
  },
  showBackdrop: {
    type: Boolean,
    default: false,
  },
})

const onboardingStore = useOnboardingStore()

const arrowStyle = computed(() => ({
  left: `${props.arrowOffset}%`,
  transform: "translateX(-50%)",
}))

const arrowPositionClass = computed(() =>
  props.arrowDirection === "top" ? "top-[-6px]" : "bottom-[-6px]",
)
</script>
