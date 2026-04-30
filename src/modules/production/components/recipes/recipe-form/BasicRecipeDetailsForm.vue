<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import RadioInputField from "@components/form/RadioInputField.vue"
import SelectField from "@components/form/SelectField.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { useSearchProductCatalogs } from "@modules/inventory/api"
import { useSearchRawMaterial } from "@modules/production/api"
import type { BasicDetails } from "../AddNewRecipeDrawer.vue"
import { computed, ref, watch } from "vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { UNITS_OF_MEASURE } from "@modules/production/constant"

type ItemOption = { label: string; value: string; item?: Record<string, unknown> }

const props = defineProps<{
  initialValues: BasicDetails
  isEditMode?: boolean
}>()

const emit = defineEmits<{
  (e: "next", details: BasicDetails): void
  (e: "close"): void
}>()

// ─── Form validation ─────────────────────────────────────────────────────
const schema = yup.object({
  outputItemType: yup.string().oneOf(["product", "sub_assembly"]).required(),
  // store the full option object so SelectField can display the label
  outputItem: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .nullable()
    .required("Output item is required"),
  outputQuantity: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .typeError("Must be a number")
    .required("Output quantity is required")
    .min(1, "Must be at least 1"),
  unit: yup
    .object({ label: yup.string().required(), value: yup.string().required() })
    .nullable()
    .required("Unit is required"),
  notes: yup.string().default(""),
})

const { handleSubmit, values, errors, setFieldValue, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    outputItemType: props.initialValues.outputItemType,
    outputItem: (props.initialValues.outputItemOption ?? null) as ItemOption | null,
    outputQuantity: props.initialValues.outputQuantity || (undefined as unknown as number),
    unit: (props.initialValues.unitOption ?? null) as ItemOption | null,
    notes: props.initialValues.notes,
  },
})

// Re-initialize when parent repopulates (e.g. drawer reopens in edit/duplicate mode)
watch(
  () => props.initialValues,
  (iv) => {
    resetForm({
      values: {
        outputItemType: iv.outputItemType,
        outputItem: (iv.outputItemOption ?? null) as ItemOption | null,
        outputQuantity: iv.outputQuantity || (undefined as unknown as number),
        unit: (iv.unitOption ?? null) as ItemOption | null,
        notes: iv.notes,
      },
    })
  },
)

// ─── Product search ──────────────────────────────────────────────────────
const productSearchInput = ref("")
const productSearchQuery = useDebouncedRef(productSearchInput, 400)
const { data: prodSearchResults, isFetching: isSearchingProd } =
  useSearchProductCatalogs(productSearchQuery)

const productOptions = computed(() => {
  if (!prodSearchResults.value?.results) return []
  return prodSearchResults.value.results.map((p) => ({
    label: p.name,
    value: p.uid || "",
    item: p,
  }))
})

// ─── Raw material search (sub-assemblies only) ───────────────────────────
const matSearchInput = ref("")
const matSearchQuery = useDebouncedRef(matSearchInput, 400)
const { data: matSearchResults, isFetching: isSearchingMat } = useSearchRawMaterial(matSearchQuery)

const materialOptions = computed<ItemOption[]>(() => {
  if (!matSearchResults.value?.results) return []
  return matSearchResults.value.results
    .filter((m) => m.is_sub_assembly)
    .map((m) => ({ label: m.name, value: m.uid || "", item: m }))
})

// ─── Unit options ─────────────────────────────────────────────────────────
const unitOptions = UNITS_OF_MEASURE

// ─── Auto-fill unit from selected output item ────────────────────────────
const selectedItemUnit = computed<string | null>(() => {
  const selected = values.outputItem
  if (!selected?.item) return null
  return (selected.item.unit as string) || null
})

const unitIsLocked = computed(() => !!selectedItemUnit.value)

watch(selectedItemUnit, (unit) => {
  if (unit) {
    const match = UNITS_OF_MEASURE.find((u) => u.value === unit)
    setFieldValue("unit", match ?? { label: unit, value: unit })
  }
})

// ─── Clear output item when type changes ─────────────────────────────────
watch(
  () => values.outputItemType,
  () => {
    setFieldValue("outputItem", null)
    setFieldValue("unit", null)
  },
)

// ─── Submit handler ─────────────────────────────────────────────────────
const handleNext = handleSubmit((formValues) => {
  const item = formValues.outputItem as ItemOption
  const unit = formValues.unit as ItemOption
  emit("next", {
    outputItemType: formValues.outputItemType as "product" | "sub_assembly",
    outputItem: item.value,
    outputItemOption: { label: item.label, value: item.value },
    outputQuantity: formValues.outputQuantity,
    unit: unit.value,
    unitOption: { label: unit.label, value: unit.value },
    notes: formValues.notes || "",
  })
})
</script>

<template>
  <form @submit.prevent="handleNext" class="flex flex-col gap-4">
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Basic Recipe Details</p>

    <div class="mb-4">
      <RadioInputField
        :model-value="values.outputItemType"
        :options="[
          { label: 'Product', value: 'product' },
          { label: 'Sub-assembly', value: 'sub_assembly' },
        ]"
        label="Output Item Type"
        :disabled="isEditMode"
        @update:model-value="setFieldValue('outputItemType', $event as 'product' | 'sub_assembly')"
      />
    </div>

    <SelectField
      v-if="values.outputItemType === 'product'"
      :model-value="values.outputItem"
      label="Output Item"
      placeholder="Select output item"
      :options="productOptions"
      :error="errors.outputItem ? String(errors.outputItem) : undefined"
      :loading="isSearchingProd"
      searchable
      required
      :disabled="isEditMode"
      @update:model-value="setFieldValue('outputItem', $event as ItemOption)"
      @search-change="productSearchInput = $event"
    />

    <!-- sub-assembly raw materials only -->
    <SelectField
      v-if="values.outputItemType === 'sub_assembly'"
      :model-value="values.outputItem"
      label="Output Item (Sub-assembly)"
      placeholder="Select sub-assembly"
      :options="materialOptions"
      :error="errors.outputItem ? String(errors.outputItem) : undefined"
      :loading="isSearchingMat"
      searchable
      required
      :disabled="isEditMode"
      @update:model-value="setFieldValue('outputItem', $event as ItemOption)"
      @search-change="matSearchInput = $event"
    />

    <FormField
      name="outputQuantity"
      type="number"
      label="Output Quantity"
      placeholder="e.g. 100"
      required
    />

    <FormField
      name="unit"
      type="select"
      label="Unit"
      placeholder="e.g. kg, liters, pieces"
      :options="unitOptions"
      :disabled="unitIsLocked"
      required
    />

    <FormField name="notes" type="textarea" label="Notes (optional)" />

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
