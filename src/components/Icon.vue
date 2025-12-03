<template>
  <component
    :is="IconComponent"
    :class="mergedClass"
    :width="shouldUseAttrSize ? normalizedSize : undefined"
    :height="shouldUseAttrSize ? normalizedSize : undefined"
    :style="svgStyle"
    @click="emit('click', $event)"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue"

interface Props {
  /** Icon filename, e.g. "check" → check.svg */
  name: string
  /** Size of the icon, can be a string (e.g. '24px' or '1.2em') or number (e.g. 24) */
  size?: string | number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void
}>()

// access raw attrs so we can filter out class/style when rebinding
const attrs = useAttrs()

// merge classes: internal app-icon and any class passed via attributes
const mergedClass = computed(() => {
  const incoming = (attrs as Record<string, unknown>)["class"] as string | string[] | undefined
  return ["app-icon", incoming].flat().filter(Boolean)
})

// string form of mergedClass — useful for simple pattern checks
const mergedClassString = computed(() => {
  const cls = mergedClass.value
  return Array.isArray(cls) ? cls.join(" ") : String(cls || "")
})

// If Tailwind width/height classes are present (w- or h-), prefer CSS classes
// to control size and do NOT set explicit width/height attributes which
// would otherwise override Tailwind utilities. NOTE: `text-...` classes are
// commonly used for color and should NOT disable attribute sizing — they are
// allowed to coexist with normalized size (so you can do `:size="24"` +
// `class="text-primary-600"`).
const shouldUseAttrSize = computed(() => {
  const s = mergedClassString.value
  // detect any class that starts with `w-` or `h-` (Tailwind width/height)
  return !/(\bw-|\bh-)/.test(s)
})

// Normalize size so numeric values become px strings and strings are passed through
const normalizedSize = computed(() => {
  if (props.size == null) return "1.25em"
  return typeof props.size === "number" ? `${props.size}px` : props.size
})

const svgStyle = computed(() => {
  const base: Record<string, string> = { display: "inline-block" }
  if (shouldUseAttrSize.value) {
    base.width = normalizedSize.value
    base.height = normalizedSize.value
  }
  return base
})

// Dynamically import all SVG icons from the assets folder
// This allows us to use the icon name directly as a prop
// e.g. <Icon name="check" /> will load check.svg
const icons = import.meta.glob("../assets/icons/*.svg", { eager: true })
const IconComponent = computed(() => {
  const key = `../assets/icons/${props.name}.svg`
  return (icons[key] as { default: unknown })?.default ?? null
})
</script>
