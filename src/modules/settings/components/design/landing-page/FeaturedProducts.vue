<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Featured Products</h4>
    </div>
    <AppForm
      :schema="validationSchema"
      :initial-values="initialValues"
      @submit="handleFormSubmit"
      class="grid gap-6 md:p-6"
      v-slot="{ values }"
    >
      <FormField
        type="radio"
        name="selection_mode"
        label="Select Featured Products"
        :radio-options="SELECTION_OPTIONS"
      />

      <FormField
        v-if="values.selection_mode === 'custom'"
        type="select"
        multiple
        name="products"
        label="Featured Products"
        placeholder="Select products to feature"
        :options="productOptions"
      />

      <FormField name="title" label="Title (optional)" placeholder="e.g. Featured Products" />

      <FormField
        name="description"
        type="textarea"
        label="Description (optional)"
        placeholder="e.g. Check out our handpicked selection"
      />

      <div class="flex justify-end">
        <AppButton type="submit" label="Save Section" :loading="isPending" />
      </div>
    </AppForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { reactive, watch, computed } from "vue"
import AppButton from "@components/AppButton.vue"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import { useGetStorefrontSections, useUpdateStorefrontSection } from "@modules/settings/api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useGetProductCatalogs } from "@modules/inventory/api"

// Define form data interface
interface FeaturedProductsFormData {
  selection_mode: string
  products?: (string | { label: string; value: string })[]
  title?: string
  description?: string
}

const SELECTION_OPTIONS = [
  {
    label: "Default",
    description: "System chooses for you",
    value: "default",
  },
  {
    label: "Custom",
    description: "You pick specific products to display",
    value: "custom",
  },
]

// API composables
const { data: landingPageData, refetch } = useGetStorefrontSections()
const { mutate: updateSection, isPending } = useUpdateStorefrontSection()
const { data: productCatalogs } = useGetProductCatalogs()

// Get featured products section from landing page data
const featuredProductsSection = computed(() => {
  const sections = landingPageData.value || []
  for (const section of sections) {
    const item = section.items?.find((i) => i.id === "featured-products")
    if (item) return { sectionUid: section.uid, ...item }
  }
  return null
})

// Product options for select dropdown
const productOptions = computed(() => {
  if (!productCatalogs.value?.results) return []
  return productCatalogs.value.results.map((product) => ({
    label: product.name,
    value: product.uid,
  }))
})

// Validation schema using Yup
const validationSchema = yup.object({
  selection_mode: yup
    .string()
    .oneOf(["default", "custom"], "Invalid selection mode")
    .required("Selection mode is required"),
  products: yup
    .array()
    .of(
      yup.lazy((value) =>
        typeof value === "string"
          ? yup.string()
          : yup.object().shape({
              label: yup.string(),
              value: yup.string(),
            }),
      ),
    )
    .when("selection_mode", {
      is: "custom",
      then: (schema) => schema.min(1, "Please select at least one product"),
      otherwise: (schema) => schema.optional(),
    }),
  title: yup.string().max(100, "Title must not exceed 100 characters").optional(),
  description: yup.string().max(500, "Description must not exceed 500 characters").optional(),
})

// Initial form values
const initialValues = reactive<FeaturedProductsFormData>({
  selection_mode: "default",
  products: [],
  title: "",
  description: "",
})

// Watch for API data and populate form
watch(
  () => featuredProductsSection.value,
  (section) => {
    if (section) {
      const sectionData = section as Record<string, unknown>
      Object.assign(initialValues, {
        selection_mode: sectionData.selection_mode || "default",
        products: sectionData.products || [],
        title: sectionData.title || "",
        description: sectionData.description || "",
      })
    }
  },
  { immediate: true },
)

// Form submit handler
const handleFormSubmit = (values: FeaturedProductsFormData) => {
  const body: Record<string, unknown> = {
    id: "featured-products",
    selection_mode: values.selection_mode,
    title: values.title || "",
    description: values.description || "",
  }

  // Only include products if custom mode is selected
  if (values.selection_mode === "custom" && values.products) {
    // Extract UIDs from products (handle both string and object formats)
    body.products = values.products.map((product) =>
      typeof product === "string" ? product : product.value,
    )
  }

  updateSection(
    {
      id: featuredProductsSection.value?.sectionUid || "",
      body,
    },
    {
      onSuccess: () => {
        toast.success("Featured Products section updated successfully")
        refetch()
      },
      onError: displayError,
    },
  )
}
</script>
