<template>
  <span class="inline-flex items-end gap-[3px]" role="img" :aria-label="`Urgency: ${level}`">
    <span
      v-for="bar in bars"
      :key="bar.index"
      class="w-[5px] rounded-full"
      :class="bar.filled ? toneClass : 'bg-gray-200'"
      :style="{ height: `${bar.height}px` }"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { UrgencyLevel } from "./types"

const props = withDefaults(defineProps<{ level: UrgencyLevel; segments?: number }>(), {
  segments: 3,
})

/**
 * Fill + colour per the Figma frame:
 *   high   → all bars filled, error/red
 *   medium → all but the tallest filled, warning/amber
 *   low    → all but the tallest filled, success/green
 * Colour encodes the level; fill count encodes high vs. the rest.
 */
const FILLED: Record<UrgencyLevel, number> = { low: 2, medium: 2, high: 3 }
const TONE: Record<UrgencyLevel, string> = {
  low: "bg-success-500",
  medium: "bg-warning-500",
  high: "bg-error-500",
}

const toneClass = computed(() => TONE[props.level])
const filledCount = computed(() =>
  props.segments >= 3 ? FILLED[props.level] : Math.min(FILLED[props.level], props.segments),
)

/** Ascending heights (shortest → tallest), evenly stepped for any segment count. */
const bars = computed(() =>
  Array.from({ length: props.segments }, (_, i) => ({
    index: i + 1,
    height: 8 + i * 4,
    filled: i + 1 <= filledCount.value,
  })),
)
</script>
