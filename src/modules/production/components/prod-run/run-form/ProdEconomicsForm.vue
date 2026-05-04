<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { computed, ref, watch } from "vue"
import type {
  IngredientRow,
  ProcessRow,
  AdditionalExpenseRow,
  BasicRunDetails,
} from "../form-types"
import TextField from "@components/form/TextField.vue"

const props = defineProps<{
  loading: boolean
  initialValues: BasicRunDetails
  ingredientRows: IngredientRow[]
  processRows: ProcessRow[]
  additionalExpenses: AdditionalExpenseRow[]
}>()
const emit = defineEmits<{ (e: "prev"): void; (e: "submit", sellingPrice: number): void }>()

const { format } = useFormatCurrency()
const showEstimator = ref(false)

const outputItemType = computed(() => props.initialValues.outputItemType)
const isProduct = computed(() => outputItemType.value === "product")

const sellingPrice = ref(props.initialValues.variantPrice ?? 0)

// Sync whenever the parent changes (e.g. back-navigation resets)
watch(
  () => props.initialValues.variantPrice,
  (val) => {
    sellingPrice.value = val ?? 0
  },
)

const materialsCost = computed(() =>
  props.ingredientRows.reduce((sum, r) => sum + r.qty * r.ingredient.cost_per_unit, 0),
)
const processCostTotal = computed(() =>
  props.processRows.reduce((sum, p) => sum + parseFloat(p.cost || "0"), 0),
)
const additionalExpensesTotal = computed(() =>
  props.additionalExpenses.reduce((sum, a) => sum + parseFloat(a.amount || "0"), 0),
)
const totalCost = computed(
  () => materialsCost.value + processCostTotal.value + additionalExpensesTotal.value,
)
const usableUnits = computed(
  () => props.initialValues.outputQuantity - props.initialValues.damagedQuantity,
)
const costPerUnit = computed(() =>
  usableUnits.value > 0 ? totalCost.value / usableUnits.value : 0,
)
const originalSellingPrice = computed(() => props.initialValues.variantPrice ?? 0)
const originalProfitPerUnit = computed(() => originalSellingPrice.value - costPerUnit.value)
const originalProfitPerBatch = computed(() => originalProfitPerUnit.value * usableUnits.value)

const profitPerUnit = computed(() => sellingPrice.value - costPerUnit.value)
const profitPerBatch = computed(() => profitPerUnit.value * usableUnits.value)
const estimationVerdict = computed(() => {
  if (profitPerUnit.value > 0) return "profit"
  if (profitPerUnit.value < 0) return "loss"
  return "neutral"
})
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Confirm your production economics and set the selling price.</p>

    <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
      <h4 class="text-sm font-medium">Production Cost Breakdown</h4>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Materials</span>
        <span class="font-medium">{{ format(materialsCost, { kobo: true }) }}</span>
      </p>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Recipe Process Costs</span>
        <span class="font-medium">{{ format(processCostTotal, { kobo: true }) }}</span>
      </p>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Additional Expenses</span>
        <span class="font-medium">
          {{ additionalExpensesTotal ? format(additionalExpensesTotal, { kobo: true }) : "-" }}
        </span>
      </p>
      <div class="border-core-200 my-2 border-t border-dashed"></div>
      <p class="flex justify-between text-sm">
        <span class="text-core-600 font-medium">Total Production Cost</span>
        <span class="font-medium">{{ format(totalCost, { kobo: true }) }}</span>
      </p>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Usable units</span>
        <span class="font-medium">{{ usableUnits }}</span>
      </p>
      <div class="border-core-200 my-2 border-t border-dashed"></div>
      <div class="flex justify-between text-sm font-semibold">
        <span class="text-core-600 font-medium">Cost per Unit</span>
        <span class="font-medium">{{ format(costPerUnit, { kobo: true }) }}</span>
      </div>
    </div>

    <!--  -->
    <div v-if="isProduct" class="border-core-300 bg-core-25 mt-6 space-y-3 rounded-xl border p-4">
      <h4 class="text-sm font-medium">Projected Profit Breakdown</h4>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Current Selling Price</span>
        <span class="font-medium">{{ format(originalSellingPrice, { kobo: true }) }}</span>
      </p>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Estimated profit / unit</span>
        <span class="font-medium">{{ format(originalProfitPerUnit, { kobo: true }) }}</span>
      </p>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Estimated profit / batch</span>
        <span class="font-medium">{{ format(originalProfitPerBatch, { kobo: true }) }}</span>
      </p>
    </div>

    <div v-if="isProduct" class="mt-4 text-center">
      <AppButton
        variant="text"
        icon="arrow-right"
        label="Open Profit Estimator"
        @click="showEstimator = true"
      />
    </div>

    <div class="border-core-200 fixed right-0 bottom-0 left-0 border-t bg-white p-4 md:p-6">
      <div class="mt-6 flex gap-3">
        <AppButton variant="outlined" label="Back" class="w-1/3" @click="emit('prev')" />
        <AppButton
          label="Create Run"
          class="w-2/3"
          :loading="loading"
          @click="emit('submit', sellingPrice)"
        />
      </div>
    </div>
    <!--  -->
    <Modal :open="showEstimator" @close="showEstimator = false" title="Profit Estimator">
      <p class="text-core-600 mb-3 text-sm">
        Calculate the estimated profit you earn based on your selling price
      </p>

      <div class="bg-gray-25 mt-6 rounded-xl border border-gray-200 p-4">
        <p class="text-core-600 mb-1 text-sm">Current Selling Price</p>
        <TextField
          v-model.number="sellingPrice"
          type="number"
          format="currency"
          step="0.01"
          placeholder="0"
          min="0"
          container-class="border-0"
        />
      </div>

      <div class="mt-4 grid grid-cols-2 gap-6">
        <div
          class="rounded-xl border p-4"
          :class="{
            'bg-error-25 border-error-300': estimationVerdict === 'loss',
            'bg-success-25 border-success-300': estimationVerdict === 'profit',
            'bg-gray-25 border-gray-200': estimationVerdict === 'neutral',
          }"
        >
          <p class="text-core-600 mb-1 text-sm">Estimated profit / unit</p>
          <p
            class="text-lg font-semibold"
            :class="{
              'text-success-700': estimationVerdict === 'profit',
              'text-error-700': estimationVerdict === 'loss',
              'text-gray-500': estimationVerdict === 'neutral',
            }"
          >
            <span v-if="estimationVerdict === 'loss'"> {{ "-" }} </span>
            {{ format(Math.abs(profitPerUnit), { kobo: true }) }}
          </p>
        </div>

        <div
          class="rounded-xl border p-4"
          :class="{
            'bg-error-25 border-error-300': estimationVerdict === 'loss',
            'bg-success-25 border-success-300': estimationVerdict === 'profit',
            'bg-gray-25 border-gray-200': estimationVerdict === 'neutral',
          }"
        >
          <p class="text-core-600 mb-1 text-sm">Estimated profit / batch</p>
          <p
            class="text-lg font-semibold"
            :class="{
              'text-success-700': estimationVerdict === 'profit',
              'text-error-700': estimationVerdict === 'loss',
              'text-gray-500': estimationVerdict === 'neutral',
            }"
          >
            <span v-if="estimationVerdict === 'loss'"> {{ "-" }} </span>
            {{ format(Math.abs(profitPerBatch), { kobo: true }) }}
          </p>
        </div>
      </div>

      <div
        v-if="estimationVerdict === 'loss'"
        class="bg-primary-25 text-error-700 border-error-300 mt-6 flex items-center gap-3 rounded-xl border px-4 py-3"
      >
        <span
          class="border-error-200 ring-error-100 hidden size-8 flex-shrink-0 items-center justify-center rounded-full border-2 p-0.5 ring-2 ring-offset-2 lg:flex"
        >
          <Icon name="info-circle" size="20" />
        </span>
        <p class="text-sm font-medium">
          The predicted profit on this batch is negative. Raise your price short-term and review
          your operations strategy long-term.
        </p>
      </div>
    </Modal>
  </div>
</template>
