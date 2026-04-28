<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import SelectField from "@components/form/SelectField.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { useSearchRawMaterial } from "@modules/production/api"
import type { IngredientRow } from "../AddNewRecipeDrawer.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"

const props = defineProps<{
  initialRows: IngredientRow[]
}>()

const emit = defineEmits<{
  (e: "next", rows: IngredientRow[]): void
  (e: "prev"): void
}>()

const isMobile = useMediaQuery("(max-width: 1028px)")
const { format: formatCurrency } = useFormatCurrency()

// ─── Raw material search ────────────────────────────────────────────────
const matSearchInput = ref("")
const matSearchQuery = useDebouncedRef(matSearchInput, 400)
const { data: matSearchResults, isFetching: isSearchingMat } = useSearchRawMaterial(matSearchQuery)

const materialOptions = computed(() => {
  if (!matSearchResults.value?.results) return []
  return matSearchResults.value.results.map((material) => ({
    label: material.name,
    value: material.uid || "",
    unit: material.unit || "",
    cost_per_unit: Number(material.last_cost || material.avg_cost || 0),
    kind: (material.is_sub_assembly ? "sub_assembly" : "raw_material") as string,
  }))
})

// ─── Ingredient rows ────────────────────────────────────────────────────
const ingredientRows = ref<IngredientRow[]>([...props.initialRows])
const ingredientSearch = ref("")

// ─── Selected values (full objects so SelectField can match & display chips) ─
type MatOption = (typeof materialOptions.value)[number]

const selectedOptions = computed<MatOption[]>(() =>
  ingredientRows.value.map((r) => ({
    label: r.ingredient.label,
    value: r.ingredient.value,
    unit: r.ingredient.unit || "",
    cost_per_unit: r.ingredient.cost_per_unit,
    kind: r.ingredient.kind,
  })),
)

function onSelectChange(newVal: unknown) {
  const selected = (Array.isArray(newVal) ? newVal : []) as MatOption[]

  const newVals = new Set(selected.map((o) => String(o.value)))

  // Remove deselected
  ingredientRows.value = ingredientRows.value.filter((r) => newVals.has(String(r.ingredient.value)))

  // Add newly selected
  for (const opt of selected) {
    const uid = String(opt.value)
    if (!ingredientRows.value.find((r) => r.ingredient.value === uid)) {
      ingredientRows.value.push({
        id: `${uid}-${Date.now()}`,
        ingredient: {
          label: String(opt.label),
          value: uid,
          unit: String(opt.unit || ""),
          cost_per_unit: Number(opt.cost_per_unit || 0),
          kind: String(opt.kind || "raw_material"),
        },
        qty: 1,
      })
    }
  }
}

const visibleIngredientRows = computed(() => {
  const q = ingredientSearch.value.trim().toLowerCase()
  if (!q) return ingredientRows.value
  return ingredientRows.value.filter((r) => r.ingredient.label.toLowerCase().includes(q))
})

const incQty = (row: IngredientRow) => (row.qty += 1)
const decQty = (row: IngredientRow) => (row.qty = Math.max(0, row.qty - 1))
const removeRow = (row: IngredientRow) => {
  ingredientRows.value = ingredientRows.value.filter((r) => r.id !== row.id)
}

const totalIngredientCost = computed(() => {
  const total = ingredientRows.value.reduce(
    (sum, row) => sum + (row.ingredient.cost_per_unit || 0) * row.qty,
    0,
  )
  return formatCurrency(total as number)
})

const canProceed = computed(() => ingredientRows.value.some((r) => r.qty > 0))

function handleNext() {
  emit("next", [...ingredientRows.value])
}
</script>

<template>
  <form @submit.prevent="handleNext">
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Add Ingredients</p>

    <!-- full raw material lists -->
    <SelectField
      :model-value="selectedOptions"
      label="Select/Search Ingredients"
      placeholder="Select"
      :options="materialOptions"
      :loading="isSearchingMat"
      multiple
      searchable
      @update:model-value="onSelectChange"
      @search-change="matSearchInput = $event"
    />

    <div class="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div class="mb-4">
        <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <Icon name="search-lg" size="18" class="text-gray-400" />
          <input
            v-model="ingredientSearch"
            class="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder="e.g Search by ingredient name"
            type="text"
          />
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="row in visibleIngredientRows"
          :key="row.id"
          class="rounded-2xl border border-gray-200 bg-white px-4 py-3"
        >
          <div :class="isMobile ? 'flex flex-col gap-3' : 'flex items-center justify-between'">
            <div class="flex min-w-0 items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                <Icon name="blur" size="18" />
              </span>
              <div class="flex min-w-0 flex-col">
                <div class="flex min-w-0 items-center gap-2">
                  <p class="truncate text-sm font-medium text-gray-900">
                    {{ row.ingredient.label }}
                  </p>
                  <span
                    v-if="row.ingredient.kind === 'sub_assembly'"
                    class="inline-flex rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
                  >
                    Sub-assembly
                  </span>
                </div>
                <div class="mt-1 flex items-center gap-2">
                  <span
                    v-if="row.ingredient.cost_per_unit"
                    class="inline-flex rounded-full border border-[#FDBA74] bg-[#FFF7ED] px-2 py-1 text-xs font-medium text-[#9A3412]"
                  >
                    {{ formatCurrency(row.ingredient.cost_per_unit || 0) }} /
                    {{ row.ingredient.unit || "unit" }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3" :class="isMobile ? 'w-full justify-between' : ''">
              <div
                class="flex items-center gap-2 rounded-xl border border-[#FDBA74] bg-white px-3 py-2"
                :class="isMobile ? 'flex-1 justify-between' : ''"
              >
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-50"
                  @click="decQty(row)"
                >
                  <span class="text-lg leading-none">−</span>
                </button>
                <input
                  type="number"
                  min="0"
                  :value="row.qty"
                  class="w-10 [appearance:textfield] bg-transparent text-center text-sm font-medium text-gray-900 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  @input="
                    row.qty = Math.max(0, parseInt(($event.target as HTMLInputElement).value) || 0)
                  "
                />
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-50"
                  @click="incQty(row)"
                >
                  <span class="text-lg leading-none">+</span>
                </button>
              </div>

              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                aria-label="Remove ingredient"
                @click="removeRow(row)"
              >
                <span class="text-base leading-none">−</span>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!(visibleIngredientRows?.length || 0)"
          class="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500"
        >
          No ingredients added yet. Use the dropdown above to add ingredients.
        </div>
      </div>
    </div>

    <div
      class="border-core-200 fixed right-0 bottom-0 left-0 space-y-2 border-t bg-white p-4 md:p-6"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">Estimated Cost:</p>
        <span class="text-sm font-medium">{{ totalIngredientCost }}</span>
      </div>

      <div class="flex gap-3">
        <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
        <AppButton label="Next" class="w-2/3" type="submit" :disabled="!canProceed" />
      </div>
    </div>
  </form>
</template>
