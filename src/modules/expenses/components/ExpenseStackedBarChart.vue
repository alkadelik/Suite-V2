<script setup lang="ts">
import { computed } from "vue"
import { ExpenseDashboardStats } from "../types"
import { formatCurrency } from "@/utils/format-currency"

const props = defineProps<{
  category_breakdown?: ExpenseDashboardStats["category_breakdown"]
  showLabel?: boolean
  totalExpense?: number
  class?: string
}>()

const colorPalette = [
  "#EF8A2E", // primary-400
  "#A48AFB", // violet-400
  "#85E13A", // green-light-400
  "#B4AAAA", // core-400
]

const categoryBreakDown = computed(() => {
  const data =
    props.category_breakdown ||
    [
      { category_name: "Travel", total_amount: 4000, expense_count: 2 },
      { category_name: "Meals", total_amount: 2500, expense_count: 3 },
      { category_name: "Supplies", total_amount: 1500, expense_count: 1 },
      { category_name: "Software", total_amount: 1000, expense_count: 1 },
      { category_name: "Other", total_amount: 5000, expense_count: 1 },
    ].slice(0, colorPalette.length) // limit to color palette length

  const total = props.totalExpense || data.reduce((acc: number, curr) => acc + curr.total_amount, 0)

  return data.map((category, index) => ({
    ...category,
    percentage: total > 0 ? (category.total_amount / total) * 100 : 0,
    color: colorPalette[index % colorPalette.length],
  }))
})

const totalAmount = computed(() => {
  return (
    props.totalExpense ||
    categoryBreakDown.value.reduce((acc: number, curr) => acc + curr.total_amount, 0)
  )
})
</script>

<template>
  <div
    :class="['text-core-800 space-y-4 rounded-xl bg-white p-4 lg:h-full lg:shadow', props.class]"
  >
    <div v-if="props.showLabel" class="text-core-600 text-base font-medium">
      Expense Distribution
    </div>

    <div v-if="props.totalExpense" class="text-center">
      <h3 class="text-core-800 font-outfit! text-center text-4xl font-bold">
        {{ formatCurrency(totalAmount) }}
      </h3>
      <p class="text-core-600 mt-1 text-sm">Total Expenses</p>
    </div>

    <!-- stacked bar chart -->
    <div class="flex h-8 w-full overflow-hidden rounded bg-gray-100">
      <div
        v-for="category in categoryBreakDown"
        :key="category.category_name"
        :style="{
          width: `${category.percentage}%`,
          backgroundColor: category.color,
        }"
        class="transition-all duration-300 hover:opacity-80"
        :title="`${category.category_name}: ${formatCurrency(category.total_amount)} (${category.percentage.toFixed(1)}%)`"
      />
    </div>

    <!-- legend -->
    <div class="mt-4 flex flex-wrap justify-center gap-3">
      <div
        v-for="category in categoryBreakDown"
        :key="category.category_name"
        class="inline-flex items-center gap-2 text-xs"
      >
        <span class="h-3 w-3 rounded" :style="{ backgroundColor: category.color }" />
        <span class="text-core-600">
          {{ category.category_name }}
          <span class="lg:hidden"> - ({{ category.percentage.toFixed(1) }}%)</span>
        </span>
      </div>
    </div>
  </div>
</template>
