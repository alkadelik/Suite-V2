<template>
  <div :class="['flex items-center justify-between', props.class]">
    <div>
      <h3 :class="[titleClasses, 'mb-1 font-semibold']">{{ title }}</h3>
      <p v-if="subtitle || $slots.subtitle" :class="[subtitleClasses, 'text-core-600']">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
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
  size: "lg",
})

const titleClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "text-lg"
    case "lg":
      return "text-lg md:text-2xl"
    case "md":
    default:
      return "text-2xl"
  }
})

const subtitleClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "text-xs"
    case "lg":
      return "text-xs md:text-base"
    case "md":
    default:
      return "text-sm"
  }
})
</script>
