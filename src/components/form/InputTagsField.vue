<template>
  <div>
    <!-- Selected Items as Chips (above the input) -->
    <div v-if="selectedItems.length > 0" class="mb-2 flex flex-wrap items-center gap-2">
      <span
        v-for="(item, index) in selectedItems"
        :key="getItemKey(item, index)"
        :class="getChipClasses(item)"
      >
        {{ item.label }}
        <button
          type="button"
          class="ml-1.5 text-sm font-bold transition-colors hover:text-red-600"
          @click="removeItem(index)"
        >
          <Icon name="x-close" size="13" />
        </button>
      </span>
    </div>

    <label v-if="label" :for="htmlFor" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative w-full">
      <div :class="containerClasses">
        <div v-if="leftIcon" class="text-core-400 flex items-center pl-3">
          <Icon :name="leftIcon" class="h-4 w-4" />
        </div>

        <div :class="contentClasses">
          <input
            ref="inputRef"
            v-model="inputValue"
            type="text"
            :inputmode="props.isWeightAttribute ? 'decimal' : 'text'"
            :placeholder="placeholder"
            :disabled="disabled"
            :class="inputClasses"
            @keydown.enter.prevent="addTag"
            @keydown="handleKeydown"
            @input="handleInput"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
          />
        </div>

        <button
          v-if="clearable && selectedItems.length > 0 && !disabled"
          type="button"
          class="text-core-400 hover:text-core-600 flex items-center px-2"
          @click="clearAllTags"
        >
          ×
        </button>
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

    <!-- Instructions text -->
    <div v-if="!error && !hint" class="text-core-600 mt-1 text-xs">
      Press <strong>Enter</strong> or use a <strong>Comma</strong> to save a tag
    </div>
  </div>
</template>

<script setup lang="ts">
import { capitalizeFirstChar } from "@/utils/format-strings"
import Icon from "@components/Icon.vue"
import { TChipColor } from "@modules/shared/types"
import { ref, computed } from "vue"

interface TagItem {
  label: string
  value: string
  color?: TChipColor
  class?: string
}

interface Props {
  /** Array of selected tag objects */
  modelValue?: TagItem[]
  /** Label text displayed above the input field */
  label?: string
  /** Name attribute for form submission */
  name?: string
  /** Unique identifier for the input field */
  id?: string
  /** Placeholder text shown in the input */
  placeholder?: string
  /** Whether the field is required for form validation */
  required?: boolean
  /** Whether the input field is disabled */
  disabled?: boolean
  /** Error message to display below the field */
  error?: string
  /** Hint text to display below the field when there's no error */
  hint?: string
  /** Show a clear button to reset all tags */
  clearable?: boolean
  /** Visual variant of the input field */
  variant?: "default" | "error" | "success"
  /** Size variant of the input field */
  size?: "sm" | "md" | "lg"
  /** Icon to display on the left side of the input field */
  leftIcon?: string
  /** Default color for tag chips */
  chipColor?: TChipColor
  /** Chip variant style */
  chipVariant?: "filled" | "outlined"
  /** Allow duplicate tags */
  allowDuplicates?: boolean
  /** Maximum number of tags allowed */
  maxTags?: number
  /** Whether this is a weight attribute field (numeric only, auto-appends "kg") */
  isWeightAttribute?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  variant: "default",
  size: "md",
  placeholder: "Type and press Enter or comma to add tags...",
  chipColor: "primary",
  chipVariant: "outlined",
  allowDuplicates: false,
  isWeightAttribute: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: TagItem[]]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputValue = ref("")
const inputRef = ref<HTMLInputElement>()

// Computed properties
const htmlFor = computed(() => props.id || props.name || props.label)

const selectedItems = computed(() => props.modelValue || [])

const getItemKey = (item: TagItem, index: number): string | number => {
  return `${item.value}-${index}`
}

const getChipClasses = (item: TagItem): string => {
  // If the item has a custom class, use it
  if (item.class) {
    return item.class
  }

  // Use the item's color or fallback to the component's default chipColor
  const color = item.color || props.chipColor
  const variant = props.chipVariant

  const baseClasses = [
    "inline-flex",
    "items-center",
    "rounded-full",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "gap-1.5",
    "transition-all",
    "duration-200",
    "ease-in-out",
  ]

  // Color and variant combinations
  const variantColorClasses = {
    filled: {
      primary: "bg-primary-600 text-white",
      success: "bg-green-600 text-white",
      warning: "bg-yellow-600 text-white",
      error: "bg-red-600 text-white",
      alt: "bg-gray-600 text-white",
      blue: "bg-blue-600 text-white",
      purple: "bg-purple-600 text-white",
      pink: "bg-pink-600 text-white",
    },
    outlined: {
      primary: "bg-primary-50 text-primary-700 border border-primary-200",
      success: "bg-green-50 text-green-700 border border-green-200",
      warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      error: "bg-red-50 text-red-700 border border-red-200",
      alt: "bg-gray-50 text-gray-700 border border-gray-200",
      blue: "bg-blue-50 text-blue-700 border border-blue-200",
      purple: "bg-purple-50 text-purple-700 border border-purple-200",
      pink: "bg-pink-50 text-pink-700 border border-pink-200",
    },
  }

  return [...baseClasses, variantColorClasses[variant][color]].join(" ")
}

// Styling computed properties
const containerClasses = computed(() => {
  const baseClasses = "flex items-center rounded-xl border w-full overflow-hidden bg-core-25"
  const variantClasses = {
    default:
      "border-core-50 focus-within:border-primary-300 focus-within:ring-1 focus-within:ring-primary-300",
    error:
      "border-red-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500",
    success:
      "border-green-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500",
  }
  const sizeClasses = { sm: "min-h-[36px]", md: "min-h-[44px]", lg: "min-h-[48px]" }
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed" : ""
  const currentVariant = props.error ? "error" : props.variant
  return [
    baseClasses,
    variantClasses[currentVariant],
    sizeClasses[props.size],
    disabledClasses,
  ].join(" ")
})

const contentClasses = computed(() => {
  const base = "flex flex-1 items-center gap-2 min-w-0"
  const padding = {
    sm: `py-1.5 ${props.leftIcon ? "pl-2" : "pl-3"}`,
    md: `py-2 ${props.leftIcon ? "pl-2" : "pl-3"}`,
    lg: `py-2.5 ${props.leftIcon ? "pl-2" : "pl-3"}`,
  }
  return [base, padding[props.size]].join(" ")
})

const inputClasses = computed(() => {
  const base = "flex-1 bg-transparent border-none outline-none text-core-800 placeholder-core-400"
  const sizeClasses = { sm: "text-sm", md: "text-sm", lg: "text-base" }
  const disabledClasses = props.disabled ? "cursor-not-allowed" : ""
  return [base, sizeClasses[props.size], disabledClasses].join(" ")
})

// Actions
const addTag = () => {
  // Convert to string and trim (handles both string and number types)
  const trimmedValue = String(inputValue.value).trim()
  if (!trimmedValue) return

  // For weight attribute, validate it's a number
  if (props.isWeightAttribute) {
    const numValue = parseFloat(trimmedValue)
    if (isNaN(numValue) || numValue <= 0) {
      inputValue.value = ""
      return
    }
  }

  // Prepare the value and label
  let tagValue = trimmedValue
  let tagLabel = trimmedValue

  // For weight attribute, append " kg" to the label but keep numeric value
  if (props.isWeightAttribute) {
    tagLabel = `${trimmedValue} kg`
    // Value stays as numeric string for dimension mapping
  }

  // Check for duplicates if not allowed
  if (!props.allowDuplicates) {
    const exists = selectedItems.value.some(
      (item) => item.value.toLowerCase() === tagValue.toLowerCase(),
    )
    if (exists) {
      inputValue.value = ""
      return
    }
  }

  // Check max tags limit
  if (props.maxTags && selectedItems.value.length >= props.maxTags) {
    inputValue.value = ""
    return
  }

  const newTag: TagItem = {
    label: tagLabel,
    value: tagValue,
  }

  const newTags = [...selectedItems.value, newTag]
  emit("update:modelValue", newTags)
  inputValue.value = ""
}

const removeItem = (index: number) => {
  const newTags = selectedItems.value.filter((_, i) => i !== index)
  emit("update:modelValue", newTags)
}

const clearAllTags = () => {
  emit("update:modelValue", [])
  inputRef.value?.focus()
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle comma key
  if (event.key === ",") {
    event.preventDefault()
    addTag()
  }

  // Handle backspace when input is empty - remove last tag
  if (event.key === "Backspace" && !inputValue.value && selectedItems.value.length > 0) {
    removeItem(selectedItems.value.length - 1)
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // For weight attribute, allow only valid numeric characters (no negative values)
  if (props.isWeightAttribute && value) {
    // Allow only digits and decimal point (no minus sign for weights)
    let sanitized = value.replace(/[^0-9.]/g, "")

    // Ensure only one decimal point
    const decimalCount = (sanitized.match(/\./g) || []).length
    if (decimalCount > 1) {
      const parts = sanitized.split(".")
      sanitized = parts[0] + "." + parts.slice(1).join("")
    }

    value = sanitized
    target.value = sanitized
    inputValue.value = sanitized
    return
  }

  // Auto-add tag when comma is typed (in case keydown doesn't catch it)
  if (value.includes(",")) {
    const parts = value.split(",")
    const tagText = parts[0].trim()

    if (tagText) {
      inputValue.value = tagText
      addTag()
    }

    // Set remaining text (if any) after comma
    inputValue.value = parts.slice(1).join(",")
  }
}
</script>
