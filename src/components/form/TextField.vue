<template>
  <div>
    <label v-if="label" :for="htmlFor" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div :class="containerClasses">
      <!-- Prefix -->
      <div v-if="prefix || format === 'currency'" :class="prefixClasses">
        {{ format === "currency" ? currencySymbol : prefix }}
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
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        :value="displayValue"
        @beforeinput="handleBeforeInput"
        @input="handleInput"
        @keydown="handleKeydown"
        @paste="handlePaste"
        :inputmode="type === 'number' && format ? 'decimal' : undefined"
        @wheel="type === 'number' ? $event.preventDefault() : undefined"
        @blur="handleBlur"
        @focus="handleFocus"
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
import { useSettingsStore } from "@modules/settings/store"
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
  /** Number formatting mode — displays commas, emits raw value */
  format?: "currency" | "number"
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

const currencySymbol = computed(() => {
  const currency = useSettingsStore().storeDetails?.currency || "NGN"
  const symbols: Record<string, string> = { NGN: "₦", USD: "$", GHS: "₵", KES: "KSh" }
  return symbols[currency] || currency
})

const showPassword = ref(false)
const isFocused = ref(false)

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit("blur", event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit("focus", event)
}

const formatWithCommas = (value: string): string => {
  if (!value) return value
  const num = parseFloat(value)
  if (isNaN(num)) return value
  const parts = value.split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return parts.join(".")
}

const stripCommas = (value: string): string => value.replace(/,/g, "")

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
  if (props.format) return // allow commas in formatted mode
  inputEvent.preventDefault()
}

const handleKeydown = (event: Event) => {
  const keyboardEvent = event as KeyboardEvent
  if (props.type !== "number" || keyboardEvent.key !== ",") return
  if (props.format) return // allow commas in formatted mode
  keyboardEvent.preventDefault()
}

const handlePaste = (event: Event) => {
  const clipboardEvent = event as ClipboardEvent

  if (props.type !== "number") return

  const pastedText = clipboardEvent.clipboardData?.getData("text") || ""

  if (props.format) {
    // In formatted mode, strip commas from pasted text and emit raw value
    clipboardEvent.preventDefault()
    const target = clipboardEvent.target as HTMLInputElement
    const rawPasted = stripCommas(pastedText)
    const currentRaw = stripCommas(target.value)
    const selectionStart = target.selectionStart ?? currentRaw.length
    const selectionEnd = target.selectionEnd ?? currentRaw.length
    const nextValue = sanitizeNumberValue(
      `${currentRaw.slice(0, selectionStart)}${rawPasted}${currentRaw.slice(selectionEnd)}`,
    )
    target.value = formatWithCommas(nextValue)
    emit("update:modelValue", nextValue)
    return
  }

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

  // For formatted number inputs, strip commas, sanitize, then reformat display
  if (props.type === "number" && props.format && value) {
    const raw = sanitizeNumberValue(stripCommas(value))
    // Reformat with commas for display while preserving cursor
    const cursorPos = target.selectionStart ?? 0
    const commasBefore = (value.slice(0, cursorPos).match(/,/g) || []).length
    target.value = formatWithCommas(raw)
    const commasAfter = (target.value.slice(0, cursorPos).match(/,/g) || []).length
    const newPos = cursorPos + (commasAfter - commasBefore)
    target.setSelectionRange(newPos, newPos)
    emit("update:modelValue", raw)
    return
  }

  // For number inputs, allow only valid numeric characters
  if (props.type === "number" && value) {
    value = sanitizeNumberValue(value)
    target.value = value
  }

  emit("update:modelValue", value)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const htmlFor = computed(() => props.id || props.name || props.label)

const actualType = computed(() => {
  if (props.type === "password" && showPassword.value) return "text"
  if (props.type === "number" && props.format) return "text"
  return props.type
})

const displayValue = computed(() => {
  // For formatted number inputs, always show commas
  if (props.type === "number" && props.format && props.modelValue) {
    return formatWithCommas(String(props.modelValue))
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

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
