<template>
  <div class="text-center">
    <template v-if="loading">
      <div class="mx-auto h-4 w-40 animate-pulse rounded bg-gray-100" />
      <div class="mx-auto mt-3 h-7 w-64 animate-pulse rounded bg-gray-100" />
    </template>
    <template v-else>
      <p class="text-core-600 text-sm md:text-base">{{ greeting }}, {{ firstName }}</p>
      <h1 class="text-core-900 font-sato mt-1 text-xl font-bold md:text-2xl">
        {{ count }} {{ pluralize("thing", count) }} need{{ count === 1 ? "s" : "" }} you today.
      </h1>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { pluralize } from "@/utils/pluralize"

withDefaults(defineProps<{ firstName?: string; count?: number; loading?: boolean }>(), {
  firstName: "",
  count: 0,
  loading: false,
})

/** Time-of-day greeting — presentational only. */
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
})
</script>
