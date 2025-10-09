<template>
  <div class="space-y-6">
    <!-- Single Variant View (when only one variant) -->
    <div v-if="isSingleVariant" class="space-y-6">
      <!-- Price Section -->
      <TextField
        :model-value="singleVariantForm.price"
        @update:model-value="updateSingleVariantField('price', removeLeadingZeros($event))"
        label="Price"
        placeholder=""
        type="number"
        step="0.01"
        min="0"
        required
      />

      <!-- Stock Section -->
      <TextField
        v-if="!props.hideStock"
        :model-value="singleVariantForm.opening_stock"
        @update:model-value="updateSingleVariantField('opening_stock', removeLeadingZeros($event))"
        label="Available Stock"
        placeholder=""
        type="number"
        min="0"
        required
      />
    </div>

    <!-- Multiple Variants View (when more than one variant) -->
    <div v-else class="space-y-4 rounded-lg border border-gray-200">
      <!-- Header -->
      <div class="flex items-center justify-between bg-gray-50 p-4">
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-900">Variant</h3>
        </div>
        <div v-if="!props.hideStock" class="w-32 text-center">
          <h3 class="text-sm font-medium text-gray-900">Quantity</h3>
        </div>
        <div class="w-32 text-center">
          <h3 class="text-sm font-medium text-gray-900">Price</h3>
        </div>
      </div>

      <!-- Variant Rows -->
      <div class="bg-white">
        <div
          v-for="(variant, index) in variants"
          :key="`variant-${index}`"
          class="flex items-center gap-4 border-b border-gray-200 p-4"
        >
          <!-- Variant Name with Chips -->
          <div class="flex-1">
            <div class="flex flex-wrap gap-2">
              <Chip
                v-for="(attributeValue, attrIndex) in getVariantDisplayValues(variant)"
                :key="`attr-${attrIndex}`"
                :label="attributeValue"
                size="sm"
              />
            </div>
          </div>

          <!-- Quantity Input -->
          <div v-if="!props.hideStock" class="w-32">
            <TextField
              :model-value="variant.opening_stock"
              placeholder=""
              type="number"
              min="0"
              size="sm"
              @update:model-value="
                updateVariantField(index, 'opening_stock', removeLeadingZeros($event))
              "
              @blur="handleStockBlur(index, $event)"
            />
          </div>

          <!-- Price Input -->
          <div class="w-32">
            <TextField
              :model-value="variant.price"
              placeholder=""
              type="number"
              step="0.01"
              min="0"
              size="sm"
              @update:model-value="updateVariantField(index, 'price', removeLeadingZeros($event))"
              @blur="handlePriceBlur(index, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Weight Section (always shown) -->
    <div class="space-y-4">
      <SelectField
        v-model="selectedDimension"
        :options="dimensionOptions"
        label="Product Weight"
        placeholder="Select weight category"
        required
      />

      <!-- Product Dimensions (only show when weight is selected) -->
      <div v-if="selectedDimension" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 class="mb-1 text-sm font-medium">Product Dimensions</h4>
        <p class="mb-3 text-sm text-gray-600">
          These are estimated dimensions based on the weight you selected. You can update them if
          you know the exact dimensions of your product.
        </p>
        <div class="grid grid-cols-3 gap-3">
          <TextField
            :model-value="globalDimensions.height"
            type="number"
            label="Height (cm)"
            placeholder="40.0"
            step="0.1"
            min="0"
            required
            @update:model-value="updateGlobalDimension('height', $event)"
          />
          <TextField
            :model-value="globalDimensions.length"
            type="number"
            label="Length (cm)"
            placeholder="40.0"
            step="0.1"
            min="0"
            required
            @update:model-value="updateGlobalDimension('length', $event)"
          />
          <TextField
            :model-value="globalDimensions.width"
            type="number"
            label="Width (cm)"
            placeholder="40.0"
            step="0.1"
            min="0"
            required
            @update:model-value="updateGlobalDimension('width', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import TextField from "@/components/form/TextField.vue"
import SelectField from "@/components/form/SelectField.vue"
import Chip from "@/components/Chip.vue"
import { PRODUCT_DIMENSIONS } from "../../constants"
import { IProductDimension } from "@modules/inventory/types"
import { IProductVariant } from "../../types"

interface Props {
  /** Variants array - for no variants case, should contain single variant */
  modelValue: IProductVariant[]
  /** Product name to set as default variant name */
  productName?: string
  /** Hide the stock/quantity field (for variant-details edit mode) */
  hideStock?: boolean
}

interface Emits {
  /** Update variants array */
  "update:modelValue": [value: IProductVariant[]]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Global dimensions state (applies to all variants)
const globalDimensions = ref({
  height: "",
  length: "",
  width: "",
  weight: "",
})

// Initialize global dimensions from existing variants
const initializeGlobalDimensions = () => {
  if (props.modelValue && props.modelValue.length > 0) {
    const firstVariant = props.modelValue[0]
    globalDimensions.value = {
      height: firstVariant.height || "",
      length: firstVariant.length || "",
      width: firstVariant.width || "",
      weight: firstVariant.weight || "",
    }
  }
}

// Initialize on mount and when variants change
watch(
  () => props.modelValue,
  (newVariants, oldVariants) => {
    if (newVariants && newVariants.length > 0) {
      // Initialize if:
      // 1. globalDimensions are empty, OR
      // 2. variants array changed (e.g., when loading from API in edit mode)
      const shouldInitialize =
        (!globalDimensions.value.weight && !globalDimensions.value.height) ||
        (oldVariants && oldVariants.length !== newVariants.length) ||
        (!oldVariants && newVariants.length > 0)

      if (shouldInitialize) {
        initializeGlobalDimensions()
      }
    }
  },
  { immediate: true },
)

// Check if we have a single variant
const isSingleVariant = computed(() => {
  return !props.modelValue || props.modelValue.length <= 1
})

// Get variants array
const variants = computed(() => props.modelValue || [])

// Transform PRODUCT_DIMENSIONS for SelectField
const dimensionOptions = computed(() =>
  PRODUCT_DIMENSIONS.map((dim) => ({
    label: `${dim.shortLabel} (${dim.range}) — ${dim.examples}`,
    value: dim,
  })),
)

// Single variant form (for when there's only one variant)
const singleVariantForm = computed({
  get: () => {
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
  set: (variant: IProductVariant) => {
    const updatedVariants = [...props.modelValue]
    updatedVariants[0] = variant
    emit("update:modelValue", updatedVariants)
  },
})

// Selected dimension for weight dropdown
const selectedDimension = computed({
  get: () => {
    if (!globalDimensions.value.weight) return null

    // First try exact match (for weights that were set by the dropdown)
    const exactMatch = dimensionOptions.value.find(
      (opt) => opt.value.max_weight.toString() === globalDimensions.value.weight,
    )
    if (exactMatch) return exactMatch

    // If no exact match, find the appropriate dimension based on weight range
    const weight = parseFloat(globalDimensions.value.weight)
    if (isNaN(weight)) return null

    // Sort dimension options by max_weight to find the right range
    const sortedOptions = [...dimensionOptions.value].sort(
      (a, b) => a.value.max_weight - b.value.max_weight,
    )

    // Find the first dimension where weight <= max_weight
    const rangeMatch = sortedOptions.find((opt) => weight <= opt.value.max_weight)
    return rangeMatch || null
  },
  set: (dimension: { label: string; value: IProductDimension }) => {
    if (dimension) {
      // Update global dimensions
      globalDimensions.value = {
        weight: dimension.value.max_weight.toString(),
        height: dimension.value.height.toString(),
        length: dimension.value.depth.toString(),
        width: dimension.value.width.toString(),
      }

      // Update all variants with new dimensions
      updateAllVariantDimensions(globalDimensions.value)
    }
  },
})

// Extract display values from variant attributes for chips
const getVariantDisplayValues = (variant: IProductVariant): string[] => {
  if (!variant.attributes || variant.attributes.length === 0) {
    return [variant.name]
  }

  // Return the attribute_value (from API) if available, otherwise valueLabel, then fall back to value (UID)
  return variant.attributes.map((attr) => {
    // Check for attribute_value first (from API response)
    if ('attribute_value' in attr && attr.attribute_value) {
      return attr.attribute_value as string
    }
    // Then check for valueLabel (used internally)
    if ('valueLabel' in attr && attr.valueLabel) {
      return attr.valueLabel as string
    }
    // Fallback to value (UID) - this shouldn't normally be displayed
    return attr.value as string
  })
}

// Update a specific field for a specific variant
const updateVariantField = (index: number, field: keyof IProductVariant, value: string) => {
  const updatedVariants = [...props.modelValue]
  if (updatedVariants[index]) {
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    }
    emit("update:modelValue", updatedVariants)
  }
}

// Update global dimensions and apply to all variants
const updateGlobalDimension = (field: string, value: string) => {
  globalDimensions.value = {
    ...globalDimensions.value,
    [field]: value,
  }

  // Update all variants with the new dimension
  updateAllVariantDimensions(globalDimensions.value)
}

// Update dimensions for all variants
const updateAllVariantDimensions = (dimensions: {
  height: string
  length: string
  width: string
  weight: string
}) => {
  const updatedVariants = props.modelValue.map((variant) => ({
    ...variant,
    height: dimensions.height,
    length: dimensions.length,
    width: dimensions.width,
    weight: dimensions.weight,
  }))

  emit("update:modelValue", updatedVariants)
}

// Handle stock blur - auto-fill other variants if they're empty
const handleStockBlur = (currentIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.trim()

  if (!value || value === "0") return

  // Check if other variants have empty or zero stock values
  const updatedVariants = [...props.modelValue]
  let hasChanges = false

  updatedVariants.forEach((variant, index) => {
    if (
      index !== currentIndex &&
      (!variant.opening_stock ||
        variant.opening_stock === "0" ||
        variant.opening_stock.trim() === "")
    ) {
      variant.opening_stock = value
      hasChanges = true
    }
  })

  if (hasChanges) {
    emit("update:modelValue", updatedVariants)
  }
}

// Handle price blur - auto-fill other variants if they're empty
const handlePriceBlur = (currentIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.trim()

  if (!value || value === "0") return

  // Check if other variants have empty or zero price values
  const updatedVariants = [...props.modelValue]
  let hasChanges = false

  updatedVariants.forEach((variant, index) => {
    if (
      index !== currentIndex &&
      (!variant.price || variant.price === "0" || variant.price.trim() === "")
    ) {
      variant.price = value
      hasChanges = true
    }
  })

  if (hasChanges) {
    emit("update:modelValue", updatedVariants)
  }
}

// Update single variant field properly using the computed setter
const updateSingleVariantField = (field: keyof IProductVariant, value: string) => {
  const updatedVariant = {
    ...singleVariantForm.value,
    [field]: value,
  }
  singleVariantForm.value = updatedVariant
}

// Remove leading zeros from input values
const removeLeadingZeros = (value: string): string => {
  if (!value || value.trim() === "") return value

  // For decimal numbers, handle separately
  if (value.includes(".")) {
    const parts = value.split(".")
    const integerPart = parts[0].replace(/^0+/, "") || "0"
    return `${integerPart}.${parts[1]}`
  }

  // For integers, remove leading zeros but keep at least one digit
  return value.replace(/^0+/, "") || "0"
}
</script>
