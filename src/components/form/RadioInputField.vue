<template>
  <div class="space-y-2">
    <label v-if="label" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <p v-if="hint" class="text-core-600 text-xs">{{ hint }}</p>

    <div
      :class="['flex gap-4', props.orientation === 'vertical' ? '!flex-col' : 'flex-row flex-wrap']"
    >
      <div v-for="option in options" :key="String(option.value)" class="flex flex-1">
        <input
          :id="`${label}-${String(option.value)}`"
          type="radio"
          :name="label"
          :value="option.value"
          :checked="modelValue === option.value"
          :disabled="disabled || option.disabled"
          @change="handleChange(option.value)"
          class="hidden"
        />
        <label
          :for="`${label}-${String(option.value)}`"
          :class="[
            'flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all',
            disabled || option.disabled
              ? 'cursor-not-allowed bg-gray-100 opacity-50'
              : 'cursor-pointer',
            !disabled && !option.disabled && modelValue === option.value
              ? 'border-primary-700 bg-primary-25'
              : variant === 'white'
                ? 'border-gray-200 bg-white'
                : 'border-gray-400 bg-gray-50',
            !disabled && !option.disabled && modelValue !== option.value
              ? 'hover:border-gray-500'
              : '',
          ]"
        >
          <!-- Radio indicator -->
          <div
            v-if="showRadio"
            :class="[
              'flex size-4 shrink-0 items-center justify-center rounded-full border',
              modelValue === option.value
                ? 'border-primary-700 bg-transparent'
                : 'border-gray-300 bg-white',
            ]"
          >
            <div v-if="modelValue === option.value" class="bg-primary-600 size-1.5 rounded-full" />
          </div>

          <!-- Radio content -->
          <slot name="content" :option="option">
            <div class="flex flex-1 flex-col gap-1 md:gap-2.5">
              <h6 class="text-sm font-medium text-gray-700">
                {{ option.label }}
              </h6>
              <span v-if="option.description" class="text-xs text-gray-400">{{
                option.description
              }}</span>
            </div>
          </slot>
        </label>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

type RadioOptionValue = string | boolean | object

interface RadioOption {
  label: string
  value: RadioOptionValue
  description?: string
  disabled?: boolean
  [key: string]: unknown
}

interface RadioInputFieldProps {
  modelValue?: RadioOptionValue
  label?: string
  options: RadioOption[]
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  size?: "sm" | "md" | "lg"
  orientation?: "vertical" | "horizontal"
  /** Background style for inactive options: "default" (gray-50) or "white" */
  variant?: "default" | "white"
  showRadio?: boolean
}

const props = withDefaults(defineProps<RadioInputFieldProps>(), {
  required: false,
  disabled: false,
  readonly: false,
  size: "md",
  orientation: "horizontal",
  variant: "default",
  showRadio: true,
})

const emit = defineEmits<{
  "update:modelValue": [value: RadioOptionValue]
}>()

const labelClasses = computed(() => [
  "block text-sm font-medium mb-2",
  {
    "text-xs": props.size === "sm",
    "text-sm": props.size === "md",
    "text-base": props.size === "lg",
  },
])

const handleChange = (value: RadioOptionValue) => {
  if (props.readonly || props.disabled) return
  emit("update:modelValue", value)
}
</script>
