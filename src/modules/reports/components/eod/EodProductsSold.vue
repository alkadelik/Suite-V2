<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import { EOD_PRODUCTS_SOLD_COLUMNS } from "@modules/reports/constants"
import { IEODReport } from "@modules/reports/types"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)
defineProps<{ data: IEODReport | null }>()
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">10</span>
      <h3 class="text-base font-semibold text-gray-900">Products Sold</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase"
        >{{ data?.products_sold?.length ?? 0 }} items</span
      >
    </header>
    <!-- content -->
    <div class="space-y-6 py-4">
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <DataTable
          :columns="EOD_PRODUCTS_SOLD_COLUMNS"
          :data="data?.products_sold ?? []"
          :show-pagination="false"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
        />
      </div>
    </div>
  </section>
</template>
