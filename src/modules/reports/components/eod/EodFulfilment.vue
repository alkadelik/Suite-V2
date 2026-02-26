<script setup lang="ts">
import StatCard from "@components/StatCard.vue"
import { EOD_FINANCIAL_DATA } from "../../constants"
import Icon from "@components/Icon.vue"

const stats = EOD_FINANCIAL_DATA.map((item) => ({
  icon: "moneys",
  label: item.label,
  value: item.value,
  valueText: item.meta,
  percentage: item.percentage || undefined,
}))
</script>

<template>
  <section>
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">07</span>
      <h3 class="text-base font-semibold text-gray-900">Fulfilment & Couriers</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Logistics</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-2 gap-3 py-4 md:grid-cols-3 xl:grid-cols-6">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :stat="stat"
        class="md:!border-white md:!bg-white"
      />
    </div>
    <div class="rounded-r-lg border border-l-4 border-gray-200 border-l-gray-600 bg-white p-4">
      <h4 class="mb-3 flex items-center gap-2 text-xs font-medium uppercase">
        <Icon name="box-filled" class="text-warning-400" size="16" /> Delivery Exceptions
      </h4>
      <p class="text-sm">
        <b>Order #1038</b> (Abuja, <b>₦18,200</b>) — GIG attempted delivery at <b>3:45pm</b> but
        customer was not available. Rescheduled for <b>Monday</b>. Recommendation: Send the customer
        a WhatsApp confirming the Monday delivery window to avoid a second failed attempt, which
        would trigger a <b>return</b>.
      </p>
    </div>
  </section>
</template>
