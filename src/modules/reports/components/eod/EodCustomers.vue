<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import ReportStatCard from "../ReportStatCard.vue"
import { IEODReport } from "@modules/reports/types"
import { computed } from "vue"

const props = defineProps<{ data: IEODReport | null }>()
const { format } = useFormatCurrency()

const stats = computed(() => [
  {
    label: "Total Customers",
    value: props.data?.customers?.unique_customers ?? 0,
    icon: "people",
    caption: `${props.data?.summary?.order_count ?? 0} orders from ${props.data?.customers?.unique_customers ?? 0} unique`,
  },
  {
    label: "New Customers",
    value: props.data?.customers?.new_customers ?? 0,
    icon: "user-circle-add",
  },
  {
    label: "Returning Customers",
    value: props.data?.customers?.returning_customers ?? 0,
    icon: "user-octagon",
  },
  {
    label: "Returning Revenue",
    value: format(props.data?.customers?.returning_revenue ?? 0, { kobo: true }),
    icon: "moneys-solid",
    caption: `${props.data?.customers?.returning_revenue_percent?.toFixed(1) ?? 0}% of total revenue`,
  },
])
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
      <ReportStatCard
        v-for="stat in stats"
        :key="stat.label"
        :stat="stat"
        class="md:!border-white md:!bg-white"
      />
    </div>
  </section>
</template>
