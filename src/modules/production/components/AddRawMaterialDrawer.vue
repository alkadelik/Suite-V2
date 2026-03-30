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
import { watch, computed, ref } from "vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { onInvalidSubmit } from "@/utils/validations"
import {
  useCreateRawMaterial,
  useEditRawMaterial,
  useGetSuppliers,
  useCreateSupplier,
} from "../api"
import { TRawMaterial } from "../types"
import SelectField from "@components/form/SelectField.vue"

const props = defineProps<{ open: boolean; material?: TRawMaterial | null }>()
const emit = defineEmits(["close", "refresh"])

const isMobile = useMediaQuery("(max-width: 1028px)")
const isEditMode = computed(() => !!props.material)

const steps = ["Add Material", "Suppliers (optional)"]
const activeStep = ref(0)

// Supplier management
const showAddSupplier = ref(false)
const newSupplierName = ref("")

// unit management
const showAddUnit = ref<"purchase" | "production" | null>(null)
const newUnitName = ref("")

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
const unitOptions = ref([
  { label: "Kilograms (kg)", value: "kg" },
  { label: "Grams (g)", value: "g" },
  { label: "Liters (L)", value: "L" },
  { label: "Milliliters (ml)", value: "ml" },
  { label: "Pieces (pcs)", value: "pcs" },
  { label: "Meters (m)", value: "m" },
  { label: "Sheets", value: "sheets" },
  { label: "Bags", value: "bags" },
  { label: "Boxes", value: "boxes" },
])

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

const { handleSubmit, resetForm, values, setFieldValue } = useForm<FormValues>({
  validationSchema: computed(() =>
    yup.object({
      name: yup
        .string()
        .required("Material name is required")
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
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
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
        // Close modal and reset
        showAddSupplier.value = false
        newSupplierName.value = ""
      },
      onError: displayError,
    },
  )
}

const buildConversion = (values: FormValues) => {
  const fromUnit = values.unit?.value
  const toUnit = values.production_unit?.value
  const fromQty = values.conversion_from_qty
  const toQty = values.conversion_to_qty

  if (!fromUnit || !toUnit || !fromQty || !toQty) return undefined

  const rate = (Number(toQty) / Number(fromQty)).toString()
  const name = values.conversion_name || `${fromUnit} to ${toUnit}`

  return {
    from_unit: fromUnit,
    to_unit: toUnit,
    rate,
    name,
    is_active: true,
  }
}

const onSubmit = handleSubmit((values) => {
  const conversion = buildConversion(values)

  const payload = {
    name: values.name,
    unit: values.unit?.value || "",
    default_cost: values.default_cost,
    qty_in_stock: values.qty_in_stock,
    is_sub_assembly: values.source?.value === "manufacture",
    ...(values.source?.value === "supplier" ? { default_cost: values.default_cost } : {}),
    ...(values.suppliers.length ? { suppliers: values.suppliers.map((x) => x.value) } : {}),
    ...(values.expiry_date ? { expiry_date: values.expiry_date } : {}),
    ...(values.reorder_threshold ? { reorder_threshold: values.reorder_threshold } : {}),
    ...(values.notes ? { notes: values.notes } : {}),
    ...(conversion ? { conversion } : {}),
  }

  const onSuccess = () => {
    toast.success(`Material ${isEditMode.value ? "updated" : "added"} successfully!`)
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

// Reset form or populate with material data when drawer opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      activeStep.value = 0
      if (isEditMode.value && props.material) {
        // Populate form with material data
        resetForm({
          values: {
            name: props.material.name,
            unit: { label: props.material.unit, value: props.material.unit },
            production_unit: null,
            qty_in_stock: props.material.current_stock.toString(),
            source: props.material.is_sub_assembly ? sourceOptions[1] : sourceOptions[0],
            default_cost: props.material.avg_cost.toString(),
            suppliers: props.material.suppliers?.map((supplier) => ({
              label: supplier.name,
              value: supplier.uid,
            })),
            expiry_date: "",
            reorder_threshold: "",
            notes: "",
            conversion_from_qty: "1",
            conversion_to_qty: "",
            conversion_name: "",
          },
        })
      } else {
        resetForm()
      }
    }
  },
)

const canProceedToStep2 = computed(() => {
  return (
    values.name &&
    values.unit &&
    values.qty_in_stock &&
    ((values.source?.value === "supplier" && values.default_cost) ||
      values.source?.value === "manufacture")
  )
})

const canComplete = computed(
  () =>
    canProceedToStep2.value &&
    ((values.source?.value === "supplier" && values.suppliers.length > 0) ||
      values.source?.value === "manufacture"),
)

const goToNextStep = () => {
  activeStep.value = activeStep.value + 1
}

const goToPrevStep = () => {
  activeStep.value = activeStep.value - 1
}
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    :title="isEditMode ? 'Edit Material' : 'Add Material'"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <StepperWizard v-model="activeStep" :steps="steps" :showIndicators="false">
      <template #default="{ step }">
        <!-- Step 1: Material Details -->
        <div v-show="step === 0">
          <div>
            <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
              <icon :name="isEditMode ? 'edit' : 'shop-add'" size="28" />
            </div>
            <p class="text-sm text-gray-600">
              {{ isEditMode ? "Update material details" : "Add a new material" }}
            </p>
          </div>

          <form class="mt-6 grid grid-cols-1 gap-5">
            <FormField
              type="text"
              name="name"
              label="Material Name"
              placeholder="e.g. Glass Butter"
              required
            />

            <section class="border-core-300 space-y-4 border-y border-dashed py-3">
              <div>
                <Field v-slot="{ field, errors: fieldErrors }" name="unit">
                  <SelectField
                    v-bind="field"
                    :model-value="field.value"
                    label="Purchase Unit"
                    placeholder="Select unit"
                    :options="unitOptions"
                    searchable
                    required
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
                  </SelectField>
                </Field>
              </div>

              <div>
                <!-- <FormField
                  type="select"
                  name="production_unit"
                  label="Production Unit"
                  :options="unitOptions"
                /> -->

                <Field v-slot="{ field, errors: fieldErrors }" name="production_unit">
                  <SelectField
                    v-bind="field"
                    :model-value="field.value"
                    label="Production Unit"
                    placeholder="Select unit"
                    :options="unitOptions"
                    searchable
                    required
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
                  </SelectField>
                </Field>
              </div>

              <div
                v-if="values.unit?.value && values.production_unit?.value"
                class="rounded-md bg-gray-200 p-4"
              >
                <p class="mb-3 flex items-center gap-1 text-sm font-medium">
                  Conversion Rate <Icon name="information" />
                </p>
                <div class="flex items-end gap-2">
                  <div class="min-w-0 flex-1">
                    <FormField
                      name="conversion_from_qty"
                      type="number"
                      label="From Unit Qty"
                      :suffix="values.unit.label"
                      placeholder="e.g. 1"
                      readonly
                    />
                  </div>
                  <AppButton
                    icon="arrow-2"
                    variant="outlined"
                    size="sm"
                    class="mb-1 flex-shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <FormField
                      name="conversion_to_qty"
                      type="number"
                      label="To Unit Qty"
                      :suffix="values.production_unit.label"
                      placeholder="e.g. 12"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div>
              <FormField
                type="number"
                name="qty_in_stock"
                label="Quantity in Stock"
                placeholder="e.g. 25"
                required
              />
            </div>

            <FormField
              type="select"
              name="source"
              label="Source of material"
              placeholder="Select source"
              :options="sourceOptions"
              value-key="value"
              label-key="label"
              required
              :placement="isMobile ? 'top' : 'auto'"
            />

            <div
              v-if="values.source?.value === 'manufacture'"
              class="bg-primary-25 text-warning-700 border-warning-300 flex items-center gap-3 rounded-xl border px-3 py-3 md:px-6"
            >
              <span
                class="border-primary-200 ring-primary-100 flex size-8 flex-shrink-0 items-center justify-center rounded-full border-2 ring-2 ring-offset-2"
              >
                <Icon name="info-circle" size="20" />
              </span>
              <div class="text-sm">
                <p class="font-medium">This Material is a Sub-assembly</p>
                <p>This will be the name displayed in the inventory</p>
              </div>
            </div>

            <div v-else>
              <FormField
                type="number"
                name="default_cost"
                label="Default Purchase price"
                placeholder="e.g. 25"
                required
              />
            </div>
          </form>
        </div>

        <!-- Step 2: Suppliers & Others (optional) -->
        <div v-show="step === 1">
          <div>
            <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
              <icon name="profile-add" size="28" />
            </div>
            <p class="text-sm text-gray-600">Review material details and confirm</p>
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
                label="Reorder Threshold (optional)"
                placeholder="Enter reorder threshold"
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
          :label="isEditMode ? 'Update Material' : 'Add Material'"
          type="submit"
          class="flex-1"
          :loading="isPending"
          :disabled="!canComplete"
          :inactive="!canComplete"
          @click="onSubmit"
        />
      </div>
    </template>
    <template v-else #footer>
      <div class="flex gap-3">
        <AppButton label="Cancel" color="alt" class="flex-1" @click="emit('close')" />
        <AppButton
          label="Continue"
          class="flex-1"
          :disabled="!canProceedToStep2"
          :inactive="!canProceedToStep2"
          @click="goToNextStep"
        />
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
        <p class="text-sm text-gray-600">Create a new supplier for your raw materials</p>

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
        <p class="text-sm text-gray-600">Create a new unit for your raw materials</p>

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
  </component>
</template>
