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
        dense ? 'h-5 w-9' : 'h-6 w-11',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ]"
    >
      <span class="sr-only">Toggle</span>
      <span
        class="inline-block transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out"
        :class="[
          value ? (dense ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0',
          dense ? 'h-4 w-4' : 'h-5 w-5',
        ]"
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
  /** Whether to render the switch in dense mode (smaller size) */
  dense?: boolean
  /** Whether the switch is disabled */
  disabled?: boolean
  /** Optional label text to display next to the switch */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  dense: false,
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

function toggle(): void {
  if (!props.disabled) {
    value.value = !value.value
  }
}
</script>
