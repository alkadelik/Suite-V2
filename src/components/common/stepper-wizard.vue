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
      <div class="bg-primary-200 absolute top-4 h-0.5 w-full"></div>
      <!-- Progress Line Fill -->
      <div
        class="bg-primary-500 absolute top-4 h-0.5 transition-all"
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
                ? 'bg-primary-50 border-primary-500 text-primary-500 border'
                : isCompleted(index)
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-50 border-primary-200 text-primary-300/60 border',
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
                ? 'text-primary-500'
                : isCompleted(index)
                  ? 'text-primary-600'
                  : 'text-primary-300/60',
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
