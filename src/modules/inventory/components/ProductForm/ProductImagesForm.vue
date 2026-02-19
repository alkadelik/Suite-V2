<template>
  <div class="space-y-6">
    <!-- Primary Image (File Upload Field) -->
    <div class="mt-6 h-48">
      <FileUploadField
        v-model="primaryImage"
        label="Upload Primary Image"
        :product-image-mode="true"
        :show-primary-label="true"
      />
    </div>

    <!-- Additional Images (Multi File Input) -->
    <div class="space-y-4">
      <h3 class="text-core-800 text-sm font-medium">Additional Images</h3>
      <MultiFileInput
        v-model="additionalImages"
        :number-of-images="4"
        :product-image-mode="true"
        :enabled-slots="enabledAdditionalSlots"
        :show-make-primary-button="true"
        @make-primary="handleMakePrimary"
      />
    </div>

    <!-- Variant Images Section (only shown when there are multiple variants) -->
    <div v-if="hasMultipleVariants" class="space-y-4">
      <h3 class="text-core-800 text-sm font-medium">Variant Images</h3>

      <div class="space-y-3">
        <div
          v-for="(variant, index) in variants"
          :key="`variant-${index}`"
          class="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
        >
          <!-- Variant Chips -->
          <div class="flex flex-1 flex-wrap gap-2">
            <Chip
              v-for="(attributeValue, attrIndex) in getVariantDisplayValues(variant)"
              :key="`attr-${attrIndex}`"
              :label="attributeValue"
              size="sm"
              color="primary"
            />
          </div>

          <!-- Single Image Upload -->
          <div class="w-20">
            <MultiFileInput
              :model-value="[getVariantImageForIndex(index)]"
              :number-of-images="1"
              :product-image-mode="true"
              :enabled-slots="enabledVariantSlots"
              :hide-image-label="true"
              @update:model-value="updateVariantImage(index, $event[0])"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import MultiFileInput from "@components/form/MultiFileInput.vue"
import FileUploadField from "@components/form/FileUploadField.vue"
import Chip from "@components/Chip.vue"
import type { IProductVariant } from "../../types"
import { useAuthStore } from "@modules/auth/store"

interface Props {
  /** Product images */
  modelValue: Array<File | string | null>
  /** Product variants (for displaying variant-specific image uploads) */
  variants?: IProductVariant[]
  /** Edit mode - when true, tracks removed image UIDs */
  editMode?: boolean
  /** Existing image IDs (for edit mode) - parallel array to modelValue */
  existingImageIds?: Array<string | null>
}

interface Emits {
  /** Update images */
  "update:modelValue": [value: Array<File | string | null>]
  /** Emit removed image IDs (only in edit mode) */
  "update:removedImageIds": [value: string[]]
}

const props = withDefaults(defineProps<Props>(), {
  variants: () => [],
  editMode: false,
  existingImageIds: () => [],
})
const emit = defineEmits<Emits>()

// Get auth store to check subscription status
const authStore = useAuthStore()

// Check if user has an active subscription
const hasSubscription = computed(() => {
  return authStore.user?.subscription !== null
})

// Determine how many additional image slots should be enabled
// If no subscription, disable all additional images (0 enabled)
// If subscription exists, enable all 4 slots
const enabledAdditionalSlots = computed(() => {
  return hasSubscription.value ? 4 : 0
})

// Determine if variant images should be enabled
// If no subscription, disable variant images (0 enabled)
// If subscription exists, enable the slot (1 enabled)
const enabledVariantSlots = computed(() => {
  return hasSubscription.value ? 1 : 0
})

// Track removed image IDs in edit mode
const removedImageIds = ref<string[]>([])

// Previous modelValue to detect removals
const previousModelValue = ref<Array<File | string | null>>([])

// Watch for changes to existing image IDs to reset removed IDs when editing different product
watch(
  () => props.existingImageIds,
  () => {
    removedImageIds.value = []
    previousModelValue.value = [...props.modelValue]
  },
  { immediate: true },
)

// Watch for image removals to track removed UIDs
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!props.editMode || !oldValue) return

    // Check each position for removals
    newValue.forEach((image, index) => {
      const wasImage = oldValue[index]
      const isNowNull = image === null

      // If there was an existing image and now it's null (removed) or a File (replaced), track it
      if (wasImage && (isNowNull || image instanceof File) && props.existingImageIds[index]) {
        const imageId = props.existingImageIds[index]
        if (imageId && !removedImageIds.value.includes(imageId)) {
          removedImageIds.value.push(imageId)
          emit("update:removedImageIds", removedImageIds.value)
        }
      }

      // If image was swapped (make primary functionality), track the swap
      if (wasImage && image && typeof wasImage === "string" && typeof image === "string") {
        // Both are existing images (string URLs), this is a swap
        if (wasImage !== image) {
          // The images have been rearranged, we'll handle this via PATCH to update sort_order
          // No removal tracking needed for swaps
        }
      }
    })
  },
  { deep: true },
)

// Primary image (first slot)
const primaryImage = computed({
  get: () => props.modelValue[0] || null,
  set: (val: File | string | null) => {
    // Preserve all existing images when updating primary
    const newImages = [...props.modelValue]
    // Ensure array is at least length 1
    if (newImages.length === 0) {
      newImages.push(null)
    }
    newImages[0] = val
    emit("update:modelValue", newImages)
  },
})

// Additional images (remaining 4 slots)
const additionalImages = computed({
  get: () => props.modelValue.slice(1, 5),
  set: (val: Array<File | string | null>) => {
    // Preserve variant images (indices 5+) when updating additional images
    const variantImages = props.modelValue.slice(5)
    const newImages = [primaryImage.value, ...val, ...variantImages]
    emit("update:modelValue", newImages)
  },
})

/**
 * Handles making an additional image the primary image.
 * Swaps the clicked image with the current primary image.
 * Also swaps the corresponding UIDs in edit mode.
 *
 * @param index - Index in the additional images array (0-3)
 */
const handleMakePrimary = (index: number) => {
  // Convert additional images index to parent array index
  // Additional images start at index 1 in parent array
  const parentIndex = index + 1

  // Ensure we have a valid modelValue array
  const currentImages = [...props.modelValue]
  while (currentImages.length < 5) {
    currentImages.push(null)
  }

  // Get the image that will become primary
  const newPrimary = currentImages[parentIndex]

  // Only proceed if there's actually an image to make primary
  if (!newPrimary) {
    console.warn("No image to make primary at index:", parentIndex)
    return
  }

  // Get the current primary image (can be null)
  const currentPrimary = currentImages[0]

  // Create new array with swapped images
  const newImages = [...currentImages]
  newImages[0] = newPrimary
  newImages[parentIndex] = currentPrimary

  // Emit the updated array - this will trigger reactivity
  emit("update:modelValue", newImages)

  console.log("Swapped images:", {
    oldPrimary: currentPrimary ? "File" : "null",
    newPrimary: newPrimary ? "File" : "null",
    fromIndex: parentIndex,
  })

  // In edit mode, we also need to swap the UIDs
  // This will be handled by the parent (ProductEditDrawer) via a special emit
  // or we can emit a swap event
  if (props.editMode) {
    // The parent will handle UID swapping when it detects the image swap
    // through the watcher on modelValue
  }
}

// Check if there are multiple variants (more than 1)
const hasMultipleVariants = computed(() => {
  return props.variants && props.variants.length > 1
})

// Variant images storage (indices 5+ in the modelValue array)
// Images 0-4: Primary + 4 additional images
// Images 5+: Variant-specific images (one per variant)
const variantImages = computed(() => {
  const images = props.modelValue.slice(5) || []
  return images
})

/**
 * Extract display values from variant attributes for chips
 * Same logic as in ProductManageCombinationsForm
 */
const getVariantDisplayValues = (variant: IProductVariant): string[] => {
  if (!variant.attributes || variant.attributes.length === 0) {
    return [variant.name]
  }

  return variant.attributes.map((attr) => {
    // Check for attribute_value first (from API response)
    if ("attribute_value" in attr && attr.attribute_value) {
      return attr.attribute_value as string
    }
    // Then check for valueLabel (used internally)
    if ("valueLabel" in attr && attr.valueLabel) {
      return attr.valueLabel
    }
    // Fallback to value (UID)
    return attr.value
  })
}

/**
 * Get variant image for a specific index
 * @param index - Index of the variant in the variants array
 */
const getVariantImageForIndex = (index: number): File | string | null => {
  const image = variantImages.value[index] || null
  return image
}

/**
 * Update a variant-specific image
 * @param variantIndex - Index of the variant in the variants array
 * @param image - The uploaded image file
 */
const updateVariantImage = (variantIndex: number, image: File | string | null) => {
  const newImages = [...props.modelValue]

  // Ensure the array is long enough to hold variant images
  const targetIndex = 5 + variantIndex
  while (newImages.length <= targetIndex) {
    newImages.push(null)
  }

  newImages[targetIndex] = image
  emit("update:modelValue", newImages)
}
</script>
