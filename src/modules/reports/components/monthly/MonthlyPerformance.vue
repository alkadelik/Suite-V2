<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import ReportStatCard, { IReportStat } from "../ReportStatCard.vue"
import { computed } from "vue"
import ReportInsightCard from "../ReportInsightCard.vue"
import { useMediaQuery } from "@vueuse/core"
import { Bar } from "vue-chartjs"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartOptions,
} from "chart.js"
import { IMonthlyReport } from "@modules/reports/types"

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{ data: IMonthlyReport | null }>()
const { format, truncate } = useFormatCurrency()

const isMobile = useMediaQuery("(max-width: 768px)")

const stats = computed(() => {
  if (!props.data) return []

  const metrics = props.data.performance_metrics

  const data: IReportStat[] = [
    {
      label: "Gross Margin",
      value: `${metrics.gross_margin_percent}%`,
      note: "Healthy profit margin",
    },
    {
      label: "Avg Order Value",
      value: truncate(metrics.average_order_value),
      note: "Average per order",
    },
    {
      label: "Avg Items/Order",
      value: metrics.avg_items_per_order.toFixed(2),
      note: "Items per transaction",
    },
    {
      label: "Inventory Turnover",
      value: metrics.inventory_turnover?.toFixed(2) ?? "N/A",
      note: "Stock movement rate",
    },
    {
      label: "Sell-through Rate",
      value: metrics.sell_through_rate ? `${metrics.sell_through_rate}%` : "N/A",
      note: "Product sell-through",
    },
    {
      label: "Conversion Rate",
      value: metrics.conversion_rate ? `${metrics.conversion_rate}%` : "N/A",
      note: "Visitor to customer",
    },
    {
      label: "Cart Abandonment",
      value: `${metrics.cart_abandonment_rate}%`,
      note: `${truncate(metrics.estimated_lost_revenue_from_abandonment)} lost`,
    },
    {
      label: "Discount Impact",
      value: `${metrics.discount_impact_percent}%`,
      note: "Revenue impact",
    },
  ]

  return isMobile.value ? data.slice(0, 2) : data
})

// Revenue Per Day of Week Chart Data
const revenueByDayData = computed(() => {
  if (!props.data) return { labels: [], datasets: [] }

  const dayData = props.data.revenue_by_day_of_week
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Create array with all 7 days, defaulting to 0 revenue
  const allDaysData = dayNames.map((_, index) => {
    const dayInfo = dayData.find((item) => item.weekday === index)
    return dayInfo ? dayInfo.revenue : 0
  })

  return {
    labels: dayNames,
    datasets: [
      {
        label: "Revenue",
        data: allDaysData,
        backgroundColor: "#3B82F6",
        borderRadius: 4,
      },
    ],
  }
})

const revenueByDayOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => `Revenue: ${format(Number(context.parsed.y))}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `₦${(Number(value) / 1000).toFixed(0)}K`,
      },
    },
  },
}

// Transaction Size Distribution Chart Data
const transactionSizeData = computed(() => {
  if (!props.data) return { labels: [], datasets: [] }

  const distribution = props.data.transaction_size_distribution

  return {
    labels: distribution.map((item) => item.range),
    datasets: [
      {
        label: "Order Count",
        data: distribution.map((item) => item.order_count),
        backgroundColor: "#10B981",
        borderRadius: 4,
      },
    ],
  }
})

const transactionSizeOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => `Orders: ${context.parsed.y}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 20,
      },
    },
  },
}

// Peak Sales Hours - GitHub-style heatmap data
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const hours = Array.from({ length: 8 }, (_, i) => {
  const startHour = i * 3
  const endHour = (i + 1) * 3
  const formatHour = (h: number) => {
    const hour = h % 12 || 12
    const ampm = h < 12 || h === 24 ? "am" : "pm"
    return `${hour}${ampm}`
  }
  return `${formatHour(startHour)} - ${formatHour(endHour)}`
})

// Generate heatmap data from API data
const heatmapData = computed(() => {
  if (!props.data) return []

  const data: { day: number; hour: number; value: number }[] = []
  const apiData = props.data.peak_sales_hours_heatmap

  // Initialize all cells with 0
  for (let day = 0; day < 7; day++) {
    for (let hourBlock = 0; hourBlock < 8; hourBlock++) {
      data.push({ day, hour: hourBlock, value: 0 })
    }
  }

  // Fill in actual data from API
  apiData.forEach((item) => {
    // weekday: 0 = Sunday, 1 = Monday, etc.
    // Convert to our format where 0 = Monday
    const dayIndex = item.weekday === 0 ? 6 : item.weekday - 1
    const hourBlock = Math.floor(item.hour / 3)

    const cell = data.find((d) => d.day === dayIndex && d.hour === hourBlock)
    if (cell) {
      cell.value += item.order_count
    }
  })

  return data
})

// Find max value for percentage calculation
const maxValue = computed(() => Math.max(...heatmapData.value.map((d) => d.value), 1))

const getHeatmapColor = (value: number) => {
  if (value === 0) return "#f3f4f6" // Gray for 0

  const percentage = (value / maxValue.value) * 100

  if (percentage <= 20) return "#DCCEFC"
  if (percentage <= 40) return "#C5AEFB"
  if (percentage <= 60) return "#ae8df9"
  if (percentage <= 80) return "#7D53DD"
  return "#462E7B"
}

// Compute peak ordering windows
const peakOrderingWindow = computed(() => {
  if (!props.data || heatmapData.value.length === 0) return ""

  // Find top 2 peak periods
  const sortedPeaks = [...heatmapData.value].sort((a, b) => b.value - a.value).slice(0, 2)

  const formatPeakTime = (peak: { day: number; hour: number; value: number }) => {
    const dayName = daysOfWeek[peak.day]
    const hourBlock = peak.hour
    const startHour = hourBlock * 3
    const endHour = (hourBlock + 1) * 3

    const formatHour = (h: number) => {
      const hour = h % 12 || 12
      const ampm = h < 12 || h === 24 ? "am" : "pm"
      return `${hour}${ampm}`
    }

    return `${dayName} ${formatHour(startHour)} - ${formatHour(endHour)}`
  }

  if (sortedPeaks.length === 0) return "No peak periods identified"
  if (sortedPeaks.length === 1) return formatPeakTime(sortedPeaks[0])

  return `${formatPeakTime(sortedPeaks[0])} & ${formatPeakTime(sortedPeaks[1])}`
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <ReportInsightCard title="Performance Insights">
      <p>
        {{ data?.narratives.performance_insight || "N/A" }}
      </p>
    </ReportInsightCard>

    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Revenue Per Day of Week</h3>
          <p class="text-xs">Average daily revenue by weekday</p>
        </div>
        <div class="px-4 py-6">
          <div class="h-64">
            <Bar :data="revenueByDayData" :options="revenueByDayOptions" />
          </div>
        </div>
      </div>
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Transaction Size Distribution</h3>
          <p class="text-xs">How order values are distributed</p>
        </div>
        <div class="px-4 py-6">
          <div class="h-64">
            <Bar :data="transactionSizeData" :options="transactionSizeOptions" />
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl bg-white shadow">
      <div class="border-b border-gray-200 px-4 py-3">
        <h3 class="mb-1 text-sm font-semibold">Peak Sales Hours</h3>
        <p class="text-xs">Order volume by day and hour — darker = more orders</p>
      </div>
      <div class="pt-1 pb-6">
        <div class="px-4 py-6">
          <!-- GitHub-style heatmap -->
          <div class="flex flex-col gap-1">
            <!-- Day labels -->
            <div class="flex gap-1">
              <div class="w-12 flex-shrink-0"></div>
              <div
                v-for="(day, idx) in daysOfWeek"
                :key="idx"
                class="flex flex-1 items-center justify-center text-xs text-gray-600"
              >
                {{ day }}
              </div>
            </div>

            <!-- Hour rows -->
            <div v-for="(hour, hourIdx) in hours" :key="hourIdx" class="flex items-center gap-1">
              <!-- Hour label -->
              <div class="w-16 flex-shrink-0 text-right text-xs text-gray-600">
                {{ hour }}
              </div>

              <!-- Heatmap cells -->
              <div v-for="dayIdx in 7" :key="dayIdx" class="group relative flex-1">
                <div
                  :style="{
                    backgroundColor: getHeatmapColor(
                      heatmapData.find((d) => d.day === dayIdx - 1 && d.hour === hourIdx)?.value ||
                        0,
                    ),
                  }"
                  class="h-12 w-full rounded-sm border border-gray-200 transition-all hover:border-gray-400"
                  :title="`${daysOfWeek[dayIdx - 1]} ${hour}: ${
                    heatmapData.find((d) => d.day === dayIdx - 1 && d.hour === hourIdx)?.value || 0
                  } orders`"
                ></div>

                <!-- Tooltip on hover -->
                <div
                  class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg group-hover:block"
                >
                  {{ daysOfWeek[dayIdx - 1] }} {{ hour }}:
                  {{
                    heatmapData.find((d) => d.day === dayIdx - 1 && d.hour === hourIdx)?.value || 0
                  }}
                  orders
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div class="mt-4 flex items-center gap-2 text-xs text-gray-600">
              <span>Less</span>
              <div class="flex gap-1">
                <div class="h-4 w-4 rounded-sm" style="background-color: #f3f4f6"></div>
                <div class="h-4 w-4 rounded-sm" style="background-color: #e5d9ff"></div>
                <div class="h-4 w-4 rounded-sm" style="background-color: #b89eff"></div>
                <div class="h-4 w-4 rounded-sm" style="background-color: #8b5cf6"></div>
                <div class="h-4 w-4 rounded-sm" style="background-color: #6927da"></div>
                <div class="h-4 w-4 rounded-sm" style="background-color: #4b1a9e"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
        <p class="text-core-600 border-t border-gray-200 px-4 pt-4 text-sm">
          <span class="text-core-800 font-semibold">Peak ordering window: </span>
          <b>{{ peakOrderingWindow }}</b
          >. Consider scheduling promotions and social posts <b>1-2 hours</b> before these windows
          to maximize impact.
        </p>
      </div>
    </div>
  </div>
</template>
