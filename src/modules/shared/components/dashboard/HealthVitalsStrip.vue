<template>
  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-core-800 font-sato text-base font-semibold">
        <span class="hidden md:inline">Today at a glance</span>
        <span class="md:hidden">Today's Metrics</span>
      </h2>
      <button class="text-core-600 flex items-center gap-1 text-sm md:hidden" type="button">
        View All
        <Icon name="chevron-down" size="16" />
      </button>
    </div>

    <!-- error: compact inline, does not blank the page -->
    <div v-if="error" class="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
      Couldn't load your metrics right now.
    </div>

    <!-- mobile: horizontal scroll; md+: grid -->
    <div
      v-else
      class="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 xl:grid-cols-6"
    >
      <template v-if="loading">
        <HealthVitalCard
          v-for="n in 6"
          :key="`skeleton-${n}`"
          class="w-[160px] shrink-0 md:w-auto"
          loading
        />
      </template>
      <template v-else>
        <HealthVitalCard
          v-for="vital in vitals"
          :key="vital.key"
          class="w-[160px] shrink-0 md:w-auto"
          :vital="vital"
        />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"
import HealthVitalCard from "./HealthVitalCard.vue"
import type { IHealthVital } from "./types"

withDefaults(defineProps<{ vitals?: IHealthVital[]; loading?: boolean; error?: boolean }>(), {
  vitals: () => [],
  loading: false,
  error: false,
})
</script>
