<script setup lang="ts">
import { computed } from "vue"
import InfoBox from "@components/InfoBox.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import type { TEbitdaBreakdownItem } from "../../types"

const props = withDefaults(
  defineProps<{
    value: number
    hasExpenses: boolean
    prompt?: string | null
    percentageChange?: number | null
    breakdown?: TEbitdaBreakdownItem[]
  }>(),
  {
    breakdown: () => [],
  },
)

const { format, truncate } = useFormatCurrency()

const ebitdaValue = computed(() => (props.value > 0 ? truncate(props.value) : format(0)))

const maxBarValue = computed(() => Math.max(...props.breakdown.map((item) => item.value), 1))

const revenueItem = computed(() => props.breakdown.find((item) => item.isPositive))
const expenseItems = computed(() => props.breakdown.filter((item) => !item.isPositive))
</script>

<template>
  <section class="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
      <div class="flex-1">
        <h3 class="text-core-800 text-base font-semibold">EBITDA</h3>
        <p class="text-core-600 mt-1 text-sm">
          Total Sales &minus; Cost of Goods Sold &minus; Expenses &minus; Shipping
        </p>

        <p class="text-core-800 font-outfit mt-4 text-3xl font-bold md:text-4xl">
          <span class="text-lg font-normal">₦</span>{{ ebitdaValue.replace("₦", "") }}
        </p>

        <p
          v-if="props.percentageChange != null"
          class="mt-2 text-sm font-medium"
          :class="props.percentageChange >= 0 ? 'text-success-600' : 'text-error-600'"
        >
          {{ props.percentageChange >= 0 ? "+" : "" }}{{ props.percentageChange }}% vs last period
        </p>

        <InfoBox v-if="!hasExpenses && prompt" variant="warning" :message="prompt" class="mt-4" />
      </div>

      <div v-if="breakdown.length > 0" class="flex-1 rounded-xl bg-gray-50">
        <!-- Revenue row -->
        <div v-if="revenueItem" class="flex items-center gap-3 p-5 pb-4">
          <span class="text-core-600 w-[110px] shrink-0 text-right text-sm md:w-[130px]">
            {{ revenueItem.label }}
          </span>
          <div class="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              :class="[revenueItem.color, 'h-full rounded-full transition-all duration-500']"
              :style="{
                width: revenueItem.value > 0 ? '100%' : '0%',
              }"
            />
          </div>
          <span class="text-success-700 w-[110px] shrink-0 text-right text-sm font-medium">
            <template v-if="revenueItem.value === 0">₦0.00</template>
            <template v-else>+ {{ format(revenueItem.value) }}</template>
          </span>
        </div>

        <hr class="border-gray-200" />

        <!-- Expense rows -->
        <div class="flex flex-col gap-5 p-5 pt-4">
          <div v-for="item in expenseItems" :key="item.label" class="flex items-center gap-3">
            <span class="text-core-600 w-[110px] shrink-0 text-right text-sm md:w-[130px]">
              {{ item.label }}
            </span>
            <div class="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                :class="[item.color, 'h-full rounded-full transition-all duration-500']"
                :style="{
                  width: item.value > 0 ? `${(item.value / maxBarValue) * 100}%` : '0%',
                }"
              />
            </div>
            <span class="text-error-600 w-[110px] shrink-0 text-right text-sm font-medium">
              <template v-if="item.value === 0">₦0.00</template>
              <template v-else>({{ format(item.value) }})</template>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
