<template>
  <div>
    <label v-if="label" :for="htmlFor" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div :class="containerClasses">
      <!-- Prefix -->
      <div v-if="prefix" :class="prefixClasses">
        {{ prefix }}
      </div>

      <!-- Left Icon -->
      <div v-if="leftIcon" :class="[prefixClasses, 'flex items-center border-r-0 !pr-0']">
        <Icon :name="leftIcon" class="h-4 w-4" />
      </div>

      <!-- Input -->
      <input
        :id="htmlFor"
        :name="name"
        :type="actualType"
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

      <!-- Password Toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="text-core-400 hover:text-core-600 flex items-center pr-3"
        @click="togglePasswordVisibility"
      >
        <Icon :name="showPassword ? 'eye' : 'eye-slash'" class="h-4 w-4" />
      </button>

      <!-- Right Icon -->
      <div v-else-if="rightIcon" class="text-core-400 flex items-center pr-3">
        <Icon :name="rightIcon" class="h-4 w-4" />
      </div>

      <!-- Suffix -->
      <div v-if="suffix" :class="suffixClasses">
        {{ suffix }}
      </div>
    </div>
    <div v-if="error" class="mt-1 flex items-center text-sm text-red-600">
      <Icon name="info-circle" size="16" class="mr-1" />
      {{ capitalizeFirstChar(error) }}
    </div>
    <div v-if="hint && !error" class="mt-1 flex items-center text-sm text-gray-500">
      <slot name="hint">
        {{ hint }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { capitalizeFirstChar } from "@/utils/format-strings"
import Icon from "@components/Icon.vue"
import { computed, ref } from "vue"

interface Props {
  /** The model value of the input */
  modelValue?: string | number
  /** The label for the input */
  label?: string
  /** The input type
   * @default "text"
   */
  type?: string
  /** The name attribute for the input */
  name?: string
  /** The id attribute for the input */
  id?: string
  /** Placeholder text for the input */
  placeholder?: string
  /** Whether the input is required */
  required?: boolean
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether the input is readonly */
  readonly?: boolean
  /** Error message to display */
  error?: string
  /** Hint text to display when there's no error */
  hint?: string
  /** The visual variant of the input
   * @default "default"
   */
  variant?: "default" | "error" | "success"
  /** The size of the input
   * @default "md"
   */
  size?: "sm" | "md" | "lg"
  /** Text to display before the input */
  prefix?: string
  /** Text to display after the input */
  suffix?: string
  /** Icon to display on the left side */
  leftIcon?: string
  /** Icon to display on the right side */
  rightIcon?: string
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

const showPassword = ref(false)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const htmlFor = computed(() => props.id || props.name || props.label)

const actualType = computed(() =>
  props.type === "password" && showPassword.value ? "text" : props.type,
)

const containerClasses = computed(() => {
  const baseClasses =
    "flex items-center rounded-xl border overflow-hidden bg-core-25 disabled:bg-gray-50"

  const variantClasses = {
    default:
      "border-core-50 focus-within:border-primary-300 focus-within:ring-1 focus-within:ring-primary-300",
    error:
      "border-red-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500",
    success:
      "border-green-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500",
  }

  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed" : ""

  // Use error variant if error prop is provided
  const currentVariant = props.error ? "error" : props.variant

  return [baseClasses, variantClasses[currentVariant], disabledClasses].filter(Boolean).join(" ")
})

const inputClasses = computed(() => {
  const baseClasses =
    "flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 placeholder-core-400 text-core-800"

  // Adjust padding based on icons/prefix/suffix
  const paddingClasses = {
    sm: `${props.leftIcon || props.prefix ? "pl-0" : "pl-2"} ${props.rightIcon || props.suffix || props.type === "password" ? "pr-0" : "pr-2"} py-2 text-sm`,
    md: `${props.leftIcon || props.prefix ? "pl-0" : "px-4"} ${props.rightIcon || props.suffix || props.type === "password" ? "pr-0" : "px-4"} py-3 text-sm`,
    lg: `${props.leftIcon || props.prefix ? "pl-0" : "p-3"} ${props.rightIcon || props.suffix || props.type === "password" ? "pr-0" : "p-3"} text-base`,
  }

  return [baseClasses, paddingClasses[props.size]].filter(Boolean).join(" ")
})

const prefixClasses = computed(() => {
  const baseClasses =
    "border-core-100 bg-core-25 mr-2 flex items-center border-r px-3 text-gray-400"

  const sizeClasses = {
    sm: "py-2 text-sm",
    md: "py-3 text-sm",
    lg: "py-3 text-base",
  }

  return [baseClasses, sizeClasses[props.size]].filter(Boolean).join(" ")
})

const suffixClasses = computed(() => {
  const baseClasses =
    "border-core-100 bg-core-25 ml-2 flex items-center border-l px-3 text-gray-400"

  const sizeClasses = {
    sm: "py-2 text-sm",
    md: "py-3 text-sm",
    lg: "py-3 text-base",
  }

  return [baseClasses, sizeClasses[props.size]].filter(Boolean).join(" ")
})
</script>
