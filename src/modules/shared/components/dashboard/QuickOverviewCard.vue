<template>
  <div class="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-2.5">
    <!-- Label + icon live on the white card, above the grey box -->
    <div class="mb-2 flex items-center gap-2 px-1.5 pt-1">
      <Icon name="bulb" size="18" class="text-warning-400" />
      <span class="text-core-600 text-sm font-medium">Quick Overview</span>
    </div>

    <!-- Grey box: the summary sentence only -->
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 md:px-5 md:py-4">
      <div v-if="loading" class="space-y-2">
        <div class="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div class="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>

      <p v-else class="text-core-700 text-sm leading-relaxed md:text-base">
        <template v-for="(seg, i) in lineSegments" :key="`p-${i}`">
          <strong v-if="seg.bold" class="text-core-900 font-semibold">{{ seg.text }}</strong>
          <template v-else>{{ seg.text }}</template>
        </template>
        <template v-if="secondary">
          {{ " " }}
          <template v-for="(seg, i) in secondarySegments" :key="`s-${i}`">
            <strong v-if="seg.bold" class="text-core-900 font-semibold">{{ seg.text }}</strong>
            <template v-else>{{ seg.text }}</template>
          </template>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"

const props = withDefaults(
  defineProps<{ line?: string; secondary?: string | null; loading?: boolean }>(),
  { line: "", secondary: null, loading: false },
)

interface Segment {
  text: string
  bold: boolean
}

/**
 * Split a sentence so ₦-amounts render bold (presentational emphasis only — the
 * client performs no currency arithmetic here, per DASH-20).
 */
function toSegments(text: string): Segment[] {
  if (!text) return []
  const parts = text.split(/(₦[\d,]+)/g).filter((p) => p.length > 0)
  return parts.map((p) => ({ text: p, bold: /^₦[\d,]+$/.test(p) }))
}

const lineSegments = computed(() => toSegments(props.line))
const secondarySegments = computed(() => toSegments(props.secondary ?? ""))
</script>
