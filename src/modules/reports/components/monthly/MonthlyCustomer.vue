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
        <div class="px-4 py-6"></div>
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
