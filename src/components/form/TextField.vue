<template>
  <div>
    <label v-if="label" :for="htmlFor" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div :class="containerClasses">
      <!-- Country Code Prefix for Tel Input -->
      <div
        v-if="type === 'tel'"
        class="flex items-center gap-2 border-r border-gray-200 bg-transparent pr-3 pl-3"
      >
        <div
          class="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-gray-200"
        >
          <img src="/images/nigeria.png" alt="Nigerian Flag" class="h-full w-full object-cover" />
        </div>
        <span class="text-sm font-medium text-gray-700">+234</span>
        <Icon name="CaretDown" size="16" class="text-gray-500" />
      </div>

      <!-- Prefix -->
      <div v-else-if="prefix" :class="prefixClasses">
        {{ prefix }}
      </div>

      <!-- Left Icon -->
      <div v-else-if="leftIcon" :class="[prefixClasses, 'flex items-center border-r-0 !pr-0']">
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
        :value="displayValue"
        @beforeinput="handleBeforeInput"
        @input="handleInput"
        @keydown="handleKeydown"
        @paste="handlePaste"
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
      <div v-if="suffix" :class="suffixClasses" class="max-w-[40%] min-w-0 shrink">
        <span class="line-clamp-1">{{ suffix }}</span>
      </div>
    </div>
    <div v-if="error" class="mt-1 flex items-center text-sm text-red-600">
      <Icon name="info-circle" size="16" class="mr-1" />
      {{ capitalizeFirstChar(error) }}
    </div>
    <div v-if="description && !error" class="text-core-600 mt-1 flex items-center text-sm">
      <slot name="description">
        {{ description }}
      </slot>
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
  /** Additional description text below the input */
  description?: string
  /** Additional classes for the input element */
  inputClass?: string
  /** Additional classes for the container element */
  containerClass?: string
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

const sanitizeNumberValue = (value: string): string => {
  if (!value) return value

  // Allow only digits, decimal point, and minus sign (at the start only)
  let sanitized = value.replace(/[^0-9.-]/g, "")

  // Ensure only one decimal point
  const decimalCount = (sanitized.match(/\./g) || []).length
  if (decimalCount > 1) {
    const parts = sanitized.split(".")
    sanitized = parts[0] + "." + parts.slice(1).join("")
  }

  // Ensure minus sign only at the start
  if (sanitized.includes("-")) {
    const minusCount = (sanitized.match(/-/g) || []).length
    if (minusCount > 1 || sanitized.indexOf("-") > 0) {
      sanitized = sanitized.replace(/-/g, "")
    }
  }

  return sanitized
}

const handleBeforeInput = (event: Event) => {
  const inputEvent = event as InputEvent

  if (props.type !== "number" || !inputEvent.data?.includes(",")) return

  inputEvent.preventDefault()
}

const handleKeydown = (event: Event) => {
  const keyboardEvent = event as KeyboardEvent

  if (props.type !== "number" || keyboardEvent.key !== ",") return

  keyboardEvent.preventDefault()
}

const handlePaste = (event: Event) => {
  const clipboardEvent = event as ClipboardEvent

  if (props.type !== "number") return

  const pastedText = clipboardEvent.clipboardData?.getData("text") || ""
  if (!pastedText.includes(",")) return

  clipboardEvent.preventDefault()

  const target = clipboardEvent.target as HTMLInputElement
  const currentValue = target.value
  const selectionStart = target.selectionStart ?? currentValue.length
  const selectionEnd = target.selectionEnd ?? currentValue.length
  const nextValue = sanitizeNumberValue(
    `${currentValue.slice(0, selectionStart)}${pastedText}${currentValue.slice(selectionEnd)}`,
  )

  target.value = nextValue
  emit("update:modelValue", nextValue)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // For number inputs, allow only valid numeric characters
  if (props.type === "number" && value) {
    value = sanitizeNumberValue(value)
    target.value = value
  }

  // For tel inputs, prefix with +234
  if (props.type === "tel" && value) {
    // Remove any existing +234 prefix to avoid duplication
    value = value.replace(/^\+234\s*/, "")
    // Remove any non-digit characters
    value = value.replace(/[^\d]/g, "")
    // Remove leading 0 if present
    if (value.startsWith("0")) {
      value = value.substring(1)
    }
    // Add +234 prefix
    if (value) {
      value = `+234${value}`
    }
  }

  emit("update:modelValue", value)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const htmlFor = computed(() => props.id || props.name || props.label)

const actualType = computed(() =>
  props.type === "password" && showPassword.value ? "text" : props.type,
)

// For tel inputs, display value without +234 prefix
const displayValue = computed(() => {
  if (props.type === "tel" && props.modelValue) {
    const value = String(props.modelValue)
    // Remove +234 prefix for display
    return value.replace(/^\+234/, "")
  }
  return props.modelValue
})

const containerClasses = computed(() => {
  const baseClasses =
    "flex items-center rounded-xl border overflow-hidden bg-core-25 disabled:bg-core-200"

  const variantClasses = {
    default:
      "border-core-50 focus-within:border-primary-300 focus-within:ring-1 focus-within:ring-primary-300",
    error:
      "border-red-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500",
    success:
      "border-green-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500",
  }

  const disabledClasses = props.disabled ? "opacity-60 cursor-not-allowed !bg-core-200" : ""

  // Use error variant if error prop is provided
  const currentVariant = props.error ? "error" : props.variant

  return [baseClasses, variantClasses[currentVariant], disabledClasses, props.containerClass]
    .filter(Boolean)
    .join(" ")
})

const inputClasses = computed(() => {
  const baseClasses =
    "flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 placeholder-core-400 text-core-800"

  // Adjust padding based on icons/prefix/suffix
  const paddingClasses = {
    sm: `${props.leftIcon || props.prefix ? "pl-0" : "pl-2"} ${props.rightIcon || props.suffix || props.type === "password" ? "pr-0" : "pr-2"} py-2 text-base`,
    md: `${props.leftIcon || props.prefix ? "pl-0" : "px-4"} ${props.rightIcon || props.suffix || props.type === "password" ? "pr-0" : "px-4"} py-3 text-base`,
    lg: `${props.leftIcon || props.prefix ? "pl-0" : "p-3"} ${props.rightIcon || props.suffix || props.type === "password" ? "pr-0" : "p-3"} text-base`,
  }

  return [baseClasses, paddingClasses[props.size], props.inputClass].filter(Boolean).join(" ")
})

const prefixClasses = computed(() => {
  const baseClasses =
    "border-core-100 bg-inherit mr-2 flex items-center border-r px-3 text-gray-400"

  const sizeClasses = {
    sm: "py-2 text-sm",
    md: "py-3 text-sm",
    lg: "py-3 text-base",
  }

  return [baseClasses, sizeClasses[props.size]].filter(Boolean).join(" ")
})

const suffixClasses = computed(() => {
  const baseClasses = "border-core-100 bg-inherit ml-2 border-l px-3 text-gray-400"

  const sizeClasses = {
    sm: "py-2 text-sm",
    md: "py-3 text-sm",
    lg: "py-3 text-base",
  }

  return [baseClasses, sizeClasses[props.size]].filter(Boolean).join(" ")
})
</script>
