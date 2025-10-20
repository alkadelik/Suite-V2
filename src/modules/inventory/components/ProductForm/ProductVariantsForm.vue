<template>
  <div class="text-core-800 space-y-4 text-left">
    <!-- Global Error Messages -->
    <div v-if="globalErrorMessage" class="mt-1 text-xs text-red-700">
      {{ globalErrorMessage }}
    </div>

    <!-- Dynamic Variants Loop -->
    <div
      v-for="(variant, index) in variants || []"
      :key="`variant-${index}`"
      class="rounded-xl border border-gray-200 bg-white"
    >
      <div class="flex items-center justify-between border-b border-gray-200 p-4">
        <p class="text-xs font-semibold md:text-sm">Variant {{ index + 1 }}</p>
        <button
          v-if="variants && variants.length > 1"
          type="button"
          class="text-core-800 text-sm hover:text-red-700"
          @click="removeVariant(index)"
        >
          <Icon name="trash" size="16" />
        </button>
      </div>
      <div class="space-y-4 p-4">
        <SelectField
          label="Select Option Type"
          placeholder="e.g. Size, Color, Material"
          :options="getFilteredAttributes(index)"
          v-model="variant.name"
          value-key="value"
          label-key="label"
          @update:model-value="
            (value) =>
              onVariantNameChange(index, value as string | number | Record<string, unknown> | null)
          "
        />

        <!-- Custom option input -->
        <TextField
          v-if="getVariantValue(index) === 'custom_type'"
          label="Option Name"
          v-model="variant.customName"
          placeholder="Enter custom option name"
          @input="(event: Event) => handleCustomNameInput(event, index)"
        />

        <InputTagsField
          v-if="getVariantDisplayName(index)"
          :label="`Enter at least ${getMinimumValuesRequired(index)} ${getVariantDisplayName(index).toLowerCase()}${getVariantDisplayName(index).toLowerCase().endsWith('s') ? '' : 's'}`"
          :placeholder="`Enter a ${getVariantDisplayName(index).toLowerCase()}`"
          v-model="variant.values"
          :is-weight-attribute="isWeightAttribute(index)"
        />

        <!-- Individual variant error messages -->
        <div v-if="getVariantErrorMessage(index)" class="mt-1 text-xs text-red-700">
          {{ getVariantErrorMessage(index) }}
        </div>
      </div>
    </div>

    <!-- Add Another Variant Button -->
    <AppButton
      v-if="variants && variants.length < 2"
      variant="text"
      label="Add Another Variant"
      class="text-primary-700 px-0"
      icon="add"
      :disabled="disableAddVariant"
      @click="addVariant"
    />
  </div>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import InputTagsField from "@components/form/InputTagsField.vue"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { computed, ref } from "vue"
import { PRODUCT_ATTRIBUTES, WEIGHT_ATTRIBUTE_UID } from "@modules/inventory/constants"
import { useTextTransform } from "@/composables/useTextTransform"

// Composables
const { handleCapitalizedInput } = useTextTransform()

/**
 * Check if the variant at the given index is the Weight attribute
 */
const isWeightAttribute = (index: number): boolean => {
  if (!variants.value) return false
  const variantValue = getVariantValue(index)
  return variantValue === WEIGHT_ATTRIBUTE_UID
}

// Use v-model to get variants data from parent
const variants = defineModel<
  Array<{
    name: Record<string, unknown> | string | null
    customName: string
    values: { label: string; value: string }[]
  }>
>()

/**
 * Handle custom name input with auto-capitalization
 */
const handleCustomNameInput = (event: Event, index: number) => {
  if (!variants.value) return

  // Create a temporary ref for the composable
  const tempRef = ref(variants.value[index].customName)
  handleCapitalizedInput(event, tempRef)
  variants.value[index].customName = tempRef.value
}

// Helper function to get the value from variant name (handles both object and string)
const getVariantValue = (index: number) => {
  if (!variants.value) return ""
  const variant = variants.value[index]
  if (!variant || !variant.name) return ""

  if (typeof variant.name === "object" && variant.name !== null) {
    return variant.name.value as string
  }

  return variant.name
}

// Helper function to get the label from variant name (handles both object and string)
const getVariantLabel = (index: number) => {
  if (!variants.value) return ""
  const variant = variants.value[index]
  if (!variant || !variant.name) return ""

  if (typeof variant.name === "object" && variant.name !== null) {
    return variant.name.label as string
  }

  // Fallback: find the label from PRODUCT_ATTRIBUTES
  const attr = PRODUCT_ATTRIBUTES.value.find((a) => a.value === variant.name)
  return attr?.label || variant.name
}

// Get filtered attributes for any variant index
const getFilteredAttributes = (currentIndex: number) => {
  if (!variants.value) return PRODUCT_ATTRIBUTES.value

  const usedNames = variants.value
    .map((_variant, index) => (index !== currentIndex ? getVariantFinalName(index) : null))
    .filter((name) => name && name.trim() !== "")
    .map((name) => name?.toLowerCase())

  return PRODUCT_ATTRIBUTES.value.filter((attr) => {
    return attr.value === "custom_type" || !usedNames.includes(attr.value)
  })
}

// Get the display name for any variant
const getVariantDisplayName = (index: number) => {
  if (!variants.value) return ""
  const variant = variants.value[index]
  if (!variant) return ""

  const variantValue = getVariantValue(index)

  if (variantValue === "custom_type") {
    return variant.customName?.trim() || ""
  }

  return getVariantLabel(index)
}

// Get the final name for comparison
const getVariantFinalName = (index: number) => {
  if (!variants.value) return ""
  const variant = variants.value[index]
  if (!variant) return ""

  const variantValue = getVariantValue(index)

  if (variantValue === "custom_type") {
    return variant.customName?.trim().toLowerCase() || ""
  }

  return variantValue.toLowerCase()
}

// Get minimum values required for a variant
const getMinimumValuesRequired = (index: number) => {
  if (!variants.value) return 2
  // First variant or single variant needs at least 2
  if (variants.value.length === 1 || index === 0) {
    return 2
  }
  // Other variants need at least 1
  return 1
}

// Handle variant name changes
const onVariantNameChange = (
  index: number,
  value: string | number | Record<string, unknown> | null,
) => {
  if (!variants.value) return
  // Store the entire object/value as-is
  variants.value[index].name = typeof value === "number" ? value.toString() : value

  const variantValue = getVariantValue(index)

  // Add new custom variant to attributes if it doesn't exist and it's not custom_type
  if (variantValue && variantValue !== "custom_type") {
    const existingAttr = PRODUCT_ATTRIBUTES.value.find(
      (attr) =>
        typeof attr.value === "string" && attr.value.toLowerCase() === variantValue.toLowerCase(),
    )
    if (!existingAttr) {
      PRODUCT_ATTRIBUTES.value.push({
        label: variantValue.charAt(0).toUpperCase() + variantValue.slice(1),
        value: variantValue.toLowerCase(),
      })
    }
  }

  // Clear custom name when switching away from custom type
  if (variantValue !== "custom_type" && variants.value) {
    variants.value[index].customName = ""
  }
}

// Add a new variant
const addVariant = () => {
  if (!variants.value) return
  variants.value.push({
    name: null,
    customName: "",
    values: [],
  })
}

// Remove a variant
const removeVariant = (index: number) => {
  if (!variants.value || variants.value.length <= 1) return
  variants.value.splice(index, 1)
}

// Get error message for individual variant
const getVariantErrorMessage = (index: number) => {
  if (!variants.value) return ""
  const variant = variants.value[index]
  if (!variant) return ""
  const displayName = getVariantDisplayName(index)
  const minimumRequired = getMinimumValuesRequired(index)

  if (!displayName) return ""

  if (variant.values.length < minimumRequired) {
    const plural = minimumRequired > 1 ? "options" : "option"
    return `You need to add at least ${minimumRequired} variant ${plural}.`
  }

  return ""
}

// Global error messages (for cross-variant validation)
const globalErrorMessage = computed(() => {
  if (!variants.value) return ""

  // Check for duplicate names
  const names = variants.value
    .map((_, index) => getVariantFinalName(index))
    .filter((name) => name && typeof name === "string" && name.trim() !== "")

  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index)

  if (duplicateNames.length > 0) {
    return "Variant names must be unique. Please choose different names for your variants."
  }

  // Check if any variant has incomplete setup when multiple variants exist
  if (variants.value.length > 1) {
    const incompleteVariants = variants.value.filter((variant, index) => {
      const displayName = getVariantDisplayName(index)
      const minimumRequired = getMinimumValuesRequired(index)
      return displayName && variant.values.length < minimumRequired
    })

    if (incompleteVariants.length > 0) {
      return "Please complete all variants before adding more."
    }
  }

  return ""
})

// Computed property to disable add variant button
const disableAddVariant = computed(() => {
  if (!variants.value) return true

  // Check if any variant is incomplete
  for (let i = 0; i < variants.value.length; i++) {
    const variant = variants.value[i]
    const displayName = getVariantDisplayName(i)
    const minimumRequired = getMinimumValuesRequired(i)

    // If variant has a name but insufficient values
    if (displayName && variant.values.length < minimumRequired) {
      return true
    }

    // If variant doesn't have a proper name
    if (!displayName && (variant.name || variant.customName)) {
      return true
    }
  }

  // Check for duplicate names
  if (globalErrorMessage.value) {
    return true
  }

  return false
})
</script>
