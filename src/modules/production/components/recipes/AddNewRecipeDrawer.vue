<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import StepperWizard from "@components/StepperWizard.vue"
import { useProductionStore } from "@modules/production/store"
import { useMediaQuery } from "@vueuse/core"
import { ref, computed, watch } from "vue"
import { toast } from "@/composables/useToast"
import BasicRecipeDetailsForm from "./recipe-form/BasicRecipeDetailsForm.vue"
import AddIngredientsForm from "./recipe-form/AddIngredientsForm.vue"
import ProcessCostForm from "./recipe-form/ProcessCostForm.vue"
import { displayError } from "@/utils/error-handler"
import { IRecipePayload, TRecipe } from "@modules/production/types"
import { useCreateRecipe, useUpdateRecipe } from "@modules/production/api"

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
  outputType: "raw-material" | "product"
  outputItem: string
  outputItemType: "product" | "sub_assembly"
  outputQuantity: number
  unit: string
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

const steps = ["Basic details", "Ingredients", "Process cost"]
const activeStep = ref(0)

const selectedRecipeOption = computed(() => useProductionStore().selectedRecipeOption)
const recipeLabel = computed(() => selectedRecipeOption.value?.label || "Recipe")

// ─── Shared state across steps ─────────────────────────────────────────────
const basicDetails = ref<BasicDetails>({
  outputType: "raw-material",
  outputItem: "",
  outputItemType: "sub_assembly",
  outputQuantity: 0,
  unit: "",
  notes: "",
})

const ingredientRowsState = ref<IngredientRow[]>([])
const processRowsState = ref<ProcessRow[]>([])
const isPending = ref(false)

// ─── Reset on open ─────────────────────────────────────────────────────────
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    activeStep.value = 0
    basicDetails.value = {
      outputType: "raw-material",
      outputItem: "",
      outputItemType: "sub_assembly",
      outputQuantity: 0,
      unit: "",
      notes: "",
    }
    ingredientRowsState.value = []
    processRowsState.value = []
    isPending.value = false
  },
)

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
    toast.success(`${recipeLabel.value} ${isEditMode.value ? "updated" : "added"} successfully!`)
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
    :title="isEditMode ? `Edit ${recipeLabel}` : `Add ${recipeLabel}`"
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
