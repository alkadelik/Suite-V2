<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref, watch } from "vue"
import { useGetExpenseCategories } from "../api"
import { useExpenseStore } from "../store"
import type { TChipColor } from "@modules/shared/types"
import RadioInputField from "@components/form/RadioInputField.vue"

defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  apply: [filters: Record<string, string>]
}>()

const isMobile = computed(() => useMediaQuery("(max-width: 1028px)").value)

const expenseStore = useExpenseStore()
const { data: apiCategories } = useGetExpenseCategories(
  computed(() => !expenseStore.hasCategories()),
)
const expCategories = computed(() => {
  if (expenseStore.categories && expenseStore.categories.length > 0) {
    return expenseStore.categories
  }
  return apiCategories.value?.results || []
})
watch(
  () => apiCategories.value,
  (data) => {
    if (data?.results && data.results.length > 0) expenseStore.setCategories(data.results)
  },
  { immediate: true },
)

const STATUS_OPTIONS: { value: string; label: string; color: TChipColor }[] = [
  { value: "pending", label: "Pending", color: "primary" },
  { value: "unpaid", label: "Unpaid", color: "error" },
  { value: "paid", label: "Paid", color: "success" },
  { value: "void", label: "Void", color: "warning" },
]

const selectedStatus = ref<string | null>(null)

const toggleStatus = (value: string) => {
  selectedStatus.value = selectedStatus.value === value ? null : value
}
const selectedCategory = ref<{ label: string; value: string } | null>(null)
const selectedSubCategory = ref<{ label: string; value: string } | null>(null)
const minAmount = ref("")
const maxAmount = ref("")

const categoriesOptions = computed(() =>
  expCategories.value.map((cat) => ({ label: cat.name, value: cat.uid })),
)

const subCategoriesOptions = computed(() => {
  if (!selectedCategory.value?.value) return []
  const cat = expCategories.value.find((c) => c.uid === selectedCategory.value!.value)
  return cat?.sub_categories?.map((s) => ({ label: s.name, value: s.uid })) || []
})

const hasSubCategories = computed(() => subCategoriesOptions.value.length > 0)

watch(selectedCategory, (newVal, oldVal) => {
  if (oldVal?.value && newVal?.value !== oldVal?.value) {
    selectedSubCategory.value = null
  }
})

const activeFilterCount = computed(() => {
  let count = 0
  if (selectedStatus.value) count++
  if (selectedCategory.value?.value) count++
  if (selectedSubCategory.value?.value) count++
  if (minAmount.value) count++
  if (maxAmount.value) count++
  return count
})

const applyFilters = () => {
  const filters: Record<string, string> = {}
  if (selectedStatus.value) filters.status = selectedStatus.value
  if (selectedCategory.value?.value) filters.category = selectedCategory.value.value
  if (selectedSubCategory.value?.value) filters.sub_category = selectedSubCategory.value.value
  if (minAmount.value) filters.min_amount = minAmount.value
  if (maxAmount.value) filters.max_amount = maxAmount.value
  emit("apply", filters)
  emit("close")
}

const clearFilters = () => {
  selectedStatus.value = null
  selectedCategory.value = null
  selectedSubCategory.value = null
  minAmount.value = ""
  maxAmount.value = ""
  emit("apply", {})
  emit("close")
}
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    title="Filter Expenses"
    max-width="lg"
    variant="fullscreen"
    @close="emit('close')"
  >
    <div class="space-y-6">
      <!-- Status -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Status</h3>
        <RadioInputField
          :model-value="selectedStatus ?? ''"
          :options="STATUS_OPTIONS"
          options-container-class="grid! grid-cols-2!"
          @update:model-value="(v) => toggleStatus(v as string)"
        >
          <template #content="{ option }">
            <Chip
              :label="option.label"
              :color="option.color as TChipColor"
              :variant="selectedStatus === option.value ? 'filled' : 'outlined'"
              show-dot
              size="sm"
              class="pointer-events-none w-full justify-center"
            />
          </template>
        </RadioInputField>
      </div>

      <div class="border-b border-gray-100" />

      <!-- Category -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Category</h3>
        <SelectField
          v-model="selectedCategory"
          placeholder="Select a category"
          :options="categoriesOptions"
          value-key="value"
          label-key="label"
          clearable
          searchable
        />
      </div>

      <!-- Sub-category -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Sub-category</h3>
        <SelectField
          v-model="selectedSubCategory"
          placeholder="Select a sub-category"
          :options="subCategoriesOptions"
          value-key="value"
          label-key="label"
          clearable
          searchable
          :disabled="!hasSubCategories"
        />
      </div>

      <div class="border-b border-gray-100" />

      <!-- Amount Range -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Amount Range</h3>
        <div class="grid grid-cols-2 gap-3">
          <TextField
            v-model="minAmount"
            label="Min Amount"
            placeholder="e.g. 500"
            type="number"
            left-icon="wallet-money"
          />
          <TextField
            v-model="maxAmount"
            label="Max Amount"
            placeholder="e.g. 50,000"
            type="number"
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
  </component>
</template>
