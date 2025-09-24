<template>
  <div class="space-y-6">
    <!-- Price Section -->
    <TextField
      v-model="variantForm.price"
      label="Price"
      placeholder="0.00"
      type="number"
      step="0.01"
      min="0"
      required
    />

    <!-- Stock Section -->
    <TextField
      v-model="variantForm.opening_stock"
      label="Available Stock"
      placeholder="0"
      type="number"
      min="0"
      required
    />

    <!-- Weight Section -->
    <div class="space-y-4">
      <SelectField
        v-model="selectedDimension"
        :options="dimensionOptions"
        label="Product Weight"
        placeholder="Select weight category"
        required
      >
        <template #option="{ option }">
          <div>
            <span class="font-semibold">{{ option.shortLabel }}</span>
            <span class="font-normal"> ({{ option.range }}) </span> —
            <span class="font-light text-gray-500">{{ option.examples }}</span>
          </div>
        </template>
      </SelectField>

      <div v-if="variantForm.weight" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 class="mb-1 text-sm font-medium">Product Dimensions</h4>
        <p class="mb-3 text-sm text-gray-600">
          These are estimated dimensions based on the weight you selected. You can update them if
          you know the exact dimensions of your product.
        </p>
        <div class="grid grid-cols-3 gap-3">
          <TextField
            v-model="variantForm.height"
            type="number"
            label="Height (cm)"
            placeholder="40.0"
            step="0.1"
            min="0"
            required
          />
          <TextField
            v-model="variantForm.length"
            type="number"
            label="Length (cm)"
            placeholder="40.0"
            step="0.1"
            min="0"
            required
          />
          <TextField
            v-model="variantForm.width"
            type="number"
            label="Width (cm)"
            placeholder="40.0"
            step="0.1"
            min="0"
            required
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue"
import TextField from "@/components/form/TextField.vue"
import SelectField from "@/components/form/SelectField.vue"
import { PRODUCT_DIMENSIONS } from "../../constants"
import { IProductDimension } from "@modules/inventory/types"
import { IProductFormVariant } from "../../types"

interface Props {
  /** Variants array - for no variants case, should contain single variant */
  modelValue: IProductFormVariant[]
  /** Product name to set as default variant name */
  productName?: string
}

interface Emits {
  /** Update variants array */
  "update:modelValue": [value: IProductFormVariant[]]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Transform PRODUCT_DIMENSIONS for SelectField
const dimensionOptions = computed(() =>
  PRODUCT_DIMENSIONS.map((dim) => ({
    label: `${dim.shortLabel} (${dim.range}) — ${dim.examples}`,
    value: dim,
    max_weight: dim.max_weight,
    height: dim.height,
    depth: dim.depth,
    width: dim.width,
    shortLabel: dim.shortLabel,
    range: dim.range,
    examples: dim.examples,
  })),
)

// Get the single variant (first item in array for no-variants case)
const variantForm = computed({
  get: () => {
    // If no variants exist, create a default one
    if (!props.modelValue || props.modelValue.length === 0) {
      return {
        name: props.productName || "Default",
        sku: "",
        price: "",
        promo_price: "",
        promo_expiry: "",
        cost_price: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        reorder_point: "",
        max_stock: "",
        opening_stock: "",
        is_active: true,
        is_default: true,
        batch_number: "",
        expiry_date: "",
        attributes: [],
      }
    }
    return props.modelValue[0]
  },
  set: (variant: IProductFormVariant) => {
    // Update the first (and only) variant in the array
    const updatedVariants = [...props.modelValue]
    updatedVariants[0] = variant
    emit("update:modelValue", updatedVariants)
  },
})

// Selected dimension for weight dropdown
const selectedDimension = computed({
  get: () => {
    if (!variantForm.value.weight) return null
    return dimensionOptions.value.find(
      (opt) => opt.max_weight.toString() === variantForm.value.weight,
    )
  },
  set: (dimension: IProductDimension) => {
    if (dimension) {
      // Update variant form with selected dimension data
      variantForm.value = {
        ...variantForm.value,
        weight: dimension.max_weight.toString(),
        height: dimension.height.toString(),
        length: dimension.depth.toString(),
        width: dimension.width.toString(),
      }
    }
  },
})

// Watch for product name changes to update variant name
watch(
  () => props.productName,
  (newName) => {
    if (newName && variantForm.value.name === "Default") {
      variantForm.value = {
        ...variantForm.value,
        name: newName,
      }
    }
  },
  { immediate: true },
)

// Initialize variant if modelValue is empty
watch(
  () => props.modelValue,
  (newVariants) => {
    if (!newVariants || newVariants.length === 0) {
      // Initialize with a default variant
      const defaultVariant: IProductFormVariant = {
        name: props.productName || "Default",
        sku: "",
        price: "",
        promo_price: "",
        promo_expiry: "",
        cost_price: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        reorder_point: "",
        max_stock: "",
        opening_stock: "",
        is_active: true,
        is_default: true,
        batch_number: "",
        expiry_date: "",
        attributes: [],
      }
      emit("update:modelValue", [defaultVariant])
    }
  },
  { immediate: true },
)
</script>
