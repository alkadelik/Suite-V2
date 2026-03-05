<script setup lang="ts">
import DataTable, { TableColumn } from "@components/DataTable.vue"
import { formatCurrency } from "@/utils/format-currency"
import { TMonthlyProductRow } from "@modules/reports/types"
import { MONTHLY_TOP_PRODUCTS } from "@modules/reports/constants"
import ReportInsightCard from "../ReportInsightCard.vue"

const COLUMNS: TableColumn<TMonthlyProductRow>[] = [
  { header: "#", accessor: "sn" },
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
        <DataTable :data="MONTHLY_TOP_PRODUCTS ?? []" :columns="COLUMNS" :show-pagination="false">
        </DataTable>
      </div>
    </div>

    <ReportInsightCard title="Product Insights">
      <template #content>
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
      </template>
    </ReportInsightCard>

    <div class="grid grid-cols-2 gap-8 py-4">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Revenue by Category</h3>
          <p class="text-xs">Product category contribution</p>
        </div>
        <div class="px-4 py-6"></div>
      </div>
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Margin vs Sell-through</h3>
          <p class="text-xs">Bubble size = revenue · Ideal = top-right</p>
        </div>
        <div class="min-h-80 px-4 py-6"></div>
      </div>
    </div>
  </div>
</template>
