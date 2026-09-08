<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4">
    <template v-if="loading">
      <div class="h-6 w-20 animate-pulse rounded bg-gray-100" />
      <div class="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
      <div class="mt-4 h-3 w-28 animate-pulse rounded bg-gray-100" />
    </template>

    <template v-else-if="vital">
      <p class="text-core-900 font-sato text-2xl font-bold">
        {{ valueHead
        }}<span v-if="valueTail" class="text-core-500 ml-1 font-medium">{{ valueTail }}</span>
      </p>
      <p class="text-core-600 mt-1 text-sm">{{ vital.label }}</p>

      <div v-if="vital.detail" class="mt-3 flex items-center gap-1.5">
        <!-- positive trend glyph: filled rounded caret-up -->
        <svg
          v-if="vital.trendUp"
          class="text-success-500 size-3.5 shrink-0"
          viewBox="0 0 14 14"
          fill="currentColor"
        >
          <path
            d="M5.87 3.28 2.3 8.4c-.5.71.01 1.7.88 1.7h7.64c.87 0 1.38-.99.88-1.7L8.13 3.28a1.3 1.3 0 0 0-2.26 0Z"
          />
        </svg>
        <!-- status dot -->
        <span v-else class="size-2 shrink-0 rounded-full" :class="dotClass" />
        <span class="text-xs font-medium" :class="detailClass">{{ vital.detail }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { IHealthVital } from "./types"

const props = defineProps<{ vital?: IHealthVital; loading?: boolean }>()

/** "5 Items" → head "5", tail "Items"; "₦86,400" → head only. */
const valueHead = computed(() => {
  const v = props.vital?.value ?? ""
  const idx = v.indexOf(" ")
  return idx === -1 ? v : v.slice(0, idx)
})
const valueTail = computed(() => {
  const v = props.vital?.value ?? ""
  const idx = v.indexOf(" ")
  return idx === -1 ? "" : v.slice(idx + 1)
})

const dotClass = computed(() => {
  switch (props.vital?.status) {
    case "critical":
      return "bg-error-500"
    case "warning":
      return "bg-warning-500"
    case "positive":
      return "bg-success-500"
    default:
      return "bg-gray-400"
  }
})

const detailClass = computed(() => {
  switch (props.vital?.status) {
    case "critical":
      return "text-error-600"
    case "warning":
      return "text-warning-700"
    case "positive":
      return "text-success-600"
    default:
      return "text-gray-500"
  }
})
</script>
