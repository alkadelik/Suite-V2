<template>
  <div class="border-primary-200 bg-primary-25 space-y-3 rounded-xl border p-4">
    <div class="flex items-start gap-3">
      <Checkbox class="mt-0.5 shrink-0" :model-value="value" @update:model-value="value = $event" />
      <div class="space-y-1">
        <p class="text-primary-600 font-medium">{{ title }}</p>
        <p class="text-primary-500 text-sm">{{ description }}</p>
      </div>
    </div>

    <template v-if="value">
      <div class="border-primary-200 border-t border-dashed" />

      <p class="text-primary-500 text-sm">
        <template v-if="expenseAmount !== null">
          {{ amountLabel }}:
          <span class="text-primary-600 font-semibold">{{ format(expenseAmount) }}</span>
        </template>
        <template v-else>{{ missingAmountText }}</template>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Checkbox from "@components/form/Checkbox.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

interface Props {
  /** Whether this purchase should be recorded as an expense. */
  modelValue: boolean
  quantity?: number
  unitCost?: string | number
  title?: string
  description?: string
  amountLabel?: string
  missingAmountText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: "Record this purchase as an expense",
  description: "Include this purchase in your expense records for reporting and profit tracking.",
  amountLabel: "Expense Amount",
  missingAmountText: "Add your quantity and unit cost",
})

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()

const { format } = useFormatCurrency()

const value = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
})

// Unit cost may arrive comma-formatted from a currency field; strip before parsing.
const expenseAmount = computed(() => {
  const qty = Number(props.quantity)
  const cost = Number(String(props.unitCost ?? "").replace(/[^0-9.-]/g, ""))
  if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(cost) || cost <= 0) return null
  return qty * cost
})
</script>
