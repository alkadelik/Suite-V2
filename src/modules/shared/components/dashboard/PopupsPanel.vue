<template>
  <section>
    <h3 class="text-core-800 font-sato mb-3 text-base font-semibold">Popups</h3>
    <div class="space-y-3">
      <div
        v-for="popup in popups"
        :key="popup.id"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import type { IPopupStatus } from "./types"

defineProps<{ popups: IPopupStatus[] }>()
</script>
