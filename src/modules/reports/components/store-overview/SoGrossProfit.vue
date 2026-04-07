<script setup lang="ts">
import { computed } from "vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import DonutChart from "@components/DonutChart.vue"
import { SO_GROSS_PROFIT, SO_GROSS_PROFIT_EMPTY } from "../../constants"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

const props = defineProps<{ useDummyData: boolean }>()
const { format } = useFormatCurrency()

const data = computed(() => (props.useDummyData ? SO_GROSS_PROFIT : SO_GROSS_PROFIT_EMPTY))

const displayValue = computed(() => format(data.value.value))
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

        <Chip v-if="data.percentageChange > 0" color="success" size="sm" class="mt-3">
          <Icon name="arrow-up-square" size="14" class="mr-1" />
          {{ data.percentageChange }}% vs last month
        </Chip>
      </div>

      <div class="flex flex-1 items-center justify-center rounded-xl bg-gray-50 p-6 lg:p-8">
        <DonutChart :percentage="data.marginPercent" label="Gross Margin" color="#22c55e" />
      </div>
    </div>
  </section>
</template>
