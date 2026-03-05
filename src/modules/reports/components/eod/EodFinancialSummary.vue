<script setup lang="ts">
import { EOD_FINANCIAL_DATA } from "../../constants"
import ReportStatCard from "../ReportStatCard.vue"

const stats = EOD_FINANCIAL_DATA.map((item) => ({
  label: item.label,
  value: item.value,
  caption: item.meta,
  percentage: item.percentage || undefined,
}))
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">01</span>
      <h3 class="text-base font-semibold text-gray-900">Financial Summary</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Reconciliation</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-2 gap-3 py-4 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard
        v-for="stat in stats"
        :key="stat.label"
        :stat="stat"
        class="md:!border-white md:!bg-white"
      />
    </div>
  </section>
</template>
