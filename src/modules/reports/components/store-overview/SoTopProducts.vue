<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import EmptyState from "@components/EmptyState.vue"
import { SO_TOP_PRODUCT_COLUMNS } from "../../constants"
import type { TStoreOverviewProduct } from "../../types"

defineProps<{ products: TStoreOverviewProduct[] }>()
</script>

<template>
  <section class="-mx-4 bg-white md:mx-0 md:rounded-xl md:border md:border-gray-200">
    <div class="border-b border-gray-200 px-5 py-4 md:px-6">
      <h3 class="text-core-800 text-base font-semibold">Top 10 Products by Revenue</h3>
      <p class="text-core-600 mt-1 text-sm">
        Ranked by total revenue — with sell-through and margin data
      </p>
    </div>

    <template v-if="products.length > 0">
      <DataTable
        :data="products"
        :columns="SO_TOP_PRODUCT_COLUMNS"
        :show-pagination="false"
        :show-mobile-view="false"
        :fix-first-column="true"
      >
        <template #cell:sell_through="{ item }">
          <div class="flex items-center gap-2">
            <div class="relative h-2 w-20 overflow-hidden rounded-full bg-gray-200">
              <div
                class="bg-primary-600 absolute top-0 left-0 h-2 rounded-full"
                :style="{ width: `${item.sell_through}%` }"
              />
            </div>
            <span class="text-xs">{{ item.sell_through }}%</span>
          </div>
        </template>
      </DataTable>
    </template>

    <EmptyState
      v-else
      title="No product sales recorded in the last 30 days."
      description=""
      class="!min-h-[40vh]"
    >
      <template #image>
        <img src="@/assets/images/empty-store.svg?url" class="mx-auto mb-4" />
      </template>
    </EmptyState>
  </section>
</template>
