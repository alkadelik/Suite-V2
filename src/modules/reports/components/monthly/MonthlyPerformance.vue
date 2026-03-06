<script setup lang="ts">
import { truncateCurrency, formatCurrency } from "@/utils/format-currency"
import ReportStatCard from "../ReportStatCard.vue"
import { computed } from "vue"
import { MONTHLY_PERFOMANCE_INSIGHTS } from "@modules/reports/constants"
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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const stats = computed(() => {
  const ngnValue = ["Gross Margin", "Avg Order Value", "Discount Impact"]
  const data = MONTHLY_PERFOMANCE_INSIGHTS.map((stat) => ({
    ...stat,
    value: ngnValue.includes(String(stat.label))
      ? truncateCurrency(Number(stat.value))
      : stat.value,
  }))

  return isMobile.value ? data.slice(0, 2) : data
})

// Revenue Per Day of Week Chart Data
const revenueByDayData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Revenue",
      data: [85000, 78000, 92000, 88000, 95000, 145000, 125000],
      backgroundColor: "#3B82F6",
      borderRadius: 4,
    },
  ],
}

const revenueByDayOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => `Revenue: ${formatCurrency(Number(context.parsed.y))}`,
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
const transactionSizeData = {
  labels: ["₦0-5K", "₦5K-10K", "₦10K-20K", "₦20K-50K", "₦50K-100K", "₦100K+"],
  datasets: [
    {
      label: "Order Count",
      data: [45, 82, 125, 98, 42, 18],
      backgroundColor: "#10B981",
      borderRadius: 4,
    },
  ],
}

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

// Generate heatmap data (3-hour intervals x day)
const generateHeatmapData = () => {
  const data: { day: number; hour: number; value: number }[] = []

  // Sample data with peaks at lunch and evening hours, especially on weekends
  for (let day = 0; day < 7; day++) {
    for (let hourBlock = 0; hourBlock < 8; hourBlock++) {
      const startHour = hourBlock * 3
      let value = Math.floor(Math.random() * 10) + 5 // Base activity 5-15

      // Lunch time peak (12PM-3PM) - Block 4
      if (startHour === 12) {
        value += day === 5 ? 60 : 35 // Saturday extra busy
      }

      // Evening peak (6PM-9PM) - Block 6
      if (startHour === 18) {
        value += day < 5 ? 50 : 25 // Weekdays busy in evening
      }

      // Late night and early morning (0-6, 21-24) - low activity
      if (startHour < 6 || startHour >= 21) {
        value = Math.floor(Math.random() * 15) + 5
      }

      data.push({ day, hour: hourBlock, value })
    }
  }

  return data
}

const heatmapData = generateHeatmapData()

// Find max value for percentage calculation
const maxValue = Math.max(...heatmapData.map((d) => d.value), 1)

const getHeatmapColor = (value: number) => {
  if (value === 0) return "#f3f4f6" // Gray for 0

  const percentage = (value / maxValue) * 100

  if (percentage <= 20) return "#E5D9FF"
  if (percentage <= 40) return "#B89EFF"
  if (percentage <= 60) return "#8B5CF6"
  if (percentage <= 80) return "#6927DA"
  return "#4B1A9E"
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <ReportInsightCard title="Performance Insights">
      <p>
        Your margins are healthy and improving, but growth is being partially offset by rising
        discount absorption and cart abandonment. The highest-leverage fix this month: address
        checkout friction. At <b>34.7% abandonment</b> with <b>62%</b> dropping off at payment,
        adding bank transfer or USSD payment options could recover <b>₦200-350K/month</b>. Also,
        your conversion rate of <b>4.2%</b> suggests your traffic quality is decent but product
        pages aren't closing the sale — consider adding more customer reviews and size-specific
        photos.
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
          <span class="text-core-800 font-semibold">Peak ordering window:</span>
          <b>Saturdays 12pm - 3pm</b> and <b>Weekday evenings 7pm - 9pm</b>. Consider scheduling
          promotions and social posts <b>1-2 hours</b> before these windows to maximize impact.
        </p>
      </div>
    </div>
  </div>
</template>
