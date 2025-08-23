<template>
  <div :class="['flex items-center justify-between', props.class]">
    <div>
      <h3 :class="[titleClasses, 'mb-1 font-semibold']">{{ title }}</h3>
      <p v-if="subtitle" :class="subtitleClasses">{{ subtitle }}</p>
    </div>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

/**
 * Props interface for the SectionHeader component
 */
interface Props {
  /** The main title/heading text */
  title: string
  /** The subtitle/description text */
  subtitle?: string
  /** Additional CSS classes to apply to the root div */
  class?: string
  /** The size variant of the section header */
  size?: "sm" | "md" | "lg"
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
})

const titleClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "text-base"
    case "lg":
      return "text-3xl"
    case "md":
    default:
      return "text-lg"
  }
})

const subtitleClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "text-xs"
    case "lg":
      return "text-base"
    case "md":
    default:
      return "text-sm"
  }
})
</script>
