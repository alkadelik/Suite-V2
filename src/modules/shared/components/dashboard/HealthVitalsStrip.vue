<template>
  <section>
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
import HealthVitalCard from "./HealthVitalCard.vue"
import type { IHealthVital } from "./types"

withDefaults(defineProps<{ vitals?: IHealthVital[]; loading?: boolean; error?: boolean }>(), {
  vitals: () => [],
  loading: false,
  error: false,
})
</script>
