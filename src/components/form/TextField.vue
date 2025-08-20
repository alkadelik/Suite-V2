<template>
  <div>
    <label
      v-if="label"
      :for="id || name"
      class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
    >
      {{ label }}
      <span v-if="required" class="ml-1 text-red-500">*</span>
    </label>
    <input
      :id="id || name"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :class="inputClasses"
      :value="modelValue"
      @input="handleInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      v-bind="$attrs"
    />
    <div v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </div>
    <div v-if="hint && !error" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  name?: string
  id?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  variant?: "default" | "error" | "success"
  size?: "sm" | "md" | "lg"
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  variant: "default",
  size: "md",
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
}

const inputClasses = computed(() => {
  const baseClasses =
    "block w-full rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0"

  const sizeClasses = {
    sm: "p-2 text-sm",
    md: "p-2.5 text-sm",
    lg: "p-3 text-base",
  }

  const variantClasses = {
    default:
      "border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400",
    error:
      "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:bg-red-600/10 dark:text-red-400",
    success:
      "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500 dark:border-green-500 dark:bg-green-600/10 dark:text-green-400",
  }

  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed" : ""

  // Use error variant if error prop is provided
  const currentVariant = props.error ? "error" : props.variant

  return [baseClasses, sizeClasses[props.size], variantClasses[currentVariant], disabledClasses]
    .filter(Boolean)
    .join(" ")
})
</script>
