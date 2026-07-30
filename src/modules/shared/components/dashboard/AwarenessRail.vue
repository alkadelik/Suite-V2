<template>
  <aside>
    <div class="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div v-if="isPending" class="space-y-4">
        <div class="h-40 animate-pulse rounded-xl bg-gray-100" />
        <div class="h-32 animate-pulse rounded-xl bg-gray-100" />
      </div>

      <div v-else-if="isError" class="p-2 text-sm text-gray-500">
        Couldn't load this panel right now.
      </div>

      <template v-else-if="rail">
        <ReceivablesPanel :data="rail.receivables" />
        <hr class="my-5 border-t border-dashed border-gray-200" />
        <OrdersInFlightPanel :data="rail.ordersInFlight" />
        <hr class="my-5 border-t border-dashed border-gray-200" />
        <PopupsPanel :popups="rail.popups" />
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useGetAwarenessRail } from "./api"
import ReceivablesPanel from "./ReceivablesPanel.vue"
import OrdersInFlightPanel from "./OrdersInFlightPanel.vue"
import PopupsPanel from "./PopupsPanel.vue"

const { data, isPending, isError } = useGetAwarenessRail()
const rail = computed(() => data.value)
</script>
