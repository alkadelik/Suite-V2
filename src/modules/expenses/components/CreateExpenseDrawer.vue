<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Drawer from "@components/Drawer.vue"
import FormField from "@components/form/FormField.vue"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { useMediaQuery } from "@vueuse/core"
import { Field } from "vee-validate"
import {
  useCreateExpense,
  useCreateExpenseVendor,
  useEditExpense,
  useGetExpenseCategories,
  useGetExpenseVendors,
} from "../api"
import { useExpenseStore } from "../store"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { watch, computed, ref } from "vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { onInvalidSubmit } from "@/utils/validations"
import { TExpense } from "../types"

const props = defineProps<{ open: boolean; expense?: TExpense | null }>()
const emit = defineEmits(["close", "refresh"])

const expenseStore = useExpenseStore()

// Only fetch if we don't have cached categories
const { data: apiCategories } = useGetExpenseCategories(
  computed(() => !expenseStore.hasCategories()),
)

// Use cached categories or API data
const expCategories = computed(() => {
  if (expenseStore.categories && expenseStore.categories.length > 0) {
    return expenseStore.categories
  }
  return apiCategories.value?.results || []
})

// Cache categories when API returns data
watch(
  () => apiCategories.value,
  (data) => {
    if (data?.results && data.results.length > 0) {
      expenseStore.setCategories(data.results)
    }
  },
  { immediate: true },
)

const { data: expVendors } = useGetExpenseVendors()
const { mutate: createExpenseVendor, isPending: isCreatingVendor } = useCreateExpenseVendor()

const selectedCategory = ref<{ label: string; value: string }>({ label: "", value: "" })
const showCreateVendorModal = ref(false)
const newVendorName = ref("")

const categoriesOptions = computed(() => {
  return expCategories.value.map((cat) => ({
    label: cat.name,
    value: cat.uid,
  }))
})

const vendorOptions = computed(() => {
  return (
    expVendors.value?.data?.results?.map((vendor: { uid: string; name: string }) => ({
      label: vendor.name,
      value: vendor.uid,
    })) || []
  )
})

const subCategoriesOptions = computed(() => {
  if (!expCategories.value || expCategories.value.length === 0 || !selectedCategory.value) return []

  const category = expCategories.value.find((cat) => cat.uid === selectedCategory.value.value)

  if (!category?.sub_categories) return []

  return category.sub_categories.map((subCat) => ({
    label: subCat.name,
    value: subCat.uid,
  }))
})

const hasSubCategories = computed(() => {
  if (!expCategories.value || expCategories.value.length === 0 || !selectedCategory.value)
    return false
  const category = expCategories.value.find((cat) => cat.uid === selectedCategory.value.value)
  return (category?.sub_categories?.length ?? 0) > 0
})

const isMobile = useMediaQuery("(max-width: 1028px)")

const isEditMode = computed(() => !!props.expense)

interface FormValues {
  name: string
  amount: string
  category: { label: string; value: string }
  sub_category: { label: string; value: string }
  vendor: { label: string; value: string }
  date: string
  notes: string
  receipt: File | null
}

const { handleSubmit, meta, resetForm, values, setFieldValue } = useForm<FormValues>({
  validationSchema: computed(() =>
    yup.object({
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
      category: yup
        .object()
        .shape({ label: yup.string().required(), value: yup.string().required() })
        .required("Expense category is required"),
      sub_category: hasSubCategories.value
        ? yup
            .object()
            .shape({ label: yup.string().required(), value: yup.string().required() })
            .required("Sub-category is required")
        : yup.object().nullable().optional(),
      vendor: yup
        .object()
        .shape({ label: yup.string(), value: yup.string() })
        .nullable()
        .optional(),
      date: yup.string().required("Expense date is required"),
      notes: yup.string().optional(),
      receipt: yup.mixed().nullable().optional(),
    }),
  ),
  initialValues: {
    name: "",
    amount: "",
    category: { label: "", value: "" },
    sub_category: { label: "", value: "" },
    vendor: { label: "", value: "" },
    date: new Date().toISOString().split("T")[0],
    notes: "",
    receipt: null,
  },
  validateOnMount: false,
})

// Watch category changes and clear sub_category
watch(
  () => values.category,
  (newCategory, oldCategory) => {
    selectedCategory.value = newCategory
    // Only clear sub_category when category actually changes (not on initial mount)
    if (
      oldCategory?.value &&
      newCategory?.value !== oldCategory?.value &&
      values.sub_category?.value
    ) {
      setFieldValue("sub_category", { label: "", value: "" })
    }
  },
)

const { mutate: createExpense, isPending: isCreating } = useCreateExpense()
const { mutate: editExpense, isPending: isEditing } = useEditExpense()

const isPending = computed(() => isCreating.value || isEditing.value)

/**
 * Create a new vendor
 */
const createVendor = () => {
  if (!newVendorName.value.trim()) {
    toast.error("Please enter a vendor name")
    return
  }

  createExpenseVendor(
    { name: newVendorName.value.trim() },
    {
      onSuccess: (response) => {
        toast.success("Vendor created successfully!")
        // Set the newly created vendor as selected
        const vendorUid = response.data?.data as { uid: string; name: string }
        setFieldValue("vendor", { label: vendorUid.name, value: vendorUid.uid })
        // Close modal and reset
        showCreateVendorModal.value = false
        newVendorName.value = ""
      },
      onError: displayError,
    },
  )
}

const onSubmit = handleSubmit((values) => {
  if (isEditMode.value && props.expense) {
    // Edit mode
    const formData = new FormData()
    formData.append("name", values.name)
    formData.append("amount", values.amount)
    formData.append("category", values.category.value)
    formData.append("sub_category", values.sub_category?.value || "")
    formData.append("date", values.date)
    formData.append("vendor", values.vendor.value || "")
    formData.append("notes", values.notes || "")
    if (values.receipt) {
      formData.append("receipt", values.receipt)
    }

    editExpense(
      { id: props.expense.uid, payload: formData },
      {
        onSuccess: () => {
          toast.success("Expense updated successfully!")
          resetForm()
          emit("close")
          emit("refresh")
        },
        onError: displayError,
      },
    )
  } else {
    // Create mode
    const formData = new FormData()
    formData.append("name", values.name)
    formData.append("amount", values.amount)
    formData.append("category", values.category.value)
    formData.append("sub_category", values.sub_category?.value || "")
    formData.append("date", values.date)
    formData.append("vendor", values.vendor.value || "")
    formData.append("notes", values.notes || "")
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
  }
}, onInvalidSubmit)

// Reset form or populate with expense data when drawer opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (isEditMode.value && props.expense) {
        // Populate form with expense data
        const categoryOption = categoriesOptions.value.find(
          (cat) => cat.value === props.expense?.category,
        ) || { label: props.expense?.category_name || "", value: props.expense?.category || "" }

        resetForm({
          values: {
            name: props.expense.name,
            amount: props.expense.amount,
            category: categoryOption,
            sub_category: props.expense.sub_category
              ? {
                  label: props.expense.sub_category_name || "",
                  value: props.expense.sub_category,
                }
              : { label: "", value: "" },
            vendor: props.expense.vendor
              ? { label: props.expense.vendor_name || "", value: props.expense.vendor }
              : { label: "", value: "" },
            date: props.expense.date,
            notes: props.expense.notes || "",
            receipt: null,
          },
        })
        selectedCategory.value = categoryOption
      } else {
        resetForm()
        selectedCategory.value = { label: "", value: "" }
      }
    }
  },
)
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    :title="isEditMode ? 'Edit Expense' : 'Create Expense'"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <div>
      <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
        <icon :name="isEditMode ? 'edit' : 'receipt-add'" size="28" />
      </div>
      <p class="text-sm text-gray-600">
        {{ isEditMode ? "Update expense details" : "Add a new expense" }}
      </p>
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
          :options="categoriesOptions"
          value-key="value"
          label-key="label"
          required
          searchable
        />
      </div>

      <div>
        <FormField
          type="select"
          name="sub_category"
          label="Sub-category"
          placeholder="e.g. Local Delivery"
          :options="subCategoriesOptions"
          :disabled="!selectedCategory"
          value-key="value"
          label-key="label"
          :required="hasSubCategories"
          searchable
        />
      </div>

      <div>
        <!-- Select Vendor with option to create -->
        <Field v-slot="{ field, errors: fieldErrors }" name="vendor">
          <SelectField
            v-bind="field"
            :model-value="field.value"
            label="Vendor"
            placeholder="Select vendor"
            :options="vendorOptions"
            value-key="value"
            label-key="label"
            :error="fieldErrors[0]"
            @update:model-value="field.value = $event"
          >
            <template #prepend="{ close }">
              <div
                class="hover:bg-core-25 cursor-pointer border-b border-gray-200 px-4 py-2 text-sm transition-colors duration-150"
                @click="
                  () => {
                    close()
                    showCreateVendorModal = true
                  }
                "
              >
                <div class="flex items-center justify-between">
                  <span class="text-primary-600 font-semibold">Add New Vendor</span>
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
        :label="isEditMode ? 'Update Expense' : 'Create Expense'"
        type="submit"
        class="w-full"
        :loading="isPending"
        :disabled="isPending"
        :inactive="!meta.valid"
        @click="onSubmit"
      />
    </template>

    <!-- Create Vendor Modal -->
    <Modal
      :open="showCreateVendorModal"
      title="Add New Vendor"
      max-width="md"
      @close="showCreateVendorModal = false"
    >
      <div class="space-y-4">
        <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
          <Icon name="profile-add" size="28" />
        </div>
        <p class="text-sm text-gray-600">Create a new vendor to use in your expenses</p>

        <TextField
          v-model="newVendorName"
          label="Vendor Name"
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
            @click="showCreateVendorModal = false"
          />
          <AppButton
            label="Add Vendor"
            class="flex-1"
            :loading="isCreatingVendor"
            :disabled="isCreatingVendor || !newVendorName.trim()"
            @click="createVendor"
          />
        </div>
      </template>
    </Modal>
  </component>
</template>
