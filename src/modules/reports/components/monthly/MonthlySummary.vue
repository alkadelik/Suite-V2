<script setup lang="ts">
import { formatCurrency, truncateCurrency } from "@/utils/format-currency"
import ReportStatCard from "../ReportStatCard.vue"
import { computed } from "vue"
import { MONTHLY_SUMMARY_STATS } from "@modules/reports/constants"
import DataTable, { TableColumn } from "@components/DataTable.vue"
import ReportInsightCard from "../ReportInsightCard.vue"
import { useMediaQuery } from "@vueuse/core"
import { Bar, Line } from "vue-chartjs"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  ChartOptions,
} from "chart.js"

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
)

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const stats = computed(() => {
  const data = MONTHLY_SUMMARY_STATS.map((stat) => ({
    ...stat,
    value: truncateCurrency(Number(stat.value)),
  }))
  return isMobile.value ? data.slice(0, 2) : data
})

type TFinancialRow = {
  line_item: string
  amount: number
  percentage: number
  vs_last_month: number
}

const COLUMNS: TableColumn<TFinancialRow>[] = [
  { header: "Line Item", accessor: "line_item" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  { header: "% of Revenue", accessor: "percentage", cell: ({ value }) => `${value}%` },
  { header: "vs Last Month", accessor: "vs_last_month", cell: ({ value }) => `${value}%` },
]

const DATA: TFinancialRow[] = [
  { line_item: "Gross Revenue", amount: 218400, percentage: 100, vs_last_month: 14.2 },
  { line_item: "Less: Refunds", amount: 18500, percentage: 8.5, vs_last_month: -22.0 },
  { line_item: "Less: Discounts Given", amount: 12000, percentage: 5.5, vs_last_month: 10.3 },
  { line_item: "Net Revenue", amount: 188900, percentage: 86.5, vs_last_month: 16.5 },
  { line_item: "Less: Cost of Goods Sold", amount: 28850, percentage: 13.2, vs_last_month: -8.1 },
  { line_item: "Shipping & Logistics", amount: 120000, percentage: 13.2, vs_last_month: 8.1 },
  { line_item: "Marketing & Ads", amount: 18200, percentage: 8.3, vs_last_month: 5.4 },
  { line_item: "Platform payment fees", amount: 7500, percentage: 3.4, vs_last_month: 2.5 },
  { line_item: "Gross Profit", amount: 189550, percentage: 86.8, vs_last_month: 16.5 },
  { line_item: "Other Operating Expenses", amount: 75000, percentage: 34.3, vs_last_month: 5.4 },
  { line_item: "Net Income (EBITDA)", amount: 114550, percentage: 52.5, vs_last_month: 25.3 },
]

const isBoldRow = (row: TFinancialRow) => {
  return ["Net Revenue", "Gross Profit", "Net Income (EBITDA)"].includes(row.line_item)
}

// Weekly Revenue & Expenses Chart Data
const weeklyRevenueExpensesData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
  datasets: [
    {
      label: "Revenue",
      data: [48200, 52100, 58300, 45600, 14200],
      backgroundColor: "#3B82F6",
      borderRadius: 4,
    },
    {
      label: "Expenses",
      data: [32500, 35800, 38200, 31900, 10200],
      backgroundColor: "#EF4444",
      borderRadius: 4,
    },
  ],
}

const weeklyRevenueExpensesOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${formatCurrency(Number(context.parsed.y))}`,
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

// Daily Revenue Trend Chart Data
const dailyRevenueTrendData = {
  labels: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
  datasets: [
    {
      label: "Revenue",
      data: [
        5200, 6100, 7300, 8500, 7800, 6900, 5800, 8200, 9100, 8700, 9500, 10200, 11500, 9800, 8300,
        7600, 8900, 9400, 10100, 11200, 9700, 8500, 7200, 6800, 7500, 8800, 9900, 10800, 9200, 7900,
        6500,
      ],
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: "#3B82F6",
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 2,
    },
  ],
}

const dailyRevenueTrendOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: "index",
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: (context) => `Day ${context[0].label}`,
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
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxTicksLimit: 10,
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

    <ReportInsightCard title="What this Mean">
      <p>
        Your revenue grew faster than your costs — a healthy sign. COGS rose <b>8.1%</b> vs
        revenue's <b>14.2%</b>, meaning your sourcing efficiency improved or your product mix
        shifted toward higher-margin items. The refund spike (<b>+22%</b>) is the one flag here:
        <b>12 of 18</b> refunded orders were in the <b>"wrong size"</b> category. This suggests your
        size guide may need updating, especially for the new Ankara line. Fixing this alone could
        recover <b>~₦85K/month</b> in lost revenue and processing costs.
      </p>
    </ReportInsightCard>

    <div class="grid gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Weekly Revenue & Expenses</h3>
          <p class="text-xs">Sales vs expenses by week of January</p>
        </div>
        <div class="px-4 py-6">
          <div class="h-64">
            <Bar :data="weeklyRevenueExpensesData" :options="weeklyRevenueExpensesOptions" />
          </div>
        </div>
      </div>
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Daily Revenue Trend</h3>
          <p class="text-xs">Revenue per day across January</p>
        </div>
        <div class="px-4 py-6">
          <div class="h-64">
            <Line :data="dailyRevenueTrendData" :options="dailyRevenueTrendOptions" />
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl bg-white shadow">
      <div class="border-b border-gray-200 px-4 py-3">
        <h3 class="mb-1 text-sm font-semibold">Financial Summary Breakdown</h3>
        <p class="text-xs">Detailed P&L for January 2026</p>
      </div>
      <div class="pt-1 pb-6">
        <DataTable
          :data="DATA ?? []"
          :columns="COLUMNS"
          :show-pagination="false"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
          :row-class="(row) => (isBoldRow(row) ? 'font-semibold bg-gray-50  ' : '')"
        >
          <template #cell:vs_last_month="{ item }">
            <span :class="item.vs_last_month > 0 ? 'text-success-600' : 'text-error-600'">
              {{ item.vs_last_month }}%
            </span>
          </template>
        </DataTable>
        <p class="text-core-600 border-t border-gray-200 px-4 pt-4 text-sm">
          <span class="text-core-800 font-semibold">Tax note:</span> Estimated VAT liability of
          ₦365,430 (7.5% on applicable sales) should be set aside for remittance.
        </p>
      </div>
    </div>
  </div>
</template>
