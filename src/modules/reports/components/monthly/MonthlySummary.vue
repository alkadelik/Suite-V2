<script setup lang="ts">
import { formatCurrency, truncateCurrency } from "@/utils/format-currency"
import ReportStatCard from "../ReportStatCard.vue"
import { computed } from "vue"
import { MONTHLY_SUMMARY_STATS } from "@modules/reports/constants"
import DataTable, { TableColumn } from "@components/DataTable.vue"
import ReportInsightCard from "../ReportInsightCard.vue"

const stats = computed(() =>
  MONTHLY_SUMMARY_STATS.map((stat) => ({
    ...stat,
    value: truncateCurrency(Number(stat.value)),
  })),
)

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
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <ReportInsightCard title="What this Mean">
      <template #content>
        <p>
          Your revenue grew faster than your costs — a healthy sign. COGS rose <b>8.1%</b> vs
          revenue's <b>14.2%</b>, meaning your sourcing efficiency improved or your product mix
          shifted toward higher-margin items. The refund spike (<b>+22%</b>) is the one flag here:
          <b>12 of 18</b> refunded orders were in the <b>"wrong size"</b> category. This suggests
          your size guide may need updating, especially for the new Ankara line. Fixing this alone
          could recover <b>~₦85K/month</b> in lost revenue and processing costs.
        </p>
      </template>
    </ReportInsightCard>

    <div class="grid grid-cols-2 gap-8 py-4">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Weekly Revenue & Expenses</h3>
          <p class="text-xs">Sales vs expenses by week of January</p>
        </div>
        <div class="px-4 py-6"></div>
      </div>
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Daily Revenue Trend</h3>
          <p class="text-xs">Revenue per day across January</p>
        </div>
        <div class="min-h-80 px-4 py-6"></div>
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
