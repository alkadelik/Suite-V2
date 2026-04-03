<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import { IEODReport } from "@modules/reports/types"

defineProps<{ data: IEODReport | null }>()
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">07</span>
      <h3 class="text-base font-semibold text-gray-900">Inventory Movement</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Stock</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Today's Stock Flow</h3>
          <p class="text-xs">Opening → Changes → Closing balance</p>
        </div>
        <div class="flex flex-wrap items-center justify-around px-4 py-6">
          <div>
            <p class="font-sato! mb-2 text-3xl font-semibold">
              {{ (data?.inventory_flow?.opening_stock ?? 0).toLocaleString() }}
            </p>
            <p class="text-core-600 text-xs">Opening</p>
          </div>
          <Icon name="arrow-right" class="text-core-400" />
          <div>
            <p class="text-error-600 font-sato! mb-2 text-3xl font-semibold">
              {{ (data?.inventory_flow?.units_sold ?? 0).toLocaleString() }}
            </p>
            <p class="text-core-600 text-xs">Sold</p>
          </div>
          <Icon name="arrow-right" class="text-core-400" />
          <div>
            <p class="font-sato! mb-2 text-3xl font-semibold text-green-600">
              {{ (data?.inventory_flow?.units_returned ?? 0).toLocaleString() }}
            </p>
            <p class="text-core-600 text-xs">Returned</p>
          </div>
          <Icon name="arrow-right" class="text-core-400" />
          <div>
            <p class="font-sato! mb-2 text-3xl font-semibold text-blue-600">
              {{ (data?.inventory_flow?.units_restocked ?? 0).toLocaleString() }}
            </p>
            <p class="text-core-600 text-xs">Restocked</p>
          </div>
          <Icon name="arrow-right" class="text-core-400" />
          <div>
            <p class="font-sato! mb-2 text-3xl font-semibold">
              {{ (data?.inventory_flow?.closing_stock ?? 0).toLocaleString() }}
            </p>
            <p class="text-core-600 text-xs">Closing</p>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Low Stocks Alerts</h3>
          <p class="text-xs">Products below reorder threshold</p>
        </div>
        <div v-if="data?.low_stock_alerts?.length" class="w-full space-y-4 px-4 py-6">
          <!--  -->
          <div
            v-for="(low, v) in data?.low_stock_alerts"
            :key="v"
            class="bg-error-50 border-error-200 flex items-center justify-between gap-4 rounded-xl border px-4 py-4"
            :class="
              low.status === 'critical'
                ? 'bg-error-50 border-error-200'
                : 'bg-warning-50 border-warning-200'
            "
          >
            <p class="text-sm font-medium">{{ low.product_name }}</p>
            <p class="text-error-600 text-xs">
              {{ low.current_stock.toLocaleString() }} left &bull; {{ low.status }}
            </p>
          </div>
        </div>

        <EmptyState
          v-else
          title="No low stock alerts"
          description="All products are above their reorder thresholds."
          class="!min-h-[25vh] py-4! shadow-none!"
        />
      </div>
    </div>
  </section>
</template>
