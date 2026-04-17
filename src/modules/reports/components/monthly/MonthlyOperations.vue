<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import ReportStatCard, { IReportStat } from "../ReportStatCard.vue"
import { computed } from "vue"
import DataTable, { TableColumn } from "@components/DataTable.vue"
import ReportInsightCard from "../ReportInsightCard.vue"
import { useMediaQuery } from "@vueuse/core"
import { IMonthlyReport, TRefundRow } from "@modules/reports/types"
import { Bar } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{ data: IMonthlyReport | null }>()
const { format } = useFormatCurrency()

const isMobile = useMediaQuery("(max-width: 768px)")

const stats = computed(() => {
  if (!props.data) return []

  const ops = props.data.operations_kpis

  const data: IReportStat[] = [
    {
      label: "Avg. Fulfilment Time",
      value: ops.avg_fulfilment_time_days ? `${ops.avg_fulfilment_time_days} days` : "N/A",
      caption: "Order placed → delivered",
    },
    {
      label: "On-Time Delivery",
      value: ops.on_time_delivery_rate_percent ? `${ops.on_time_delivery_rate_percent}%` : "N/A",
      caption: "Delivery performance",
    },
    {
      label: "Returns Rate",
      value: `${ops.returns_rate_percent}%`,
      caption: `${props.data.refund_breakdown.count} returns`,
    },
    {
      label: "Cancelation Rate",
      value: `${ops.cancellation_rate_percent}%`,
      caption: "Pre-shipment cancels",
    },
  ]

  return isMobile.value ? data.slice(0, 2) : data
})

const COLUMNS: TableColumn<TRefundRow>[] = [
  { header: "Reason", accessor: "reason" },
  { header: "Count", accessor: "count" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => format(Number(value)),
  },
  { header: "% of Total", accessor: "percentage", cell: ({ value }) => `${value}%` },
]

const refundData = computed(() => {
  if (!props.data || props.data.refund_breakdown.insufficient_data) return []

  return props.data.refund_breakdown.by_reason ?? []
})

const paymentMethods = computed(() => {
  if (!props.data) return []

  const colors = ["#85E13A", "#53B1FD", "#A48AFB", "#FDB022", "#F97066", "#B2836B"]

  return props.data.analysis.payments.map((payment, index) => ({
    method: payment.mode,
    amount: payment.amount,
    percentage: payment.percent_collected,
    color: colors[index % colors.length],
  }))
})

const formattedPeriod = computed(() => {
  if (!props.data?.period) return ""
  return new Date(props.data.period.year, props.data.period.month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
})

const channelRevenueData = computed(() => {
  // Mock data - replace with actual data from props.data later
  return [
    { channel: "WhatsApp", revenue: 450000, color: "#85E13A" },
    { channel: "Website", revenue: 320000, color: "#53B1FD" },
    { channel: "Instagram", revenue: 280000, color: "#A48AFB" },
    { channel: "Walk-in", revenue: 180000, color: "#FDB022" },
    { channel: "Facebook", revenue: 120000, color: "#F97066" },
    { channel: "Other", revenue: 50000, color: "#B2836B" },
  ]
})

const channelChartData = computed(() => {
  const channels = channelRevenueData.value

  return {
    labels: channels.map((c) => c.channel),
    datasets: [
      {
        data: channels.map((c) => c.revenue),
        backgroundColor: channels.map((c) => c.color),
        borderWidth: 0,
      },
    ],
  }
})

const channelChartOptions: ChartOptions<"bar"> = {
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          return ` ${format(Number(context.parsed.x))}`
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        callback: (value) => {
          const num = Number(value)
          if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
          if (num >= 1000) return `₦${(num / 1000).toFixed(0)}K`
          return `₦${num}`
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 12,
        },
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
              v-for="payment in paymentMethods"
              :key="payment.method"
              class="grid grid-cols-4 items-center gap-6"
            >
              <p class="text-right text-sm">{{ payment.method }}</p>
              <!-- percentage line -->
              <div class="col-span-2">
                <div class="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    class="absolute top-0 left-0 h-2 rounded-full"
                    :style="{ width: `${payment.percentage}%`, backgroundColor: payment.color }"
                  />
                </div>
              </div>
              <!--  -->
              <p class="text-sm font-semibold break-keep">
                {{ format(payment.amount) }}
              </p>
            </div>
          </div>
          <p class="text-core-600 mt-4 text-sm italic">
            {{ data?.insights.payments.join(" ") }}
          </p>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Daily Revenue Trend [MOCK DATA]</h3>
          <p class="text-xs">Revenue distribution across channels in {{ formattedPeriod }}</p>
        </div>
        <div class="px-4 py-6">
          <div style="height: 320px">
            <Bar :data="channelChartData" :options="channelChartOptions" />
          </div>

          <p class="text-core-600 mt-4 text-sm italic">
            {{ data?.insights.channels.join(" ") }}
          </p>
        </div>
      </div>
    </div>

    <ReportInsightCard title="Operations Insights">
      <p>
        {{ data?.narratives.operations_insight }}
      </p>
    </ReportInsightCard>

    <div class="rounded-xl bg-white shadow">
      <div class="border-b border-gray-200 px-4 py-3">
        <h3 class="mb-1 text-sm font-semibold">Refund & Return Breakdown</h3>
        <p class="text-xs">Understanding why revenue is being returned</p>
      </div>
      <div class="pt-1">
        <DataTable
          :data="refundData ?? []"
          :columns="COLUMNS"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
          :show-pagination="false"
        />
      </div>
    </div>
  </div>
</template>
