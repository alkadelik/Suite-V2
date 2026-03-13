<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { computed, h } from "vue"
import Chip from "@components/Chip.vue"
import DataTable, { TableColumn } from "@components/DataTable.vue"
import ReportStatCard, { IReportStat } from "../ReportStatCard.vue"
import { useMediaQuery } from "@vueuse/core"
import ReportInsightCard from "../ReportInsightCard.vue"
import { IEODReport, TEodPendingOrder } from "@modules/reports/types"

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)
const props = defineProps<{ data: IEODReport | null }>()

const stats = computed(() => {
  const { fulfillment_metrics, summary } = props.data || {}

  const data: IReportStat[] = [
    {
      label: "Orders Fulfilled",
      value: fulfillment_metrics?.delivered_today ?? 0,
      caption: `of ${summary?.order_count ?? 0} total`,
    },
    {
      label: "Pending Fulfilment",
      value: fulfillment_metrics?.pending_fulfillment ?? 0,
      // caption: "3 awaiting payment · 2 stock",
    },
    {
      label: "Delivered Today",
      value: fulfillment_metrics?.delivered_today ?? 0,
      caption: "From previous days",
    },
    {
      label: "Returns Received",
      value: fulfillment_metrics?.returns_received ?? 0,
      caption: "Refund processed same-day",
    },
    // {
    //   label: "Delivered Exceptions",
    //   value: fulfillment_metrics?.delivered_exceptions ?? 0,
    //   caption: "Customer not available (Abuja)",
    // },
  ]
  return isMobile.value ? data.slice(0, 2) : data
})

const COLUMNS: TableColumn<TEodPendingOrder>[] = [
  { header: "Order", accessor: "order_number" },
  {
    header: "Issue",
    accessor: "issue",
    cell: ({ item }) =>
      h(Chip, {
        label: startCase(String(item.issue)),
        color: item.issue === "awaiting_payment" ? "alt" : "warning",
        radius: "md",
      }),
  },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  {
    header: "Action",
    accessor: "action",
    cell: ({ item }) =>
      h(Chip, {
        label: startCase(String(item.action)),
        color: item.action === "send_reminder" ? "blue" : "warning",
      }),
  },
]
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">06</span>
      <h3 class="text-base font-semibold text-gray-900">Fulfilment & Couriers</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Logistics</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-2 gap-3 py-4 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard
        v-for="stat in stats"
        :key="stat.label"
        :stat="stat"
        class="md:!border-white md:!bg-white"
      />
    </div>

    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Courier Performance</h3>
          <p class="text-xs">Shipments handed off today</p>
        </div>
        <div class="flex p-6">
          <div class="w-full divide-y divide-gray-200 rounded-xl bg-gray-100">
            <!--  -->
            <div v-for="v in 3" :key="v" class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-medium">GIG Logistics</p>
              <p class="text-xs">
                <b>9</b> shipments <b>{{ formatCurrency(10800) }}</b> costs
                <span class="text-success-700">100% on time</span>
              </p>
            </div>
            <!--  -->
            <div class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-semibold">Total Shipping Today</p>
              <p class="text-success-700 text-sm font-semibold">
                {{ formatCurrency(10800 * 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Pending Orders → Monday</h3>
          <p class="text-xs">5 orders carrying over &bull; {{ formatCurrency(4500) }} at stake</p>
        </div>
        <div>
          <DataTable
            :columns="COLUMNS"
            :data="data?.pending_orders ?? []"
            :show-mobile-view="false"
            :fix-first-column="isMobile"
            :show-pagination="false"
            :empty-state="{ class: '!h-[25vh]' }"
          />
        </div>
      </div>
    </div>

    <ReportInsightCard title="Delivery Exceptions">
      <p class="text-sm">
        <b>Order #1038</b> (Abuja, <b>₦18,200</b>) — GIG attempted delivery at <b>3:45pm</b> but
        customer was not available. Rescheduled for <b>Monday</b>. Recommendation: Send the customer
        a WhatsApp confirming the Monday delivery window to avoid a second failed attempt, which
        would trigger a <b>return</b>.
      </p>
    </ReportInsightCard>
  </section>
</template>
