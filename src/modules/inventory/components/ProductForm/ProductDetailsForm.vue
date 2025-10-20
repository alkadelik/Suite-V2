<template>
  <div class="space-y-6">
    <TextField
      v-model="productName"
      label="Product Name"
      placeholder="Enter product name"
      required
      @input="handleProductNameInput"
    />

    <SelectField
      v-model="form.category"
      :options="categoryOptions"
      label="Category"
      placeholder="Select category"
      searchable
      required
      @update:modelValue="handleCategorySelect"
    />

    <TextAreaField
      v-model="form.description"
      label="Description"
      placeholder="Enter product description"
      :rows="4"
      hint="Your customers will see this description when they view this product."
    />

    <div
      v-if="!props.disableVariantsToggle"
      class="flex items-center justify-between gap-3 rounded-2xl border border-gray-400 px-4 py-5"
    >
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold text-gray-700 md:text-sm">
          Does this product have variants?
        </p>
        <p class="text-xs text-gray-500 md:text-sm">
          Eg. Different colours, sizes, fragrances etc.
        </p>
      </div>
      <Switch v-model="hasProductVariants" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import TextField from "@/components/form/TextField.vue"
import TextAreaField from "@/components/form/TextAreaField.vue"
import SelectField from "@/components/form/SelectField.vue"
import Switch from "@components/form/Switch.vue"
import { useGetCategories } from "@modules/inventory/api"
import { useTextTransform } from "@/composables/useTextTransform"

interface ProductForm {
  name: string
  category: { label: string; value: string } | null
  description: string
}

interface Props {
  /** Product form data */
  modelValue: ProductForm
  /** Whether product has variants */
  hasVariants: boolean
  /** Whether to disable the variants toggle (e.g., when editing) */
  disableVariantsToggle?: boolean
}

interface Emits {
  /** Update form data */
  "update:modelValue": [value: ProductForm]
  /** Update has variants flag */
  "update:hasVariants": [value: boolean]
  /** Emit when Add New Category is clicked */
  "add-category": []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { data: categoriesData } = useGetCategories()
const { handleCapitalizedInput } = useTextTransform()

// State
const productName = ref(props.modelValue.name)

// Main form computed with v-model pattern
const form = computed({
  get: () => props.modelValue,
  set: (val: ProductForm) => emit("update:modelValue", val),
})

const hasProductVariants = computed({
  get: () => props.hasVariants,
  set: (value: boolean) => emit("update:hasVariants", value),
})

/**
 * Category options with "Add New Category" as first item
 */
const categoryOptions = computed(() => {
  const addNewOption = {
    label: "Add New Category",
    value: "__add_new__",
    icon: "add",
    divider: true,
  }

  const categories =
    categoriesData.value?.data?.results?.map((category: { uid: string; name: string }) => ({
      label: category.name,
      value: category.uid,
    })) || []

  return [addNewOption, ...categories]
})

/**
 * Handle product name input with auto-capitalization
 */
const handleProductNameInput = (event: Event) => {
  handleCapitalizedInput(event, productName)
  form.value.name = productName.value
}

/**
 * Handle category selection
 * If "Add New Category" is selected, emit event to parent
 */
const handleCategorySelect = (
  value:
    | string
    | number
    | Record<string, unknown>
    | Array<string | number | Record<string, unknown>>
    | null,
) => {
  // Type guard to check if value is the expected category object
  if (value && typeof value === "object" && !Array.isArray(value) && "value" in value) {
    const categoryValue = value.value as string
    if (categoryValue === "__add_new__") {
      // Reset category selection and emit event to parent
      form.value.category = null
      emit("add-category")
    }
  }
}

// Watch for external changes to productName
watch(
  () => props.modelValue.name,
  (newName) => {
    productName.value = newName
  },
)

/**
 * Expose method to set category from parent (for when new category is created)
 */
const setCategory = (category: { label: string; value: string }) => {
  form.value.category = category
}

defineExpose({
  setCategory,
})
</script>
