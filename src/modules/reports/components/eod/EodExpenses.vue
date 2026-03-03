<script setup lang="ts">
import { computed } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import DataTable, { TableColumn } from "@components/DataTable.vue"

const stats = [
  { title: "Total Expenses", value: formatCurrency(281400), subtitle: "5 categories" },
  { title: "Biggest Line Item", value: formatCurrency(120000), subtitle: "Shopping & Logistics" },
  {
    title: "Expense-to-Revenue",
    value: "13.2%",
    subtitle: `${formatCurrency(28850)} / ${formatCurrency(218400)}`,
  },
]

type TExpense = {
  category_name: string
  percentage: number
  amount: number
}

const COLUMNS: TableColumn<TExpense>[] = [
  { header: "Category", accessor: "category_name" },
  { header: "", accessor: "chip", class: "!px-8" },
  {
    header: "Amount",
    accessor: "amount",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  {
    header: "Inv. Turnover",
    accessor: "percentage",
    cell: ({ value }) => `${value}%`,
  },
]

const EXPENSE_ROWS: TExpense[] = [
  {
    category_name: "Shopping & Logistics",
    percentage: 13.2,
    amount: 120000,
  },
  {
    category_name: "Marketing & Advertising",
    percentage: 8.5,
    amount: 18200,
  },
  {
    category_name: "Utilities",
    percentage: 2.1,
    amount: 4500,
  },
  {
    category_name: "Miscellaneous",
    percentage: 1.2,
    amount: 2500,
  },
  {
    category_name: "Other Expenses",
    percentage: 5.0,
    amount: 32000,
  },
]

const totalAmount = computed(() => EXPENSE_ROWS.reduce((sum, r) => sum + r.amount, 0))
const totalPercentage = computed(() => EXPENSE_ROWS.reduce((sum, r) => sum + r.percentage, 0))

const DATA = computed<TExpense[]>(() => [
  ...EXPENSE_ROWS,
  {
    category_name: "Total",
    amount: totalAmount.value,
    percentage: totalPercentage.value,
  },
])

const isTotalRow = (row: TExpense) => row.category_name === "Total"
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">03</span>
      <h3 class="text-base font-semibold text-gray-900">Expenses</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Costs Today</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-3 gap-8 py-4">
      <!--  -->
      <div>
        <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
          <div v-for="stat in stats" :key="stat.title" class="text-core-700 px-4 py-3">
            <h4 class="text-sm">{{ stat.title }}</h4>
            <p class="text-core-900 mt-1 text-lg font-semibold">
              {{ stat.value }}
            </p>
            <span class="text-xs font-normal">{{ stat.subtitle }}</span>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="col-span-2 overflow-hidden rounded-xl bg-white shadow">
        <DataTable
          :data="DATA"
          :columns="COLUMNS"
          :show-pagination="false"
          :row-class="(row) => (isTotalRow(row) ? 'font-semibold bg-gray-50  ' : '')"
        >
          <template #cell:chip="{ item }">
            <!-- percentage line -->
            <div
              v-if="!isTotalRow(item)"
              class="relative h-2 w-full overflow-hidden rounded-full bg-gray-200"
            >
              <div
                class="bg-primary-600 absolute top-0 left-0 h-2 rounded-full"
                :style="{ width: `${item.percentage}%` }"
              ></div>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </section>
</template>
