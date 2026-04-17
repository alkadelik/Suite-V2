<script setup lang="ts">
import { computed } from "vue"
// import { EOD_FINANCIAL_DATA } from "../../constants"
import ReportStatCard from "../ReportStatCard.vue"
import { useMediaQuery } from "@vueuse/core"
import { IEODReport } from "@modules/reports/types"
import { formatCurrency } from "@/utils/format-currency"

const isMobile = useMediaQuery("(max-width: 768px)")
const props = defineProps<{ data: IEODReport | null }>()

const stats = computed(() => {
  const { summary, summary_comparison } = props.data || {}

  const averageOrderMargin =
    summary?.average_order_value && summary_comparison?.average_order_value_absolute_change
      ? (summary.average_order_value / summary_comparison.average_order_value_absolute_change) * 100
      : 0

  const data = [
    {
      label: "Gross Revenue",
      value: formatCurrency(summary?.gross_revenue ?? 0),
      caption: `${summary?.order_count ?? 0} orders`,
      percentage: summary_comparison?.gross_revenue_percent_change ?? 0,
    },
    {
      label: "Refunds",
      value: formatCurrency(summary?.total_refunds ?? 0),
      // caption: `${summary?.total_refunds ?? 0} orders`,
      percentage: undefined,
    },
    {
      label: "Discounts",
      value: formatCurrency(summary?.total_discounts ?? 0),
      // caption: `${summary?.discount_count ?? 0} orders`,
      // percentage: summary_comparison?.discounts_percent_change ?? 0,
    },
    {
      label: "Shipping Costs",
      value: formatCurrency(summary?.total_shipping_costs ?? 0),
      // caption: `${summary?.shipping_count ?? 0} orders`,
      percentage: undefined,
    },
    {
      label: "Net Revenue",
      value: formatCurrency(summary?.net_revenue ?? 0),
      // caption: `${summary?.net_margin ?? 0}% net margin`,
      percentage: summary_comparison?.net_revenue_percent_change ?? 0,
    },
    {
      label: "Avg Order Value",
      value: formatCurrency(summary?.average_order_value ?? 0),
      caption: `${averageOrderMargin}% net margin`,
      percentage: undefined,
    },
  ]

  return isMobile.value ? data.slice(0, 2) : data
})
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
