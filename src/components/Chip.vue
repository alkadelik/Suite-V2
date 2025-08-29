<template>
  <div :class="chipClasses">
    <slot name="prepend">
      <div v-if="showDot" :class="dotClasses" />
      <Icon v-else-if="icon" :name="icon" :class="iconClasses" />
    </slot>

    <span v-if="label || $slots.default" :class="labelClasses">
      <slot>{{ label }}</slot>
    </span>

    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "./Icon.vue"

export interface ChipProps {
  /**
   * The text label to display in the chip
   * @example "Active"
   */
  label?: string

  /**
   * The icon name to display (based on Icon component)
   * @example "check-circle"
   */
  icon?: string

  /**
   * The chip size
   * - sm: 24px height
   * - md: 32px height (default)
   * @default "md"
   */
  size?: "sm" | "md"

  /**
   * The chip visual variant
   * - filled: Solid background with contrasting text
   * - outlined: Light background with border
   * @default "filled"
   */
  variant?: "filled" | "outlined"

  /**
   * The chip color scheme
   * - primary: Uses primary theme colors
   * - success: Green color scheme for positive states
   * - warning: Yellow/orange color scheme for warnings
   * - error: Red color scheme for errors
   * - alt: Gray color scheme for neutral states
   * @default "primary"
   */
  color?: "primary" | "success" | "warning" | "error" | "alt" | "blue"

  /**
   * Whether to show a colored dot instead of an icon
   * @default false
   */
  showDot?: boolean

  /**
   * Additional CSS classes to apply to the chip
   */
  class?: string | string[] | Record<string, boolean>
}

const props = withDefaults(defineProps<ChipProps>(), {
  size: "sm",
  variant: "outlined",
  color: "primary",
  showDot: false,
})

const chipClasses = computed(() => {
  const baseClasses = [
    "inline-flex",
    "items-center",
    "rounded-full",
    "font-medium",
    "transition-all",
    "duration-200",
    "ease-in-out",
  ]

  // Size classes
  const sizeClasses = {
    sm: "h-6 px-2.5 gap-1.5 text-xs",
    md: "h-8 px-3 gap-2 text-sm",
  }

  // Color and variant combinations
  const variantColorClasses = {
    filled: {
      primary: "bg-primary-600 text-white",
      success: "bg-green-600 text-white",
      warning: "bg-yellow-600 text-white",
      error: "bg-red-600 text-white",
      alt: "bg-gray-600 text-white",
      blue: "bg-blue-600 text-white",
    },
    outlined: {
      primary: "bg-primary-50 text-primary-700 border border-primary-200",
      success: "bg-green-50 text-green-700 border border-green-200",
      warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      error: "bg-red-50 text-red-700 border border-red-200",
      alt: "bg-gray-50 text-gray-700 border border-gray-200",
      blue: "bg-blue-50 text-blue-700 border border-blue-200",
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

  // Icon size based on chip size
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  }

  return [...baseClasses, sizeClasses[props.size]]
})

const dotClasses = computed(() => {
  const baseClasses = ["rounded-full", "flex-shrink-0"]

  // Dot size based on chip size
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  }

  // Dot colors based on chip color
  const colorClasses = {
    primary: "bg-primary-400",
    success: "bg-green-400",
    warning: "bg-yellow-400",
    error: "bg-red-400",
    alt: "bg-gray-400",
    blue: "bg-blue-500",
  }

  // Adjust dot color for outlined variant (make it darker)
  const variantColorClasses = {
    filled: colorClasses,
    outlined: {
      primary: "bg-primary-600",
      success: "bg-green-600",
      warning: "bg-yellow-600",
      error: "bg-red-600",
      alt: "bg-gray-600",
      blue: "bg-blue-600",
    },
  }

  return [...baseClasses, sizeClasses[props.size], variantColorClasses[props.variant][props.color]]
})

const labelClasses = computed(() => {
  return ["truncate", "flex-shrink-0"]
})
</script>
