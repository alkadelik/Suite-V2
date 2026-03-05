<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import ReportStatCard, { IReportStat } from "../ReportStatCard.vue"
import { computed } from "vue"
import DataTable, { TableColumn } from "@components/DataTable.vue"
import ReportInsightCard from "../ReportInsightCard.vue"
import { useMediaQuery } from "@vueuse/core"

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const stats = computed(() => {
  const data: IReportStat[] = [
    {
      label: "Avg. Fulfilment Time",
      value: "2.4 days",
      percentage: 23,
      percentageText: "from 3.1 days in Dec",
      caption: "Order placed → delivered",
    },
    {
      label: "On-Time Delivery",
      value: "95%",
      percentage: 5,
      percentageText: "from 90% in Dec",
    },
    {
      label: "Returns Rate",
      value: "4.6%",
      caption: "18 returns · 12 wrong size",
    },
    {
      label: "Cancelation Rate",
      value: "2.1%",
      caption: "8 orders cancelled pre-shipment",
    },
  ]

  return isMobile.value ? data.slice(0, 2) : data
})

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

type TDailyRevenue = {
  day: string
  revenue: number
  color: string
  percentage?: number
}

const dailyRevenueData = computed<TDailyRevenue[]>(() => {
  const data: TDailyRevenue[] = [
    { day: "Mon", revenue: 28500, color: "bg-blue-500" },
    { day: "Tue", revenue: 32100, color: "bg-blue-500" },
    { day: "Wed", revenue: 45200, color: "bg-success-500" },
    { day: "Thu", revenue: 38900, color: "bg-blue-500" },
    { day: "Fri", revenue: 52300, color: "bg-success-500" },
    { day: "Sat", revenue: 48700, color: "bg-success-500" },
    { day: "Sun", revenue: 35400, color: "bg-blue-500" },
  ]

  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return data.map((d) => ({
    ...d,
    percentage: (d.revenue / maxRevenue) * 100,
  })) as TDailyRevenue[]
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Payment Methods</h3>
          <p class="text-xs">Revenue by payment channel</p>
        </div>
        <div class="px-4 py-6">
          <div class="space-y-6 border-b border-gray-200 pb-4">
            <div
              v-for="x in ['Card', 'Bank Transfer', 'Pay on Delivery']"
              :key="x"
              class="grid grid-cols-4 items-center gap-6"
            >
              <p class="text-right text-sm">{{ x }}</p>
              <!-- percentage line -->
              <div class="col-span-2">
                <div class="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    class="absolute top-0 left-0 h-2 rounded-full"
                    :class="
                      x === 'Card'
                        ? 'bg-success-400'
                        : x === 'Bank Transfer'
                          ? 'bg-blue-400'
                          : 'bg-warning-400'
                    "
                    :style="{
                      width: x === 'Card' ? '80%' : x === 'Bank Transfer' ? '28%' : '10%',
                    }"
                  />
                </div>
              </div>
              <!--  -->
              <p class="text-sm font-semibold break-keep">
                {{ formatCurrency(x === "Card" ? 108000 : x === "Bank Transfer" ? 38200 : 4500) }}
              </p>
            </div>
          </div>
          <p class="text-core-600 mt-4 text-sm italic">
            Pay-on-delivery has 3.2x higher cancellation rate than card. Consider incentivizing
            prepayment with a small discount.
          </p>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Daily Revenue Trends</h3>
          <p class="text-xs">Revenue per days across January</p>
        </div>
        <div class="min-h-80 px-4 py-6">
          <!-- horizontal bar chart -->
          <div class="space-y-4">
            <div v-for="day in dailyRevenueData" :key="day.day" class="flex items-center gap-4">
              <span class="w-10 text-right text-sm font-medium text-gray-700">{{ day.day }}</span>
              <div class="relative flex-1">
                <div class="h-8 w-full overflow-hidden rounded bg-gray-100">
                  <div
                    class="flex h-full items-center rounded transition-all duration-300"
                    :class="day.color"
                    :style="{ width: `${day.percentage}%` }"
                  >
                    <span class="ml-2 text-xs font-semibold text-white">
                      {{ formatCurrency(day.revenue) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p class="text-core-600 mt-4 text-sm italic">
            Instagram-driven sales grew 18% — your Reels strategy is working. WhatsApp catalog
            orders are new but promising.
          </p>
        </div>
      </div>
    </div>

    <ReportInsightCard title="Operations Insights">
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
    </ReportInsightCard>

    <div class="rounded-xl bg-white shadow">
      <div class="border-b border-gray-200 px-4 py-3">
        <h3 class="mb-1 text-sm font-semibold">Refund & Return Breakdown</h3>
        <p class="text-xs">Understanding why revenue is being returned</p>
      </div>
      <div class="pt-1">
        <DataTable
          :data="DATA ?? []"
          :columns="COLUMNS"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
          :show-pagination="false"
        />
      </div>
    </div>
  </div>
</template>
