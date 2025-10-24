<template>
  <div ref="containerRef" class="relative">
    <!-- Label -->
    <label
      v-if="label && !hideLabel"
      :for="inputId"
      class="text-core-800 mb-1.5 block text-sm font-medium"
    >
      {{ label }}
      <span v-if="required" class="text-red-500" aria-label="required">*</span>
    </label>

    <!-- Color Trigger Button -->
    <button
      :id="inputId"
      ref="triggerRef"
      type="button"
      :class="triggerClasses"
      :disabled="disabled || readonly"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-label="ariaLabel"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      :aria-invalid="!!error"
      @click="handleTriggerClick"
      @keydown="handleTriggerKeydown"
    >
      <!-- Color Preview Circle -->
      <div
        class="h-6 w-6 flex-shrink-0 rounded-full border border-gray-300 shadow-sm"
        :style="{ backgroundColor: normalizedColor }"
        aria-hidden="true"
      />

      <!-- Hex Display -->
      <span class="text-core-800 flex-1 truncate text-left text-sm font-medium">
        {{ normalizedColor }}
      </span>

      <!-- Chevron Icon -->
      <Icon
        name="chevron-down"
        size="16"
        class="text-core-400 flex-shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      />
    </button>

    <!-- Error Message -->
    <div
      v-if="error"
      :id="`${inputId}-error`"
      role="alert"
      class="mt-1 flex items-center gap-1 text-sm text-red-600"
    >
      <Icon name="info-circle" size="16" class="flex-shrink-0" aria-hidden="true" />
      <span>{{ error }}</span>
    </div>

    <!-- Hint Text -->
    <div v-if="hint && !error" class="mt-1 text-sm text-gray-500">
      {{ hint }}
    </div>

    <!-- Color Picker Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click="handleBackdropClick"
          @keydown.esc="handleClose"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="isOpen"
              ref="modalRef"
              role="dialog"
              aria-modal="true"
              :aria-label="`${label || 'Color'} picker`"
              class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
              @click.stop
            >
              <!-- Modal Header -->
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ label || "Choose Color" }}
                </h3>
                <button
                  type="button"
                  class="text-core-400 hover:text-core-600 rounded-lg p-1 transition-colors hover:bg-gray-100"
                  aria-label="Close color picker"
                  @click="handleClose"
                >
                  <Icon name="close" size="20" />
                </button>
              </div>

              <!-- Color Picker -->
              <div class="mb-4">
                <Sketch :model-value="normalizedColor" @update:model-value="handleColorChange" />
              </div>

              <!-- Current Color Display -->
              <div class="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <div
                  class="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-300 shadow-sm"
                  :style="{ backgroundColor: normalizedColor }"
                  aria-hidden="true"
                />
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Current Color</p>
                  <p class="font-mono text-sm font-medium text-gray-900">{{ normalizedColor }}</p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  @click="handleClose"
                >
                  Done
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue"
import Icon from "@components/Icon.vue"
import { Sketch } from "@ckpack/vue-color"
import { safeParseColor, normalizeHexColor } from "@/utils/color-validation"

/**
 * Production-ready color picker component with modal interface
 *
 * Features:
 * - Modal-based UI (better UX than dropdown)
 * - Full keyboard navigation (Enter/Space to open, Esc to close)
 * - ARIA attributes for screen readers
 * - Color validation and normalization
 * - Disabled and readonly states
 * - Error handling with accessible error messages
 * - Mobile-responsive modal
 * - Backdrop click to close
 * - TypeScript type safety
 */

interface Props {
  /** Current color value in hex format (e.g., "#FF5733") */
  modelValue?: string
  /** Label text for the field */
  label?: string
  /** HTML name attribute */
  name?: string
  /** HTML id attribute */
  id?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is readonly */
  readonly?: boolean
  /** Error message to display */
  error?: string
  /** Hide the label visually (still accessible to screen readers) */
  hideLabel?: boolean
  /** Hint text to display below the field */
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "#000000",
  disabled: false,
  readonly: false,
  required: false,
  hideLabel: false,
})

interface Emits {
  "update:modelValue": [value: string]
  open: []
  close: []
}

const emit = defineEmits<Emits>()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

// Computed Properties
const inputId = computed(
  () => props.id || props.name || `color-picker-${Math.random().toString(36).substring(2, 11)}`,
)

const normalizedColor = computed(() => safeParseColor(props.modelValue))

const ariaLabel = computed(() => {
  const base = props.label || "Color picker"
  const state = props.disabled ? "disabled" : props.readonly ? "readonly" : ""
  return `${base}${state ? ` (${state})` : ""}, current color: ${normalizedColor.value}`
})

const triggerClasses = computed(() => {
  const base =
    "bg-core-25 flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all"

  const stateClasses = {
    error: "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200",
    default: "border-core-50 focus:border-primary-300 focus:ring-2 focus:ring-primary-100",
    disabled: "cursor-not-allowed opacity-50",
    active: "cursor-pointer hover:border-gray-300",
  }

  if (props.disabled || props.readonly) {
    return [base, stateClasses.disabled].join(" ")
  }

  if (props.error) {
    return [base, stateClasses.error, stateClasses.active].join(" ")
  }

  return [base, stateClasses.default, stateClasses.active].join(" ")
})

// Modal state management
const handleTriggerClick = () => {
  if (props.disabled || props.readonly) return
  openPicker()
}

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.readonly) return

  // Open on Enter or Space
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    if (!isOpen.value) {
      openPicker()
    }
  }
}

const openPicker = async () => {
  isOpen.value = true
  emit("open")

  // Prevent body scroll when modal is open
  document.body.style.overflow = "hidden"

  // Focus management: Wait for modal to render, then focus first interactive element
  await nextTick()
  const firstInput = modalRef.value?.querySelector<HTMLInputElement>("input")
  firstInput?.focus()
}

const closePicker = () => {
  isOpen.value = false
  emit("close")

  // Restore body scroll
  document.body.style.overflow = ""

  // Return focus to trigger button for accessibility
  nextTick(() => {
    triggerRef.value?.focus()
  })
}

const handleClose = () => {
  closePicker()
}

const handleBackdropClick = (event: MouseEvent) => {
  // Only close if clicking the backdrop, not the modal content
  if (event.target === event.currentTarget) {
    closePicker()
  }
}

// Color change handler with validation
interface SketchColorPayload {
  hex?: string
  hex8?: string
  rgba?: {
    r: string | number
    g: string | number
    b: string | number
    a: string | number
  }
  hsl?: {
    h: string | number
    s: string | number
    l: string | number
    a?: string | number
  }
}

const handleColorChange = (color: SketchColorPayload) => {
  if (!color?.hex) return

  const normalizedHex = normalizeHexColor(color.hex)
  emit("update:modelValue", normalizedHex)
}

// Watch for external changes to close the picker if disabled
watch(
  () => props.disabled,
  (newDisabled) => {
    if (newDisabled && isOpen.value) {
      closePicker()
    }
  },
)

// Cleanup on unmount
watch(isOpen, (newIsOpen) => {
  if (!newIsOpen) {
    document.body.style.overflow = ""
  }
})
</script>
