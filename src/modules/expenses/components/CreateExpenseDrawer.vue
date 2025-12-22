<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Drawer from "@components/Drawer.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { useMediaQuery } from "@vueuse/core"
import { useCreateExpense, useGetExpenseCategories, useGetExpenseSubCategories } from "../api"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { watch } from "vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { onInvalidSubmit } from "@/utils/validations"

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(["close", "refresh"])

const { data: expCategories } = useGetExpenseCategories()
const { data: expSubCategories } = useGetExpenseSubCategories()

watch([expCategories, expSubCategories], ([categories, subcategories]) => {
  console.log("expenses", { categories, subcategories })
})

const isMobile = useMediaQuery("(max-width: 1028px)")

interface FormValues {
  name: string
  amount: string
  category: string
  subcategory: string
  vendor: string
  date: string
  notes: string
  receipt: File | null
}

const { handleSubmit, meta, resetForm } = useForm<FormValues>({
  validationSchema: yup.object({
    name: yup
      .string()
      .required("Expense name is required")
      .min(3, "Name must be at least 3 characters"),
    amount: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .typeError("Amount must be a number")
      .required("Amount is required")
      .positive("Amount must be greater than 0"),
    category: yup.string().required("Expense category is required"),
    subcategory: yup.string().required("Sub-category is required"),
    vendor: yup.string().optional(),
    date: yup.string().required("Expense date is required"),
    notes: yup.string().optional(),
    receipt: yup.mixed().nullable().optional(),
  }),
  initialValues: {
    name: "",
    amount: "",
    category: "",
    subcategory: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    receipt: null,
  },
  validateOnMount: false,
})

const { mutate: createExpense, isPending } = useCreateExpense()

const onSubmit = handleSubmit((values) => {
  const formData = new FormData()
  formData.append("name", values.name)
  formData.append("amount", values.amount)
  formData.append("category", values.category)
  formData.append("subcategory", values.subcategory)
  formData.append("expense_date", values.date)
  if (values.vendor) {
    formData.append("vendor", values.vendor)
  }
  if (values.notes) {
    formData.append("notes", values.notes)
  }
  if (values.receipt) {
    formData.append("receipt", values.receipt)
  }

  createExpense(formData, {
    onSuccess: () => {
      toast.success("Expense created successfully!")
      resetForm()
      emit("close")
      emit("refresh")
    },
    onError: displayError,
  })
}, onInvalidSubmit)

// Reset form when drawer opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  },
)
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    :title="'Create Expense'"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <div>
      <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
        <icon name="receipt-add" size="28" />
      </div>
      <p class="text-sm text-gray-600">Add a new expense</p>
    </div>

    <form class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2" @submit.prevent="onSubmit">
      <div class="sm:col-span-2">
        <FormField
          type="text"
          name="name"
          label="Expense Name"
          placeholder="e.g. GIG Logistics - Dispatch fee"
          required
        />
      </div>

      <div class="sm:col-span-2">
        <FormField type="number" name="amount" label="Amount" placeholder="e.g. 12,500" required />
      </div>

      <div>
        <FormField
          type="select"
          name="category"
          label="Expense Category"
          placeholder="e.g. Shipping"
          :options="[]"
          required
        />
      </div>

      <div>
        <FormField
          type="select"
          name="subcategory"
          label="Sub-category"
          placeholder="e.g. Local Delivery"
          :options="[]"
          required
        />
      </div>

      <div>
        <FormField type="text" name="vendor" label="Vendor" placeholder="Enter vendor name" />
      </div>

      <div>
        <FormField
          type="date"
          name="date"
          label="Expense Date"
          placeholder="Select expense date"
          required
        />
      </div>

      <div class="sm:col-span-2">
        <FormField
          type="textarea"
          name="notes"
          label="Notes (optional)"
          placeholder="Add a note that describes this expense"
        />
      </div>

      <div class="sm:col-span-2">
        <FormField
          type="file"
          name="receipt"
          label="Upload Receipt (optional)"
          accept="image/*,application/pdf"
          :show-preview="true"
          :max-size="3"
          placeholder="Supports: JPG, PNG, PDF (Max - 3MB)"
        />
      </div>
    </form>

    <template #footer>
      <AppButton
        label="Create Expense"
        type="submit"
        class="w-full"
        :loading="isPending"
        :disabled="isPending"
        :inactive="!meta.valid"
        @click="onSubmit"
      />
    </template>
  </component>
</template>
