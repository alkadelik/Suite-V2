<template>
  <div
    class="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-3 md:px-4"
  >
    <div class="min-w-0 flex-1">
      <p class="truncate">
        <span class="text-core-900 font-medium">{{ row.title }}</span>
        <span class="text-sm text-gray-400"> ({{ row.reference }})</span>
      </p>

      <!-- mobile meta line -->
      <div class="mt-1.5 flex items-center gap-2 md:hidden">
        <span v-if="row.amountLabel" class="text-core-900 text-sm font-semibold">
          {{ row.amountLabel }}
        </span>
        <span v-if="row.amountLabel" class="text-gray-300">·</span>
        <UrgencyBars :level="row.urgency" />
        <span class="text-core-600 text-sm">{{ row.ageLabel }}</span>
      </div>
    </div>

    <!-- desktop: urgency + age -->
    <div class="hidden items-center gap-2 md:flex">
      <UrgencyBars :level="row.urgency" />
      <span class="text-core-700 text-sm whitespace-nowrap">{{ row.ageLabel }}</span>
    </div>

    <!-- desktop: optional destination column (variable) -->
    <div v-if="row.destination" class="text-core-600 hidden w-32 truncate text-sm md:block">
      {{ row.destination }}
    </div>

    <!-- desktop: amount -->
    <div class="hidden w-28 text-right md:block">
      <span v-if="row.amountLabel" class="text-core-900 font-semibold">{{ row.amountLabel }}</span>
    </div>

    <AppButton
      :label="row.actionLabel"
      variant="outlined"
      size="sm"
      :loading="loading"
      class="shrink-0"
      @click="$emit('action', row)"
    />
  </div>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import UrgencyBars from "./UrgencyBars.vue"
import type { ITaskRow } from "./types"

defineProps<{ row: ITaskRow; loading?: boolean }>()
defineEmits<{ (e: "action", row: ITaskRow): void }>()
</script>
