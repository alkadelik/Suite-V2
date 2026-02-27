<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import StatCard from "@components/StatCard.vue"

const stats = [
  {
    label: "Total Customers",
    value: 120,
    icon: "people",
  },
  {
    label: "New Customers",
    value: 30,
    icon: "user-circle-add",
  },
  {
    label: "Returning Customers",
    value: 90,
    icon: "user-octagon",
  },
  {
    label: "Returning Revenue",
    value: formatCurrency(120000),
    icon: "moneys-solid",
  },
]
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">04</span>
      <h3 class="text-base font-semibold text-gray-900">Customers</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Today's Buyers</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-2 gap-3 py-4 md:grid-cols-3 xl:grid-cols-4">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :stat="stat"
        class="md:!border-white md:!bg-white"
      />
    </div>
  </section>
</template>
