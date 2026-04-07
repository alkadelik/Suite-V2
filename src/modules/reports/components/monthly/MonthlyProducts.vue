<script setup lang="ts">
import DataTable, { TableColumn } from "@components/DataTable.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import ReportInsightCard from "../ReportInsightCard.vue"
import { computed, ref } from "vue"
import { useMediaQuery } from "@vueuse/core"
import { Doughnut, Bubble } from "vue-chartjs"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  LinearScale,
  PointElement,
} from "chart.js"
import { IMonthlyReport } from "@modules/reports/types"

ChartJS.register(ArcElement, Tooltip, Legend, LinearScale, PointElement)

const props = defineProps<{ data: IMonthlyReport | null }>()
const { format } = useFormatCurrency()

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)
const isHoveringChart = ref(false)

const categoryChartData = computed(() => {
  if (!props.data) return { labels: [], datasets: [] }

  const categories = props.data.revenue_by_category

  return {
    labels: categories.map((item) => item.category),
    datasets: [
      {
        data: categories.map((item) => item.revenue),
        backgroundColor: ["#85E13A", "#53B1FD", "#A48AFB", "#FDB022", "#F97066", "#B2836B"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  }
})

const bubbleChartOptions: ChartOptions<"bubble"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: "Sell-through (%)",
        font: { size: 12, weight: "bold" },
      },
      min: 0,
      max: 100,
    },
    y: {
      title: {
        display: true,
        text: "Margin (%)",
        font: { size: 12, weight: "bold" },
      },
      min: 0,
      max: 100,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const point = context.raw as { x: number; y: number; r: number; product: string }
          return [
            `Product: ${point.product}`,
            `Sell-through: ${point.x}%`,
            `Margin: ${point.y}%`,
            `Revenue: Relative size`,
          ]
        },
      },
    },
  },
}

const categoryChartOptions: ChartOptions<"doughnut"> = {
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
          const label = context.label || ""
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${format(value)} (${percentage}%)`
        },
      },
    },
  },
}

const bubbleChartData = computed(() => {
  if (!props.data) return { datasets: [] }

  const products = props.data.top_10_products

  return {
    datasets: [
      {
        label: "Products",
        data: products.map((product) => ({
          x: product.sell_through_percent,
          y: product.gross_margin_percent,
          r: Math.max(5, Math.min(25, product.revenue / 5000)),
          product: product.name,
        })),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
      },
    ],
  }
})

const tableData = computed(() => {
  if (!props.data) return []

  return props.data.top_10_products.map((product) => ({
    sn: product.rank,
    product_name: product.name,
    amount: product.revenue,
    units_sold: product.units_sold,
    avg_price: product.average_price,
    margin: product.gross_margin_percent,
    sell_through: product.sell_through_percent,
    inventory_turnover: product.inventory_turnover ?? 0,
  }))
})

type TProductRow = {
  sn: number
  product_name: string
  amount: number
  units_sold: number
  avg_price: number
  margin: number
  sell_through: number
  inventory_turnover: number | null
}

const COLUMNS: TableColumn<TProductRow>[] = [
  { header: "#", accessor: "sn" },
  { header: "Product", accessor: "product_name" },
  { header: "Revenue", accessor: "amount", cell: ({ value }) => format(Number(value)) },
  { header: "Units Sold", accessor: "units_sold" },
  {
    header: "Avg. Price",
    accessor: "avg_price",
    cell: ({ value }) => format(Number(value)),
  },
  { header: "Margin", accessor: "margin", cell: ({ value }) => `${value}%` },
  { header: "Sell-Through", accessor: "sell_through", cell: ({ value }) => `${value}%` },
  {
    header: "Inv. Turnover",
    accessor: "inventory_turnover",
    cell: ({ value }) => (value ? `${value}x` : "N/A"),
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-xl bg-white shadow">
      <div class="border-b border-gray-200 px-4 py-3">
        <h3 class="mb-1 text-sm font-semibold">Top 10 Products by Revenue</h3>
        <p class="text-xs">
          Ranked by total revenue in January 2026 — with sell-through and margin data
        </p>
      </div>
      <div class="pt-1">
        <DataTable
          :data="tableData"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
          :columns="COLUMNS"
          :show-pagination="false"
        >
        </DataTable>
      </div>
    </div>

    <ReportInsightCard title="Product Insights">
      <p>{{ data?.narratives.product_insight || "N/A" }}</p>
    </ReportInsightCard>

    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Revenue by Category</h3>
          <p class="text-xs">Product category contribution</p>
        </div>
        <div class="px-4 py-6">
          <div class="relative" style="height: 300px">
            <Doughnut :data="categoryChartData" :options="categoryChartOptions" />

            <!-- categories count -->
            <div
              v-show="!isHoveringChart"
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10"
            >
              <p class="text-2xl font-bold">{{ categoryChartData.labels.length }}</p>
              <p class="text-xs text-gray-500">Categories</p>
            </div>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Margin vs Sell-through</h3>
          <p class="text-xs">Bubble size = revenue · Ideal = top-right</p>
        </div>
        <div class="min-h-80 px-4 py-6">
          <div style="height: 320px">
            <Bubble :data="bubbleChartData" :options="bubbleChartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
