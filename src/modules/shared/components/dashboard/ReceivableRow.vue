<template>
  <div class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3">
    <span class="text-core-900 min-w-0 flex-1 truncate font-medium">{{ item.name }}</span>
    <span
      class="shrink-0 text-sm whitespace-nowrap"
      :class="item.aged ? 'text-warning-600' : 'text-gray-500'"
    >
      {{ item.ageLabel }}
    </span>
    <span class="text-core-900 shrink-0 pl-1 font-semibold whitespace-nowrap">
      {{ item.amountLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { IReceivable } from "./types"

defineProps<{ item: IReceivable }>()
</script>
