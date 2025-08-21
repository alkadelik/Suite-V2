<template>
  <!-- Render the SVG component and FORCE sizing via CSS (overrides width/height attrs) -->
  <component :is="IconComponent" v-bind="$attrs" :style="svgStyle" />
</template>

<script setup lang="ts">
import { computed } from "vue"

interface Props {
  /** Icon filename, e.g. "check" → check.svg */
  name: string
  /** Size of the icon, can be a string (e.g. '24px') or number (e.g. 24) */
  size?: string | number
}

const props = defineProps<Props>()

const size = computed(() => (props.size == null ? "1.25em" : props.size))

const svgStyle = computed(() => ({
  width: size.value,
  height: size.value,
  // display: "inline-block",
  // overflow: "visible",
}))

// Dynamically import all SVG icons from the assets folder
// This allows us to use the icon name directly as a prop
// e.g. <Icon name="check" /> will load check.svg
const icons = import.meta.glob("../../assets/icons/*.svg", { eager: true })
const IconComponent = computed(() => {
  const key = `../../assets/icons/${props.name}.svg`
  return (icons as any)[key]?.default ?? null
})
</script>
