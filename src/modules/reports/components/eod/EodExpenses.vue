<script setup lang="ts">
import { computed } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import DataTable, { TableColumn } from "@components/DataTable.vue"
import { useMediaQuery } from "@vueuse/core"
import { IEODReport } from "@modules/reports/types"
import { startCase } from "@/utils/format-strings"

const props = defineProps<{ data: IEODReport | null }>()
const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const stats = computed(() => [
  {
    title: "Total Expenses",
    value: formatCurrency(props.data?.total_expenses ?? 0, { kobo: true }),
    subtitle: `${props.data?.expenses_by_category?.length ?? 0} categories`,
  },
  {
    title: "Biggest Line Item",
    value: formatCurrency(props.data?.expenses_overview?.biggest_expense_amount ?? 0, {
      kobo: true,
    }),
    subtitle: startCase(props.data?.expenses_overview?.biggest_expense_category_name ?? "N/A"),
  },
  {
    title: "Expense-to-Revenue",
    value: `${(props.data?.expenses_overview?.expense_to_revenue_percent ?? 0).toFixed(1)}%`,
    subtitle: `${formatCurrency(props.data?.total_expenses ?? 0, { kobo: true })} / ${formatCurrency(props.data?.summary?.gross_revenue ?? 0, { kobo: true })}`,
  },
])

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
    cell: ({ value }) => formatCurrency(Number(value), { kobo: true }),
  },
  {
    header: "% of Revenue",
    accessor: "percentage",
    cell: ({ value }) => `${Number(value).toFixed(1)}%`,
  },
]

const EXPENSE_ROWS = computed(() => {
  return (props.data?.expenses_by_category ?? []).map((expense) => ({
    category_name: startCase(expense.category),
    percentage: expense.percent_of_revenue ?? 0,
    amount: expense.amount,
  }))
})

const totalAmount = computed(() => props.data?.total_expenses ?? 0)
const totalPercentage = computed(() => EXPENSE_ROWS.value.reduce((sum, r) => sum + r.percentage, 0))

const DATA = computed<TExpense[]>(() => [
  ...EXPENSE_ROWS.value,
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
    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-3">
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
      <div class="overflow-hidden rounded-xl bg-white shadow md:col-span-2">
        <DataTable
          :data="DATA"
          :columns="COLUMNS"
          :show-pagination="false"
          :show-mobile-view="false"
          :fix-first-column="isMobile"
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
