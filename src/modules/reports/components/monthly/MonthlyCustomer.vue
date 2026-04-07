<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import ReportStatCard, { IReportStat } from "../ReportStatCard.vue"
import { computed, ref } from "vue"
import ReportInsightCard from "../ReportInsightCard.vue"
import { useMediaQuery } from "@vueuse/core"
import { IMonthlyReport } from "@modules/reports/types"
import { Doughnut } from "vue-chartjs"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{ data: IMonthlyReport | null }>()
const { format, truncate } = useFormatCurrency()

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const stats = computed(() => {
  if (!props.data) return []

  const metrics = props.data.customer_metrics

  const data: IReportStat[] = [
    {
      label: "New Customers",
      value: metrics.new_customers.toString(),
      caption: "First-time buyers",
    },
    {
      label: "Repeat Rate",
      value: `${metrics.repeat_customer_rate_180_percent.toFixed(1)}%`,
      caption: "Customer retention",
    },
    {
      label: "Customer Growth",
      value: `${metrics.customer_growth_rate_percent.toFixed(1)}%`,
      caption: "Month-over-month",
    },
    {
      label: "Avg Spend/Customer",
      value: truncate(props.data.breakdowns.customers.avg_spend_per_customer),
      caption: "Revenue per customer",
    },
    {
      label: "LTV:CAC Ratio",
      value: metrics.ltv_cac_ratio?.toFixed(1) ?? "N/A",
      caption: "Customer value efficiency",
    },
    {
      label: "Total Active (180d)",
      value: metrics.total_active_customers_180.toString(),
      caption: "Recent customers",
    },
  ]

  return isMobile.value ? data.slice(0, 2) : data
})

const regions = computed(() => {
  if (!props.data) return []
  return props.data.sales_by_region.map((item) => ({
    name: item.city || item.state || "Unknown",
    revenue: item.revenue,
  }))
})

const regionalSummary = computed(() => {
  if (!props.data || regions.value.length === 0) return ""

  const totalRegionalRevenue = regions.value.reduce((sum, region) => sum + region.revenue, 0)
  const sortedRegions = [...regions.value].sort((a, b) => b.revenue - a.revenue)

  if (sortedRegions.length === 0) return ""

  const topRegion = sortedRegions[0]
  const topPercentage = ((topRegion.revenue / totalRegionalRevenue) * 100).toFixed(0)

  if (sortedRegions.length === 1) {
    return `${topRegion.name} accounts for all regional sales (${format(topRegion.revenue)}).`
  }

  const secondRegion = sortedRegions[1]
  const secondPercentage = ((secondRegion.revenue / totalRegionalRevenue) * 100).toFixed(0)

  return `${topRegion.name} leads with ${topPercentage}% of sales (${format(topRegion.revenue)}), followed by ${secondRegion.name} at ${secondPercentage}% (${format(secondRegion.revenue)}).`
})

const customerRevenueData = computed(() => {
  if (!props.data) return []

  const { new_revenue, new_percent, returning_revenue, returning_percent } =
    props.data.customer_metrics.new_vs_returning_revenue

  return [
    {
      label: "Returning Customers",
      revenue: returning_revenue,
      percentage: returning_percent,
      color: "#85E13A",
    },
    {
      label: "New Customers",
      revenue: new_revenue,
      percentage: new_percent,
      color: "#53B1FD",
    },
  ]
})

const totalRevenue = computed(() =>
  customerRevenueData.value.reduce((sum, item) => sum + item.revenue, 0),
)

const isHoveringChart = ref(false)

const customerChartData = computed(() => {
  if (!props.data) return { labels: [], datasets: [] }

  return {
    labels: customerRevenueData.value.map((item) => item.label),
    datasets: [
      {
        data: customerRevenueData.value.map((item) => item.revenue),
        backgroundColor: customerRevenueData.value.map((item) => item.color),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  }
})

const customerChartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  onHover: (_, activeElements) => {
    isHoveringChart.value = activeElements.length > 0
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        padding: 15,
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return ` ${format(value)} (${percentage}%)`
        },
      },
    },
  },
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <ReportInsightCard title="Customer Insights">
      <p>
        {{ data?.narratives.customer_insight }}
      </p>
    </ReportInsightCard>

    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">New vs Returning Revenue</h3>
          <p class="text-xs">Revenue split by customer type</p>
        </div>
        <div class="px-4 py-6">
          <div class="relative" style="height: 300px">
            <Doughnut :data="customerChartData" :options="customerChartOptions" />
            <!-- Center text overlay -->
            <div
              v-show="!isHoveringChart"
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10"
            >
              <p class="text-2xl font-bold">{{ truncate(totalRevenue) }}</p>
              <p class="text-xs text-gray-500">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Sales by Region</h3>
          <p class="text-xs">Top cities by order volume</p>
        </div>
        <div class="px-4 py-6">
          <div class="w-full divide-y divide-gray-200 rounded-xl bg-gray-100">
            <!--  -->
            <div
              v-for="v in regions"
              :key="v.name"
              class="flex items-center justify-between gap-4 px-4 py-5"
            >
              <p class="text-sm font-medium">{{ v.name }}</p>
              <p :class="['text-sm font-medium']">
                {{ format(v.revenue) }}
              </p>
            </div>
          </div>

          <p v-if="regionalSummary" class="text-core-600 mt-4 text-sm italic">
            {{ regionalSummary }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
