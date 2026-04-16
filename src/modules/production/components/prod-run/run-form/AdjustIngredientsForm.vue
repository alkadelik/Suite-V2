<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import type { IngredientRow } from "../form-types"
import { computed, ref } from "vue"
import Chip from "@components/Chip.vue"

const props = defineProps<{
  initialRows: IngredientRow[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: "next", rows: IngredientRow[]): void
  (e: "prev"): void
}>()

const { format: formatCurrency } = useFormatCurrency()

const ingredientRows = ref<IngredientRow[]>([...props.initialRows])

const insufficientRows = computed(() =>
  ingredientRows.value.filter(
    (r) => r.ingredient.available_stock !== undefined && r.qty > r.ingredient.available_stock,
  ),
)

const quickAdjust = () => {
  ingredientRows.value = ingredientRows.value.map((r) =>
    r.ingredient.available_stock !== undefined
      ? { ...r, qty: Math.min(r.qty, r.ingredient.available_stock) }
      : r,
  )
}

const totalIngredientCost = computed(() => {
  const total = ingredientRows.value.reduce(
    (sum, row) => sum + (row.ingredient.cost_per_unit || 0) * row.qty,
    0,
  )
  return formatCurrency(total)
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
        <button
          type="button"
          class="text-sm font-medium text-amber-700 underline hover:no-underline"
          @click="quickAdjust"
        >
          Quick Adjust
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="row in ingredientRows"
          :key="row.id"
          class="rounded-2xl border border-gray-200 bg-white px-4 py-3"
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
                <span
                  v-if="row.ingredient.kind === 'sub_assembly'"
                  class="inline-flex shrink-0 rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700"
                >
                  Sub-assembly
                </span>
              </div>
            </div>

            <span class="text-sm font-medium">
              {{ formatCurrency(row.ingredient.cost_per_unit * row.qty) }}
            </span>
          </div>

          <!-- Stats grid -->
          <div class="mt-3 flex items-end gap-2 rounded-xl bg-gray-50 p-3">
            <div class="grid flex-1 grid-cols-3">
              <!-- Required Stock -->
              <div class="flex flex-col items-start gap-1">
                <Chip color="alt" :label="`${row.qty} ${row.ingredient.unit}`" radius="md" />
                <span class="text-xs text-gray-500">Required stock</span>
              </div>
              <!-- Available Stock  -->
              <div class="flex flex-col gap-1">
                <Chip
                  v-if="row.ingredient.available_stock !== undefined"
                  color="alt"
                  :label="`${row.ingredient.available_stock} ${row.ingredient.unit}`"
                  radius="md"
                />
                <span v-else>-</span>
                <span class="text-xs text-gray-500">Available Stock</span>
              </div>
              <!-- Used Stock  -->
              <div class="flex flex-col gap-1">
                <Chip
                  v-if="row.ingredient.used_stock !== undefined"
                  color="alt"
                  :label="`${row.ingredient.used_stock} ${row.ingredient.unit}`"
                  radius="md"
                />
                <span v-else>-</span>
                <span class="text-xs text-gray-500">Used Stock</span>
              </div>
            </div>
            <!-- Edit Button  -->
            <div class="flex flex-col items-end gap-1">
              <Icon name="edit" size="16" class="text-gray-500" />
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
  </form>
</template>
