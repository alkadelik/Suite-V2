<template>
  <div>
    <label v-if="label" :for="htmlFor" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div :class="containerClasses">
      <!-- Textarea -->
      <textarea
        :id="htmlFor"
        :name="name"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :cols="cols"
        :maxlength="maxlength"
        :minlength="minlength"
        :class="textareaClasses"
        :value="modelValue"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        v-bind="$attrs"
      />
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
    <div v-if="showCharacterCount" class="mt-1 text-right text-xs text-gray-400">
      {{ characterCount }}{{ maxlength ? `/${maxlength}` : "" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { capitalizeFirstChar } from "@/utils/format-strings"
import Icon from "@components/Icon.vue"
import { computed } from "vue"

interface Props {
  /** The model value of the textarea */
  modelValue?: string
  /** The label for the textarea */
  label?: string
  /** The name attribute for the textarea */
  name?: string
  /** The id attribute for the textarea */
  id?: string
  /** Placeholder text for the textarea */
  placeholder?: string
  /** Whether the textarea is required */
  required?: boolean
  /** Whether the textarea is disabled */
  disabled?: boolean
  /** Whether the textarea is readonly */
  readonly?: boolean
  /** Error message to display */
  error?: string
  /** Hint text to display when there's no error */
  hint?: string
  /** The visual variant of the textarea
   * @default "default"
   */
  variant?: "default" | "error" | "success"
  /** The size of the textarea
   * @default "md"
   */
  size?: "sm" | "md" | "lg"
  /** The number of visible text lines for the textarea
   * @default 4
   */
  rows?: number
  /** The visible width of the textarea in average character widths */
  cols?: number
  /** The maximum number of characters allowed */
  maxlength?: number
  /** The minimum number of characters required */
  minlength?: number
  /** Whether to show character count
   * @default false
   */
  showCharacterCount?: boolean
  /** Whether the textarea should resize automatically
   * @default false
   */
  autoResize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "md",
  rows: 4,
  showCharacterCount: false,
  autoResize: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit("update:modelValue", target.value)

  // Auto resize if enabled
  if (props.autoResize) {
    target.style.height = "auto"
    target.style.height = target.scrollHeight + "px"
  }
}

const htmlFor = computed(() => props.id || props.name || props.label)

const characterCount = computed(() => {
  return typeof props.modelValue === "string" ? props.modelValue.length : 0
})

const containerClasses = computed(() => {
  const baseClasses =
    "flex items-start rounded-xl border overflow-hidden bg-core-25 disabled:bg-gray-50"

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

const textareaClasses = computed(() => {
  const baseClasses =
    "w-full border-0 bg-transparent focus:outline-none focus:ring-0 placeholder-core-400 text-core-800 resize-none"

  const sizeClasses = {
    sm: "p-2 text-sm",
    md: "p-3 text-sm",
    lg: "p-4 text-base",
  }

  const resizeClasses = props.autoResize ? "overflow-hidden" : "resize-y"

  return [baseClasses, sizeClasses[props.size], resizeClasses].filter(Boolean).join(" ")
})
</script>
