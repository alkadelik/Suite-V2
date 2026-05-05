<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import SelectField from "@components/form/SelectField.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { useSearchRecipe } from "@modules/production/api"
import { useGetProduct } from "@modules/inventory/api"
import { computed, ref, watch } from "vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { BasicRunDetails } from "../form-types"
import Chip from "@components/Chip.vue"

type ItemOption = {
  label: string
  value: string
  name?: string
  output_quantity?: number | string
  item_type?: "product" | "sub_assembly"
  output_product?: string | null
}

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
  outputVariantUid: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .nullable()
    .optional(),
})

const { handleSubmit, values, errors, setFieldValue, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    outputQuantity: props.initialValues.outputQuantity || (undefined as unknown as number),
    damagedQuantity: props.initialValues.damagedQuantity ?? (undefined as unknown as number),
    recipe: (props.initialValues.recipeOption ?? null) as ItemOption | null,
    outputVariantUid: null as ItemOption | null,
  },
})

// Re-initialize when parent repopulates (edit/duplicate reopens)
watch(
  () => props.initialValues,
  (iv) => {
    resetForm({
      values: {
        outputQuantity: iv.outputQuantity || (undefined as unknown as number),
        damagedQuantity: iv.damagedQuantity ?? (undefined as unknown as number),
        recipe: (iv.recipeOption ?? null) as ItemOption | null,
        outputVariantUid: null as ItemOption | null,
      },
    })
  },
)

// ─── Recipe search ───────────────────────────
const recipeSearchInput = ref("")
const recipeSearchQuery = useDebouncedRef(recipeSearchInput, 400)
const { data: recipeSearchResults, isFetching: isSearchingRecipe } =
  useSearchRecipe(recipeSearchQuery)

const recipeOptions = computed<ItemOption[]>(() => {
  if (!recipeSearchResults.value?.results) return []
  return recipeSearchResults.value.results
    .filter((m) => m)
    .map((m) => {
      const qty = parseInt(m.output_quantity)
      const unit = m.output_unit || ""
      return {
        label: `${m.output_item_name} - ${qty}${unit}`,
        value: m.uid || "",
        output_quantity: qty + unit,
        name: m.output_item_name,
        item_type: m.item_type,
        output_product: m.output_product,
      }
    }) as ItemOption[]
})

// ─── Variant list (only when recipe is for a product) ───────────────────
const selectedRecipe = computed(() => values.recipe)
const isProductRecipe = computed(
  () => (selectedRecipe.value as { item_type?: string } | null)?.item_type === "product",
)
const selectedProductUid = computed(
  () => (selectedRecipe.value as { output_product?: string | null } | null)?.output_product || "",
)

const { data: productData, isFetching: isLoadingVariants } = useGetProduct(
  () => selectedProductUid.value,
  { enabled: () => !!selectedProductUid.value },
)

const variantOptions = computed<{ label: string; value: string; price?: number }[]>(() => {
  if (!productData.value?.data?.variants) return []
  return productData.value.data.variants.map((v) => ({
    label: v.name?.split(productData.value.data.name + " - ")?.[1] || v.name,
    value: v.uid,
    price: v.price ? Number(v.price) : undefined,
  }))
})

// ─── Emit recipe uid immediately when selection changes ──────────────────
watch(
  () => values.recipe,
  (recipe) => {
    setFieldValue("outputVariantUid", null)
    if (recipe && typeof recipe === "object" && "value" in recipe) {
      emit("recipe-change", String(recipe.value))
    }
  },
)

// ─── Auto-select variant when options load (edit / duplicate pre-populate) ─
watch(variantOptions, (opts) => {
  const preselectedUid = props.initialValues.outputVariantUid
  if (!preselectedUid || values.outputVariantUid) return
  const match = opts.find((o) => o.value === preselectedUid)
  if (match) setFieldValue("outputVariantUid", match)
})

// ─── Submit handler ─────────────────────────────────────────────────────
const handleNext = handleSubmit((formValues) => {
  const recipe = formValues.recipe as ItemOption
  const variant = formValues.outputVariantUid as {
    label: string
    value: string
    price?: number
  } | null
  emit("next", {
    outputQuantity: formValues.outputQuantity,
    damagedQuantity: formValues.damagedQuantity,
    recipeUid: recipe.value,
    outputVariantUid: variant?.value || "",
    outputItemType: recipe.item_type,
    variantPrice: variant?.price,
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
    >
      <template #option="{ option, selected }">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>{{ (option as ItemOption).name }}</span>
            <Chip color="blue" :label="(option as ItemOption).output_quantity" />
          </div>
          <Icon v-if="selected" name="check" class="text-primary-600 h-4 w-4" />
        </div>
      </template>
    </SelectField>

    <SelectField
      v-if="isProductRecipe"
      :model-value="values.outputVariantUid"
      label="Output Variant"
      placeholder="Select variant"
      :options="variantOptions"
      :error="errors.outputVariantUid ? String(errors.outputVariantUid) : undefined"
      :loading="isLoadingVariants"
      required
      searchable
      @update:model-value="setFieldValue('outputVariantUid', $event as ItemOption)"
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
