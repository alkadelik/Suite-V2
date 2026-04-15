<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { useMediaQuery } from "@vueuse/core"
import { ref, computed, watch } from "vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { IProdRunPayload, TProdRun } from "@modules/production/types"
import { useCreateProdRun, useUpdateProdRun, useGetSingleRecipe } from "@modules/production/api"
import BasicRunDetailsForm from "./run-form/BasicRunDetailsForm.vue"
import AdjustIngredientsForm from "./run-form/AdjustIngredientsForm.vue"
import ProcessExpensesForm from "./run-form/ProcessExpensesForm.vue"
import ProdEconomicsForm from "./run-form/ProdEconomicsForm.vue"
import type { IngredientRow, ProcessRow, AdditionalExpenseRow, BasicRunDetails } from "./form-types"

export type { IngredientRow, ProcessRow, AdditionalExpenseRow, BasicRunDetails }

export type RecipeDrawerProps = {
  open: boolean
  run?: TProdRun | null
  mode: "create" | "edit" | "duplicate" | null
}

const props = withDefaults(defineProps<RecipeDrawerProps>(), { mode: "create" })
const emit = defineEmits(["close", "refresh"])

const isMobile = computed(() => useMediaQuery("(max-width: 1028px)").value)
const isEditMode = computed(() => props.mode === "edit" && !!props.run)

const steps = ["Basic details", "Ingredients", "Process cost", "Economics"]
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

// Separate getter so we can pass it to useGetSingleRecipe as a getter fn
const { data: recipeData, isFetching: isLoadingRecipe } = useGetSingleRecipe(
  () => selectedRecipeUid.value,
)

// Seed rows from recipe once per selection; reset on new selection
watch(selectedRecipeUid, () => {
  ingredientRowsState.value = []
  processRowsState.value = []
})

watch(recipeData, (recipe) => {
  if (!recipe) return
  // Only seed if not already populated (user might have edited them)
  if (!ingredientRowsState.value.length && recipe.ingredients?.length) {
    ingredientRowsState.value = recipe.ingredients.map((ing) => ({
      id: ing.uid,
      ingredient: {
        label: ing.material_name,
        value: ing.material_uid,
        unit: ing.unit,
        cost_per_unit: ing.unit_cost,
        kind: "raw_material",
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

// ─── Reset on open ─────────────────────────────────────────────────────────
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    activeStep.value = 0
    basicDetails.value = {
      outputQuantity: 0,
      damagedQuantity: 0,
      recipeUid: "",
    }
    ingredientRowsState.value = []
    processRowsState.value = []
    additionalExpensesState.value = []
    sellingPriceState.value = 0
    isPending.value = false
    selectedRecipeUid.value = ""
  },
)

const { mutate: createProdRun, isPending: isCreating } = useCreateProdRun()
const { mutate: updateProdRun, isPending: isUpdating } = useUpdateProdRun()

const onSubmit = () => {
  const details = basicDetails.value

  const payload: IProdRunPayload = {
    recipe_uid: details.recipeUid,
    output_variant_uid:
      recipeData.value?.output_product || recipeData.value?.output_raw_material || undefined,
    quantity_to_produce: String(details.outputQuantity),
    damaged_quantity: String(details.damagedQuantity),
    selling_price_per_unit: String(sellingPriceState.value),
    notes: "",
    ingredients: ingredientRowsState.value
      .filter((r) => r.qty > 0)
      .map((r) => ({ material_uid: r.ingredient.value, quantity_required: String(r.qty) })),
    process_costs: processRowsState.value
      .filter((p) => p.name.trim())
      .map((p) => ({ recipe_process_cost_uid: p.id, name: p.name, cost_per_batch: p.cost })),
    additional_expenses: additionalExpensesState.value
      .filter((a) => a.name.trim())
      .map((a) => ({ name: a.name, cost_type: "other", amount: a.amount, notes: "" })),
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
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    :title="isEditMode ? `Edit Run` : `Create Run`"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step, onPrev, onNext }">
        <!-- step 0: basic details -->
        <BasicRunDetailsForm
          v-if="step == 0"
          :initial-values="basicDetails"
          @recipe-change="
            (uid: string) => {
              selectedRecipeUid = uid
            }
          "
          @next="
            (details: BasicRunDetails) => {
              basicDetails = details
              onNext()
            }
          "
          @close="emit('close')"
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
            (price: number) => {
              sellingPriceState = price
              onSubmit()
            }
          "
        />
      </template>
    </StepperWizard>
  </component>
</template>
