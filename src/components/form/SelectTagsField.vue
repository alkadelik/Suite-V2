<template>
  <div>
    <!-- Selected Items as Chips (above the select) -->
    <div v-if="selectedItems.length > 0" class="mb-2 flex flex-wrap items-center gap-2">
      <span
        v-for="item in selectedItems"
        :key="getOptionKey(item, selectedItems.indexOf(item))"
        :class="getChipClasses(item)"
      >
        {{ getLabel(item) }}
        <button
          type="button"
          class="ml-1.5 text-sm font-bold transition-colors hover:text-red-600"
          @click="removeItem(item)"
        >
          <Icon name="x-close" size="13" />
        </button>
      </span>
    </div>

    <label v-if="label" :for="htmlFor" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative w-full" ref="selectContainer" @click.stop="toggleDropdown">
      <div :class="containerClasses">
        <div v-if="leftIcon" class="text-core-400 flex items-center pl-3">
          <Icon :name="leftIcon" class="h-4 w-4" />
        </div>

        <div :class="contentClasses">
          <!-- Display Text -->
          <div :class="displayTextClasses">
            {{ displayText }}
          </div>
        </div>

        <button
          v-if="clearable && selectedItems.length > 0 && !disabled"
          type="button"
          class="text-core-400 hover:text-core-600 flex items-center px-2"
          @click.stop="clearAllSelections"
        >
          ×
        </button>

        <div class="text-core-400 flex items-center pr-3">
          <Icon name="arrow-down-double" class="h-4 w-4" />
        </div>
      </div>

      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div v-if="open" :class="dropdownClasses" @click.stop>
          <!-- Search Input (inside dropdown) -->
          <div v-if="searchable" class="border-core-100 border-b p-3">
            <input
              ref="searchInput"
              v-model="search"
              placeholder="Search options..."
              :class="searchInputClasses"
              @click.stop
              @keydown.escape="open = false"
              @keydown.enter.prevent="selectHighlighted"
              @keydown.arrow-down.prevent="highlightNext"
              @keydown.arrow-up.prevent="highlightPrevious"
            />
          </div>

          <!-- Options List -->
          <div class="max-h-48 overflow-auto">
            <div
              v-for="(opt, idx) in availableOptions"
              :key="getOptionKey(opt, idx)"
              :class="[getOptionClasses(opt, idx)]"
              @click="selectItem(opt)"
              @mouseenter="highlightedIndex = idx"
            >
              <slot name="option" :option="opt" :label="getLabel(opt)">
                <div class="flex items-center justify-between">
                  <span>{{ getLabel(opt) }}</span>
                </div>
              </slot>
            </div>
            <div
              v-if="availableOptions.length === 0"
              class="text-core-400 px-4 py-3 text-center text-sm"
            >
              {{ noOptionsText }}
            </div>
          </div>
        </div>
      </Transition>
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
import { TChipColor } from "@modules/shared/types"
import { ref, computed, onMounted, onUnmounted } from "vue"

type OptionValue = string | number | Record<string, unknown>

interface OptionWithClass extends Record<string, unknown> {
  label: string | number
  value: OptionValue
  class?: string
  color?: TChipColor
}

interface Props {
  /** Array of selected values */
  modelValue?: OptionValue[]
  /** Array of options to display in the dropdown */
  options: OptionWithClass[]
  /** Label text displayed above the select field */
  label?: string
  /** Name attribute for form submission */
  name?: string
  /** Unique identifier for the select field */
  id?: string
  /** Placeholder text shown when no option is selected */
  placeholder?: string
  /** Whether the field is required for form validation */
  required?: boolean
  /** Whether the select field is disabled */
  disabled?: boolean
  /** Error message to display below the field */
  error?: string
  /** Hint text to display below the field when there's no error */
  hint?: string
  /** Enable search functionality within the dropdown */
  searchable?: boolean
  /** Show a clear button to reset all selections */
  clearable?: boolean
  /** Key to use for displaying option labels when options are objects */
  labelKey?: string
  /** Key to use for option values when options are objects */
  valueKey?: string
  /** Text to show when no options are found */
  noOptionsText?: string
  /** Visual variant of the select field */
  variant?: "default" | "error" | "success"
  /** Size variant of the select field */
  size?: "sm" | "md" | "lg"
  /** Icon to display on the left side of the select field */
  leftIcon?: string
  /** Placement direction of the dropdown menu */
  placement?: "bottom" | "top" | "auto"
  /** Default color for selected item chips */
  chipColor?: TChipColor
  /** Chip variant style */
  chipVariant?: "filled" | "outlined"
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  searchable: false,
  clearable: false,
  labelKey: "label",
  valueKey: "value",
  noOptionsText: "No options found",
  variant: "default",
  size: "md",
  placement: "bottom",
  placeholder: "Select options...",
  chipColor: "primary",
  chipVariant: "outlined",
})

const emit = defineEmits<{
  "update:modelValue": [value: OptionValue[]]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const open = ref(false)
const search = ref("")
const highlightedIndex = ref(-1)
const selectContainer = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()

// Check if we're inside a modal
const isInsideModal = computed(() => {
  if (!selectContainer.value) return false
  return !!selectContainer.value.closest('[class*="fixed"][class*="inset-0"]')
})

// Computed properties
const htmlFor = computed(() => props.id || props.name || props.label)

const selectedValues = computed(() => props.modelValue || [])

const selectedItems = computed(() => {
  return props.options.filter((option) =>
    selectedValues.value.some(
      (value) => JSON.stringify(getValue(option)) === JSON.stringify(value),
    ),
  )
})

// Dropdown placement logic
const dropdownPlacement = computed(() => {
  if (props.placement === "auto" && selectContainer.value && open.value) {
    const rect = selectContainer.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    if (spaceAbove > spaceBelow && spaceBelow < 200) {
      return "top"
    }
    return "bottom"
  }
  return props.placement === "auto" ? "bottom" : props.placement
})

// Helper functions
const getLabel = (opt: OptionWithClass): string => {
  const label = opt[props.labelKey]
  if (typeof label === "string" || typeof label === "number") return String(label)
  return JSON.stringify(opt)
}

const getValue = (opt: OptionWithClass): OptionValue => {
  if (props.valueKey in opt) {
    return opt[props.valueKey] as OptionValue
  }
  return opt
}

const getOptionKey = (opt: OptionWithClass, index: number): string | number => {
  if ("id" in opt) {
    return (opt.id as string | number) || index
  }
  return index
}

const getChipClasses = (item: OptionWithClass): string => {
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

  // Color and variant combinations (same as Chip component)
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

// Filter available options (exclude already selected ones)
const availableOptions = computed(() => {
  let opts = props.options.filter(
    (option) =>
      !selectedValues.value.some(
        (value) => JSON.stringify(getValue(option)) === JSON.stringify(value),
      ),
  )

  if (props.searchable && search.value.trim()) {
    const searchTerm = search.value.toLowerCase()
    opts = opts.filter((option) => getLabel(option).toLowerCase().includes(searchTerm))
  }

  return opts
})

const displayText = computed(() => {
  if (selectedItems.value.length > 0) {
    return `${selectedItems.value.length} item${selectedItems.value.length === 1 ? "" : "s"} selected`
  }
  return props.placeholder
})

const displayTextClasses = computed(() => [
  "flex-1 text-left truncate",
  selectedItems.value.length > 0 ? "text-core-800" : "text-core-400",
])

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
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  const currentVariant = props.error ? "error" : props.variant
  return [
    baseClasses,
    variantClasses[currentVariant],
    sizeClasses[props.size],
    disabledClasses,
  ].join(" ")
})

const contentClasses = computed(() => {
  const base = "flex flex-1 items-center gap-2 min-w-0 text-sm"
  const padding = {
    sm: `py-1.5 ${props.leftIcon ? "pl-2" : "pl-3"}`,
    md: `py-2 ${props.leftIcon ? "pl-2" : "pl-3"}`,
    lg: `py-2.5 ${props.leftIcon ? "pl-2" : "pl-3"}`,
  }
  return [base, padding[props.size]].join(" ")
})

const searchInputClasses = computed(() => {
  const base =
    "w-full border border-core-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-primary-300 placeholder-core-400 text-core-800"
  const sizeClasses = { sm: "text-sm", md: "text-sm", lg: "text-base" }
  return [base, sizeClasses[props.size]].join(" ")
})

const dropdownClasses = computed(() => {
  const zIndex = isInsideModal.value ? "z-[70]" : "z-[60]"
  const baseClasses = `absolute ${zIndex} w-full overflow-hidden rounded-xl border bg-white shadow-lg border-core-100 py-2`
  const placementClasses = {
    bottom: "mt-1 top-full",
    top: "mb-1 bottom-full",
  }
  return [baseClasses, placementClasses[dropdownPlacement.value]].join(" ")
})

const getOptionClasses = (_opt: OptionWithClass, index: number): string => {
  const base = "cursor-pointer px-4 py-2 text-sm transition-colors duration-150"
  const highlightedClasses = index === highlightedIndex.value ? "bg-core-25" : "hover:bg-core-25"
  return [base, "text-core-700", highlightedClasses].join(" ")
}

// Actions
const toggleDropdown = () => {
  if (props.disabled) return
  open.value = !open.value
  highlightedIndex.value = -1

  if (open.value && props.searchable) {
    search.value = ""
    setTimeout(() => searchInput.value?.focus(), 100)
  }
}

const selectItem = (opt: OptionWithClass) => {
  const newValues = [...selectedValues.value, getValue(opt)]
  emit("update:modelValue", newValues)
  search.value = ""
  // Keep dropdown open for multiple selections
}

const removeItem = (opt: OptionWithClass) => {
  const optValue = JSON.stringify(getValue(opt))
  const newValues = selectedValues.value.filter((value) => JSON.stringify(value) !== optValue)
  emit("update:modelValue", newValues)
}

const clearAllSelections = () => {
  emit("update:modelValue", [])
  search.value = ""
  if (open.value && props.searchable) {
    setTimeout(() => searchInput.value?.focus(), 50)
  }
}

const selectHighlighted = () => {
  const highlightedOption = availableOptions.value[highlightedIndex.value]
  if (highlightedOption) {
    selectItem(highlightedOption)
  }
}

const highlightNext = () => {
  if (highlightedIndex.value < availableOptions.value.length - 1) highlightedIndex.value++
}

const highlightPrevious = () => {
  if (highlightedIndex.value > 0) highlightedIndex.value--
}

// Outside click handler
const onClickOutside = (event: MouseEvent) => {
  if (
    open.value &&
    selectContainer.value &&
    !selectContainer.value.contains(event.target as Node)
  ) {
    const target = event.target as HTMLElement

    if (isInsideModal.value) {
      const isClickOnModalOverlay =
        target.classList.contains("fixed") &&
        target.classList.contains("inset-0") &&
        (target.classList.contains("bg-black") || target.style.backgroundColor)

      const isModalCloseButton =
        target.closest('[class*="close"]') ||
        target.closest('button[aria-label*="close"]') ||
        target.closest('button[title*="close"]')

      if (isClickOnModalOverlay || isModalCloseButton) {
        open.value = false
        search.value = ""
      }
    } else {
      open.value = false
      search.value = ""
    }
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside, true)
})
onUnmounted(() => {
  document.removeEventListener("click", onClickOutside, true)
})
</script>
