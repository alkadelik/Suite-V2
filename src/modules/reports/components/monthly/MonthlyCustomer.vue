<script setup lang="ts">
import { formatCurrency, truncateCurrency } from "@/utils/format-currency"
import ReportStatCard from "../ReportStatCard.vue"
import { computed } from "vue"
import { MONTHLY_SUMMARY_STATS } from "@modules/reports/constants"
import ReportInsightCard from "../ReportInsightCard.vue"
import { useMediaQuery } from "@vueuse/core"

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const stats = computed(() => {
  const data = MONTHLY_SUMMARY_STATS.map((stat) => ({
    ...stat,
    value: truncateCurrency(Number(stat.value)),
  }))

  return isMobile.value ? data.slice(0, 2) : data
})

const REGIONS = [
  { name: "Lagos", revenue: 10800, percentage: 45 },
  { name: "Abuja", revenue: 8500, percentage: 35 },
  { name: "Port Harcourt", revenue: 4200, percentage: 17 },
  { name: "Kano", revenue: 1500, percentage: 6 },
  { name: "Ibadan", revenue: 800, percentage: 3 },
  { name: "Others (12 cities)", revenue: 500, percentage: 2 },
]

const customerRevenueData = [
  { label: "Returning Customers", revenue: 87600, percentage: 58, color: "#10b981" },
  { label: "New Customers", revenue: 63400, percentage: 42, color: "#3b82f6" },
]

const totalRevenue = computed(() =>
  customerRevenueData.reduce((sum, item) => sum + item.revenue, 0),
)
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <ReportInsightCard title="Customer Insights">
      <p>
        The <b>38% repeat rate</b> is the standout metric this month — up from <b>27.6%</b> in
        December. This suggests your holiday promotions successfully converted deal-seekers into
        loyal customers. Your <b>LTV:CAC ratio of 12.4x</b> is exceptional (benchmark: <b>3-5x</b>),
        meaning every naira spent on ads generates tremendous long-term value. Recommended action:
        invest more in retention marketing (loyalty points, exclusive drops for repeat buyers) since
        your repeat customers generate <b>2.8x more revenue</b> per order than first-time buyers.
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
          <!-- donut chart -->
          <div class="flex flex-col items-center gap-6">
            <!-- Donut Chart -->
            <div class="relative h-48 w-48">
              <svg viewBox="0 0 100 100" class="-rotate-90 transform">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="20" />
                <!-- Returning Customers segment -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  :stroke="customerRevenueData[0].color"
                  stroke-width="20"
                  :stroke-dasharray="`${customerRevenueData[0].percentage * 2.51} ${251 - customerRevenueData[0].percentage * 2.51}`"
                  stroke-linecap="round"
                  class="transition-all duration-500"
                />
                <!-- New Customers segment -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  :stroke="customerRevenueData[1].color"
                  stroke-width="20"
                  :stroke-dasharray="`${customerRevenueData[1].percentage * 2.51} ${251 - customerRevenueData[1].percentage * 2.51}`"
                  :stroke-dashoffset="`${-customerRevenueData[0].percentage * 2.51}`"
                  stroke-linecap="round"
                  class="transition-all duration-500"
                />
              </svg>
              <!-- Center text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <p class="text-2xl font-bold">{{ formatCurrency(totalRevenue) }}</p>
                <p class="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>

            <!-- Legend -->
            <div class="w-full space-y-3">
              <div
                v-for="item in customerRevenueData"
                :key="item.label"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: item.color }" />
                  <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold">{{ formatCurrency(item.revenue) }}</p>
                  <p class="text-xs text-gray-500">{{ item.percentage }}%</p>
                </div>
              </div>
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
              v-for="v in REGIONS"
              :key="v.name"
              class="flex items-center justify-between gap-4 px-4 py-5"
            >
              <p class="text-sm font-medium">{{ v.name }}</p>
              <p :class="['text-sm font-medium']">
                {{ formatCurrency(v.revenue) }}
                <span class="text-xs font-normal"> {{ v.percentage }}% </span>
              </p>
            </div>
          </div>

          <p class="text-core-600 mt-4 text-sm italic">
            Lagos dominance (50%) is expected but<b>Abuja grew 24%</b> month-over-month. Consider
            targeted Instagram ads for the Abuja market.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
