<template>
  <div>
    <label v-if="label" :for="htmlFor" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="flex items-center gap-2" :class="containerClass">
      <template v-for="(_, i) in length" :key="i">
        <!-- Add separator before the second group -->
        <span v-if="shouldShowSeparator(i)" class="text-core-400 text-lg font-medium select-none">
          {{ separator }}
        </span>

        <input
          :ref="(el) => setInputRef(el as HTMLInputElement, i)"
          v-model="values[i]"
          :id="i === 0 ? htmlFor : undefined"
          :name="i === 0 ? name : undefined"
          type="text"
          :inputmode="digitsOnly ? 'numeric' : 'text'"
          :pattern="digitsOnly ? '[0-9]*' : undefined"
          :disabled="disabled"
          :required="required && i === 0"
          maxlength="1"
          placeholder="•"
          :class="inputClasses"
          @input="(e) => handleInput(e, i)"
          @keydown="(e) => handleKeydown(e, i)"
          @paste="(e) => handlePaste(e, i)"
          @focus="$emit('focus', $event)"
          @blur="$emit('blur', $event)"
        />
      </template>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-1 flex items-center text-sm text-red-600">
      <Icon name="info-circle" size="16" class="mr-1" />
      {{ error }}
    </div>

    <!-- Hint message -->
    <div v-if="hint && !error" class="mt-1 flex items-center text-sm text-gray-500">
      <slot name="hint">
        {{ hint }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from "@components/common/icon.vue"
import { ref, onMounted, watch, computed } from "vue"

/**
 * Props interface for the OtpField component
 */
interface OtpFieldProps {
  /** The model value of the OTP field */
  modelValue?: string
  /** The number of OTP input fields to display
   * @default 6
   */
  length?: number
  /** Whether the input fields are disabled */
  disabled?: boolean
  /** Whether the input fields are required */
  required?: boolean
  /** Error message to display */
  error?: string
  /** Hint text to display when there's no error */
  hint?: string
  /** The label for the OTP field */
  label?: string
  /** The name attribute for the first input */
  name?: string
  /** The id attribute for the first input */
  id?: string
  /** Additional CSS classes for the container */
  class?: string
  /** Whether to allow only digits (0-9) or alphanumeric characters
   * @default true
   */
  digitsOnly?: boolean
  /** The separator character to display between input groups
   * @default "-"
   */
  separator?: string
  /** The visual variant of the OTP field
   * @default "default"
   */
  variant?: "default" | "error" | "success"
  /** The size of the input fields
   * @default "md"
   */
  size?: "sm" | "md" | "lg"
}

/**
 * Events emitted by the OtpField component
 */
interface OtpFieldEvents {
  /** Emitted when the OTP value changes */
  "update:modelValue": [value: string]
  /** Emitted when an input field is focused */
  focus: [event: FocusEvent]
  /** Emitted when an input field loses focus */
  blur: [event: FocusEvent]
}

const props = withDefaults(defineProps<OtpFieldProps>(), {
  length: 6,
  digitsOnly: true,
  separator: "—",
  variant: "default",
  size: "md",
})

const emit = defineEmits<OtpFieldEvents>()

const values = ref<string[]>(Array(props.length).fill("") as string[])
const inputs = ref<HTMLInputElement[]>([])

const htmlFor = computed(() => props.id || props.name || props.label)

const containerClass = computed(() => {
  return [props.class].filter(Boolean).join(" ")
})

const inputClasses = computed(() => {
  const baseClasses =
    "border text-center font-semibold focus:ring focus:outline-none rounded-lg bg-core-25"

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-11 h-11 text-lg",
    lg: "w-12 h-12 text-xl",
  }

  const variantClasses = {
    default: "border-core-200 text-core-600 focus:ring-primary-500/10 focus:border-primary-500",
    error: "border-red-300 text-red-600 focus:ring-red-500/10 focus:border-red-500",
    success: "border-green-300 text-green-600 focus:ring-green-500/10 focus:border-green-500",
  }

  const disabledClasses = props.disabled ? "bg-gray-200 opacity-80 cursor-not-allowed" : ""

  // Use error variant if error prop is provided
  const currentVariant = props.error ? "error" : props.variant

  return [baseClasses, sizeClasses[props.size], variantClasses[currentVariant], disabledClasses]
    .filter(Boolean)
    .join(" ")
})

/**
 * Determines if a separator should be shown before the input at the given index
 * @param index - The index of the input field
 * @returns Whether to show a separator before this input
 */
const shouldShowSeparator = (index: number): boolean => {
  if (props.length === 4) {
    return index === 2 // Show separator before 3rd input (XX-XX)
  } else if (props.length === 6) {
    return index === 3 // Show separator before 4th input (XXX-XXX)
  }
  return false
}

/**
 * Sets the input element reference
 * @param el - The input element
 * @param index - The index of the input
 */
const setInputRef = (el: HTMLInputElement | null, index: number): void => {
  if (el) {
    inputs.value[index] = el
  }
}

onMounted(() => {
  if (props.modelValue) {
    for (let i = 0; i < props.length; i++) {
      values.value[i] = props.modelValue[i] || ""
    }
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (!val) values.value = Array(props.length).fill("")
  },
)

/**
 * Focuses the input at the specified index
 * @param index - The index of the input to focus
 */
const focusInput = (index: number): void => {
  const input = inputs.value[index]
  if (input) {
    input.focus()
  }
}

/**
 * Handles input events for OTP fields
 * @param e - The input event
 * @param index - The index of the input field
 */
const handleInput = (e: Event, index: number): void => {
  const target = e.target as HTMLInputElement
  let val = target.value.slice(-1) // only last character

  // If digitsOnly is enabled, filter out non-digit characters
  if (props.digitsOnly && val && isNaN(Number(val))) {
    target.value = values.value[index] || ""
    return
  }

  values.value[index] = val
  emit("update:modelValue", values.value.join(""))

  // Auto-focus next input if current one is filled
  if (val && index < props.length - 1) {
    focusInput(index + 1)
  }
}

/**
 * Handles keydown events for OTP fields
 * @param e - The keyboard event
 * @param index - The index of the input field
 */
const handleKeydown = (e: KeyboardEvent, index: number): void => {
  // Allow control keys (Backspace, Delete, Tab, Arrow keys, etc.)
  const controlKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
    "PageUp",
    "PageDown",
  ]

  const isControlKey =
    controlKeys.includes(e.key) || e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1

  // If digitsOnly is enabled, prevent non-digit key presses (except control keys)
  if (props.digitsOnly && !isControlKey && isNaN(Number(e.key))) {
    e.preventDefault()
    return
  }

  // Handle backspace navigation
  if (e.key === "Backspace" && !values.value[index] && index > 0) {
    focusInput(index - 1)
  }
}

/**
 * Handles paste events for OTP fields
 * @param e - The clipboard event
 * @param index - The index of the input field where paste occurred
 */
const handlePaste = (e: ClipboardEvent, index: number): void => {
  e.preventDefault()
  let pasteData = e.clipboardData?.getData("text") || ""

  // If digitsOnly is enabled, filter out non-digit characters
  if (props.digitsOnly) {
    pasteData = pasteData
      .split("")
      .filter((char) => !isNaN(Number(char)))
      .join("")
  }

  if (pasteData) {
    // Fill the inputs starting from the current index
    for (let i = 0; i < Math.min(pasteData.length, props.length - index); i++) {
      values.value[index + i] = pasteData[i]
    }

    // Emit the updated value
    emit("update:modelValue", values.value.join(""))

    // Focus the next empty input or the last input
    const nextEmptyIndex = values.value.findIndex((val, idx) => idx > index && !val)
    const focusIndex =
      nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + pasteData.length, props.length - 1)
    focusInput(focusIndex)
  }
}
</script>
