<template>
  <div class="space-y-2">
    <label v-if="label" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <p v-if="hint" class="text-core-600 text-xs">{{ hint }}</p>

    <div
      class="flex flex-row items-start gap-2 space-y-2"
      :class="{ 'flex-wrap': options.some((x) => x.description) }"
    >
      <div
        v-for="option in options"
        :key="String(option.value)"
        :class="[
          'flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-all',
          modelValue === option.value
            ? 'border-primary-700 bg-primary-25'
            : 'border-gray-400 bg-gray-50 hover:border-gray-500',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          options.every((x) => !x.description) ? 'flex-1 items-center' : 'items-start md:flex-1',
        ]"
        @click="!disabled && handleChange(option.value)"
      >
        <div
          :class="[
            'relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
            modelValue === option.value ? 'border-primary-700' : 'border-gray-300',
          ]"
        >
          <div v-if="modelValue === option.value" class="bg-primary-700 h-2.5 w-2.5 rounded-full" />
        </div>
        <div class="flex-1">
          <p
            :class="[
              'text-xs font-medium md:text-sm',
              modelValue === option.value ? 'text-primary-700' : 'text-core-800',
            ]"
          >
            {{ option.label }}
          </p>
          <p v-if="option.description" class="text-core-600 text-sm">
            {{ option.description }}
          </p>
        </div>
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
}

const props = withDefaults(defineProps<RadioInputFieldProps>(), {
  required: false,
  disabled: false,
  readonly: false,
  size: "md",
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
