<template>
  <div>
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
          <!-- Multiple Selection Chips -->
          <div v-if="multiple && hasSelection" class="flex flex-wrap items-center gap-1">
            <span
              v-for="(item, idx) in displayedSelections"
              :key="idx"
              class="bg-primary-100 text-primary-800 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
            >
              {{ getLabel(item) }}
              <button type="button" class="hover:text-primary-900 ml-1" @click.stop="remove(item)">
                ×
              </button>
            </span>
            <span
              v-if="selectedArray.length > maxChipsDisplay"
              class="bg-core-100 text-core-600 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
            >
              +{{ selectedArray.length - maxChipsDisplay }} more
            </span>
          </div>

          <!-- Display Text (always visible, no input field in main area) -->
          <div v-if="!multiple || !hasSelection" :class="displayTextClasses">
            {{ displayText }}
          </div>
        </div>

        <button
          v-if="clearable && hasSelection && !disabled"
          type="button"
          class="text-core-400 hover:text-core-600 flex items-center px-2"
          @click.stop="clearSelection"
        >
          ×
        </button>

        <div class="text-core-400 flex items-center pr-3">
          <Icon name="arrow-down-double" class="h-4 w-4" />
        </div>
      </div>

      <Teleport to="body">
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="open"
            ref="dropdownElement"
            :class="dropdownClasses"
            :style="dropdownStyles"
            @click.stop
          >
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

            <!-- Select All Button (for multiple selection) -->
            <div
              v-if="multiple && filteredOptions.length > 0"
              class="border-core-100 border-b px-3 pb-2"
            >
              <button
                type="button"
                class="text-primary-600 hover:text-primary-700 text-xs font-medium"
                @click.stop="selectAll"
              >
                {{ allSelected ? "Unselect All" : "Select All" }}
              </button>
            </div>

            <!-- Options List -->
            <div class="max-h-48 overflow-auto">
              <template v-for="(opt, idx) in filteredOptions" :key="getOptionKey(opt, idx)">
                <div
                  :class="[getOptionClasses(opt, idx)]"
                  @click="select(opt)"
                  @mouseenter="highlightedIndex = idx"
                >
                  <slot
                    name="option"
                    :option="opt"
                    :label="getLabel(opt)"
                    :selected="isSelected(opt)"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <!-- Checkbox for multiple selection -->
                        <div
                          v-if="multiple"
                          :class="[
                            'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                            isSelected(opt)
                              ? 'bg-primary-600 border-primary-600'
                              : 'border-core-300 bg-white',
                          ]"
                        >
                          <Icon v-if="isSelected(opt)" name="check" class="h-3 w-3 text-white" />
                        </div>
                        <span>{{ getLabel(opt) }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Icon
                          v-if="getOptionIcon(opt)"
                          :name="getOptionIcon(opt)!"
                          class="text-primary-600 h-4 w-4"
                        />
                        <Icon
                          v-if="!multiple && isSelected(opt)"
                          name="check"
                          class="text-primary-600 h-4 w-4"
                        />
                      </div>
                    </div>
                  </slot>
                </div>
                <div v-if="hasOptionDivider(opt)" class="border-b border-gray-200" />
              </template>
              <div
                v-if="filteredOptions.length === 0"
                class="text-core-400 px-4 py-3 text-center text-sm"
              >
                {{ noOptionsText }}
              </div>
            </div>

            <!-- Done Button (for multiple selection) -->
            <div
              v-if="multiple && filteredOptions.length > 0"
              class="border-core-100 flex justify-end border-t px-3 pt-2"
            >
              <button
                type="button"
                class="text-primary-600 hover:text-primary-700 text-xs font-medium"
                @click.stop="closeDropdown"
              >
                Done
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>
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
import { useMediaQuery } from "@vueuse/core"
import { ref, computed, onMounted, onUnmounted } from "vue"

type OptionValue = string | number | Record<string, unknown>

interface Props {
  /** The current value of the select field. Can be a single value or array for multiple selection */
  modelValue?: OptionValue | OptionValue[] | null
  /** Array of options to display in the dropdown */
  options: OptionValue[]
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
  /** Enable multiple selection mode */
  multiple?: boolean
  /** Enable search functionality within the dropdown */
  searchable?: boolean
  /** Hide already selected options from the dropdown */
  hideSelected?: boolean
  /** Show a clear button to reset the selection */
  clearable?: boolean
  /** Key to use for displaying option labels when options are objects */
  labelKey?: string
  /** Key to use for option values when options are objects */
  valueKey?: string
  /** Maximum number of selected chips to display before showing "+X more" */
  maxChipsDisplay?: number
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
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  searchable: false,
  hideSelected: false,
  clearable: false,
  labelKey: "label",
  valueKey: "value",
  maxChipsDisplay: 3,
  noOptionsText: "No options found",
  variant: "default",
  size: "md",
  placement: "top",
})

const emit = defineEmits<{
  "update:modelValue": [value: OptionValue | OptionValue[] | null]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const open = ref(false)
const search = ref("")
const highlightedIndex = ref(-1)
const selectContainer = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()
const dropdownElement = ref<HTMLElement>()
const positionTrigger = ref(0) // Used to force recompute dropdown position

// Check if we're inside a modal
const isInsideModal = computed(() => {
  if (!selectContainer.value) return false
  return !!selectContainer.value.closest('[class*="fixed"][class*="inset-0"]')
})

// Computed properties
const htmlFor = computed(() => props.id || props.name || props.label)
const selected = computed(() => (props.multiple ? null : (props.modelValue as OptionValue | null)))
const selectedArray = computed(() =>
  props.multiple ? (Array.isArray(props.modelValue) ? props.modelValue : []) : [],
)
const displayedSelections = computed(() => selectedArray.value.slice(0, props.maxChipsDisplay))
const hasSelection = computed(() =>
  props.multiple ? selectedArray.value.length > 0 : selected.value != null,
)

const isMobile = useMediaQuery("(max-width: 768px)")

// Dropdown placement logic
const dropdownPlacement = computed(() => {
  if (isMobile && props.searchable) return "bottom"

  if (props.placement === "auto" && selectContainer.value && open.value) {
    const rect = selectContainer.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    // If there's more space above and not enough below, place on top
    if (spaceAbove > spaceBelow && spaceBelow < 200) {
      return "top"
    }
    return "bottom"
  }
  return props.placement === "auto" ? "top" : props.placement
})

// Helper functions
const getLabel = (opt: OptionValue): string => {
  if (typeof opt === "object" && opt !== null) {
    const label = opt[props.labelKey]
    if (typeof label === "string" || typeof label === "number") return String(label)
    return JSON.stringify(opt)
  }
  return String(opt)
}

const getValue = (opt: OptionValue): OptionValue => {
  if (typeof opt === "object" && opt !== null && props.valueKey in opt) {
    return opt[props.valueKey] as OptionValue
  }
  return opt
}

const getOptionKey = (opt: OptionValue, index: number): string | number => {
  if (typeof opt === "object" && opt !== null && "id" in opt) {
    return (opt.id as string | number) || index
  }
  return index
}

const getOptionIcon = (opt: OptionValue): string | undefined => {
  if (typeof opt === "object" && opt !== null && "icon" in opt) {
    return opt.icon as string
  }
  return undefined
}

const hasOptionDivider = (opt: OptionValue): boolean => {
  if (typeof opt === "object" && opt !== null && "divider" in opt) {
    return opt.divider === true
  }
  return false
}

const isSelected = (opt: OptionValue): boolean => {
  const optValue = JSON.stringify(getValue(opt))
  if (props.multiple) {
    return selectedArray.value.some((item) => JSON.stringify(getValue(item)) === optValue)
  }
  return selected.value ? JSON.stringify(getValue(selected.value)) === optValue : false
}

// Filter options
const filteredOptions = computed(() => {
  let opts = props.options

  if (props.searchable && search.value.trim()) {
    const searchTerm = search.value.toLowerCase()
    opts = opts.filter((option) => {
      // Keep options marked as always visible
      if (
        typeof option === "object" &&
        option !== null &&
        "alwaysVisible" in option &&
        option.alwaysVisible === true
      ) {
        return true
      }
      return getLabel(option).toLowerCase().includes(searchTerm)
    })
  }

  if (props.hideSelected) {
    opts = opts.filter((option) => !isSelected(option))
  }
  return opts
})

// REFACTOR: New computed properties to keep the template DRY
const displayText = computed(() => {
  if (!props.multiple && hasSelection.value) {
    return getLabel(selected.value!)
  }
  return props.placeholder || (props.multiple ? "Select options..." : "Select option...")
})

const displayTextClasses = computed(() => [
  "flex-1 text-left truncate",
  !props.multiple && hasSelection.value ? "text-core-800" : "text-core-400",
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
    "w-full border border-core-200 rounded-lg px-3 py-2 bg-white focus:outline-none  focus:border-primary-300 placeholder-core-400 text-core-800"
  const sizeClasses = { sm: "text-base", md: "text-base", lg: "text-base" }
  return [base, sizeClasses[props.size]].join(" ")
})

const dropdownClasses = computed(() => {
  // Use higher z-index when inside a modal (z-60) vs normal usage (z-50)
  const zIndex = isInsideModal.value ? "z-[1300]" : "z-[1200]"
  const baseClasses = `fixed ${zIndex} overflow-hidden rounded-xl border bg-white shadow-lg border-core-100 py-2`
  return baseClasses
})

// Calculate dropdown position using fixed positioning
const dropdownStyles = computed(() => {
  // Include positionTrigger to force recomputation on scroll/resize
  void positionTrigger.value

  if (!selectContainer.value || !open.value) return {}

  const rect = selectContainer.value.getBoundingClientRect()
  const spacing = 4 // Gap between select and dropdown

  const styles: Record<string, string> = {
    width: `${rect.width}px`,
    minWidth: `${rect.width}px`,
  }

  if (dropdownPlacement.value === "top") {
    // Position above the select field
    styles.bottom = `${window.innerHeight - rect.top + spacing}px`
    styles.left = `${rect.left}px`
  } else {
    // Position below the select field
    styles.top = `${rect.bottom + spacing}px`
    styles.left = `${rect.left}px`
  }

  return styles
})

const getOptionClasses = (opt: OptionValue, index: number): string => {
  const base = "cursor-pointer px-4 py-2 text-sm transition-colors duration-150"
  const selectedClasses = isSelected(opt)
    ? "bg-primary-50 text-primary-700 font-semibold"
    : "text-core-700"
  const highlightedClasses = index === highlightedIndex.value ? "bg-core-25" : "hover:bg-core-25"
  return [base, selectedClasses, highlightedClasses].join(" ")
}

// Actions
const toggleDropdown = () => {
  if (props.disabled) return
  open.value = !open.value
  highlightedIndex.value = -1

  if (open.value && props.searchable) {
    search.value = ""
    // Focus the search input after the dropdown opens
    setTimeout(() => searchInput.value?.focus(), 100)
  }
}

const select = (opt: OptionValue) => {
  if (props.multiple) {
    if (isSelected(opt)) remove(opt)
    else emit("update:modelValue", [...selectedArray.value, opt])
    // Don't close dropdown for multiple selection
  } else {
    emit("update:modelValue", opt)
    open.value = false
  }
  search.value = ""
}

const allSelected = computed(() => {
  if (!props.multiple || filteredOptions.value.length === 0) return false
  return filteredOptions.value.every((opt) => isSelected(opt))
})

const selectAll = () => {
  if (!props.multiple) return
  if (allSelected.value) {
    // Unselect all filtered options
    const filteredValues = filteredOptions.value.map((opt) => JSON.stringify(getValue(opt)))
    const newValue = selectedArray.value.filter(
      (item) => !filteredValues.includes(JSON.stringify(getValue(item))),
    )
    emit("update:modelValue", newValue)
  } else {
    // Select all filtered options (merge with existing selections)
    const newSelections = filteredOptions.value.filter((opt) => !isSelected(opt))
    emit("update:modelValue", [...selectedArray.value, ...newSelections])
  }
}

const closeDropdown = () => {
  open.value = false
  search.value = ""
}

const remove = (opt: OptionValue) => {
  if (!props.multiple) return
  const optValue = JSON.stringify(getValue(opt))
  const newValue = selectedArray.value.filter((item) => JSON.stringify(getValue(item)) !== optValue)
  emit("update:modelValue", newValue)
}

const clearSelection = () => {
  emit("update:modelValue", props.multiple ? [] : null)
  search.value = ""
  // Keep dropdown open and focus search if it was open and searchable
  if (open.value && props.searchable) {
    setTimeout(() => searchInput.value?.focus(), 50)
  }
}

const selectHighlighted = () => {
  const highlightedOption = filteredOptions.value[highlightedIndex.value]
  if (highlightedOption) {
    select(highlightedOption)
  }
}

const highlightNext = () => {
  if (highlightedIndex.value < filteredOptions.value.length - 1) highlightedIndex.value++
}

const highlightPrevious = () => {
  if (highlightedIndex.value > 0) highlightedIndex.value--
}

// Outside click handler
const onClickOutside = (event: MouseEvent) => {
  if (!open.value || !selectContainer.value) return

  const target = event.target as HTMLElement

  // Check if click is inside the select container
  if (selectContainer.value.contains(target)) return

  // Check if click is inside the dropdown (via ref or by checking parent elements)
  if (dropdownElement.value?.contains(target)) return

  // Also check if the target is within any teleported dropdown
  const isInsideDropdown = target.closest('[class*="z-[1200]"], [class*="z-[1300]"]')
  if (isInsideDropdown) return

  // Special handling for clicks inside modals
  if (isInsideModal.value) {
    // Check if the click is on the modal overlay (which should close the dropdown)
    const isClickOnModalOverlay =
      target.classList.contains("fixed") &&
      target.classList.contains("inset-0") &&
      (target.classList.contains("bg-black") || target.style.backgroundColor)

    // Check if click is on the modal close button
    const isModalCloseButton =
      target.closest('[class*="close"]') ||
      target.closest('button[aria-label*="close"]') ||
      target.closest('button[title*="close"]')

    if (isClickOnModalOverlay || isModalCloseButton) {
      open.value = false
      search.value = ""
    }
  } else {
    // Normal outside click behavior for non-modal usage
    open.value = false
    search.value = ""
  }
}

// Update dropdown position on scroll and resize
const updateDropdownPosition = () => {
  if (open.value && selectContainer.value) {
    // Force recompute by incrementing positionTrigger
    positionTrigger.value++
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside, true) // Use capture phase
  window.addEventListener("scroll", updateDropdownPosition, true)
  window.addEventListener("resize", updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside, true)
  window.removeEventListener("scroll", updateDropdownPosition, true)
  window.removeEventListener("resize", updateDropdownPosition)
})
</script>
