<template>
  <!-- Backdrop Overlay -->
  <div
    v-if="onboardingStore.calloutIsVisible && showBackdrop"
    class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
    @click="onboardingStore.closeCallout"
  ></div>

  <!-- Callout Box -->
  <div
    v-if="onboardingStore.calloutIsVisible"
    class="fixed z-50 w-[90vw] max-w-[300px] bg-white rounded-lg shadow-lg p-4 -translate-x-1/2"
    :class="positionClass"
  >
    <!-- Arrow -->
    <div
      class="absolute w-3 h-3 bg-white z-[-1]"
      :style="[arrowStyle, { transform: 'translateX(-50%) rotate(45deg)' }]"
      :class="arrowPositionClass"
    ></div>

    <!-- Callout Content -->
    <div class="text-sm text-gray-700 mb-4">
      <slot />
    </div>

    <!-- Step Dots + Button -->
    <div class="flex justify-between items-center">
      <div v-if="totalSteps && currentStep" class="flex items-center gap-1">
        <span
          v-for="step in totalSteps"
          :key="step"
          :class="[
            'h-1 w-6 rounded-full transition-colors duration-200',
            step <= currentStep ? 'bg-brand-500' : 'bg-gray-300',
          ]"
        ></span>
      </div>
      <button
        v-else
        type="button"
        class="text-sm text-brand-300 underline"
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
import { computed } from "vue";
import { useOnboardingStore } from "../../stores/onboarding";
import AppButton from "./app-button.vue";

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
});

const onboardingStore = useOnboardingStore();

const arrowStyle = computed(() => ({
  left: `${props.arrowOffset}%`,
  transform: "translateX(-50%)",
}));

const arrowPositionClass = computed(() =>
  props.arrowDirection === "top" ? "top-[-6px]" : "bottom-[-6px]",
);
</script>
