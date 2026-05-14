<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import Modal from "@components/Modal.vue"
import SelectField from "@components/form/SelectField.vue"
import type { IngredientRow } from "../form-types"
import { useSearchRawMaterial } from "@modules/production/api"
import { computed, ref } from "vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
// import AdjustMaterialStockModal from "../../raw-material/AdjustMaterialStockModal.vue"
// import type { TRawMaterial } from "@/modules/production/types"

const props = defineProps<{
  initialRows: IngredientRow[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: "next", rows: IngredientRow[]): void
  (e: "prev"): void
}>()

const { format: formatCurrency } = useFormatCurrency()

const isInsufficient = (row: IngredientRow) =>
  row.ingredient.available_stock !== undefined &&
  row.ingredient.used_stock !== undefined &&
  row.ingredient.used_stock > row.ingredient.available_stock

// Prefill used_stock with required qty if not already set
const ingredientRows = ref<IngredientRow[]>(
  props.initialRows.map((r) => ({
    ...r,
    ingredient: {
      ...r.ingredient,
      used_stock: r.ingredient.used_stock ?? r.qty,
    },
  })),
)

const insufficientRows = computed(() => ingredientRows.value.filter((r) => isInsufficient(r)))

const totalIngredientCost = computed(() => {
  const total = ingredientRows.value.reduce(
    (sum, row) => sum + (row.ingredient.cost_per_unit || 0) * row.qty,
    0,
  )
  return formatCurrency(total)
})

const canProceed = computed(
  () => ingredientRows.value.some((r) => r.qty > 0) && !insufficientRows.value.length,
)

// ─── Edit used stock modal ────────────────────────────────────────────────
const editModalOpen = ref(false)
const editingRow = ref<IngredientRow | null>(null)
const editUsedStock = ref(0)

function openEditModal(row: IngredientRow) {
  editingRow.value = row
  editUsedStock.value = row.ingredient.used_stock ?? row.qty
  editModalOpen.value = true
}

function saveUsedStock() {
  if (!editingRow.value) return
  const row = ingredientRows.value.find((r) => r.id === editingRow.value!.id)
  if (row) row.ingredient.used_stock = editUsedStock.value
  editModalOpen.value = false
}

// ─── Adjust stock (commented out — may be needed later) ──────────────────
// const adjustModalOpen = ref(false)
// const selectedMaterial = ref<TRawMaterial | null>(null)
//
// function openAdjustModal(row: IngredientRow) {
//   selectedMaterial.value = {
//     uid: row.ingredient.value,
//     name: row.ingredient.label,
//     unit: row.ingredient.unit || "",
//     current_stock: row.ingredient.available_stock ?? 0,
//     is_sub_assembly: row.ingredient.kind === "sub_assembly",
//     avg_cost: row.ingredient.cost_per_unit,
//     last_cost: row.ingredient.cost_per_unit,
//     low_stock: false,
//     created_at: "",
//   }
//   adjustModalOpen.value = true
// }
//
// function onAdjustRefresh(quantity: number) {
//   if (selectedMaterial.value) {
//     const uid = selectedMaterial.value.uid
//     const row = ingredientRows.value.find((r) => r.ingredient.value === uid)
//     if (row) row.ingredient.available_stock = (row.ingredient.available_stock || 0) + quantity
//   }
//   adjustModalOpen.value = false
// }

// ─── Add ingredient modal ─────────────────────────────────────────────────
const addModalOpen = ref(false)
const addSearchInput = ref("")
const addSearchQuery = useDebouncedRef(addSearchInput, 400)
const { data: addSearchResults, isFetching: isSearchingAdd } = useSearchRawMaterial(addSearchQuery)
const addSelectedMaterial = ref<IngredientRow["ingredient"] | null>(null)
const addQty = ref<number | undefined>(undefined)

const addMaterialOptions = computed(() => {
  if (!addSearchResults.value?.results) return []
  return addSearchResults.value.results
    .filter((m) => !ingredientRows.value.find((r) => r.ingredient.value === m.uid))
    .map((m) => ({
      label: m.name,
      value: m.uid || "",
      unit: m.unit || "",
      cost_per_unit: Number(m.last_cost || m.avg_cost || 0),
      kind: (m.is_sub_assembly ? "sub_assembly" : "raw_material") as string,
      conversions: m.conversions || [],
      available_stock: m.current_stock,
    }))
})

function confirmAddIngredient() {
  if (!addSelectedMaterial.value || !addQty.value) return
  const mat = addSelectedMaterial.value
  ingredientRows.value.push({
    id: `${mat.value}-${Date.now()}`,
    ingredient: {
      label: mat.label,
      value: mat.value,
      unit: mat.unit,
      cost_per_unit: mat.cost_per_unit,
      kind: mat.kind,
      conversions: mat.conversions as IngredientRow["ingredient"]["conversions"],
      available_stock: mat.available_stock,
      used_stock: addQty.value,
    },
    qty: addQty.value,
  })
  addModalOpen.value = false
  addSelectedMaterial.value = null
  addSearchInput.value = ""
  addQty.value = undefined
}

function handleNext() {
  emit("next", [...ingredientRows.value])
}

function updateSelectedMat(evt: unknown) {
  addSelectedMaterial.value = evt as IngredientRow["ingredient"]
}
</script>

<template>
  <form @submit.prevent="handleNext">
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Review and adjust ingredient quantities.</p>

    <!-- Loading skeleton -->
    <div v-if="loading && !ingredientRows.length" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-5"
      >
        <div class="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
        <div class="flex-1 space-y-2">
          <div class="h-3 w-2/5 animate-pulse rounded bg-gray-100" />
          <div class="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>

    <template v-else-if="!loading">
      <div
        v-if="insufficientRows.length"
        class="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
      >
        <div class="flex items-center gap-2 text-sm text-amber-700">
          <Icon name="warning" size="16" />
          <span>
            {{ insufficientRows.length }} material{{ insufficientRows.length !== 1 ? "s" : "" }}
            with insufficient stock
          </span>
        </div>
        <a
          href="/production/raw-materials"
          target="_blank"
          class="text-sm font-medium text-amber-700 underline hover:no-underline"
        >
          Go to Materials
        </a>
      </div>

      <div class="space-y-3">
        <div
          v-for="row in ingredientRows"
          :key="row.id"
          :class="
            isInsufficient(row)
              ? 'border-error-200 bg-error-50 rounded-2xl border px-4 py-3'
              : 'rounded-2xl border border-gray-200 bg-white px-4 py-3'
          "
        >
          <!-- Name row -->
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100"
              >
                <Icon name="blur" size="18" />
              </span>
              <div class="flex min-w-0 items-center gap-2">
                <p class="truncate text-sm font-medium text-gray-900">{{ row.ingredient.label }}</p>
                <Chip
                  v-if="row.ingredient.kind === 'sub_assembly'"
                  color="purple"
                  label="Sub-assembly"
                  size="sm"
                />
              </div>
            </div>

            <span class="text-sm font-medium">
              {{ formatCurrency(row.ingredient.cost_per_unit * row.qty) }}
            </span>
          </div>

          <!-- Stats grid -->
          <div class="mt-3 flex items-end gap-2 border-t border-dashed border-gray-200 pt-3">
            <div class="grid flex-1 grid-cols-3">
              <!-- Required Stock -->
              <div class="flex flex-col items-start gap-1">
                <Chip color="alt" :label="`${row.qty} ${row.ingredient.unit}`" radius="md" />
                <span class="text-xs text-gray-500">Required stock</span>
              </div>
              <!-- Available Stock  -->
              <div class="flex flex-col items-start gap-1">
                <Chip
                  v-if="row.ingredient.available_stock !== undefined"
                  :color="isInsufficient(row) ? 'error' : 'alt'"
                  :label="`${row.ingredient.available_stock} ${row.ingredient.unit}`"
                  radius="md"
                />
                <span v-else>-</span>
                <span class="text-xs text-gray-500">Available Stock</span>
              </div>
              <!-- Used Stock  -->
              <div class="flex flex-col items-start gap-1">
                <Chip
                  color="alt"
                  :label="`${row.ingredient.used_stock ?? row.qty} ${row.ingredient.unit}`"
                  radius="md"
                />
                <span class="text-xs text-gray-500">Used Stock</span>
              </div>
            </div>
            <!-- Edit Button -->
            <div class="flex flex-col items-end gap-1">
              <button type="button" @click="openEditModal(row)">
                <Icon name="edit" size="16" class="text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!ingredientRows.length"
          class="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400"
        >
          No ingredients found for this recipe.
        </div>
      </div>

      <button
        type="button"
        class="text-primary-600 mt-3 flex items-center gap-1 text-sm font-medium hover:underline"
        @click="addModalOpen = true"
      >
        <Icon name="add" size="16" />
        Add Ingredient
      </button>
    </template>

    <div class="h-40" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 border-t bg-white p-4 md:p-6">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm text-gray-600">Estimated Cost:</p>
        <span class="text-sm font-medium">{{ totalIngredientCost }}</span>
      </div>
      <div class="flex gap-3">
        <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
        <AppButton label="Continue" class="w-2/3" type="submit" :disabled="!canProceed" />
      </div>
    </div>

    <!-- Edit Used Stock Modal -->
    <Modal
      :open="editModalOpen"
      :title="`Edit Used Stock — ${editingRow?.ingredient.label}`"
      max-width="lg"
      variant="bottom-nav"
      @close="editModalOpen = false"
    >
      <div v-if="editingRow" class="grid grid-cols-2 gap-3">
        <!-- Used stock input — spans both columns -->
        <div class="col-span-2 rounded-xl border border-gray-200 bg-white p-4">
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Used Stock ({{ editingRow.ingredient.unit }})
          </label>
          <TextField
            v-model.number="editUsedStock"
            type="number"
            :suffix="editingRow.ingredient.unit"
          />
        </div>

        <!-- Available stock -->
        <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p class="text-xs text-gray-500">Available Stock</p>
          <p class="mt-1 text-lg font-semibold text-gray-900">
            {{
              editingRow.ingredient.available_stock !== undefined
                ? editingRow.ingredient.available_stock
                : "—"
            }}
            <span class="text-sm font-normal text-gray-500">
              {{ editingRow.ingredient.unit }}
            </span>
          </p>
        </div>

        <!-- Required stock -->
        <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p class="text-xs text-gray-500">Required Stock</p>
          <p class="mt-1 text-lg font-semibold text-gray-900">
            {{ editingRow.qty }}
            <span class="text-sm font-normal text-gray-500">
              {{ editingRow.ingredient.unit }}
            </span>
          </p>
        </div>
      </div>

      <template #footer>
        <AppButton label="Save" class="w-full" @click="saveUsedStock" />
      </template>
    </Modal>

    <!-- AdjustMaterialStockModal (commented out — may be needed later)
    <AdjustMaterialStockModal
      :open="adjustModalOpen"
      :material="selectedMaterial"
      add-only
      @close="adjustModalOpen = false"
      @refresh="(qty) => onAdjustRefresh(qty as number)"
    />
    -->

    <!-- Add Ingredient Modal -->
    <Modal
      :open="addModalOpen"
      title="Add Ingredient"
      max-width="lg"
      variant="bottom-nav"
      @close="addModalOpen = false"
    >
      <div class="space-y-4">
        <SelectField
          :model-value="addSelectedMaterial"
          label="Search material"
          placeholder="Type to search..."
          :options="addMaterialOptions"
          searchable
          :loading="isSearchingAdd"
          @update:model-value="updateSelectedMat"
          @search-change="addSearchInput = $event"
        />
        <TextField
          v-if="addSelectedMaterial"
          v-model.number="addQty"
          type="number"
          label="Quantity"
          :suffix="addSelectedMaterial.unit"
          placeholder="e.g. 5"
        />
      </div>

      <template #footer>
        <AppButton
          label="Add"
          class="w-full"
          :disabled="!addSelectedMaterial || !addQty"
          @click="confirmAddIngredient"
        />
      </template>
    </Modal>
  </form>
</template>
