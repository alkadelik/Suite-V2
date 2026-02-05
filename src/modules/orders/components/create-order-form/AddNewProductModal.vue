<script setup lang="ts">
import { computed } from "vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import { useCreateProduct, useGetCategories } from "@modules/inventory/api"
import { PRODUCT_DIMENSIONS } from "@modules/inventory/constants"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useQueryClient } from "@tanstack/vue-query"

interface FormValues {
  name: string
  category: string
  price: string
  total_stock: string
  weight: string
}

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  success: [productUid: string]
}>()

// Composables
const { data: categoriesData } = useGetCategories()
const { mutate: createProduct, isPending } = useCreateProduct()
const queryClient = useQueryClient()

// Category options
const categoryOptions = computed(() => {
  const categories =
    categoriesData.value?.data?.results?.map((category: { uid: string; name: string }) => ({
      label: category.name,
      value: category.uid,
    })) || []

  return categories
})

// Dimension options
const dimensionOptions = computed(() =>
  PRODUCT_DIMENSIONS.map((dim) => ({
    label: `${dim.shortLabel} (${dim.range}) — ${dim.examples}`,
    value: dim.max_weight.toString(),
  })),
)

// Validation schema
const productSchema = computed(() => {
  return yup.object({
    name: yup
      .string()
      .required("Product name is required")
      .min(2, "Product name must be at least 2 characters"),
    category: yup
      .mixed()
      .required("Category is required")
      .test("is-valid-category", "Category is required", (value) => {
        if (typeof value === "string") return value.length > 0
        if (typeof value === "object" && value !== null && "value" in value) {
          return (value as { value: string }).value.length > 0
        }
        return false
      }),
    price: yup
      .string()
      .required("Price is required")
      .matches(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
    total_stock: yup
      .string()
      .required("Available stock is required")
      .matches(/^\d+$/, "Stock must be a whole number"),
    weight: yup
      .mixed()
      .required("Product weight is required")
      .test("is-valid-weight", "Product weight is required", (value) => {
        if (typeof value === "string") return value.length > 0
        if (typeof value === "object" && value !== null && "value" in value) {
          return (value as { value: string }).value.length > 0
        }
        return false
      }),
  })
})

// Form setup
const { handleSubmit, resetForm } = useForm<FormValues>({
  validationSchema: productSchema,
})

// Handle form submission
const onSubmit = () => {
  handleSubmit((values) => {
    // Extract actual values if they are objects with label/value
    const categoryValue =
      typeof values.category === "object" && values.category !== null && "value" in values.category
        ? (values.category as { value: string }).value
        : values.category

    const weightValue =
      typeof values.weight === "object" && values.weight !== null && "value" in values.weight
        ? (values.weight as { value: string }).value
        : values.weight

    // Find the selected dimension
    const selectedDimension = PRODUCT_DIMENSIONS.find(
      (dim) => dim.max_weight.toString() === weightValue,
    )

    // Create product payload with a single default variant
    const payload = {
      name: values.name.trim(),
      description: "",
      story: "",
      category: categoryValue,
      brand: "",
      is_active: true,
      is_variable: false,
      requires_approval: false,
      variants: [
        {
          name: values.name.trim(),
          sku: `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          price: values.price,
          promo_price: "",
          promo_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cost_price: "",
          weight: weightValue,
          length: selectedDimension?.depth.toString() || "0",
          width: selectedDimension?.width.toString() || "0",
          height: selectedDimension?.height.toString() || "0",
          reorder_point: "0",
          max_stock: "0",
          opening_stock: values.total_stock,
          is_active: true,
          is_default: true,
          batch_number: "",
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          attributes: [],
        },
      ],
    }

    createProduct(payload, {
      onSuccess: (response: unknown) => {
        toast.success("Product created successfully")

        // Extract product UID from response
        const productUid =
          (response as { data?: { data?: { uid?: string } } })?.data?.data?.uid || ""

        // Invalidate product queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ["products"] })
        queryClient.invalidateQueries({ queryKey: ["product-catalogs"] })

        // Reset form and close modal
        resetForm()
        emit("success", productUid)
        emit("close")
      },
      onError: (error) => {
        displayError(error)
      },
    })
  })()
}
</script>

<template>
  <!-- <Teleport to="body"> -->
  <Modal title="Add Product" :open="open" @close="emit('close')">
    <form @submit.prevent="onSubmit">
      <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
        <Icon name="box" size="28" />
      </div>
      <p class="mb-4 text-sm">Add a new product</p>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField type="text" name="name" label="Product Name" placeholder="e.g. iPhone 15 Pro" />

        <FormField
          type="select"
          name="category"
          label="Category"
          placeholder="Select category"
          :options="categoryOptions"
        />

        <FormField type="text" name="price" label="Price" placeholder="e.g. 1000" />

        <FormField type="text" name="total_stock" label="Available Stock" placeholder="e.g. 50" />

        <div class="sm:col-span-2">
          <FormField
            type="select"
            name="weight"
            label="Product Weight"
            placeholder="Select weight range"
            :options="dimensionOptions"
            placement="top"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <AppButton
        label="Add Product"
        class="w-full"
        :loading="isPending"
        :disabled="isPending"
        @click="onSubmit"
      />
    </template>
  </Modal>
  <!-- </Teleport> -->
</template>
