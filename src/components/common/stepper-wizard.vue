<script setup>
import { ref, computed, watch } from "vue"

const props = defineProps({
  modelValue: { type: Number },
  steps: { type: Array, required: true },
  showIndicators: { type: Boolean, default: true },
  showLabels: { type: Boolean, default: false },
})

const emit = defineEmits(["update:modelValue"])
const currentStep = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    currentStep.value = val
  },
)

// Move to next step
const onNext = () => {
  if (currentStep.value < props.steps.length - 1) {
    currentStep.value++
    emit("update:modelValue", currentStep.value)
  }
}

// Move to previous step
const onPrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    emit("update:modelValue", currentStep.value)
  }
}

// Dynamic step status
const isActive = (index) => index === currentStep.value
const isCompleted = (index) => index < currentStep.value

const stepPercentage = computed(() => ((currentStep.value + 1) / props.steps.length) * 100)
</script>

<template>
  <div class="w-full">
    <!-- Stepper Header -->
    <div v-if="showIndicators" class="relative mb-4">
      <!-- Progress Line Background -->
      <div class="bg-brand-200 absolute top-4 h-0.5 w-full"></div>
      <!-- Progress Line Fill -->
      <div
        class="bg-brand-500 absolute top-4 h-0.5 transition-all"
        :style="{ width: stepPercentage + '%' }"
      ></div>

      <!-- Steps Container -->
      <div class="flex items-start">
        <div v-for="(step, index) in steps" :key="index" class="flex flex-1 flex-col items-center">
          <!-- Step Number Circle -->
          <div
            :class="[
              'relative z-[2] flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
              isActive(index)
                ? 'bg-brand-50 border-brand-500 text-brand-500 border'
                : isCompleted(index)
                  ? 'bg-brand-500 text-white'
                  : 'bg-brand-50 border-brand-200 text-brand-300/60 border',
            ]"
          >
            {{ index + 1 }}
          </div>
          <!-- Step Label -->
          <span
            v-if="showLabels"
            :class="[
              'mt-px text-center text-xs font-medium transition-all',
              isActive(index)
                ? 'text-brand-500'
                : isCompleted(index)
                  ? 'text-brand-600'
                  : 'text-brand-300/60',
            ]"
          >
            {{ step }}
          </span>
        </div>
      </div>
    </div>

    <!-- Step Content Slot -->
    <div class="transition-opacity duration-300">
      <slot :step="currentStep" :on-prev="onPrev" :on-next="onNext"></slot>
    </div>
  </div>
</template>
