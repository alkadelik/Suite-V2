<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import SelectField from "@components/form/SelectField.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { useSearchRawMaterial } from "@modules/production/api"
import { getProdUsageUnit } from "@modules/production/utils"
import type { TConversion } from "@modules/production/types"
import type { IngredientRow } from "../AddNewRecipeDrawer.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"

const props = defineProps<{
  initialRows: IngredientRow[]
  excludeUid?: string
  outputItemDetails: { name: string; qty: number; unit: string; type: "product" | "sub_assembly" }
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
  return matSearchResults.value.results
    .filter((material) => !props.excludeUid || material.uid !== props.excludeUid)
    .map((material) => ({
      label: material.name,
      value: material.uid || "",
      unit: material.unit || "",
      cost_per_unit: Number(material.last_cost || material.avg_cost || 0),
      kind: (material.is_sub_assembly ? "sub_assembly" : "raw_material") as string,
      conversions: material.conversions || [],
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
    conversions: r.ingredient.conversions || [],
  })),
)

function onSelectChange(newVal: unknown) {
  const selected = (Array.isArray(newVal) ? newVal : []) as MatOption[]

  console.log("Selected options:", selected)

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
          conversions: opt.conversions,
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

const removeRow = (row: IngredientRow) => {
  ingredientRows.value = ingredientRows.value.filter((r) => r.id !== row.id)
}

const totalIngredientCost = computed(() => {
  const total = ingredientRows.value.reduce((sum, row) => {
    const baseCost = rowCostPerUsageUnit(row) || 0
    return sum + baseCost * row.qty
  }, 0)
  return formatCurrency(Number(total))
})

function rowUsageUnit(row: IngredientRow) {
  return getProdUsageUnit({
    unit: row.ingredient.base_unit || row.ingredient.unit || "",
    conversions: (row.ingredient.conversions ?? []) as TConversion[],
  })
}

function rowCostPerUsageUnit(row: IngredientRow) {
  const firstConversion = (row.ingredient.conversions ?? [])[0]
  if (!firstConversion) return row.ingredient.cost_per_unit || 0
  const baseCost = row.ingredient.base_cost_per_unit ?? row.ingredient.cost_per_unit ?? 0
  return baseCost / Number(firstConversion.rate)
}

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

    <div class="border-core-300 bg-core-25 my-4 rounded-xl border p-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Icon name="box" class="h-5 w-5 text-gray-400" />
          </div>
          <div class="flex-1">
            <h4 class="flex items-center gap-2 text-sm font-medium">
              {{ outputItemDetails.name }}
              <Chip
                v-if="outputItemDetails.type === 'sub_assembly'"
                label="Sub-assembly"
                color="purple"
              />
            </h4>
          </div>
        </div>
        <Chip :label="`${outputItemDetails.qty} ${outputItemDetails.unit}`" />
      </div>
    </div>

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
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100"
              >
                <Icon name="blur" size="18" />
              </span>
              <div class="flex min-w-0 flex-col">
                <div class="flex min-w-0 items-center gap-2">
                  <p class="truncate text-sm font-medium text-gray-900">
                    {{ row.ingredient.label }}
                  </p>
                  <Chip
                    v-if="row.ingredient.kind === 'sub_assembly'"
                    color="purple"
                    label="Sub-assembly"
                    size="sm"
                  />
                </div>
                <div
                  v-if="row.ingredient.kind !== 'sub_assembly'"
                  class="mt-1 flex items-center gap-2"
                >
                  <Chip
                    :label="`${formatCurrency(rowCostPerUsageUnit(row))}/${rowUsageUnit(row)}`"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3" :class="isMobile ? 'w-full justify-between' : ''">
              <TextField
                v-model="row.qty"
                type="number"
                :prefix="rowUsageUnit(row)"
                class="w-full"
              />

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
