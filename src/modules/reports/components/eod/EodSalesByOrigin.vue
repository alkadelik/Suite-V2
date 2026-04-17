<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import DataTable, { TableColumn } from "@components/DataTable.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"
import { IEODReport, TEodSalesByOrigin } from "@modules/reports/types"

const props = defineProps<{ data: IEODReport | null }>()

const COLUMNS: TableColumn<TEodSalesByOrigin>[] = [
  { header: "Channel", accessor: "origin_name" },
  { header: "Orders", accessor: "order_count" },
  {
    header: "Revenue",
    accessor: "revenue",
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  {
    header: "Share",
    accessor: "percent_of_revenue",
    cell: ({ value }) => `${Number(value).toFixed(1)}%`,
  },
]

const totalOrders = computed(() => {
  return props.data?.sales_by_origin?.reduce((sum, item) => sum + item.order_count, 0) ?? 0
})

const totalRevenue = computed(() => {
  return props.data?.sales_by_origin?.reduce((sum, item) => sum + item.revenue, 0) ?? 0
})

const isMobile = useMediaQuery("(max-width: 768px)")
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
    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Revenue by Channel</h3>
          <p class="text-xs">
            {{ totalOrders }} orders &bull; {{ formatCurrency(totalRevenue, { kobo: true }) }} total
          </p>
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
          <DataTable
            :columns="COLUMNS"
            :data="data?.sales_by_origin ?? []"
            :show-mobile-view="false"
            :fix-first-column="isMobile"
            :show-pagination="false"
          />
        </div>
      </div>
    </div>
  </section>
</template>
