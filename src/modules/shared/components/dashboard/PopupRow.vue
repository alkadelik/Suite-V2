<template>
  <div
    class="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
  >
    <span class="flex min-w-0 items-center gap-2">
      <span
        class="size-2 shrink-0 rounded-full"
        :class="popup.active ? 'bg-success-500' : 'bg-gray-300'"
      />
      <span class="text-core-800 truncate text-sm font-medium">{{ popup.name }}</span>
    </span>
    <span class="text-sm whitespace-nowrap text-gray-500">{{ popup.statusLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import type { IPopupStatus } from "./types"

defineProps<{ popup: IPopupStatus }>()
</script>
