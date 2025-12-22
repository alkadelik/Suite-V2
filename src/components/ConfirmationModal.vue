<template>
  <MessageModal :open="modelValue" max-width="lg" @close="emit('update:modelValue', false)">
    <div :class="headerIconContainerClasses">
      <div :class="headerIconInnerClasses">
        <Icon :name="displayHeaderIcon" size="16" :class="headerIconClasses" />
      </div>
    </div>

    <!-- Dynamic header -->
    <h6 class="text sm mt-2 font-bold">{{ header }}</h6>
    <!-- Dynamic paragraph -->
    <slot name="paragraph">
      <p class="mt-2 text-xs md:text-sm">{{ paragraph }}</p>
    </slot>

    <div :class="infoBoxClasses">
      <div :class="infoIconContainerClasses">
        <div :class="infoIconInnerClasses">
          <Icon name="info-circle-filled" size="20" :class="infoIconClasses" />
        </div>
      </div>
      <p class="text-xs font-semibold md:text-sm">{{ displayInfoMessage }}</p>
    </div>

    <div class="mt-5 flex gap-2">
      <AppButton
        label="Cancel"
        variant="outlined"
        @click="emit('update:modelValue', false)"
        class="flex-1 !border-gray-200 bg-white !text-gray-700 hover:!bg-gray-100"
      />
      <AppButton
        :label="displayActionLabel"
        variant="filled"
        :class="actionButtonClasses"
        :loading="loading"
        @click="emit('confirm')"
      />
    </div>
  </MessageModal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import MessageModal from "@/components/MessageModal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"

export interface ConfirmationModalProps {
  modelValue: boolean
  header: string
  paragraph: string
  loading: boolean

  /**
   * The modal variant affecting colors and styling
   * - warning: Yellow/orange color scheme for warnings (default)
   * - error: Red color scheme for destructive actions
   * - success: Green color scheme for positive actions
   * - neutral: Grey color scheme for neutral actions
   * @default "warning"
   */
  variant?: "warning" | "error" | "success" | "neutral"

  /**
   * Custom header icon name (overrides default variant icons)
   * @example "custom-icon"
   */
  headerIcon?: string

  /**
   * Custom info message (overrides default variant messages)
   */
  infoMessage?: string

  /**
   * Custom action button label (overrides default variant labels)
   */
  actionLabel?: string

  /**
   * Custom variant for the info box only (overrides main variant for info box styling)
   */
  infoBoxVariant?: "warning" | "error" | "success" | "neutral"
}

const props = withDefaults(defineProps<ConfirmationModalProps>(), {
  variant: "warning",
})

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  confirm: []
}>()

// Default icons for each variant
const defaultIcons = {
  warning: "pause",
  error: "trash-01",
  success: "check-circle",
  neutral: "info-circle",
}

// Default info messages for each variant
const defaultInfoMessages = {
  warning: "You can reverse this action later.",
  error: "This action cannot be reversed.",
  success: "This action will be completed immediately.",
  neutral: "You can reverse this action later.",
}

// Default action labels for each variant
const defaultActionLabels = {
  warning: "Suspend",
  error: "Delete",
  success: "Confirm",
  neutral: "Confirm",
}

const displayHeaderIcon = computed(() => props.headerIcon || defaultIcons[props.variant])
const displayInfoMessage = computed(() => props.infoMessage || defaultInfoMessages[props.variant])
const displayActionLabel = computed(() => props.actionLabel || defaultActionLabels[props.variant])

// Header icon container classes
const headerIconContainerClasses = computed(() => {
  const variantClasses = {
    warning: "bg-warning-50",
    error: "bg-error-50",
    success: "bg-success-50",
    neutral: "bg-gray-50",
  }

  return ["absolute top-3 self-start rounded-full p-1.5", variantClasses[props.variant]]
})

const headerIconInnerClasses = computed(() => {
  const variantClasses = {
    warning: "bg-warning-100",
    error: "bg-error-100",
    success: "bg-success-100",
    neutral: "bg-gray-100",
  }

  return ["rounded-full h-9 w-9 flex items-center justify-center", variantClasses[props.variant]]
})

const headerIconClasses = computed(() => {
  const variantClasses = {
    warning: "text-warning-600",
    error: "text-error-600",
    success: "text-success-600",
    neutral: "text-gray-700",
  }

  return variantClasses[props.variant]
})

// Info box classes
const infoBoxClasses = computed(() => {
  const variantClasses = {
    warning: "border-warning-300 bg-warning-25 text-warning-700",
    error: "border-error-300 bg-error-25 text-error-700",
    success: "border-success-300 bg-success-25 text-success-700",
    neutral: "border-gray-300 bg-gray-50 text-gray-700",
  }

  const activeVariant = props.infoBoxVariant || props.variant
  return ["my-3 flex items-center gap-3 rounded-lg border p-3", variantClasses[activeVariant]]
})

const infoIconContainerClasses = computed(() => {
  const variantClasses = {
    warning: "border-warning-100",
    error: "border-error-100",
    success: "border-success-100",
    neutral: "border-gray-100",
  }

  const activeVariant = props.infoBoxVariant || props.variant
  return ["rounded-full border-2 p-0.5", variantClasses[activeVariant]]
})

const infoIconInnerClasses = computed(() => {
  const variantClasses = {
    warning: "border-warning-300",
    error: "border-error-300",
    success: "border-success-300",
    neutral: "border-gray-300",
  }

  const activeVariant = props.infoBoxVariant || props.variant
  return [
    "rounded-full border-2 h-6 w-6 flex items-center justify-center",
    variantClasses[activeVariant],
  ]
})

const infoIconClasses = computed(() => {
  const variantClasses = {
    warning: "text-warning-600",
    error: "text-error-600",
    success: "text-success-600",
    neutral: "text-gray-700",
  }

  const activeVariant = props.infoBoxVariant || props.variant
  return variantClasses[activeVariant]
})

// Action button classes
const actionButtonClasses = computed(() => {
  const variantClasses = {
    warning: "!bg-warning-600 hover:!bg-warning-500",
    error: "!bg-error-600 hover:!bg-error-500",
    success: "!bg-success-600 hover:!bg-success-500",
    neutral: "!bg-gray-700 hover:!bg-gray-600",
  }

  return ["flex-1", variantClasses[props.variant]]
})
</script>
