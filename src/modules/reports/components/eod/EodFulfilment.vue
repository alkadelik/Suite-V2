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
            <div
              v-for="courier in data?.courier_performance ?? []"
              :key="courier.courier"
              class="flex items-center justify-between gap-4 px-4 py-5"
            >
              <p class="text-sm font-medium">{{ courier.courier }}</p>
              <p class="text-xs">
                <b>{{ courier.orders }}</b> shipment{{ courier.orders !== 1 ? "s" : "" }}
                <span v-if="courier.delivered > 0" class="text-success-700">
                  &bull; {{ ((courier.delivered / courier.orders) * 100).toFixed(0) }}% delivered
                </span>
                <span v-if="courier.pending > 0" class="text-warning-700">
                  &bull; {{ courier.pending }} pending
                </span>
              </p>
            </div>
            <!--  -->
            <div class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-semibold">Total Shipping Today</p>
              <p class="text-success-700 text-sm font-semibold">
                {{ formatCurrency(data?.summary?.total_shipping_costs ?? 0, { kobo: true }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Pending Orders → Monday</h3>
          <p class="text-xs">
            {{ data?.pending_orders?.length ?? 0 }} orders carrying over &bull;
            {{
              formatCurrency(
                data?.pending_orders?.reduce((sum, order) => sum + order.amount, 0) ?? 0,
                { kobo: true },
              )
            }}
            at stake
          </p>
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

    <ReportInsightCard v-if="data?.narratives?.fulfilment_insight" title="Delivery Exceptions">
      <p class="text-sm">
        {{ data?.narratives?.fulfilment_insight }}
      </p>
    </ReportInsightCard>
  </section>
</template>
