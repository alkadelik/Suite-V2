<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-core-800 font-sato text-base font-semibold">Popups</h3>
      <SeeAllToggle v-if="hasToggle" :expanded="expanded" @toggle="toggle" />
    </div>
    <div class="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div
        v-for="popup in visible"
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
import SeeAllToggle from "./SeeAllToggle.vue"
import { useSeeAll } from "./useSeeAll"
import type { IPopupStatus } from "./types"

const props = defineProps<{ popups: IPopupStatus[] }>()
const { visible, hasToggle, expanded, toggle } = useSeeAll(() => props.popups)
</script>
