<template>
  <div class="space-y-6">
    <TextField v-model="form.name" label="Product Name" placeholder="Enter product name" required />

    <SelectField
      v-model="form.category"
      :options="PRODUCT_CATEGORY_OPTIONS"
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
import { computed } from "vue"
import TextField from "@/components/form/TextField.vue"
import TextAreaField from "@/components/form/TextAreaField.vue"
import SelectField from "@/components/form/SelectField.vue"
import Switch from "@components/form/Switch.vue"
import { PRODUCT_CATEGORY_OPTIONS } from "@modules/inventory/constants"

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
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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
