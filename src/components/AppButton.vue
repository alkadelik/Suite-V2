<template>
  <button :class="buttonClasses" :disabled="disabled || loading" :type="type" @click="handleClick">
    <template v-if="loading">
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span v-if="loadingText">{{ loadingText }}</span>
      <span v-else-if="label">{{ label }}</span>
    </template>
    <template v-else>
      <Icon v-if="icon" :name="icon" :class="iconClasses.join(' ')" />
      <slot>
        <span v-if="label">{{ label }}</span>
      </slot>
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "./common/icon.vue"

export interface AppButtonProps {
  /**
   * The text label to display in the button
   * @example "Submit Form"
   */
  label?: string

  /**
   * The icon name to display (based on Icon component)
   * @example "arrow-right"
   */
  icon?: string

  /**
   * The HTML button type
   * @default "button"
   */
  type?: "button" | "submit" | "reset"

  /**
   * The button size
   * - sm: 40px height
   * - md: 44px height (default)
   * - lg: 48px height
   * @default "md"
   */
  size?: "sm" | "md" | "lg"

  /**
   * The button visual variant
   * - filled: Solid background with contrasting text
   * - outlined: Transparent background with border
   * - text: Plain text button with no background
   * @default "filled"
   */
  variant?: "filled" | "outlined" | "text"

  /**
   * The button color scheme
   * - primary: Uses primary theme colors
   * - error: Red color scheme for destructive actions
   * - success: Green color scheme for positive actions
   * - alt: White background with gray-600 text
   * @default "primary"
   */
  color?: "primary" | "error" | "success" | "alt"

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the button is in loading state
   * @default false
   */
  loading?: boolean

  /**
   * Text to show when loading (if not provided, uses label)
   * @example "Saving..."
   */
  loadingText?: string

  /**
   * Additional CSS classes to apply to the button
   */
  class?: string | string[] | Record<string, boolean>
}

const props = withDefaults(defineProps<AppButtonProps>(), {
  type: "button",
  size: "md",
  variant: "filled",
  color: "primary",
  disabled: false,
  loading: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit("click", event)
  }
}

const buttonClasses = computed(() => {
  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-xl",
    "font-medium",
    "cursor-pointer",
    "transition-all",
    "duration-200",
    "ease-in-out",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-1",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
  ]

  // Size classes
  const sizeClasses = {
    sm: props.icon && !props.label ? "w-10 h-10" : "h-10 px-4 gap-2 text-sm",
    md: props.icon && !props.label ? "w-11 h-11" : "h-11 px-5 gap-2.5 text-sm",
    lg: props.icon && !props.label ? "w-12 h-12" : "h-12 px-6 gap-3 text-base",
  }

  // Color and variant combinations
  const variantColorClasses = {
    filled: {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50",
      error: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50",
      alt: "bg-white text-core-600 border border-core-200 hover:bg-core-25 focus:ring-core-500/50",
    },
    outlined: {
      primary:
        "border border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500/50",
      error:
        "border border-red-600 text-red-600 bg-transparent hover:bg-red-50 focus:ring-red-500/50",
      success:
        "border border-green-600 text-green-600 bg-transparent hover:bg-green-50 focus:ring-green-500/50",
      alt: "border border-core-300 text-core-600 bg-transparent hover:bg-core-50 focus:ring-core-500/50",
    },
    text: {
      primary: "text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500/50",
      error: "text-red-600 bg-transparent hover:bg-red-50 focus:ring-red-500/50",
      success: "text-green-600 bg-transparent hover:bg-green-50 focus:ring-green-500/50",
      alt: "text-core-600 bg-transparent hover:bg-core-50 focus:ring-core-500/50",
    },
  }

  return [
    ...baseClasses,
    sizeClasses[props.size],
    variantColorClasses[props.variant][props.color],
    props.class,
  ]
})

const iconClasses = computed(() => {
  const baseClasses = ["flex-shrink-0"]

  // Icon size based on button size
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-5 h-5",
  }

  return [...baseClasses, sizeClasses[props.size]]
})
</script>
