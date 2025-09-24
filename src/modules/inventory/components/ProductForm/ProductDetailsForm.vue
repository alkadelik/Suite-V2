<template>
  <div class="space-y-6">
    <TextField v-model="form.name" label="Product Name" placeholder="Enter product name" required />

    <SelectField
      v-model="form.category"
      :options="categoryOptions"
      label="Category"
      placeholder="Select category"
      searchable
      required
    />

    <TextAreaField
      v-model="form.description"
      label="Description"
      placeholder="Enter product description"
      :rows="4"
      hint="Your customers will see this description when they view this product."
    />

    <div>
      <p class="text-xs font-semibold text-gray-700 md:text-sm">Product Image(s) (optional)</p>
      <p class="mb-2 text-xs text-gray-500 md:text-sm">
        Supports: PNG, JPEG, SVG, WEBP, HEIC, HEIF, AVIF | Max. size: 5MB
      </p>
      <MultiFileInput v-model="form.images" :number-of-images="5" />
    </div>

    <div
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
import { computed } from "vue"
import TextField from "@/components/form/TextField.vue"
import TextAreaField from "@/components/form/TextAreaField.vue"
import SelectField from "@/components/form/SelectField.vue"
import Switch from "@components/form/Switch.vue"
import MultiFileInput from "@components/form/MultiFileInput.vue"

interface ProductForm {
  name: string
  category: string | null
  description: string
  images: Array<File>
}

interface Props {
  /** Product form data */
  modelValue: ProductForm
  /** Whether product has variants */
  hasVariants: boolean
}

interface Emits {
  /** Update form data */
  "update:modelValue": [value: ProductForm]
  /** Update has variants flag */
  "update:hasVariants": [value: boolean]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Sample category options
const categoryOptions = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothing & Fashion", value: "clothing" },
  { label: "Home & Garden", value: "home-garden" },
  { label: "Health & Beauty", value: "health-beauty" },
  { label: "Sports & Outdoors", value: "sports" },
  { label: "Books & Media", value: "books-media" },
  { label: "Toys & Games", value: "toys-games" },
  { label: "Food & Beverages", value: "food-beverages" },
  { label: "Automotive", value: "automotive" },
  { label: "Jewelry & Accessories", value: "jewelry" },
  { label: "Art & Crafts", value: "art-crafts" },
  { label: "Pet Supplies", value: "pet-supplies" },
  { label: "Office Supplies", value: "office-supplies" },
  { label: "Baby & Kids", value: "baby-kids" },
  { label: "Travel & Luggage", value: "travel" },
]

// Main form computed with v-model pattern
const form = computed({
  get: () => props.modelValue,
  set: (val: ProductForm) => emit("update:modelValue", val),
})

const hasProductVariants = computed({
  get: () => props.hasVariants,
  set: (value: boolean) => emit("update:hasVariants", value),
})
</script>
