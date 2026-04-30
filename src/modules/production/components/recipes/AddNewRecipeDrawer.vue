<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { useProductionStore } from "@modules/production/store"
import { useMediaQuery } from "@vueuse/core"
import { ref, computed, watch, capitalize } from "vue"
import { toast } from "@/composables/useToast"
import BasicRecipeDetailsForm from "./recipe-form/BasicRecipeDetailsForm.vue"
import AddIngredientsForm from "./recipe-form/AddIngredientsForm.vue"
import ProcessCostForm from "./recipe-form/ProcessCostForm.vue"
import { displayError } from "@/utils/error-handler"
import { IRecipePayload, TRecipe } from "@modules/production/types"
import { useCreateRecipe, useUpdateRecipe } from "@modules/production/api"
import { UNITS_OF_MEASURE } from "@modules/production/constant"

export type IngredientRow = {
  id: string
  ingredient: { label: string; value: string; unit?: string; cost_per_unit: number; kind: string }
  qty: number
}

export type ProcessRow = {
  id: string
  name: string
  cost: string
  note: string
}

export type BasicDetails = {
  outputItemType: "product" | "sub_assembly"
  outputItem: string
  outputItemOption?: { label: string; value: string } | null
  outputQuantity: number
  unit: string
  unitOption?: { label: string; value: string } | null
  notes: string
}

export type RecipeDrawerProps = {
  open: boolean
  recipe?: TRecipe | null
  mode: "create" | "edit" | "duplicate" | null
}

const props = withDefaults(defineProps<RecipeDrawerProps>(), { mode: "create" })
const emit = defineEmits(["close", "refresh"])

const isMobile = computed(() => useMediaQuery("(max-width: 1028px)").value)
const isEditMode = computed(() => props.mode === "edit" && !!props.recipe)

const drawerTitle = computed(() => {
  if (isEditMode.value) return `Edit ${capitalize(recipeNameValue.value)}`
  return `Add ${capitalize(recipeNameValue.value)}`
})

const steps = ["Basic details", "Ingredients", "Process cost"]
const activeStep = ref(0)

const recipeNameValue = computed(() => useProductionStore().recipeValue)

// ─── Shared state across steps ─────────────────────────────────────────────
const basicDetails = ref<BasicDetails>({
  outputItemType: "product",
  outputItem: "",
  outputQuantity: 0,
  unit: "",
  notes: "",
})

const ingredientRowsState = ref<IngredientRow[]>([])
const processRowsState = ref<ProcessRow[]>([])
const isPending = ref(false)

// ─── Reset or populate when drawer opens ───────────────────────────────────
watch([() => props.open, () => props.recipe], ([isOpen]) => {
  if (!isOpen || !props.mode) return
  activeStep.value = 0
  isPending.value = false

  if (props.mode === "create" || !props.recipe) {
    basicDetails.value = {
      outputItemType: "product",
      outputItem: "",
      outputQuantity: 0,
      unit: "",
      notes: "",
    }
    ingredientRowsState.value = []
    processRowsState.value = []
    return
  }

  // edit / duplicate – use fully-hydrated recipe passed by the caller
  const recipe = props.recipe
  const itemUid = recipe.output_product || recipe.output_raw_material || ""
  const unitOption =
    UNITS_OF_MEASURE.find((u) => u.value?.toLowerCase() === recipe.output_unit?.toLowerCase()) ??
    (recipe.output_unit ? { label: recipe.output_unit, value: recipe.output_unit } : null)
  basicDetails.value = {
    outputItemType: recipe.item_type,
    outputItem: itemUid,
    outputItemOption: itemUid ? { label: recipe.output_item_name, value: itemUid } : null,
    outputQuantity: parseInt(recipe.output_quantity),
    unit: recipe.output_unit,
    unitOption,
    notes: recipe.notes || "",
  }
  ingredientRowsState.value = (recipe.ingredients ?? []).map((ing) => ({
    id: ing.uid,
    ingredient: {
      label: ing.material_name,
      value: ing.material_uid,
      unit: ing.unit,
      cost_per_unit: ing.unit_cost,
      kind: "raw_material" as string,
    },
    qty: ing.quantity,
  }))
  processRowsState.value = (recipe.process_costs ?? []).map((pc) => ({
    id: pc.uid,
    name: pc.name,
    cost: String(pc.cost_per_batch),
    note: pc.notes,
  }))
})
const { mutate: createRecipe, isPending: isCreating } = useCreateRecipe()
const { mutate: updateRecipe, isPending: isUpdating } = useUpdateRecipe()

const onSubmit = () => {
  const details = basicDetails.value
  const ingredients: IRecipePayload["ingredients"] = ingredientRowsState.value
    .filter((r) => r.qty > 0)
    .map((r) => ({ material_uid: r.ingredient.value, quantity: r.qty }))

  const processCosts: IRecipePayload["process_costs"] = processRowsState.value
    .filter((p) => p.name.trim())
    .map((p) => ({ name: p.name, cost_per_batch: p.cost, notes: p.note }))

  const payload: IRecipePayload = {
    output_item_type: details.outputItemType,
    output_item_uid: details.outputItem,
    output_quantity: details.outputQuantity,
    output_unit: details.unit || "",
    notes: details.notes,
    ingredients,
    process_costs: processCosts,
  }

  const onSuccess = () => {
    toast.success(
      `${capitalize(recipeNameValue.value)} ${isEditMode.value ? "updated" : "added"} successfully!`,
    )
    emit("close")
    emit("refresh")
  }

  if (isEditMode.value && props.recipe?.uid) {
    updateRecipe({ uid: props.recipe.uid, body: payload }, { onSuccess, onError: displayError })
  } else {
    createRecipe(payload, { onSuccess, onError: displayError })
  }
}
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    :title="drawerTitle"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step, onPrev, onNext }">
        <!-- step 0: basic details -->
        <BasicRecipeDetailsForm
          v-if="step == 0"
          :initial-values="basicDetails"
          :is-edit-mode="isEditMode"
          @next="
            (details: BasicDetails) => {
              basicDetails = details
              onNext()
            }
          "
          @close="emit('close')"
        />
        <!-- step 1: ingredients -->
        <AddIngredientsForm
          v-if="step == 1"
          :initial-rows="ingredientRowsState"
          :exclude-uid="basicDetails.outputItem"
          :output-item-details="{
            name: basicDetails.outputItemOption?.label || '',
            qty: basicDetails.outputQuantity,
            unit: basicDetails.unit,
            type: basicDetails.outputItemType,
          }"
          @next="
            (rows: IngredientRow[]) => {
              ingredientRowsState = rows
              onNext()
            }
          "
          @prev="onPrev"
        />
        <!-- step 2: process cost -->
        <ProcessCostForm
          v-if="step == 2"
          :initial-rows="processRowsState"
          :loading="isCreating || isUpdating"
          :output-item-details="{
            name: basicDetails.outputItemOption?.label || '',
            qty: basicDetails.outputQuantity,
            unit: basicDetails.unit,
            type: basicDetails.outputItemType,
          }"
          @prev="onPrev"
          @submit="
            (rows: ProcessRow[]) => {
              processRowsState = rows
              onSubmit()
            }
          "
        />
      </template>
    </StepperWizard>
  </component>
</template>
