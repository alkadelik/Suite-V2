<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import StepperWizard from "@components/StepperWizard.vue"
import FormField from "@components/form/FormField.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { useMediaQuery } from "@vueuse/core"
import { Field, useForm } from "vee-validate"
import * as yup from "yup"
import { watch, computed, ref, nextTick } from "vue"
import { useQueryClient } from "@tanstack/vue-query"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { onInvalidSubmit } from "@/utils/validations"
import {
  useCreateRawMaterial,
  useEditRawMaterial,
  useGetSuppliers,
  useCreateSupplier,
  useGetSingleRawMaterial,
} from "../../api"
import { TRawMaterial, type TConversion } from "../../types"
import SelectField from "@components/form/SelectField.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { UNITS_OF_MEASURE } from "@modules/production/constant"
import { floatDecimal } from "@/utils/others"
import { useProductionStore } from "@modules/production/store"
import { removeUnderscores, startCase } from "@/utils/format-strings"

const props = defineProps<{
  open: boolean
  mode?: "create" | "edit" | null
  material?: TRawMaterial | null
  hasFullDetails?: boolean
}>()
const emit = defineEmits(["close", "refresh"])

const isMobile = useMediaQuery("(max-width: 1028px)")
const isEditMode = computed(() => !!props.material)
const { currency } = useFormatCurrency()

const materialSingular = computed(() => useProductionStore().componentSingular)
const materialLabel = computed(() => useProductionStore().componentLabel)
const recipeLabel = computed(() => useProductionStore().recipeLabel)

const steps = computed(() => [`Add ${materialLabel.value}`, "Suppliers (optional)"])
const activeStep = ref(0)

// Supplier management
const showAddSupplier = ref(false)
const newSupplierName = ref("")
const queryClient = useQueryClient()

// unit management
const showAddUnit = ref<"purchase" | "production" | null>(null)
const newUnitName = ref("")

const POPULAR_CONVERSIONS: Record<string, string> = {
  "kg-g": "1000",
  "g-kg": "0.001",
  "l-ml": "1000",
  "ml-l": "0.001",
  "m-cm": "100",
  "cm-m": "0.01",
  "m-mm": "1000",
  "mm-m": "0.001",
  "cm-mm": "10",
  "mm-cm": "0.1",
  "g-mg": "1000",
  "mg-g": "0.001",
  "kg-mg": "1000000",
  "mg-kg": "0.000001",
  "l-cl": "100",
  "cl-l": "0.01",
  "cl-ml": "10",
  "ml-cl": "0.1",
}

const createNewUnit = () => {
  const unit = newUnitName.value.trim()
  const newUnit = { label: unit, value: unit.toLowerCase().replace(/\s+/g, "_") }
  // Add the new unit to the unitOptions & set as selected value
  unitOptions.value.push(newUnit)
  if (showAddUnit.value === "purchase") {
    setFieldValue("unit", newUnit)
  } else if (showAddUnit.value === "production") {
    setFieldValue("production_unit", newUnit)
  }
  showAddUnit.value = null
  newUnitName.value = ""
}

const { data: suppliers } = useGetSuppliers()
const { mutate: createSupplier, isPending: isCreatingSupplier } = useCreateSupplier()

const supplierOptions = computed(() => {
  return (
    suppliers.value?.data?.results?.map((supplier: { uid: string; name: string }) => ({
      label: supplier.name,
      value: supplier.uid,
    })) || []
  )
})

// Unit options
const unitOptions = ref(UNITS_OF_MEASURE)

// Source of material options
const sourceOptions = [
  { label: "I buy it from a supplier", value: "supplier" },
  { label: "I produce it myself", value: "manufacture" },
]

interface FormValues {
  name: string
  unit: null | { label: string; value: string }
  production_unit: { label: string; value: string } | null
  qty_in_stock: string
  default_cost: string
  source: null | { label: string; value: string }
  suppliers: { label: string; value: string }[]
  expiry_date?: string
  reorder_threshold?: string
  notes?: string
  conversion_from_qty: string
  conversion_to_qty: string
  conversion_name: string
}

const { handleSubmit, resetForm, values, setFieldValue, validateField, setFieldTouched } =
  useForm<FormValues>({
    validationSchema: computed(() =>
      yup.object({
        name: yup
          .string()
          .required(`${useProductionStore().componentSingular} name is required`)
          .min(3, "Name must be at least 3 characters"),
        unit: yup
          .object()
          .shape({ label: yup.string().required(), value: yup.string().required() })
          .required("Unit of measurement is required"),
        qty_in_stock: yup
          .number()
          .transform((value, originalValue) => (originalValue === "" ? undefined : value))
          .typeError("Qty in stock must be a number")
          .required("Qty in stock is required")
          .min(0, "Qty in stock cannot be negative"),
        default_cost: yup
          .number()
          .transform((_, originalValue) =>
            originalValue === "" ? undefined : Number(String(originalValue).replace(/,/g, "")),
          )
          .typeError("Default purchase price must be a number")
          .when("source", {
            is: (source: { value: string }) => source?.value === "supplier",
            then: (schema) =>
              schema
                .required("Default purchase price is required")
                .min(0, "Default purchase price cannot be negative"),
            otherwise: (schema) => schema.optional().nullable(),
          }),
        source: yup
          .object()
          .shape({ label: yup.string().required(), value: yup.string().required() })
          .required("Source of material is required"),
        suppliers: yup.array().when("source", {
          is: (source: { value: string }) => source?.value === "supplier",
          then: (schema) =>
            schema
              .min(1, "At least one supplier is required when buying from a supplier")
              .required("Supplier is required when buying from a supplier"),
          otherwise: (schema) => schema.optional(),
        }),
        expiry_date: yup.string().optional(),
        reorder_threshold: yup.string().optional(),
        notes: yup.string().optional(),
        production_unit: yup.object().nullable().optional(),
        conversion_from_qty: yup.string().optional(),
        conversion_to_qty: yup.string().optional(),
        conversion_name: yup.string().optional(),
      }),
    ),
    initialValues: {
      name: "",
      unit: null,
      production_unit: null,
      qty_in_stock: "",
      default_cost: "",
      source: null,
      suppliers: [],
      expiry_date: "",
      reorder_threshold: "",
      notes: "",
      conversion_from_qty: "1",
      conversion_to_qty: "",
      conversion_name: "",
    },
    validateOnMount: false,
  })

const { mutate: createMaterial, isPending: isCreating } = useCreateRawMaterial()
const { mutate: editMaterial, isPending: isEditing } = useEditRawMaterial()

const isPending = computed(() => isCreating.value || isEditing.value)

const createNewSupplier = () => {
  if (!newSupplierName.value.trim()) {
    toast.error("Please enter a supplier name")
    return
  }

  createSupplier(
    { name: newSupplierName.value.trim() },
    {
      onSuccess: (response) => {
        toast.success("Supplier created successfully!")
        // Set the newly created supplier as selected
        const supplierUid = response.data?.data as { uid: string; name: string }
        const currentSuppliers = values.suppliers || []
        setFieldValue("suppliers", [
          ...currentSuppliers,
          { label: supplierUid.name, value: supplierUid.uid },
        ])
        // Invalidate the suppliers cache so the new supplier appears in future selections
        queryClient.invalidateQueries({ queryKey: ["raw-materials-suppliers"] })
        // Close modal and reset
        showAddSupplier.value = false
        newSupplierName.value = ""
      },
      onError: displayError,
    },
  )
}

const showConversionSection = computed(
  () =>
    !!values.unit?.value &&
    !!values.production_unit?.value &&
    values.unit.value !== values.production_unit.value,
)

const buildConversion = (values: FormValues) => {
  const purchaseUnit = values.unit?.value
  const productionUnit = values.production_unit?.value
  const fromQty = values.conversion_from_qty
  const toQty = values.conversion_to_qty

  if (!purchaseUnit || !productionUnit || !fromQty || !toQty) return undefined

  const rate = (Number(toQty) / Number(fromQty)).toFixed(4)
  const name = values.conversion_name || `${purchaseUnit} to ${productionUnit}`

  return {
    from_unit: productionUnit,
    to_unit: purchaseUnit,
    rate,
    name,
    is_active: true,
  }
}

const onSubmit = handleSubmit((values) => {
  const conversion = buildConversion(values)

  const qty_in_stock: string = conversion
    ? floatDecimal(Number(values.qty_in_stock) * Number(conversion.rate)).toString()
    : values.qty_in_stock

  // unit cost for each material is stored in purchase unit, so convert if needed
  let default_cost = null
  const is_sub_assembly = values.source?.value === "manufacture"
  if (!is_sub_assembly || (is_sub_assembly && values.qty_in_stock)) {
    default_cost = floatDecimal(
      Number(values.default_cost.replace(/[^0-9.]/g, "")) / (conversion ? +conversion.rate : 1),
    )
  }

  const payload = {
    name: values.name,
    unit: values.production_unit?.value || "",
    qty_in_stock,
    is_sub_assembly,
    ...(default_cost ? { default_cost } : {}),
    ...(values.suppliers.length ? { suppliers: values.suppliers.map((x) => x.value) } : {}),
    ...(values.expiry_date ? { expiry_date: values.expiry_date } : {}),
    ...(values.reorder_threshold ? { reorder_threshold: values.reorder_threshold } : {}),
    ...(values.notes ? { notes: values.notes } : {}),
    ...(conversion ? { conversion } : {}),
  }

  const onSuccess = () => {
    toast.success(
      `${materialSingular.value} ${isEditMode.value ? "updated" : "added"} successfully!`,
    )
    resetForm()
    emit("close")
    emit("refresh")
  }

  if (isEditMode.value && props.material) {
    editMaterial({ id: props.material.uid, payload }, { onSuccess, onError: displayError })
  } else {
    createMaterial(payload, { onSuccess, onError: displayError })
  }
}, onInvalidSubmit)

// Prefill popular conversions when units change
watch([() => values.unit, () => values.production_unit], ([newUnit, newProdUnit]) => {
  if (newUnit?.value && newProdUnit?.value && newUnit.value !== newProdUnit.value) {
    const key = `${newUnit.value}-${newProdUnit.value}`
    const popular = POPULAR_CONVERSIONS[key]
    setFieldValue("conversion_from_qty", "1")
    setFieldValue("conversion_to_qty", popular ?? "")
  }
})

const seedFromMaterial = (item: TRawMaterial) => {
  const activeConversion: TConversion | undefined = item.conversions?.find(
    (c) => c.is_active && c.from_unit !== c.to_unit,
  )
  // Reuse the existing option (with its canonical label) when the unit is known,
  // otherwise add it as a custom option so it can still be selected.
  const resolveUnit = (unitValue: string) => {
    const existing = unitOptions.value.find((o) => o.value === unitValue)
    if (existing) return existing
    const custom = { label: unitValue, value: unitValue }
    unitOptions.value.push(custom)
    return custom
  }

  const purchaseUnitOption = resolveUnit(item.unit)
  const productionUnit = activeConversion
    ? resolveUnit(activeConversion.to_unit)
    : purchaseUnitOption

  const prefillSuppliers = item.suppliers?.map((s) => ({ label: s.name, value: s.uid })) ?? []

  resetForm({
    values: {
      name: item.name,
      unit: productionUnit,
      production_unit: purchaseUnitOption,
      qty_in_stock: activeConversion
        ? floatDecimal(item.current_stock / Number(activeConversion.rate)).toString()
        : item.current_stock.toString(),
      source: item.is_sub_assembly ? sourceOptions[1] : sourceOptions[0],
      default_cost: activeConversion
        ? String(item.avg_cost * Number(activeConversion.rate))
        : item.avg_cost.toString(),
      suppliers: prefillSuppliers,
      expiry_date: item.expiry_date ?? "",
      reorder_threshold: item.reorder_threshold
        ? parseInt(String(item.reorder_threshold)).toString()
        : "",
      notes: item.notes ?? "",
      conversion_from_qty: "1",
      conversion_to_qty: activeConversion?.rate,
      conversion_name: "",
    },
  })
  if (activeConversion) {
    nextTick(() => {
      setFieldValue("conversion_from_qty", "1")
      setFieldValue("conversion_to_qty", activeConversion.rate)
      setFieldValue("conversion_name", activeConversion.name)
    })
  }
}

// Fetch full material when hasFullDetails is false
const fetchUid = computed(() =>
  !props.hasFullDetails && props.open && props.mode === "edit" && props.material
    ? props.material.uid
    : "",
)
const { data: fetchedMaterial, isFetching: isLoadingMaterial } = useGetSingleRawMaterial(fetchUid)

const unitsLocked = computed(
  () => !!props.material?.linked_recipes?.length || !!fetchedMaterial.value?.linked_recipes?.length,
)

// immediate: true handles the case where TanStack Query returns cached data without a change event
watch(fetchedMaterial, (material) => {
  if (material && fetchUid.value) seedFromMaterial(material)
})

const emptyForm = () =>
  resetForm({
    values: {
      name: "",
      unit: null,
      production_unit: null,
      qty_in_stock: "",
      default_cost: "",
      source: null,
      suppliers: [],
      expiry_date: "",
      reorder_threshold: "",
      notes: "",
      conversion_from_qty: "1",
      conversion_to_qty: "",
      conversion_name: "",
    },
  })

// Reset form or populate with material data when drawer opens
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    activeStep.value = 0
    if (props.mode === "edit" && props.material) {
      if (props.hasFullDetails) {
        seedFromMaterial(props.material)
      } else {
        // Clear stale data first; if TanStack already has this material cached,
        // seed immediately — otherwise the fetchedMaterial watcher handles it
        emptyForm()
        if (fetchedMaterial.value?.uid === props.material.uid) {
          seedFromMaterial(fetchedMaterial.value)
        }
      }
    } else {
      emptyForm()
    }
  },
)

const validateStepOne = async () => {
  const stepOneFields: Array<keyof FormValues> = ["name", "unit", "qty_in_stock", "source"]

  if (
    values.source?.value === "supplier" ||
    (+values.qty_in_stock > 0 && values.source?.value === "manufacture")
  ) {
    stepOneFields.push("default_cost")
  }

  const validationResults = await Promise.all(
    stepOneFields.map(async (fieldName) => {
      setFieldTouched(fieldName, true)
      const result = (await validateField(fieldName)) as { valid: boolean; errors?: string[] }
      return { fieldName, result }
    }),
  )

  const firstInvalid = validationResults.find(({ result }) => !result.valid)

  if (firstInvalid) {
    onInvalidSubmit({
      errors: {
        [firstInvalid.fieldName]: firstInvalid.result.errors?.[0] || true,
      },
    })
    return false
  }

  return true
}

const goToNextStep = async () => {
  const isValidStep = await validateStepOne()
  if (!isValidStep) return

  activeStep.value = activeStep.value + 1
}

const goToPrevStep = () => {
  activeStep.value = activeStep.value - 1
}

const handleAddFromSearch = (search: string, close: () => void) => {
  showAddSupplier.value = true
  newSupplierName.value = search
  close()
}
</script>

<template>
  <Drawer
    :open="open"
    :title="
      isEditMode ? `Edit ${props.material?.name || materialSingular}` : `Add ${materialSingular}`
    "
    max-width="2xl"
    @close="emit('close')"
  >
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step }">
        <!-- loading skeleton while fetching full material details -->
        <div v-if="isLoadingMaterial" class="space-y-4 p-4">
          <div v-for="n in 6" :key="n" class="h-12 animate-pulse rounded-xl bg-gray-200" />
        </div>

        <!-- Step 1: Material Details -->
        <div v-show="step === 0 && !isLoadingMaterial">
          <div>
            <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
              <icon :name="isEditMode ? 'edit' : 'shop-add'" size="28" />
            </div>
            <p class="text-sm text-gray-600">
              {{
                isEditMode ? `Update ${materialSingular} details` : `Add a new ${materialSingular}`
              }}
            </p>
          </div>

          <form class="mt-6 grid grid-cols-1 gap-5">
            <FormField
              type="text"
              name="name"
              :label="`${startCase(materialSingular)} Name`"
              placeholder="e.g. Glass Butter"
              required
            />

            <FormField
              type="select"
              name="source"
              label="Do you make or buy this?"
              placeholder="Select source"
              :options="sourceOptions"
              value-key="value"
              label-key="label"
              required
              :placement="isMobile ? 'top' : 'auto'"
            />

            <section class="border-core-300 space-y-4 border-y border-dashed py-3">
              <div>
                <Field v-slot="{ field, errors: fieldErrors }" name="unit">
                  <SelectField
                    v-bind="field"
                    :model-value="field.value"
                    :label="`What unit do you ${values.source?.value === 'manufacture' ? 'produce' : 'buy'} this in?`"
                    placeholder="Select unit"
                    :options="unitOptions"
                    searchable
                    required
                    :disabled="unitsLocked"
                    :error="fieldErrors[0]"
                    @update:model-value="field.value = $event"
                  >
                    <template #prepend="{ close }">
                      <div
                        class="hover:bg-core-25 cursor-pointer border-b border-gray-200 px-4 py-2 text-sm transition-colors duration-150"
                        @click="
                          () => {
                            close()
                            showAddUnit = 'purchase'
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
                              showAddUnit = 'purchase'
                              newUnitName = search
                            }
                          "
                        >
                          Add <span class="font-semibold">"{{ search }}"</span>
                        </button>
                        as purchase unit?
                      </p>
                    </template>
                  </SelectField>
                </Field>
              </div>

              <div>
                <Field v-slot="{ field, errors: fieldErrors }" name="production_unit">
                  <SelectField
                    v-bind="field"
                    :model-value="field.value"
                    :label="`What unit do you use during production?`"
                    placeholder="Select unit"
                    :options="unitOptions"
                    searchable
                    required
                    :disabled="unitsLocked"
                    :error="fieldErrors[0]"
                    @update:model-value="field.value = $event"
                  >
                    <template #prepend="{ close }">
                      <div
                        class="hover:bg-core-25 cursor-pointer border-b border-gray-200 px-4 py-2 text-sm transition-colors duration-150"
                        @click="
                          () => {
                            close()
                            showAddUnit = 'production'
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
                              showAddUnit = 'production'
                              newUnitName = search
                            }
                          "
                        >
                          Add <span class="font-semibold">"{{ search }}"</span>
                        </button>
                        as production?
                      </p>
                    </template>
                  </SelectField>
                </Field>
              </div>

              <div v-if="showConversionSection" class="rounded-md bg-gray-200 p-4">
                <p class="mb-3 flex items-center gap-1 text-sm font-medium">
                  How do you convert {{ removeUnderscores(values.unit?.label) }} to
                  {{ removeUnderscores(values.production_unit?.label) }}?
                </p>
                <p v-if="false" class="mb-3 text-xs text-amber-600">
                  Units and conversion are locked because this {{ materialSingular }} is used in
                  {{ props.material?.linked_recipes?.length }} {{ recipeLabel.toLowerCase() }}.
                </p>
                <div class="flex items-end gap-2">
                  <div class="min-w-0 flex-1">
                    <FormField
                      name="conversion_from_qty"
                      :label="removeUnderscores(values.unit?.label)"
                      :suffix="removeUnderscores(values.unit?.label)"
                      placeholder="e.g. 1"
                      :disabled="false"
                      type="decimal"
                    />
                  </div>
                  <AppButton
                    icon="arrow-2"
                    variant="outlined"
                    size="sm"
                    class="mb-1 flex-shrink-0 hover:cursor-default! focus:ring-0!"
                  />
                  <div class="min-w-0 flex-1">
                    <FormField
                      name="conversion_to_qty"
                      :label="removeUnderscores(values.production_unit?.label)"
                      :suffix="removeUnderscores(values.production_unit?.label)"
                      placeholder="e.g. 12"
                      :disabled="false"
                      type="decimal"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div v-if="!isEditMode">
              <FormField
                name="qty_in_stock"
                label="Quantity in Stock"
                :suffix="removeUnderscores(values.unit?.label)"
                placeholder="e.g. 25"
                required
                type="decimal"
              />
            </div>

            <div v-if="mode !== 'edit'">
              <FormField
                v-if="+values.qty_in_stock > 0 || values.source?.value === 'supplier'"
                type="number"
                name="default_cost"
                format="currency"
                step="0.01"
                :label="`Cost per ${removeUnderscores(values.unit?.value) || 'unit'} (${currency})`"
                :suffix="removeUnderscores(values.unit?.label)"
                placeholder="e.g. 25"
                required
              />

              <div
                v-if="values.source?.value === 'manufacture'"
                class="bg-primary-25 text-warning-700 border-warning-300 mt-6 flex items-center gap-3 rounded-xl border px-3 py-3 md:px-6"
              >
                <span
                  class="border-primary-200 ring-primary-100 flex size-8 flex-shrink-0 items-center justify-center rounded-full border-2 ring-2 ring-offset-2"
                >
                  <Icon name="info-circle" size="20" />
                </span>
                <div class="text-sm">
                  <p class="font-medium">This {{ materialSingular }} is a Sub-assembly</p>
                  <p>This will be the name displayed in the inventory</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Step 2: Suppliers & Others (optional) -->
        <div v-show="step === 1">
          <div>
            <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
              <icon name="profile-add" size="28" />
            </div>
            <p class="text-sm text-gray-600">Review {{ materialSingular }} details and confirm</p>
          </div>

          <div class="mt-6 space-y-4">
            <!-- Select suppliers with option to create -->
            <div v-if="values.source?.value === 'supplier'">
              <Field v-slot="{ field, errors: fieldErrors }" name="suppliers">
                <SelectField
                  v-bind="field"
                  :model-value="field.value"
                  label="Suppliers"
                  placeholder="Select suppliers"
                  :options="supplierOptions"
                  value-key="value"
                  label-key="label"
                  searchable
                  multiple
                  required
                  placement="bottom"
                  :error="fieldErrors[0]"
                  @update:model-value="field.value = $event"
                >
                  <template #prepend="{ close }">
                    <div
                      class="hover:bg-core-25 cursor-pointer border-b border-gray-200 px-4 py-2 text-sm transition-colors duration-150"
                      @click="
                        () => {
                          close()
                          showAddSupplier = true
                        }
                      "
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-primary-600 font-semibold">Add New Supplier</span>
                        <Icon name="add" class="text-primary-600 h-4 w-4" />
                      </div>
                    </div>
                  </template>
                  <template #no-options="{ search, close }">
                    <p>
                      No results found.
                      <button
                        class="text-primary-600 ml-1 hover:underline"
                        @click="handleAddFromSearch(search, close)"
                      >
                        Add <span class="font-semibold">"{{ search }}"</span>
                      </button>
                      as a supplier?
                    </p>
                  </template>
                </SelectField>
              </Field>
            </div>

            <div>
              <FormField
                type="date"
                name="expiry_date"
                label="Expiry Date (optional)"
                placeholder="Select expiry date"
              />
            </div>

            <div>
              <FormField
                type="text"
                name="reorder_threshold"
                :label="`Reorder Threshold (optional)`"
                placeholder="Enter reorder threshold"
                :suffix="values.unit?.label"
              />
            </div>

            <div class="sm:col-span-2">
              <FormField
                type="textarea"
                name="notes"
                label="Notes/Description (optional)"
                placeholder="e.g. 055 Logistics 1025L"
              />
            </div>
          </div>
        </div>
      </template>
    </StepperWizard>

    <template v-if="activeStep >= 1" #footer>
      <div class="flex gap-3">
        <AppButton label="Back" color="alt" class="flex-1" @click="goToPrevStep" />
        <AppButton
          :label="isEditMode ? `Update ${materialSingular}` : `Add ${materialSingular}`"
          type="submit"
          class="flex-1"
          :loading="isPending"
          :disabled="isPending"
          @click="onSubmit"
        />
      </div>
    </template>
    <template v-else #footer>
      <div class="flex gap-3">
        <AppButton label="Cancel" color="alt" class="flex-1" @click="emit('close')" />
        <AppButton label="Continue" class="flex-1" @click="goToNextStep" />
      </div>
    </template>

    <!-- Create Supplier Modal -->
    <Modal
      :open="showAddSupplier"
      title="Add New Supplier"
      max-width="md"
      @close="showAddSupplier = false"
    >
      <div class="space-y-4">
        <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
          <Icon name="profile-add" size="28" />
        </div>
        <p class="text-sm text-gray-600">
          Create a new supplier for your {{ materialLabel.toLowerCase() }}
        </p>

        <TextField
          v-model="newSupplierName"
          label="Supplier Name"
          placeholder="e.g. ABC Supplies"
          required
        />
      </div>

      <template #footer>
        <div class="flex gap-3">
          <AppButton
            label="Cancel"
            variant="outlined"
            class="flex-1"
            @click="showAddSupplier = false"
          />
          <AppButton
            label="Add Supplier"
            class="flex-1"
            :loading="isCreatingSupplier"
            loading-text="Adding..."
            :disabled="isCreatingSupplier || !newSupplierName.trim()"
            @click="createNewSupplier"
          />
        </div>
      </template>
    </Modal>

    <!-- Create new Unit Modal -->
    <Modal :open="!!showAddUnit" title="Add New Unit" max-width="md" @close="showAddUnit = null">
      <div class="space-y-4">
        <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
          <Icon name="profile-add" size="28" />
        </div>
        <p class="text-sm text-gray-600">
          Create a new unit for your {{ materialLabel.toLowerCase() }}
        </p>

        <TextField v-model="newUnitName" label="Unit Name" placeholder="e.g. Kilogram" required />
      </div>

      <template #footer>
        <div class="flex gap-3">
          <AppButton label="Cancel" variant="outlined" class="flex-1" @click="showAddUnit = null" />
          <AppButton
            label="Add Unit"
            class="flex-1"
            :disabled="!newUnitName.trim()"
            @click="createNewUnit"
          />
        </div>
      </template>
    </Modal>
  </Drawer>
</template>
