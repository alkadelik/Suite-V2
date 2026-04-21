<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import type { ProcessRow, AdditionalExpenseRow } from "../form-types"
import { computed, ref } from "vue"

const props = defineProps<{
  initialRows: ProcessRow[]
}>()

const emit = defineEmits<{
  (e: "prev"): void
  (e: "submit", processRows: ProcessRow[], additionalExpenses: AdditionalExpenseRow[]): void
}>()

const { format: formatCurrency } = useFormatCurrency()

// ─── Process rows (local copy so rows can be removed) ────────────────────
const processRows = ref<ProcessRow[]>([...props.initialRows])
const removeProcessRow = (row: ProcessRow) => {
  processRows.value = processRows.value.filter((r) => r.id !== row.id)
}

// ─── Additional expense rows ─────────────────────────────────────────────
const makeEmptyExpense = (): AdditionalExpenseRow => ({
  id: `expense-${Date.now()}-${Math.random()}`,
  name: "",
  amount: "",
})

const additionalExpenses = ref<AdditionalExpenseRow[]>([])

const addExpense = () => additionalExpenses.value.push(makeEmptyExpense())
const removeExpense = (row: AdditionalExpenseRow) => {
  additionalExpenses.value = additionalExpenses.value.filter((r) => r.id !== row.id)
}

// ─── Totals ──────────────────────────────────────────────────────────────
const recipeTotalCost = computed(() =>
  processRows.value.reduce((sum, r) => sum + (Number(r.cost) || 0), 0),
)

const additionalTotalCost = computed(() =>
  additionalExpenses.value.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
)

// ─── Submit ──────────────────────────────────────────────────────────────
function handleSubmit() {
  emit("submit", [...processRows.value], [...additionalExpenses.value])
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Log expenses like fuel, labour, or packaging.</p>

    <!-- Recipe Process Costs (read-only) -->
    <div class="mb-6 rounded-2xl border border-gray-200 bg-white pt-3">
      <div class="flex items-center gap-3 px-4">
        <Icon name="setting" size="20" class="text-gray-600" />
        <span class="text-sm font-medium text-gray-900"> Processes </span>
      </div>
      <div v-if="processRows.length" class="mt-4 space-y-6 border-t border-gray-200 px-4">
        <div v-for="row in processRows" :key="row.id" class="flex items-center gap-3 py-3">
          <div class="grid flex-1 grid-cols-2 gap-3">
            <TextField :model-value="row.name" disabled />
            <TextField
              v-model="row.cost"
              type="number"
              format="currency"
              step="0.01"
              placeholder="0"
            />
          </div>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
            aria-label="Remove expense"
            @click="removeProcessRow(row)"
          >
            <span class="text-lg leading-none">−</span>
          </button>
        </div>
      </div>
      <div
        v-if="!processRows.length"
        class="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400"
      >
        No process costs defined in recipe.
      </div>
    </div>

    <!-- Additional Expenses -->
    <div>
      <p class="mb-3 text-sm font-medium text-gray-700">Additional Expenses</p>
      <div class="space-y-4">
        <div v-for="row in additionalExpenses" :key="row.id" class="flex items-center gap-3 py-3">
          <div class="grid flex-1 grid-cols-2 gap-3">
            <TextField v-model="row.name" placeholder="e.g. Billing, Labour" />
            <TextField
              v-model="row.amount"
              type="number"
              format="currency"
              step="0.01"
              :placeholder="`e.g. 100`"
            />
          </div>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
            aria-label="Remove expense"
            @click="removeExpense(row)"
          >
            <span class="text-lg leading-none">−</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600"
        @click="addExpense"
      >
        <span class="text-lg leading-none">+</span>
        <span>Add expense</span>
      </button>
    </div>

    <div class="h-40" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 border-t bg-white p-4 md:p-6">
      <div class="mb-1 flex items-center justify-between text-sm">
        <span class="text-gray-500">Recipe Process Costs</span>
        <span class="font-medium text-gray-900">{{ formatCurrency(recipeTotalCost) }}</span>
      </div>
      <div class="mb-3 flex items-center justify-between text-sm">
        <span class="text-gray-500">Additional Expenses</span>
        <span class="font-medium text-gray-900">+ {{ formatCurrency(additionalTotalCost) }}</span>
      </div>
      <div class="flex gap-3">
        <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
        <AppButton label="Continue" class="w-2/3" type="submit" />
      </div>
    </div>
  </form>
</template>
