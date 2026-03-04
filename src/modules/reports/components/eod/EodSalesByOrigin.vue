<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import DataTable, { TableColumn } from "@components/DataTable.vue"

interface SalesByOrigin {
  channel: string
  orders: number
  revenue: number
  share: string
}

const COLUMNS: TableColumn<SalesByOrigin>[] = [
  { header: "Channel", accessor: "channel" },
  { header: "Orders", accessor: "orders" },
  {
    header: "Revenue",
    accessor: "revenue",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  { header: "Share", accessor: "share" },
]

const DATA = [
  { channel: "Instagram DM", orders: 10, revenue: 150000, share: "68.7%" },
  { channel: "Website", orders: 5, revenue: 50000, share: "22.9%" },
  { channel: "Whatsapp", orders: 2, revenue: 15000, share: "6.8%" },
  { channel: "Walk-in", orders: 3, revenue: 20000, share: "2.9%" },
  { channel: "Facebook", orders: 1, revenue: 1000, share: "1.0%" },
]
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">05</span>
      <h3 class="text-base font-semibold text-gray-900">Sales by Origin</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Channel Mix</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-2 gap-8 py-4">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Revenue by Channel</h3>
          <p class="text-xs">17 orders &bull; {{ formatCurrency(218400) }} total</p>
        </div>
        <div class="flex min-h-[280px] items-center justify-center">
          <!-- pie chart -->
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Channel Breakdown</h3>
          <p class="text-xs">Orders, revenue, and share</p>
        </div>
        <div>
          <DataTable :columns="COLUMNS" :data="DATA" :show-pagination="false" />
        </div>
      </div>
    </div>
  </section>
</template>
