<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Featured Products</h4>
    </div>
    <form @submit="onSubmit" class="grid gap-6 md:p-6">
      <FormField
        type="radio"
        name="selection_mode"
        label="Select Featured Products"
        :radio-options="SELECTION_OPTIONS"
        :show-radio="!isMobile"
      />

      <Field
        v-show="selectionMode === 'custom'"
        v-slot="{ field, errors: fieldErrors }"
        name="products"
      >
        <SelectField
          v-bind="field"
          :model-value="field.value"
          label="Featured Products"
          placeholder="Select products to feature"
          :options="productOptions"
          :error="fieldErrors[0]"
          :loading="isSearching"
          multiple
          searchable
          @update:model-value="field.value = $event"
          @search-change="productSearchInput = $event"
        />
        <p
          v-show="selectionMode === 'custom'"
          class="-mt-4 text-right text-xs"
          :class="(field.value?.length ?? 0) >= 8 ? 'text-red-500' : 'text-gray-400'"
        >
          {{ field.value?.length ?? 0 }} / 8 selected
        </p>
      </Field>

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
    </form>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { watch, computed, ref } from "vue"
import { Field, useForm } from "vee-validate"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import { useUpdateStorefrontSection } from "@modules/settings/api"
import type { ThemeSection } from "@modules/settings/types"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useSearchProductVariants } from "@modules/inventory/api"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import SelectField from "@components/form/SelectField.vue"
import { useMediaQuery } from "@vueuse/core"

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

const props = defineProps<{ featuredProductsSection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

const productSearchInput = ref("")
const productSearchQuery = useDebouncedRef(productSearchInput, 400)
const { data: searchResults, isFetching: isSearching } =
  useSearchProductVariants(productSearchQuery)

const selectionMode = ref("default")

const productOptions = computed(() => {
  if (!searchResults.value?.results) return []
  return searchResults.value.results.map((product) => ({
    label: product.name,
    value: product.uid || "",
  }))
})

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
      then: (schema) =>
        schema
          .min(1, "Please select at least one product")
          .max(8, "You can feature at most 8 products"),
      otherwise: (schema) => schema.optional(),
    }),
  title: yup.string().max(100, "Title must not exceed 100 characters").optional(),
  description: yup.string().max(500, "Description must not exceed 500 characters").optional(),
})

const { handleSubmit, setValues, values } = useForm<FeaturedProductsFormData>({
  validationSchema,
})

watch(
  () => values.selection_mode,
  (newMode) => {
    if (newMode) {
      selectionMode.value = newMode
    }
  },
)

watch(
  () => props.featuredProductsSection,
  (newSection) => {
    if (newSection) {
      setValues({
        selection_mode: newSection.selection_mode || "default",
        products: productOptions.value.filter((option) =>
          newSection.featured_products.includes(option.value),
        ),
        title: newSection.title || "",
        description: newSection.subtitle || "",
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  if (!props.featuredProductsSection?.uid) {
    return toast.error("Featured Products section not found. Please refresh the page.")
  }

  const body: Record<string, unknown> = {
    title: values.title || "",
    subtitle: values.description || "",
    selection_mode: values.selection_mode,
  }

  if (values.selection_mode === "custom" && values.products) {
    body.featured_products = values.products.map((product) =>
      typeof product === "string" ? product : product.value,
    )
  }

  updateSection(
    { id: props.featuredProductsSection.uid, body: body as unknown as FormData },
    {
      onSuccess: () => {
        toast.success("Featured Products section updated successfully")
        emit("refetch")
      },
      onError: displayError,
    },
  )
})
</script>
