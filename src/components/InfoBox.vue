<template>
  <div :class="infoBoxClasses">
    <div :class="infoIconContainerClasses">
      <div :class="infoIconInnerClasses">
        <Icon name="info-circle-filled" size="20" :class="infoIconClasses" />
      </div>
    </div>
    <p class="text-xs font-semibold md:text-sm">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"

export interface InfoBoxProps {
  /**
   * The message to display in the info box
   */
  message: string

  /**
   * The info box variant affecting colors and styling
   * - warning: Yellow/orange color scheme for warnings (default)
   * - error: Red color scheme for destructive actions
   * - success: Green color scheme for positive actions
   * - info: Blue color scheme for informational messages
   * @default "warning"
   */
  variant?: "warning" | "error" | "success" | "info"
}

const props = withDefaults(defineProps<InfoBoxProps>(), {
  variant: "warning",
})

// Info box classes
const infoBoxClasses = computed(() => {
  const variantClasses = {
    warning: "border-warning-300 bg-warning-25 text-warning-700",
    error: "border-error-300 bg-error-25 text-error-700",
    success: "border-success-300 bg-success-25 text-success-700",
    info: "border-blue-300 bg-blue-25 text-blue-700",
  }

  return ["flex items-center gap-3 rounded-lg border p-3", variantClasses[props.variant]]
})

const infoIconContainerClasses = computed(() => {
  const variantClasses = {
    warning: "border-warning-100",
    error: "border-error-100",
    success: "border-success-100",
    info: "border-blue-100",
  }

  return ["rounded-full border-2 p-0.5", variantClasses[props.variant]]
})

const infoIconInnerClasses = computed(() => {
  const variantClasses = {
    warning: "border-warning-300",
    error: "border-error-300",
    success: "border-success-300",
    info: "border-blue-300",
  }

  return ["rounded-full border-2 p-0.5", variantClasses[props.variant]]
})

const infoIconClasses = computed(() => {
  const variantClasses = {
    warning: "text-warning-600",
    error: "text-error-600",
    success: "text-success-600",
    info: "text-blue-600",
  }

  return variantClasses[props.variant]
})
</script>
