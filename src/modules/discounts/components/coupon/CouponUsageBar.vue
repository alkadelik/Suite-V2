<template>
  <div class="flex items-center gap-2">
    <div class="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
      <div class="bg-primary-600 h-full rounded-full" :style="{ width: pct + '%' }" />
    </div>
    <span class="text-xs whitespace-nowrap text-gray-600">{{ labelText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{ used: number; limit: number | null }>()

const pct = computed(() => (props.limit ? Math.min(100, (props.used / props.limit) * 100) : 0))
const labelText = computed(() => (props.limit ? `${props.used}/${props.limit}` : "Unlimited"))
</script>
