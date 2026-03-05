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

type TRefundRow = {
  reason: string
  count: number
  amount: number
  percentage: number
  action: string
}

const COLUMNS: TableColumn<TRefundRow>[] = [
  { header: "Reason", accessor: "reason" },
  { header: "Count", accessor: "count" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  { header: "% of Revenue", accessor: "percentage", cell: ({ value }) => `${value}%` },
  { header: "Action", accessor: "action" },
]

const DATA: TRefundRow[] = [
  {
    reason: "Wrong Size",
    count: 45,
    amount: 13500,
    percentage: 67,
    action: "Add size guide popup and offer free exchanges",
  },
  {
    reason: "Damaged Item",
    count: 15,
    amount: 4500,
    percentage: 22,
    action: "Improve packaging and quality checks",
  },
  {
    reason: "Changed Mind",
    count: 7,
    amount: 2100,
    percentage: 10,
    action: "Implement restocking fee to deter frivolous returns",
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <div class="grid grid-cols-2 gap-8 py-4">
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
        <div class="min-h-80 px-4 py-6"></div>
      </div>
    </div>

    <ReportInsightCard title="Operations Insights">
      <template #content>
        <p>
          Fulfillment improved significantly — <b>2.4 days</b> vs <b>3.1</b> in December — likely
          because post-holiday order volume normalized and your logistics partner cleared their
          backlog. The key concern is returns: <b>67%</b> are <b>"wrong size"</b> which is a
          preventable issue. Top returned product: <b>Ankara Wrap Dress</b>. Recommendation: Add a
          measurement guide popup on that product page and consider offering free size exchanges
          instead of refunds to retain revenue. For payments, the pay-on-delivery channel shows
          <b>3.2x higher cancellations</b> — a <b>₦200-300 prepayment discount</b> could shift
          <b>15-20%</b> of POD orders to prepaid, reducing no-shows and improving cash flow.
        </p>
      </template>
    </ReportInsightCard>

    <div class="rounded-xl bg-white shadow">
      <div class="border-b border-gray-200 px-4 py-3">
        <h3 class="mb-1 text-sm font-semibold">Refund & Return Breakdown</h3>
        <p class="text-xs">Understanding why revenue is being returned</p>
      </div>
      <div class="pt-1">
        <DataTable :data="DATA ?? []" :columns="COLUMNS" :show-pagination="false" />
      </div>
    </div>
  </div>
</template>
