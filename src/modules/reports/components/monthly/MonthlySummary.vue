<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import ReportStatCard, { IReportStat } from "../ReportStatCard.vue"
import { computed } from "vue"
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
import { IMonthlyReport } from "@modules/reports/types"
import { startCase } from "@/utils/format-strings"

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

const props = defineProps<{ data: IMonthlyReport | null }>()
const { format, truncate } = useFormatCurrency()

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const stats = computed(() => {
  const data: IReportStat[] =
    props.data?.kpi_cards?.map((card) => ({
      label: startCase(card.key),
      value: truncate(card.value ?? 0),
      percentage: Number(card.percent_change_vs_previous).toFixed(1) ?? 0,
      // percentageText: card.percentageText ?? "",
      // caption: card.caption ?? "",
    })) || []

  return isMobile.value ? data.slice(0, 2) : data
})

type TFinancialRow = {
  line_item: string
  amount: number
  percentage: number
  vs_last_month: number | string
}

const COLUMNS: TableColumn<TFinancialRow>[] = [
  { header: "Line Item", accessor: "line_item" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => format(Number(value)),
  },
  { header: "% of Revenue", accessor: "percentage", cell: ({ value }) => `${value}%` },
  { header: "vs Last Month", accessor: "vs_last_month", cell: ({ value }) => `${value}%` },
]

const financialData = computed(() => {
  if (!props.data) return []

  const data: TFinancialRow[] = props.data.financial_summary_breakdown.map((item) => ({
    line_item: startCase(item.line_item),
    amount: item.amount,
    percentage: item.percent_of_revenue,
    vs_last_month: Number(item.percent_change_vs_previous).toFixed(1) ?? 0,
  }))

  return data
})

const isBoldRow = (row: TFinancialRow) => {
  return ["Net Revenue", "Gross Profit", "Net Income Ebitda"].includes(row.line_item)
}

const formattedPeriod = computed(() => {
  if (!props.data?.period) return ""
  return new Date(props.data.period.year, props.data.period.month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
})

// Weekly Revenue & Expenses Chart Data
const weeklyRevenueExpensesData = computed(() => {
  if (!props.data) return { labels: [], datasets: [] }

  const series = props.data.weekly_revenue_expenses.series

  return {
    labels: series.map((_, index) => `Week ${index + 1}`),
    datasets: [
      {
        label: "Revenue",
        data: series.map((item) => item.revenue),
        backgroundColor: "#3B82F6",
        borderRadius: 4,
      },
      {
        label: "Expenses",
        data: series.map((item) => item.expenses),
        backgroundColor: "#EF4444",
        borderRadius: 4,
      },
    ],
  }
})

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
        label: (context) => `${context.dataset.label}: ${format(Number(context.parsed.y))}`,
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
const dailyRevenueTrendData = computed(() => {
  if (!props.data) return { labels: [], datasets: [] }

  const dailyData = props.data.daily_revenue_trend

  return {
    labels: dailyData.map((item) => new Date(item.day).getDate().toString()),
    datasets: [
      {
        label: "Revenue",
        data: dailyData.map((item) => item.revenue),
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
})

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
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 10 },
    },
  },
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <ReportInsightCard title="What this Means?">
      <p>
        {{ data?.narratives.financial_insight || "N/A" }}
      </p>
    </ReportInsightCard>

    <div class="grid gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Weekly Revenue & Expenses</h3>
          <p class="text-xs">Sales vs expenses by week of {{ formattedPeriod }}</p>
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
          <p class="text-xs">Revenue per day across {{ formattedPeriod }}</p>
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
        <p class="text-xs">Detailed P&L for {{ formattedPeriod }}</p>
      </div>
      <div class="pt-1 pb-6">
        <DataTable
          :data="financialData ?? []"
          :columns="COLUMNS"
          :show-pagination="false"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
          :row-class="(row) => (isBoldRow(row) ? 'font-semibold bg-gray-50  ' : '')"
        >
          <template #cell:vs_last_month="{ item }">
            <span :class="Number(item.vs_last_month) > 0 ? 'text-success-600' : 'text-error-600'">
              {{ item.vs_last_month }}%
            </span>
          </template>
        </DataTable>
        <p
          v-if="data?.tax_summary"
          class="text-core-600 border-t border-gray-200 px-4 pt-4 text-sm"
        >
          <span class="text-core-800 font-semibold">Tax note:</span> Estimated VAT liability of
          {{ format(data.tax_summary.estimated_vat_liability) }}
          ({{ data.tax_summary.vat_rate_percent }}% on applicable sales) should be set aside for
          remittance.
        </p>
      </div>
    </div>
  </div>
</template>
