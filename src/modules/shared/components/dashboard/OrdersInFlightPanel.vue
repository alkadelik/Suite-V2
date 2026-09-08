<template>
  <section>
    <h3 class="text-core-800 font-sato mb-3 text-base font-semibold">Orders in flight</h3>
    <div class="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
      >
        <span class="text-core-700 text-sm">{{ item.label }}</span>
        <span class="text-core-900 font-semibold">{{ item.value }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { IOrdersInFlight } from "./types"

const props = defineProps<{ data: IOrdersInFlight }>()

const items = computed(() => [
  { label: "Out for delivery", value: props.data.outForDelivery },
  { label: "Waiting to be collected", value: props.data.waitingToBeCollected },
  { label: "Delivered today", value: props.data.deliveredToday },
])
</script>
