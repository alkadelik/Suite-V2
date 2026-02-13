<template>
  <button
    :class="[
      buttonClasses,
      { '!cursor-not-allowed': disabled || loading || inactive },
      { '!opacity-50': inactive },
    ]"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <Icon
      v-if="(icon || loading) && iconPlacement === 'left'"
      :name="loading ? 'loader' : icon || ''"
      :size="iconSize || iconSizes[props.size] || 20"
      :class="['flex-shrink-0', loading ? 'animate-spin' : '']"
    />
    <slot>
      <span v-if="loadingText || label" class="truncate">
        {{ loading && loadingText ? loadingText : label }}
      </span>
    </slot>
    <Icon
      v-if="(icon || loading) && iconPlacement === 'right'"
      :name="loading ? 'loader' : icon || ''"
      :size="iconSize || iconSizes[props.size] || 20"
      :class="['flex-shrink-0', loading ? 'animate-spin' : '']"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, HTMLAttributes } from "vue"
import Icon from "./Icon.vue"

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
   * The size of the icon (overrides default sizing based on button size)
   * @example 16
   */
  iconSize?: number | string

  /**
   * The placement of the icon relative to the text
   * - left: Icon appears before the text (default)
   * - right: Icon appears after the text
   * @default "left"
   */
  iconPlacement?: "left" | "right"

  /**
   * The HTML button type
   * @default "button"
   */
  type?: "button" | "submit" | "reset"

  /**
   * The button size
   * - xs: 32px height
   * - sm: 40px height
   * - md: 44px height (default)
   * - lg: 48px height
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg"

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
   * Whether the button is inactive (visually faded but still clickable)
   * @default false
   */
  inactive?: boolean

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
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<AppButtonProps>(), {
  type: "button",
  size: "md",
  variant: "filled",
  color: "primary",
  iconPlacement: "left",
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
    ...(props.variant !== "text" ? ["focus:ring-2", "focus:ring-offset-1"] : []),
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "min-w-0",
    "max-w-full",
  ]

  // Size classes
  const sizeClasses = {
    xs:
      props.icon && !props.label
        ? "w-8 h-8"
        : props.variant === "text"
          ? "h-8 px-1 gap-1.5 text-xs"
          : "h-8 px-3 gap-1.5 text-xs",
    sm:
      props.icon && !props.label
        ? "w-10 h-10"
        : props.variant === "text"
          ? "h-10 px-2 gap-2 text-sm"
          : "h-10 px-4 gap-2 text-sm",
    md:
      props.icon && !props.label
        ? "w-11 h-11"
        : props.variant === "text"
          ? "h-11 px-2.5 gap-2.5 text-sm"
          : "h-11 px-5 gap-2.5 text-sm",
    lg:
      props.icon && !props.label
        ? "w-12 h-12"
        : props.variant === "text"
          ? "h-12 px-3 gap-3 text-base"
          : "h-12 px-6 gap-3 text-base",
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
        "border border-primary-600 text-primary-600 bg-primary-50 hover:bg-primary-100 focus:ring-primary-500/50",
      error: "border border-red-600 text-red-600 bg-red-50 hover:bg-red-100 focus:ring-red-500/50",
      success:
        "border border-green-600 text-green-600 bg-green-50 hover:bg-green-100 focus:ring-green-500/50",
      alt: "border border-core-300 text-core-600 bg-core-50 hover:bg-core-100 focus:ring-core-500/50",
    },
    text: {
      primary: "text-primary-600 hover:text-primary-700 hover:underline",
      error: "text-red-600 hover:text-red-700 hover:underline",
      success: "text-green-600 hover:text-green-700 hover:underline",
      alt: "text-core-600 hover:text-core-700 hover:underline",
    },
  }

  return [
    ...baseClasses,
    sizeClasses[props.size],
    variantColorClasses[props.variant][props.color],
    props.class,
  ]
})

const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
}
</script>
