<template>
  <div class="flex items-center gap-1">
    <span v-if="label" class="text-core-800 text-sm">
      {{ label }}
    </span>

    <!-- Switch Button -->
    <button
      type="button"
      role="switch"
      :aria-checked="value"
      :disabled="disabled"
      @click="toggle"
      class="focus-visible:ring-primary-300 relative inline-flex items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2"
      :class="[
        value ? 'bg-primary-500' : 'bg-gray-300',
        switchSizeClasses,
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ]"
    >
      <span class="sr-only">Toggle</span>
      <span
        class="inline-block transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out"
        :class="[value ? translateClasses : 'translate-x-0', thumbSizeClasses]"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

/**
 * Props for the Switch component
 */
interface Props {
  /** The current value of the switch */
  modelValue?: boolean
  /** Size of the switch */
  size?: "xs" | "sm" | "md"
  /** Whether the switch is disabled */
  disabled?: boolean
  /** Optional label text to display next to the switch */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: "md",
  disabled: false,
  label: undefined,
})

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()

const value = computed({
  get: (): boolean => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
})

const switchSizeClasses = computed(() => {
  switch (props.size) {
    case "xs":
      return "h-4 w-7"
    case "sm":
      return "h-5 w-9"
    case "md":
    default:
      return "h-6 w-11"
  }
})

const thumbSizeClasses = computed(() => {
  switch (props.size) {
    case "xs":
      return "h-3 w-3"
    case "sm":
      return "h-4 w-4"
    case "md":
    default:
      return "h-5 w-5"
  }
})

const translateClasses = computed(() => {
  switch (props.size) {
    case "xs":
      return "translate-x-3"
    case "sm":
      return "translate-x-4"
    case "md":
    default:
      return "translate-x-5"
  }
})

function toggle(): void {
  if (!props.disabled) {
    value.value = !value.value
  }
}
</script>
