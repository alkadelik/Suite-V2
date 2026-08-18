<template>
  <section>
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-core-800 font-sato text-base font-semibold">Receivables</h3>
      <SeeAllToggle v-if="hasToggle" :expanded="expanded" @toggle="toggle" />
    </div>

    <div class="mt-2 flex items-center gap-2">
      <span class="text-core-900 font-sato text-2xl font-bold">{{ data.totalLabel }}</span>
      <Chip :label="`${data.customerCount} customers`" color="blue" variant="outlined" size="sm" />
    </div>

    <div class="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div
        v-for="item in visible"
        :key="item.customerId"
        class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3"
      >
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
    </div>
  </section>
</template>

<script setup lang="ts">
import Chip from "@components/Chip.vue"
import SeeAllToggle from "./SeeAllToggle.vue"
import { useSeeAll } from "./useSeeAll"
import type { IReceivablesPanel } from "./types"

const props = defineProps<{ data: IReceivablesPanel }>()
const { visible, hasToggle, expanded, toggle } = useSeeAll(() => props.data.items)
</script>
