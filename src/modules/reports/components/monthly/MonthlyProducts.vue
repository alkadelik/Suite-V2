<script setup lang="ts">
import DataTable, { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"
import { TMonthlyProductRow } from "@modules/reports/types"
import { MONTHLY_TOP_PRODUCTS } from "@modules/reports/constants"
import ReportInsightCard from "../ReportInsightCard.vue"
import { computed } from "vue"
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

ChartJS.register(ArcElement, Tooltip, Legend, LinearScale, PointElement)

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const categoryChartData = {
  labels: ["Traditional Wear", "Accessories", "Footwear", "Modern Fusion", "Jewelry"],
  datasets: [
    {
      data: [450000, 180000, 120000, 95000, 75000],
      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"],
      borderWidth: 2,
      borderColor: "#ffffff",
    },
  ],
}

const categoryChartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
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
          return `${label}: ${formatCurrency(value)} (${percentage}%)`
        },
      },
    },
  },
}

const bubbleChartData = {
  datasets: [
    {
      label: "Products",
      data: [
        { x: 94, y: 62, r: 15, product: "Adire Bucket Hat" },
        { x: 78, y: 58, r: 25, product: "Ankara Maxi Dress" },
        { x: 85, y: 55, r: 20, product: "Aso-Oke Gele" },
        { x: 72, y: 48, r: 12, product: "Dashiki Shirt" },
        { x: 65, y: 52, r: 18, product: "Kente Bag" },
        { x: 48, y: 45, r: 10, product: "Agbada Set" },
        { x: 88, y: 60, r: 14, product: "Beaded Necklace" },
        { x: 70, y: 50, r: 16, product: "Traditional Sandals" },
      ],
      backgroundColor: "rgba(59, 130, 246, 0.6)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 2,
    },
  ],
}

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
      min: 40,
      max: 100,
    },
    y: {
      title: {
        display: true,
        text: "Margin (%)",
        font: { size: 12, weight: "bold" },
      },
      min: 40,
      max: 70,
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

const COLUMNS: TableColumn<TMonthlyProductRow>[] = [
  //   { header: "#", accessor: "sn" },
  { header: "Product", accessor: "product_name" },
  { header: "Revenue", accessor: "amount", cell: ({ value }) => formatCurrency(Number(value)) },
  { header: "Units Sold", accessor: "units_sold" },
  {
    header: "Avg. Price",
    accessor: "avg_price",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  { header: "Margin", accessor: "margin", cell: ({ value }) => `${value}%` },
  { header: "Sell-Through", accessor: "sell_through", cell: ({ value }) => `${value}%` },
  { header: "Inv. Turnover", accessor: "inventory_turnover", cell: ({ value }) => `${value}x` },
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
          :data="MONTHLY_TOP_PRODUCTS ?? []"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
          :columns="COLUMNS"
          :show-pagination="false"
        >
        </DataTable>
      </div>
    </div>

    <ReportInsightCard title="Product Insights">
      <p>
        Three standout stories here: (1) The <b>Adire Bucket Hat at #3</b> with
        <b>94% sell-through</b> and <b>62% margin</b> is your efficiency champion — consider
        expanding to other colors/patterns. (2) The <b>Agbada Set at #8</b> has the lowest
        sell-through (<b>48%</b>) and turnover (<b>2.1x</b>) — at <b>₦23K</b> it's a slow mover
        tying up capital. Consider made-to-order instead of holding stock. (3) Your
        <b>top 3 products</b> generate <b>41% of total revenue</b> — this concentration means a
        stockout in any of them would significantly hurt monthly numbers. Maintain a
        <b>2-week safety stock</b> on these items.
      </p>
    </ReportInsightCard>

    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Revenue by Category</h3>
          <p class="text-xs">Product category contribution</p>
        </div>
        <div class="px-4 py-6">
          <div style="height: 300px">
            <Doughnut :data="categoryChartData" :options="categoryChartOptions" />
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
