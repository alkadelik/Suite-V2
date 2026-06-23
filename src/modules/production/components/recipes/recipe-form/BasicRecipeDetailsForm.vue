<script setup lang="ts">
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import RadioInputField from "@components/form/RadioInputField.vue"
import SelectField from "@components/form/SelectField.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import Modal from "@components/Modal.vue"
import TextField from "@components/form/TextField.vue"
import { useSearchProducts } from "@modules/inventory/api"
import { useSearchRawMaterial } from "@modules/production/api"
import type { BasicDetails } from "../AddNewRecipeDrawer.vue"
import { computed, nextTick, ref, watch } from "vue"
import { Field, useForm } from "vee-validate"
import * as yup from "yup"
import { UNITS_OF_MEASURE } from "@modules/production/constant"
import { useSharedStore } from "@modules/shared/store"
import { useProductionStore } from "@modules/production/store"

const recipeSingularLabel = computed(() => useProductionStore().recipeSingularLabel)

type ItemOption = { label: string; value: string; item?: Record<string, unknown> }

const props = defineProps<{
  initialValues: BasicDetails
  isEditMode?: boolean
  unitLockedByHistory?: boolean
}>()

const emit = defineEmits<{
  (e: "next", details: BasicDetails): void
  (e: "close"): void
}>()

const sharedStore = useSharedStore()

// ─── Form validation ─────────────────────────────────────────────────────
const schema = yup.object({
  name: yup.string().optional().default(""),
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
    name: props.initialValues.name || "",
    outputItemType: props.initialValues.outputItemType,
    outputItem: (props.initialValues.outputItemOption ?? null) as ItemOption | null,
    outputQuantity: props.initialValues.outputQuantity || (undefined as unknown as number),
    unit: (props.initialValues.unitOption ?? null) as ItemOption | null,
    notes: props.initialValues.notes,
  },
})

let isResetting = false

// Re-initialize when parent repopulates (e.g. drawer reopens in edit/duplicate mode)
watch(
  () => props.initialValues,
  (iv) => {
    isResetting = true
    resetForm({
      values: {
        name: iv.name || "",
        outputItemType: iv.outputItemType,
        outputItem: (iv.outputItemOption ?? null) as ItemOption | null,
        outputQuantity: iv.outputQuantity || (undefined as unknown as number),
        unit: (iv.unitOption ?? null) as ItemOption | null,
        notes: iv.notes,
      },
    })
    nextTick(() => {
      isResetting = false
    })
  },
)

// ─── Product search ──────────────────────────────────────────────────────
const productSearchInput = ref("")
const productSearchQuery = useDebouncedRef(productSearchInput, 400)
const { data: prodSearchResults, isFetching: isSearchingProd } =
  useSearchProducts(productSearchQuery)

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
const unitOptions = ref(UNITS_OF_MEASURE)

// ─── Add new unit ─────────────────────────────────────────────────────────
const showAddUnit = ref(false)
const newUnitName = ref("")

const createNewUnit = () => {
  const unit = newUnitName.value.trim()
  const newUnit = { label: unit, value: unit.toLowerCase().replace(/\s+/g, "_") }
  unitOptions.value.push(newUnit)
  setFieldValue("unit", newUnit)
  showAddUnit.value = false
  newUnitName.value = ""
}

// ─── Auto-fill unit from selected output item ────────────────────────────
const selectedItemUnit = computed<string | null>(() => {
  const selected = values.outputItem
  if (!selected?.item) return null
  return (selected.item.unit as string) || null
})

const selectedItemHasBeenProduced = computed(() => !!values.outputItem?.item?.has_been_produced)

watch(selectedItemUnit, (unit) => {
  if (unit) {
    const match = UNITS_OF_MEASURE.find((u) => u.value === unit)
    setFieldValue("unit", match ?? { label: unit, value: unit })
  }
})

// ─── Clear output item when type changes (skip during programmatic reset) ────
watch(
  () => values.outputItemType,
  () => {
    if (isResetting) return
    setFieldValue("outputItem", null)
    setFieldValue("unit", null)
  },
)

// ─── Submit handler ─────────────────────────────────────────────────────
const handleNext = handleSubmit((formValues) => {
  const item = formValues.outputItem as ItemOption
  const unit = formValues.unit as ItemOption
  emit("next", {
    name: formValues.name || "",
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
  <form @submit.prevent="handleNext" class="flex flex-col gap-5">
    <div>
      <span class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
        <Icon name="box-filled" size="28" />
      </span>
      <p class="text-sm">Basic {{ recipeSingularLabel }} Details</p>
    </div>

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
      :hint="isEditMode ? 'Output item cannot be changed in EDIT mode' : undefined"
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
      name="name"
      :label="`Custom ${recipeSingularLabel} Name (optional)`"
      placeholder="e.g. Vanila Cake"
      :required="false"
    />

    <div>
      <Field v-slot="{ field, errors: fieldErrors }" name="unit">
        <SelectField
          v-bind="field"
          :model-value="field.value"
          label="Unit of Measurement"
          placeholder="e.g. kg, liters, pieces"
          :options="unitOptions"
          :disabled="selectedItemHasBeenProduced"
          required
          searchable
          :error="fieldErrors[0]"
          :hint="isEditMode ? 'Unit cannot be changed in EDIT mode' : undefined"
          @update:model-value="field.value = $event"
        >
          <template #prepend="{ close }">
            <div
              class="hover:bg-core-25 cursor-pointer border-b border-gray-200 px-4 py-2 text-sm transition-colors duration-150"
              @click="
                () => {
                  close()
                  showAddUnit = true
                }
              "
            >
              <div class="flex items-center justify-between">
                <span class="text-primary-600 font-semibold">Add New Unit</span>
                <Icon name="add" class="text-primary-600 h-4 w-4" />
              </div>
            </div>
          </template>
          <template #no-options="{ search, close }">
            <p>
              No results found.
              <button
                class="text-primary-600 ml-1 hover:underline"
                @click="
                  () => {
                    close()
                    showAddUnit = true
                    newUnitName = search
                  }
                "
              >
                Add <span class="font-semibold">"{{ search }}"</span>
              </button>
              as a unit?
            </p>
          </template>
        </SelectField>
      </Field>
      <p v-if="selectedItemHasBeenProduced" class="mt-1 text-sm text-gray-500">
        Unit cannot be changed once a recipe has been used in a production run.
        <button
          type="button"
          class="text-primary-600 underline"
          @click="sharedStore.openSupportModal()"
        >
          Contact support
        </button>
        to make changes.
      </p>
    </div>

    <FormField
      name="outputQuantity"
      type="decimal"
      label="Output Quantity"
      placeholder="e.g. 100"
      required
      :suffix="values.unit?.value"
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

    <!-- Create new Unit Modal -->
    <Modal :open="showAddUnit" title="Add New Unit" max-width="md" @close="showAddUnit = false">
      <div class="space-y-4">
        <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
          <Icon name="profile-add" size="28" />
        </div>
        <p class="text-sm text-gray-600">Create a new unit of measurement</p>

        <TextField v-model="newUnitName" label="Unit Name" placeholder="e.g. Kilogram" required />
      </div>

      <template #footer>
        <div class="flex gap-3">
          <AppButton
            label="Cancel"
            variant="outlined"
            class="flex-1"
            @click="showAddUnit = false"
          />
          <AppButton
            label="Add Unit"
            class="flex-1"
            :disabled="!newUnitName.trim()"
            @click="createNewUnit"
          />
        </div>
      </template>
    </Modal>
  </form>
</template>
