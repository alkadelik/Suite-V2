<script setup lang="ts">
defineProps<{
  title: string
  value: string
  badge?: string
  pill?: string
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4">
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-medium text-gray-500">{{ title }}</p>

      <span
        v-if="badge"
        class="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700"
      >
        {{ badge }}
      </span>

      <span
        v-else-if="pill"
        class="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700"
      >
        {{ pill }}
      </span>
    </div>

    <p class="mt-2 text-lg font-semibold text-gray-900">
      {{ value }}
    </p>
  </div>
</template>
