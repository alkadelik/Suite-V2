<template>
  <div class="border-primary-200 bg-primary-25 space-y-3 rounded-xl border p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <Checkbox :model-value="value" @update:model-value="value = $event" />
        <div class="space-y-1">
          <p class="text-primary-600 font-medium">Record this purchase as an expense</p>
          <p class="text-primary-500 text-sm">
            Include this purchase in your expense records for reporting and profit tracking.
          </p>
        </div>
      </div>
      <Switch v-model="value" size="sm" />
    </div>

    <template v-if="value">
      <div class="border-primary-200 border-t border-dashed" />

      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-primary-500 text-sm">
          <template v-if="expenseAmount !== null">
            Expense Amount:
            <span class="text-primary-600 font-semibold">{{ format(expenseAmount) }}</span>
          </template>
          <template v-else>Add your quantity and unit cost</template>
        </p>

        <div class="flex items-center gap-2">
          <span class="text-primary-500 text-sm">Category:</span>
          <Chip label="Inventory" color="purple" icon="tag-2" size="sm" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Checkbox from "@components/form/Checkbox.vue"
import Switch from "@components/form/Switch.vue"
import Chip from "@components/Chip.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

interface Props {
  /** Whether the stock purchase should be recorded as an expense */
  modelValue: boolean
  quantity?: number
  unitCost?: string | number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()

const { format } = useFormatCurrency()

const value = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
})

// Unit cost may arrive comma-formatted from the currency field; strip before parsing.
const expenseAmount = computed(() => {
  const qty = Number(props.quantity)
  const cost = Number(String(props.unitCost ?? "").replace(/[^0-9.]/g, ""))
  if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(cost) || cost <= 0) return null
  return qty * cost
})
</script>
