<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import { EOD_ORDER_COLUMNS } from "@modules/reports/constants"
import { IEODReport } from "@modules/reports/types"
import { useMediaQuery } from "@vueuse/core"

const isMobile = useMediaQuery("(max-width: 768px)")
defineProps<{ data: IEODReport | null }>()
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">11</span>
      <h3 class="text-base font-semibold text-gray-900">Orders</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase"
        >{{ data?.orders?.length ?? 0 }} orders</span
      >
    </header>
    <!-- content -->
    <div class="space-y-6 py-4">
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <DataTable
          :columns="EOD_ORDER_COLUMNS"
          :data="data?.orders ?? []"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
          :show-pagination="false"
        />
      </div>
    </div>
  </section>
</template>
