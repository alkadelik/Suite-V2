<template>
  <component
    :is="IconComponent"
    :width="size"
    :height="size"
    class="inline-block align-middle"
    :class="props.class"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue"

interface Props {
  /** Icon filename, e.g. "check" → check.svg */
  name: string
  /** Size of the icon, can be a string (e.g. '24px') or number (e.g. 24) */
  size?: string | number
  /** Additional CSS classes to apply to the icon */
  class?: string
}

const props = defineProps<Props>()

const size = computed(() =>
  typeof props.size === "number" ? `${props.size}px` : props.size || "1em",
)
// Dynamically import the SVG icon based on the name prop
// This assumes icons are stored in `src/assets/icons/` directory
// and are named as `name.svg`
// e.g. for name="check", it will import `src/assets/icons/check.svg`
const IconComponent = computed(() => {
  return defineAsyncComponent(() => import(`../../assets/icons/${props.name}.svg`))
})
</script>
