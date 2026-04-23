<script setup lang="ts">
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"
import { useGetHighlights } from "../api"
import { formatCurrency } from "@/utils/format-currency"

import SoEbitda from "../components/store-overview/SoEbitda.vue"
import SoGrossProfit from "../components/store-overview/SoGrossProfit.vue"
import SoRepeatCustomer from "../components/store-overview/SoRepeatCustomer.vue"
import SoCustomerGrowth from "../components/store-overview/SoCustomerGrowth.vue"
import SoTopProducts from "../components/store-overview/SoTopProducts.vue"

const { data: highlights, isPending } = useGetHighlights()

const isMobile = useMediaQuery("(max-width: 1024px)")

const metrics = computed(() => highlights.value?.metrics)

const dateRange = computed(() => {
  const period = highlights.value?.period
  if (!period?.start || !period?.end) return ""
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  return `${fmt(period.start)} - ${fmt(period.end)}`
})

const summaryCards = computed(() => {
  const m = metrics.value
  return [
    {
      label: "Average Order Value (AOV)",
      value: m?.average_order_value != null ? formatCurrency(m.average_order_value) : "₦0",
    },
    {
      label: "Average Items per Sale",
      value: m?.average_items_per_sale != null ? String(m.average_items_per_sale) : "0",
    },
    {
      label: "Inventory Turnover",
      value: m?.inventory_turnover != null ? `${m.inventory_turnover}x` : "—",
    },
    {
      label: "Sell-Through Rate",
      value: m?.sell_through_rate_percent != null ? `${m.sell_through_rate_percent}%` : "0%",
    },
  ]
})

const ebitdaBreakdown = computed(() => {
  const items = metrics.value?.ebitda?.breakdown
  if (!items?.length) return []
  return items.map((item) => ({
    label: item.label,
    value: item.value,
    color: item.label === "Revenue" ? "bg-success-500" : "bg-error-400",
    isPositive: item.label === "Revenue",
  }))
})

const topProducts = computed(() => {
  if (!metrics.value?.top_10_products) return []
  return metrics.value.top_10_products.map((p) => ({
    rank: p.rank,
    product_name: p.name,
    revenue: p.revenue,
    units_sold: p.units_sold,
    avg_price: p.avg_price,
    margin: p.margin,
    sell_through: p.sell_through,
    inventory_turnover: p.inventory_turnover ?? 0,
  }))
})
</script>

<template>
  <div class="p-4">
    <PageHeader v-if="isMobile" title="Store Overview" />
    <SectionHeader v-else title="Store Overview" :subtitle="dateRange">
      <template #action>
        <Chip :label="`Past ${highlights?.period?.days || 30} days`" color="warning" />
      </template>
    </SectionHeader>

    <div v-if="isMobile" class="mt-1 flex items-center gap-2">
      <span class="text-core-600 text-sm">{{ dateRange }}</span>
      <Chip :label="`Past ${highlights?.period?.days || 30} days`" color="warning" size="sm" />
    </div>

    <!-- Loading state -->
    <div v-if="isPending" class="mt-12 flex items-center justify-center">
      <Icon name="loader" size="40" class="text-primary-500 animate-spin" />
    </div>

    <section v-else class="mt-6 space-y-6">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="rounded-xl border border-gray-200 bg-white px-4 py-6"
        >
          <span class="border-primary-600 mb-2 block w-8 border-t-2" />
          <p class="text-core-600 text-sm">{{ card.label }}</p>
          <p class="text-core-800 mt-1 text-xl font-bold">{{ card.value }}</p>
        </div>
      </div>

      <SoEbitda
        :value="metrics?.ebitda?.value || 0"
        :has-expenses="metrics?.ebitda?.has_expenses || false"
        :prompt="metrics?.ebitda?.prompt"
        :percentage-change="metrics?.ebitda?.percentage_change"
        :breakdown="ebitdaBreakdown"
      />
      <SoGrossProfit
        :value="metrics?.gross_profit?.value || 0"
        :margin-percent="metrics?.gross_profit?.gross_margin_percent || 0"
        :percentage-change="metrics?.gross_profit?.percentage_change"
      />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SoRepeatCustomer :percent="metrics?.repeat_customer_rate_percent || 0" />
        <SoCustomerGrowth :percent="metrics?.customer_growth_rate_percent || 0" />
      </div>

      <SoTopProducts :products="topProducts" />
    </section>
  </div>
</template>
