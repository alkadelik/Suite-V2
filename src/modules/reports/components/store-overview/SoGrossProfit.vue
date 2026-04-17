<script setup lang="ts">
import { computed } from "vue"
import DonutChart from "@components/DonutChart.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

const props = defineProps<{
  value: number
  marginPercent: number
  percentageChange?: number | null
}>()

const { format } = useFormatCurrency()

const displayValue = computed(() => format(props.value))
</script>

<template>
  <section class="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
      <div class="flex-1">
        <h3 class="text-core-800 text-base font-semibold">Gross Profit (₦)</h3>
        <p class="text-core-600 mt-1 text-sm">
          Absolute naira value earned above cost of goods, before any operating expenses
        </p>

        <p class="text-core-800 font-outfit mt-4 text-3xl font-bold md:text-4xl">
          <span class="text-lg font-normal">₦</span>{{ displayValue.replace("₦", "") }}
        </p>

        <p
          v-if="props.percentageChange != null"
          class="mt-2 text-sm font-medium"
          :class="props.percentageChange >= 0 ? 'text-success-600' : 'text-error-600'"
        >
          {{ props.percentageChange >= 0 ? "+" : "" }}{{ props.percentageChange }}% vs last period
        </p>
      </div>

      <div class="flex flex-1 items-center justify-center rounded-xl bg-gray-50 p-6 lg:p-8">
        <DonutChart :percentage="marginPercent" label="Gross Margin" color="#22c55e" />
      </div>
    </div>
  </section>
</template>
