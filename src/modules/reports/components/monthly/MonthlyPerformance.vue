<script setup lang="ts">
import { truncateCurrency } from "@/utils/format-currency"
import ReportStatCard from "../ReportStatCard.vue"
import { computed } from "vue"
import { MONTHLY_PERFOMANCE_INSIGHTS } from "@modules/reports/constants"
import ReportInsightCard from "../ReportInsightCard.vue"

const stats = computed(() => {
  const ngnValue = ["Gross Margin", "Avg Order Value", "Discount Impact"]
  return MONTHLY_PERFOMANCE_INSIGHTS.map((stat) => ({
    ...stat,
    value: ngnValue.includes(String(stat.label))
      ? truncateCurrency(Number(stat.value))
      : stat.value,
  }))
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <ReportStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </div>

    <ReportInsightCard title="Performance Insights">
      <template #content>
        <p>
          Your margins are healthy and improving, but growth is being partially offset by rising
          discount absorption and cart abandonment. The highest-leverage fix this month: address
          checkout friction. At <b>34.7% abandonment</b> with <b>62%</b> dropping off at payment,
          adding bank transfer or USSD payment options could recover <b>₦200-350K/month</b>. Also,
          your conversion rate of <b>4.2%</b> suggests your traffic quality is decent but product
          pages aren't closing the sale — consider adding more customer reviews and size-specific
          photos.
        </p>
      </template>
    </ReportInsightCard>

    <div class="grid grid-cols-2 gap-8 py-4">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Revenue Per Day of Week</h3>
          <p class="text-xs">Average daily revenue by weekday</p>
        </div>
        <div class="px-4 py-6"></div>
      </div>
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Transaction Size Distribution</h3>
          <p class="text-xs">How order values are distributed</p>
        </div>
        <div class="min-h-80 px-4 py-6"></div>
      </div>
    </div>

    <div class="rounded-xl bg-white shadow">
      <div class="border-b border-gray-200 px-4 py-3">
        <h3 class="mb-1 text-sm font-semibold">Peak Sales Hours</h3>
        <p class="text-xs">Order volume by day and hour — darker = more orders</p>
      </div>
      <div class="pt-1 pb-6">
        <div class="min-h-80"></div>
        <p class="text-core-600 border-t border-gray-200 px-4 pt-4 text-sm">
          <span class="text-core-800 font-semibold">Peak ordering window:</span>
          <b>Saturdays 12pm - 3pm</b> and <b>Weekday evenings 7pm - 9pm</b>. Consider scheduling
          promotions and social posts <b>1-2 hours</b> before these windows to maximize impact.
        </p>
      </div>
    </div>
  </div>
</template>
