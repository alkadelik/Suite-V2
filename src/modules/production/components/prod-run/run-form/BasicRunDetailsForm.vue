<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import SelectField from "@components/form/SelectField.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { useSearchRecipe } from "@modules/production/api"
import { computed, ref, watch } from "vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { BasicRunDetails } from "../form-types"

type ItemOption = { label: string; value: string }

const props = defineProps<{
  initialValues: BasicRunDetails
}>()

const emit = defineEmits<{
  (e: "next", details: BasicRunDetails): void
  (e: "recipe-change", recipeUid: string): void
  (e: "close"): void
}>()

// ─── Form validation ─────────────────────────────────────────────────────
const schema = yup.object({
  outputQuantity: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Must be a number")
    .required("Output quantity is required")
    .min(1, "Must be at least 1"),
  damagedQuantity: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Must be a number")
    .required("Damaged quantity is required")
    .min(0, "Cannot be negative"),
  recipe: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .nullable()
    .required("Recipe is required"),
})

const { handleSubmit, values, errors, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    outputQuantity: props.initialValues.outputQuantity || (undefined as unknown as number),
    damagedQuantity: props.initialValues.damagedQuantity ?? (undefined as unknown as number),
    recipe: null as ItemOption | null,
  },
})

// ─── Recipe search ───────────────────────────
const recipeSearchInput = ref("")
const recipeSearchQuery = useDebouncedRef(recipeSearchInput, 400)
const { data: recipeSearchResults, isFetching: isSearchingRecipe } =
  useSearchRecipe(recipeSearchQuery)

const recipeOptions = computed<ItemOption[]>(() => {
  if (!recipeSearchResults.value?.results) return []
  return recipeSearchResults.value.results
    .filter((m) => m)
    .map((m) => ({ label: m.output_item_name, value: m.uid || "" }))
})

// ─── Emit recipe uid immediately when selection changes ──────────────────
watch(
  () => values.recipe,
  (recipe) => {
    if (recipe && typeof recipe === "object" && "value" in recipe) {
      emit("recipe-change", String(recipe.value))
    }
  },
)

// ─── Submit handler ─────────────────────────────────────────────────────
const handleNext = handleSubmit((formValues) => {
  const recipe = formValues.recipe as ItemOption
  emit("next", {
    outputQuantity: formValues.outputQuantity,
    damagedQuantity: formValues.damagedQuantity,
    recipeUid: recipe.value,
  })
})
</script>

<template>
  <form @submit.prevent="handleNext" class="flex flex-col gap-4">
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Basic Recipe Details</p>

    <SelectField
      :model-value="values.recipe"
      label="Select Recipe"
      placeholder="e.g standard formula v2"
      :options="recipeOptions"
      :error="errors.recipe ? String(errors.recipe) : undefined"
      :loading="isSearchingRecipe"
      searchable
      required
      @update:model-value="setFieldValue('recipe', $event as ItemOption)"
      @search-change="recipeSearchInput = $event"
    />

    <FormField
      name="outputQuantity"
      type="number"
      label="Quantity Produced (including damages)"
      placeholder="e.g. 100"
      required
    />

    <FormField
      name="damagedQuantity"
      type="number"
      label="Quantity Damaged"
      placeholder="e.g. 10"
      required
    />

    <div class="h-40" />

    <div
      class="border-core-200 fixed right-0 bottom-0 left-0 space-y-2 border-t bg-white p-4 md:p-6"
    >
      <div class="grid grid-cols-2 gap-3">
        <AppButton label="Back" color="alt" icon="arrow-left" @click="emit('close')" />
        <AppButton label="Next" type="submit" />
      </div>
    </div>
  </form>
</template>
