<script setup lang="ts">
import { ref, computed, watch } from "vue"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import { formatCurrency } from "@/utils/format-currency"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useAdjustMaterialStock } from "../api"
import { TRawMaterial } from "../types"
import * as yup from "yup"
import RadioInputField from "@components/form/RadioInputField.vue"
import FormField from "@components/form/FormField.vue"
import { Field, useForm } from "vee-validate"
import { onInvalidSubmit } from "@/utils/validations"

interface Props {
  open: boolean
  material: TRawMaterial | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  refresh: []
}>()

const selectedMaterial = computed(() => props.material)

// Adjustment type options
const adjustmentTypeOptions = [
  { label: "Add Stock", value: "add" },
  { label: "Remove Stock", value: "remove" },
]

// Reason options
const reasonOptions = {
  add: [
    { label: "New Purchase", value: "purchase" },
    { label: "Return from Production", value: "return" },
    { label: "Stock Count Adjustment", value: "adjustment" },
    { label: "Other", value: "other" },
  ],
  remove: [
    { label: "Used in Production", value: "production" },
    { label: "Damaged/Spoiled", value: "damaged" },
    { label: "Stock Count Adjustment", value: "adjustment" },
    { label: "Other", value: "other" },
  ],
}

interface FormValues {
  quantity: string
  unit_cost: string
  reason: { label: string; value: string } | null
  notes: string
}

const adjustmentType = ref<"add" | "remove">("add")

const { handleSubmit, meta, resetForm, values, setFieldValue } = useForm<FormValues>({
  validationSchema: computed(() =>
    yup.object({
      quantity: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("Quantity must be a number")
        .required("Quantity is required")
        .positive("Quantity must be greater than 0")
        .test("max-remove", function (value) {
          if (adjustmentType.value === "remove" && selectedMaterial.value && value !== undefined) {
            const maxRemove = selectedMaterial.value.current_stock || 0
            if (value > maxRemove) {
              return this.createError({
                message: `Cannot remove more than current stock (${maxRemove})`,
              })
            }
          }
          return true
        }),
      unit_cost: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("unit cost must be a number")
        .required("unit cost is required")
        .positive("unit cost must be greater than 0"),
      reason: yup
        .object()
        .shape({ label: yup.string().required(), value: yup.string().required() })
        .nullable()
        .required("Reason is required"),
      notes: yup.string().optional(),
    }),
  ),
  initialValues: {
    quantity: "",
    unit_cost: "",
    reason: null,
    notes: "",
  },
})

const { mutate: adjustStock, isPending: isAdjusting } = useAdjustMaterialStock()

// Get available reasons based on adjustment type
const availableReasons = computed(() => {
  if (!adjustmentType.value) return []
  return adjustmentType.value === "add" ? reasonOptions.add : reasonOptions.remove
})

// Increment/Decrement functions
const incrementQuantity = () => {
  const currentQty = Number(values.quantity) || 0
  setFieldValue("quantity", String(currentQty + 1))
}

const decrementQuantity = () => {
  const currentQty = Number(values.quantity) || 0
  if (currentQty > 0) {
    setFieldValue("quantity", String(currentQty - 1))
  }
}

// Save adjustment
const onSubmit = handleSubmit((values) => {
  if (!selectedMaterial.value) return

  const payload = {
    movement_type: adjustmentType.value,
    quantity: Number(values.quantity),
    unit_cost: Number(values.unit_cost),
    reason: values.reason!.value,
    notes: values.notes || "",
  }

  adjustStock(
    { id: selectedMaterial.value.uid, payload },
    {
      onSuccess: () => {
        toast.success("Stock adjusted successfully")
        emit("refresh")
        closeModal()
      },
      onError: displayError,
    },
  )
}, onInvalidSubmit)

// Close modal
const closeModal = () => {
  resetForm()
  emit("close")
}

// Watch adjustment type changes to reset reason
watch(adjustmentType, () => {
  setFieldValue("reason", null)
})
</script>

<template>
  <Modal
    :open="props.open"
    title="Adjust Stock"
    max-width="lg"
    variant="bottom-nav"
    @close="closeModal"
    body-class="!pb-8"
  >
    <div v-if="selectedMaterial" class="space-y-4">
      <!-- Material Header -->

      <div
        class="bg-warning-50 border-warning-200 flex flex-wrap justify-between gap-x-8 gap-y-2 rounded-xl border p-5 text-sm"
      >
        <p>
          <span class="font-semibold">Material:</span>
          {{ selectedMaterial.name }} &bullet; {{ selectedMaterial.unit }}
        </p>
        <p>
          <span class="font-semibold">Current Stock:</span>
          {{ Number(selectedMaterial.current_stock).toLocaleString() }}{{ selectedMaterial.unit }}
        </p>
      </div>

      <RadioInputField v-model="adjustmentType" :options="adjustmentTypeOptions" />

      <!-- Adjustment Form -->
      <div class="space-y-4 border-t border-gray-200 pt-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Quantity</label>
          <div
            class="flex items-center justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-3"
          >
            <button
              type="button"
              @click="decrementQuantity"
              class="cursor-pointer transition-opacity hover:opacity-70"
            >
              <Icon name="minus" size="20" class="text-primary-600" />
            </button>

            <div class="flex items-center gap-0">
              <Field v-slot="{ field }" name="quantity" v-model="values.quantity">
                <input
                  v-bind="field"
                  class="w-20 border-0 bg-transparent text-center text-2xl font-semibold outline-none focus:ring-0"
                  placeholder="0"
                />
              </Field>
              <span class="text-gray-500">({{ selectedMaterial.unit }})</span>
            </div>

            <button
              type="button"
              @click="incrementQuantity"
              class="cursor-pointer transition-opacity hover:opacity-70"
            >
              <Icon name="add" size="20" class="text-primary-600" />
            </button>
          </div>
          <Field v-slot="{ errorMessage }" name="quantity">
            <p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
          </Field>
        </div>

        <FormField
          type="text"
          name="unit_cost"
          label="unit cost"
          :placeholder="`e.g. ${formatCurrency(12400)}`"
        />

        <FormField
          type="select"
          name="reason"
          label="Reason"
          placeholder="Select reason"
          :options="availableReasons"
        />

        <FormField
          type="textarea"
          name="notes"
          label="Notes (Optional)"
          placeholder="Add any additional notes..."
          :rows="3"
        />
      </div>
    </div>

    <template #footer>
      <AppButton
        label="Adjust Stock"
        class="w-full"
        :loading="isAdjusting"
        :disabled="!meta.valid"
        @click="onSubmit"
      />
    </template>
  </Modal>
</template>
