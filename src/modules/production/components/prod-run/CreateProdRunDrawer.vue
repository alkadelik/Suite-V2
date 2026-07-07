<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { ref, computed, watch } from "vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { IProdRunPayload, TProdRun } from "@modules/production/types"
import {
  useCreateProdRun,
  useUpdateProdRun,
  useGetSingleRecipe,
  useGetSingleProdRun,
} from "@modules/production/api"
import BasicRunDetailsForm from "./run-form/BasicRunDetailsForm.vue"
import AdjustIngredientsForm from "./run-form/AdjustIngredientsForm.vue"
import ProcessExpensesForm from "./run-form/ProcessExpensesForm.vue"
import ProdEconomicsForm from "./run-form/ProdEconomicsForm.vue"
import type { IngredientRow, ProcessRow, AdditionalExpenseRow, BasicRunDetails } from "./form-types"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { floatDecimal } from "@/utils/others"
import { useProductionStore } from "@modules/production/store"

export type { IngredientRow, ProcessRow, AdditionalExpenseRow, BasicRunDetails }
type RunStatus = "draft" | "finalized"

export type RecipeDrawerProps = {
  open: boolean
  run?: TProdRun | null
  mode: "create" | "edit" | "duplicate" | null
  hasFullDetails?: boolean
}

const props = withDefaults(defineProps<RecipeDrawerProps>(), { mode: "create" })
const emit = defineEmits(["close", "refresh"])

const isEditMode = computed(() => props.mode === "edit" && !!props.run)

const drawerTitle = computed(() => {
  if (isEditMode.value && props.run) {
    return `Edit Run - ${props.run.output_item_name} - ${parseInt(props.run.quantity_to_produce)} ${props.run.output_unit}`
  }
  return "Create Run"
})

const steps = computed(() => [
  "Basic details",
  useProductionStore().componentLabel,
  "Process cost",
  "Economics",
])
const activeStep = ref(0)

// ─── Shared state across steps ─────────────────────────────────────────────
const basicDetails = ref<BasicRunDetails>({
  outputQuantity: 0,
  damagedQuantity: 0,
  recipeUid: "",
})

const ingredientRowsState = ref<IngredientRow[]>([])
const processRowsState = ref<ProcessRow[]>([])
const additionalExpensesState = ref<AdditionalExpenseRow[]>([])
const sellingPriceState = ref(0)
const isPending = ref(false)

// Updated immediately when user selects a recipe in step 0 (pre-fetches
// before they reach step 1/2 — single call, cached by TanStack Query).
const selectedRecipeUid = ref("")

// Tracks the recipe's batch size and per-batch ingredient quantities so we
// can scale them correctly when the user sets a different output quantity.
const recipeOutputQty = ref(1)
const ingredientBaseQty = ref<Record<string, number>>({})

// Separate getter so we can pass it to useGetSingleRecipe as a getter fn
const { data: recipeData, isFetching: isLoadingRecipe } = useGetSingleRecipe(
  () => selectedRecipeUid.value,
)

// Guard flag — prevents the selectedRecipeUid watcher from clearing rows
// that were just pre-seeded from an existing run (edit / duplicate).
let skipNextRecipeClear = false

// Seed rows from recipe once per selection; reset on new selection
// Skip clearing in edit mode — the recipe is fixed and rows are seeded from the run
watch(selectedRecipeUid, () => {
  if (skipNextRecipeClear || isEditMode.value) {
    skipNextRecipeClear = false
    return
  }
  ingredientRowsState.value = []
  processRowsState.value = []
})

watch(recipeData, (recipe) => {
  if (!recipe) return
  recipeOutputQty.value = Number(recipe.output_quantity) || 1
  // Only seed if not already populated (user might have edited them)
  if (!ingredientRowsState.value.length && recipe.ingredients?.length) {
    // Store per-batch quantities for scaling when output quantity changes
    recipe.ingredients.forEach((ing) => {
      ingredientBaseQty.value[ing.uid] = ing.quantity
    })
    ingredientRowsState.value = recipe.ingredients.map((ing) => ({
      id: ing.uid,
      ingredient: {
        label: ing.material_name,
        value: ing.material_uid,
        unit: ing.unit,
        cost_per_unit: ing.unit_cost,
        kind: "raw_material",
        available_stock: ing.available_stock,
        conversions: ing.conversions,
      },
      qty: ing.quantity,
    }))
  }
  if (!processRowsState.value.length && recipe.process_costs?.length) {
    processRowsState.value = recipe.process_costs.map((p) => ({
      id: p.uid,
      name: p.name,
      cost: String(p.cost_per_batch),
      note: p.notes || "",
    }))
  }
})

const seedFromRun = (run: TProdRun) => {
  const recipeLabel = `${run.output_item_name} - ${parseInt(run.quantity_to_produce)}${run.output_unit}`

  basicDetails.value = {
    outputQuantity: parseInt(run.quantity_to_produce),
    damagedQuantity: parseInt(run.damaged_quantity),
    recipeUid: run.recipe,
    recipeOption: { label: recipeLabel, value: run.recipe },
    outputVariantUid: run.output_variant || "",
    outputUnit: run.output_unit,
  }

  ingredientRowsState.value = (run.ingredients_used ?? []).map((ing) => {
    const qty = Number(ing.quantity_required)
    const actualUnitCost = Number(ing.actual_unit_cost)
    const estimatedUnitCost = qty > 0 ? Number(ing.estimated_cost) / qty : 0
    return {
      id: ing.uid,
      ingredient: {
        label: ing.material_name,
        value: ing.material_uid,
        unit: ing.unit,
        cost_per_unit: actualUnitCost || estimatedUnitCost,
        kind: "raw_material",
        available_stock: ing.available_inventory,
      },
      qty,
    }
  })

  processRowsState.value = (run.process_costs_used ?? []).map((pc) => ({
    id: pc.uid,
    name: pc.name,
    cost: String(pc.cost_per_batch),
    note: "",
  }))

  additionalExpensesState.value = (run.additional_expenses ?? []).map((ex) => ({
    id: ex.uid,
    name: ex.name,
    amount: String(ex.amount),
  }))

  sellingPriceState.value = Number(run.selling_price_per_unit) || 0

  skipNextRecipeClear = true
  selectedRecipeUid.value = run.recipe
}

// Fetch full run when hasFullDetails is false
const fetchRunUid = computed(() =>
  !props.hasFullDetails && props.open && isEditMode.value ? (props.run?.uid ?? "") : "",
)
const { data: fetchedRun, isFetching: isLoadingRun } = useGetSingleProdRun(fetchRunUid)

watch(fetchedRun, (run) => {
  if (run) seedFromRun(run)
})

// ─── Reset or populate when drawer opens ─────────────────────────────────
watch([() => props.open, () => props.run], ([isOpen]) => {
  if (!isOpen) return
  activeStep.value = 0
  isPending.value = false

  if (props.mode === "create" || !props.run) {
    basicDetails.value = { outputQuantity: 0, damagedQuantity: 0, recipeUid: "" }
    ingredientRowsState.value = []
    processRowsState.value = []
    additionalExpensesState.value = []
    sellingPriceState.value = 0
    selectedRecipeUid.value = ""
    return
  }

  if (props.hasFullDetails) {
    seedFromRun(props.run)
  }
})

const { mutate: createProdRun, isPending: isCreating } = useCreateProdRun()
const { mutate: updateProdRun, isPending: isUpdating } = useUpdateProdRun()

const onSubmit = (status: RunStatus) => {
  const details = basicDetails.value

  const payload: IProdRunPayload = {
    recipe_uid: details.recipeUid,
    output_variant_uid: details.outputVariantUid || undefined,
    quantity_to_produce: String(details.outputQuantity),
    damaged_quantity: String(details.damagedQuantity),
    selling_price_per_unit: String(sellingPriceState.value),
    notes: "",
    ingredients: ingredientRowsState.value
      .filter((r) => r.qty > 0)
      .map((r) => ({
        material_uid: r.ingredient.value,
        quantity_required: floatDecimal(r.ingredient.used_stock!).toString(),
      })),
    process_costs: processRowsState.value
      .filter((p) => p.name.trim())
      .map((p) => ({ recipe_process_cost_uid: p.id, name: p.name, cost_per_batch: p.cost })),
    additional_expenses: additionalExpensesState.value
      .filter((a) => a.name.trim())
      .map((a) => ({ name: a.name, cost_type: "other", amount: a.amount, notes: "" })),
    //
    status,
  }

  const onSuccess = () => {
    toast.success(`Production run ${isEditMode.value ? "updated" : "added"} successfully!`)
    emit("close")
    emit("refresh")
  }

  if (isEditMode.value && props.run?.uid) {
    updateProdRun({ uid: props.run.uid, body: payload }, { onSuccess, onError: displayError })
  } else {
    createProdRun(payload, { onSuccess, onError: displayError })
  }
}

function handleBasicDetailsNext(details: BasicRunDetails, onNext: () => void) {
  const outputChanged = details.outputQuantity !== basicDetails.value.outputQuantity
  basicDetails.value = details
  // Scale ingredient quantities by the ratio of desired output to recipe batch size
  if (!isEditMode.value && recipeOutputQty.value > 0) {
    const scale = details.outputQuantity / recipeOutputQty.value
    ingredientRowsState.value = ingredientRowsState.value.map((row) => {
      const qty = (ingredientBaseQty.value[row.id] ?? row.qty) * scale
      return {
        ...row,
        qty,
        // When output qty changes, re-evaluate used_stock to match the new
        // required qty — regardless of any manual edits made previously.
        ingredient: outputChanged ? { ...row.ingredient, used_stock: qty } : row.ingredient,
      }
    })
  }
  onNext()
}

const confirmClose = ref(false)

const handleClose = () => {
  if (activeStep.value >= 1) {
    confirmClose.value = true
  } else {
    emit("close")
  }
}

const forceClose = () => {
  confirmClose.value = false
  emit("close")
}
</script>

<template>
  <Drawer
    :open="open"
    :title="drawerTitle"
    max-width="2xl"
    variant="fullscreen"
    @close="handleClose"
  >
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step, onPrev, onNext }">
        <!-- loading skeleton while fetching full run details -->
        <div v-if="isLoadingRun" class="space-y-4 p-4">
          <div v-for="n in 6" :key="n" class="h-12 animate-pulse rounded-xl bg-gray-200" />
        </div>

        <template v-else>
          <!-- step 0: basic details -->
          <BasicRunDetailsForm
            v-if="step == 0"
            :initial-values="basicDetails"
            :is-edit-mode="isEditMode"
            @recipe-change="
              (uid: string) => {
                selectedRecipeUid = uid
              }
            "
            @next="(details: BasicRunDetails) => handleBasicDetailsNext(details, onNext)"
            @close="handleClose"
          />
          <!-- step 1: ingredients -->
          <AdjustIngredientsForm
            v-if="step == 1"
            :initial-rows="ingredientRowsState"
            :loading="isLoadingRecipe"
            @next="
              (rows: IngredientRow[]) => {
                ingredientRowsState = rows
                onNext()
              }
            "
            @prev="onPrev"
          />
          <!-- step 2: process cost -->
          <ProcessExpensesForm
            v-if="step == 2"
            :initial-rows="processRowsState"
            :initial-expenses="additionalExpensesState"
            @prev="onPrev"
            @submit="
              (remainingProcessRows: ProcessRow[], additionalExpenses: AdditionalExpenseRow[]) => {
                processRowsState = remainingProcessRows
                additionalExpensesState = additionalExpenses
                onNext()
              }
            "
          />
          <!-- step 3: economics profit estimator -->
          <ProdEconomicsForm
            v-if="step == 3"
            :initial-values="basicDetails"
            :ingredient-rows="ingredientRowsState"
            :process-rows="processRowsState"
            :additional-expenses="additionalExpensesState"
            :loading="isCreating || isUpdating"
            @prev="onPrev"
            @submit="
              (price: number, status: string) => {
                sellingPriceState = price
                onSubmit(status as RunStatus)
              }
            "
          />

          <ConfirmationModal
            v-model="confirmClose"
            header="Discard Production Run?"
            paragraph="You have unsaved progress on this production run. Closing now will lose everything you've entered."
            action-label="Discard"
            variant="warning"
            info-message="This action cannot be reversed."
            @confirm="forceClose"
          />
        </template>
      </template>
    </StepperWizard>
  </Drawer>
</template>
