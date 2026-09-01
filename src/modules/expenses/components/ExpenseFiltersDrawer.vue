<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import { computed, ref, watch } from "vue"
import { useExpenseCategories } from "../composables"
import type { TChipColor } from "@modules/shared/types"
import type { TExpenseFilters } from "../types"

const props = defineProps<{
  open: boolean
  /** Payables fixes the status itself, so the facet would only contradict the tab */
  hideStatus?: boolean
  /** A payables bucket (Taxes/Shipping) already is a category filter — only amount is left */
  hideCategories?: boolean
}>()
const emit = defineEmits<{
  close: []
  apply: [filters: TExpenseFilters]
}>()

type TOption = { label: string; value: string }

const { categories: expCategories } = useExpenseCategories()

const STATUS_OPTIONS: { value: string; label: string; color: TChipColor }[] = [
  { value: "pending", label: "Pending", color: "primary" },
  { value: "unpaid", label: "Unpaid", color: "error" },
  { value: "paid", label: "Paid", color: "success" },
  { value: "void", label: "Void", color: "warning" },
]

const selectedStatuses = ref<string[]>([])

const toggleStatus = (value: string) => {
  const index = selectedStatuses.value.indexOf(value)
  if (index === -1) selectedStatuses.value.push(value)
  else selectedStatuses.value.splice(index, 1)
}

const selectedCategories = ref<TOption[]>([])
const selectedSubCategories = ref<TOption[]>([])
const minAmount = ref("")
const maxAmount = ref("")

const categoriesOptions = computed(() =>
  expCategories.value.map((cat) => ({ label: cat.name, value: cat.uid })),
)

// Sub-categories belong to exactly one parent, so `category=A&category=B&sub_category=X`
// would silently collapse to A's X only. Sub-category filtering is therefore offered
// only while a single category is picked — pick more and the field switches off.
const singleCategory = computed(() =>
  selectedCategories.value.length === 1 ? selectedCategories.value[0] : null,
)

const subCategoriesOptions = computed(() => {
  if (!singleCategory.value) return []
  const cat = expCategories.value.find((c) => c.uid === singleCategory.value!.value)
  return cat?.sub_categories?.map((s) => ({ label: s.name, value: s.uid })) || []
})

const hasSubCategories = computed(() => subCategoriesOptions.value.length > 0)

const subCategoryHint = computed(() => {
  if (selectedCategories.value.length > 1) return "Available when a single category is selected."
  if (!selectedCategories.value.length) return "Select a category first."
  if (!hasSubCategories.value) return "This category has no sub-categories."
  return undefined
})

// Leaving single-category mode (or switching which one it is) invalidates any picked
// sub-categories, so drop them rather than keep an unreachable filter around.
watch(singleCategory, (category, previous) => {
  if (category?.value !== previous?.value) selectedSubCategories.value = []
})

// A hidden facet must stop counting and stop being applied, or the tab would carry an
// invisible filter the merchant can't see or clear.
watch(
  () => props.hideCategories,
  (hidden) => {
    if (!hidden) return
    selectedCategories.value = []
    selectedSubCategories.value = []
  },
  { immediate: true },
)

const activeFilterCount = computed(
  () =>
    (props.hideStatus ? 0 : selectedStatuses.value.length) +
    (props.hideCategories
      ? 0
      : selectedCategories.value.length + selectedSubCategories.value.length) +
    (minAmount.value ? 1 : 0) +
    (maxAmount.value ? 1 : 0),
)

const applyFilters = () => {
  const filters: TExpenseFilters = {}
  if (!props.hideStatus && selectedStatuses.value.length)
    filters.status = [...selectedStatuses.value]
  if (!props.hideCategories && selectedCategories.value.length)
    filters.category = selectedCategories.value.map((c) => c.value)
  if (!props.hideCategories && selectedSubCategories.value.length)
    filters.sub_category = selectedSubCategories.value.map((s) => s.value)
  if (minAmount.value) filters.min_amount = minAmount.value
  if (maxAmount.value) filters.max_amount = maxAmount.value
  emit("apply", filters)
  emit("close")
}

const clearFilters = () => {
  selectedStatuses.value = []
  selectedCategories.value = []
  selectedSubCategories.value = []
  minAmount.value = ""
  maxAmount.value = ""
  emit("apply", {})
  emit("close")
}
</script>

<template>
  <Drawer :open="open" title="Filter Expenses" max-width="lg" @close="emit('close')">
    <div class="space-y-6">
      <!-- Status -->
      <div v-if="!hideStatus">
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Status</h3>
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="option in STATUS_OPTIONS"
            :key="option.value"
            type="button"
            :class="[
              'flex w-full items-center rounded-xl border px-4 py-3 transition-all',
              selectedStatuses.includes(option.value)
                ? 'border-primary-700 bg-primary-25'
                : 'border-gray-400 bg-gray-50 hover:border-gray-500',
            ]"
            @click="toggleStatus(option.value)"
          >
            <Chip
              :label="option.label"
              :color="option.color as TChipColor"
              :variant="selectedStatuses.includes(option.value) ? 'filled' : 'outlined'"
              show-dot
              size="sm"
              class="pointer-events-none w-full justify-center"
            />
          </button>
        </div>
      </div>

      <div v-if="!hideStatus" class="border-b border-gray-100" />

      <!-- Category -->
      <div v-if="!hideCategories">
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Category</h3>
        <SelectField
          v-model="selectedCategories"
          placeholder="Select categories"
          :options="categoriesOptions"
          value-key="value"
          label-key="label"
          multiple
          clearable
          searchable
        />
      </div>

      <!-- Sub-category -->
      <div v-if="!hideCategories">
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Sub-category</h3>
        <SelectField
          v-model="selectedSubCategories"
          placeholder="Select sub-categories"
          :options="subCategoriesOptions"
          value-key="value"
          label-key="label"
          multiple
          clearable
          searchable
          :disabled="!hasSubCategories"
          :hint="subCategoryHint"
        />
      </div>

      <div v-if="!hideCategories" class="border-b border-gray-100" />

      <!-- Amount Range -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Amount Range</h3>
        <div class="grid grid-cols-2 gap-3">
          <TextField
            v-model="minAmount"
            label="Min Amount"
            placeholder="e.g. 500"
            type="number"
            format="currency"
            step="0.01"
            left-icon="wallet-money"
          />
          <TextField
            v-model="maxAmount"
            label="Max Amount"
            placeholder="e.g. 50,000"
            type="number"
            format="currency"
            step="0.01"
            left-icon="wallet-money"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-4">
        <AppButton color="alt" label="Clear All" @click="clearFilters" />
        <AppButton
          :label="activeFilterCount ? `Apply (${activeFilterCount})` : 'Apply Filters'"
          @click="applyFilters"
        />
      </div>
    </template>
  </Drawer>
</template>
