<template>
  <Drawer
    :open="modelValue"
    title="Add Product"
    :position="drawerPosition"
    max-width="xl"
    @close="emit('update:modelValue', false)"
  >
    <IconHeader icon-name="shop-add" :title="getHeaderTitle" :subtext="getHeaderText" />

    <form id="product-form" @submit.prevent="handleSubmit" class="min-h-full">
      <div>
        <!-- Step 1: Product Details -->
        <ProductDetailsForm
          v-if="step === 1"
          v-model="form"
          :has-variants="hasVariants"
          @update:has-variants="hasVariants = $event"
        />

        <!-- Step 2: Variants Configuration (only if hasVariants is true) -->
        <ProductVariantsForm v-else-if="step === 2 && hasVariants" v-model="variantConfiguration" />

        <!-- Step 2/3: Inventory & Pricing -->
        <ProductManageCombinationsForm
          v-else-if="(step === 2 && !hasVariants) || (step === 3 && hasVariants)"
          v-model="variants"
          :product-name="form.name"
        />

        <!-- Step 3/4: Product Images -->
        <ProductImagesForm
          v-else-if="(step === 3 && !hasVariants) || (step === 4 && hasVariants)"
          v-model="form.images"
        />

        <!-- Fallback -->
        <div v-else class="text-center text-gray-500">Step {{ step }} - Coming soon</div>
      </div>
    </form>

    <template #footer>
      <div class="flex w-full items-center">
        <!-- Step Indicator -->
        <!-- <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500"> Step {{ step }} of {{ totalSteps }} </span>
          <div class="flex space-x-1">
            <div
              v-for="i in totalSteps"
              :key="i"
              :class="['h-2 w-2 rounded-full', i <= step ? 'bg-primary-600' : 'bg-gray-300']"
            />
          </div>
        </div> -->

        <!-- Navigation Buttons -->
        <div class="flex w-full items-center gap-2">
          <AppButton
            variant="outlined"
            :label="step === 1 ? 'Cancel' : 'Back'"
            class="flex-1"
            :disabled="isPending"
            @click="handleBack"
          />
          <AppButton
            :label="isLastStep ? 'Save Product' : 'Next'"
            :loading="isPending"
            :disabled="isPending || !canProceed"
            class="flex-1"
            form="product-form"
            type="submit"
          />
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, onUnmounted, watch } from "vue"
import Drawer from "@components/Drawer.vue"
import AppButton from "@/components/AppButton.vue"
import { IProductFormPayload } from "../types"
import IconHeader from "@components/IconHeader.vue"
import ProductDetailsForm from "./ProductForm/ProductDetailsForm.vue"
import ProductManageCombinationsForm from "./ProductForm/ProductManageCombinationsForm.vue"
import { IProductVariant, IProductAttribute } from "../types"
import ProductImagesForm from "./ProductForm/ProductImagesForm.vue"
import ProductVariantsForm from "./ProductForm/ProductVariantsForm.vue"
import {
  useCreateProduct,
  useCreateAttribute,
  useCreateAttributeValues,
  useAddProductImage,
} from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"

interface Props {
  /** Whether the drawer is open/visible */
  modelValue: boolean
  /** Loading state for async operations */
  loading?: boolean
}

interface Emits {
  /** Update the modelValue */
  "update:modelValue": [value: boolean]
  /** Emitted when drawer should refresh parent data */
  refresh: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

// API Calls
const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
const { mutate: createAttribute, isPending: isCreatingAttribute } = useCreateAttribute()
const { mutate: createAttributeValues, isPending: isCreatingAttributeValues } =
  useCreateAttributeValues()
const { mutate: addProductImages, isPending: isAddingProductImages } = useAddProductImage()

// Reactive state
const isMobile = ref(false)
const step = ref(1) // Current step in multi-step form
const hasVariants = ref(false)
const form = reactive({
  name: "",
  description: "",
  category: null as { label: string; value: string } | null,
  images: [] as Array<File | string | null>,
  story: "",
  brand: "",
  requires_approval: false,
})

// Variants array for inventory management
const variants = ref<IProductVariant[]>([])

// Watch hasVariants to initialize single variant when no variants are needed
watch(hasVariants, (newValue) => {
  if (!newValue && variants.value.length === 0) {
    // Initialize single variant for no-variants case
    variants.value = [
      {
        name: form.name || "Default",
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
      },
    ]
  } else if (newValue && variants.value.length === 1 && variants.value[0].attributes.length === 0) {
    // Clear variants when switching back to variants mode
    variants.value = []
  }
})

// Variant configuration for step 2 (variant types and values)
interface VariantConfiguration {
  name: Record<string, unknown> | string | null
  customName: string
  values: { label: string; value: string }[]
}

const variantConfiguration = ref<VariantConfiguration[]>([
  {
    name: null,
    customName: "",
    values: [],
  },
])

// Computed properties
const totalSteps = computed(() => {
  return hasVariants.value ? 4 : 3
})

const isLastStep = computed(() => {
  return step.value === totalSteps.value
})

// Helper function to get the value from variant name (handles both object and string)
const getVariantValue = (variant: VariantConfiguration) => {
  if (!variant || !variant.name) return ""

  if (typeof variant.name === "object" && variant.name !== null) {
    return variant.name.value as string
  }

  return variant.name
}

// Helper function to get the display name for a variant
const getVariantDisplayName = (variant: VariantConfiguration) => {
  if (!variant) return ""

  const variantValue = getVariantValue(variant)

  if (variantValue === "custom_type") {
    return variant.customName?.trim() || ""
  }

  return variantValue
}

// Get the final name for comparison
const getVariantFinalName = (variant: VariantConfiguration) => {
  if (!variant) return ""

  const variantValue = getVariantValue(variant)

  if (variantValue === "custom_type") {
    return variant.customName?.trim().toLowerCase() || ""
  }

  return variantValue.toLowerCase()
}

// Get minimum values required for a variant
const getMinimumValuesRequired = (index: number) => {
  // First variant or single variant needs at least 2
  if (variantConfiguration.value.length === 1 || index === 0) {
    return 2
  }
  // Other variants need at least 1
  return 1
}

// Validate variant configuration
const isVariantConfigurationValid = computed(() => {
  // Check for duplicate names
  const names = variantConfiguration.value
    .map((variant) => getVariantFinalName(variant))
    .filter((name) => name && typeof name === "string" && name.trim() !== "")

  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index)

  if (duplicateNames.length > 0) {
    return false // Has duplicate names
  }

  // Check if all variants are complete
  for (let i = 0; i < variantConfiguration.value.length; i++) {
    const variant = variantConfiguration.value[i]
    const displayName = getVariantDisplayName(variant)
    const minimumRequired = getMinimumValuesRequired(i)

    // If variant doesn't have a proper display name
    if (!displayName) {
      return false
    }

    // If variant has insufficient values
    if (variant.values.length < minimumRequired) {
      return false
    }
  }

  return true
})

const canProceed = computed(() => {
  if (step.value === 1) {
    return form.name.trim() !== "" && form.category !== null
  } else if (step.value === 2 && hasVariants.value) {
    // Validate variants step - ensure valid variant configuration
    return isVariantConfigurationValid.value
  } else if ((step.value === 2 && !hasVariants.value) || (step.value === 3 && hasVariants.value)) {
    // Validate inventory step - ensure we have at least basic pricing, stock info, and dimensions
    if (!variants.value || variants.value.length === 0) {
      return false
    }

    // For multiple variants, check that all have required fields filled
    if (variants.value.length > 1) {
      const isValid = variants.value.every((variant) => {
        const validationResult =
          variant &&
          variant.price.trim() !== "" &&
          parseFloat(variant.price) > 0 &&
          variant.opening_stock.trim() !== "" &&
          parseInt(variant.opening_stock) >= 0 &&
          variant.height.trim() !== "" &&
          parseFloat(variant.height) > 0 &&
          variant.length.trim() !== "" &&
          parseFloat(variant.length) > 0 &&
          variant.width.trim() !== "" &&
          parseFloat(variant.width) > 0 &&
          variant.weight.trim() !== "" &&
          parseFloat(variant.weight) > 0

        // Debug logging
        if (!validationResult) {
          console.log("Validation failed for variant:", {
            name: variant?.name,
            price: variant?.price,
            stock: variant?.opening_stock,
            height: variant?.height,
            length: variant?.length,
            width: variant?.width,
            weight: variant?.weight,
          })
        }
        return validationResult
      })
      return isValid
    } else {
      // For single variant, check basic requirements including weight
      const variant = variants.value[0]
      const isValid =
        variant &&
        variant.price.trim() !== "" &&
        parseFloat(variant.price) > 0 &&
        variant.opening_stock.trim() !== "" &&
        parseInt(variant.opening_stock) >= 0 &&
        variant.height.trim() !== "" &&
        parseFloat(variant.height) > 0 &&
        variant.length.trim() !== "" &&
        parseFloat(variant.length) > 0 &&
        variant.width.trim() !== "" &&
        parseFloat(variant.width) > 0 &&
        variant.weight.trim() !== "" &&
        parseFloat(variant.weight) > 0

      // Debug logging
      if (!isValid && variant) {
        console.log("Single variant validation failed:", {
          name: variant.name,
          price: variant.price,
          stock: variant.opening_stock,
          height: variant.height,
          length: variant.length,
          width: variant.width,
          weight: variant.weight,
        })
      }

      return isValid
    }
  }
  // Add validation for other steps as needed
  return true
})

// Computed loading state
const isPending = computed(() => {
  return (
    props.loading ||
    isCreating.value ||
    isCreatingAttribute.value ||
    isCreatingAttributeValues.value ||
    isAddingProductImages.value
  )
})

// Computed property to create attribute UID to name mapping
// note: this is currently unused but was used for product review step

// const attributeNamesMap = computed(() => {
//   const map: Record<string, string> = {}

//   for (const variant of variantConfiguration.value) {
//     if (typeof variant.name === "object" && variant.name?.value && variant.name?.label) {
//       // Map UID to the actual label
//       map[variant.name.value as string] = variant.name.label as string
//     }
//   }

//   return map
// })

// Function to validate that all variants and values have UIDs after processing
const validateAllUIDs = (): boolean => {
  for (const variant of variantConfiguration.value) {
    // Check if variant has required values
    if (variant.values.length === 0) {
      continue // Skip empty variants
    }

    // Skip UID validation for custom variants - they always get processed fresh

    // Check all values have UIDs
    for (const value of variant.values) {
      const isObject =
        typeof value === "object" && value !== null && "label" in value && "value" in value
      const hasUID = isObject && value.label !== value.value && value.value !== "custom_type"

      if (!hasUID) {
        console.error("Value missing UID:", value)
        return false
      }
    }
  }

  return true
}

// Function to reset all form state
const resetFormState = () => {
  // Reset form data
  Object.assign(form, {
    name: "",
    description: "",
    category: null,
    images: [],
    story: "",
    brand: "",
    requires_approval: false,
  })

  // Reset step and variants
  step.value = 1
  hasVariants.value = true
  variants.value = []

  // Reset variant configuration
  variantConfiguration.value = [
    {
      name: null,
      customName: "",
      values: [],
    },
  ]
}

// Dynamic header title based on current step
const getHeaderTitle = computed(() => {
  if ((step.value === 3 && !hasVariants.value) || (step.value === 4 && hasVariants.value)) {
    return "Product Image(s) (optional)"
  }
  return undefined
})

// Dynamic header text based on current step and variant status
const getHeaderText = computed(() => {
  if (step.value === 1) {
    return "Add basic details about your product, e.g. name, category, description."
  } else if (step.value === 2 && !hasVariants.value) {
    return "Enter available quantity and price for your product."
  } else if (step.value === 3 && !hasVariants.value) {
    return "Supports: PNG, JPEG, SVG, WEBP, HEIC, HEIF, AVIF | Max. size: 5MB"
  } else if (step.value === 2 && hasVariants.value) {
    return "Add the different options your product comes in (like size or colour). For example: Size → Large, Color → Red."
  } else if (step.value === 3 && hasVariants.value) {
    return "Enter available quantity and price for each variant combination."
  } else if (step.value === 4 && hasVariants.value) {
    return "Supports: PNG, JPEG, SVG, WEBP, HEIC, HEIF, AVIF | Max. size: 5MB"
  }
  return ""
})

// Watch for drawer opening to reset form
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetFormState()
    }
  },
  { immediate: true },
)

// Check if mobile on mount and window resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
}

onMounted(() => {
  checkMobile()
  window.addEventListener("resize", checkMobile)
})

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile)
})

// Computed drawer position based on screen size
const drawerPosition = computed(() => {
  return isMobile.value ? "bottom" : "right"
})

// Helper function to safely extract UID from response
const extractUid = (response: unknown): string => {
  // Use the known correct path directly
  try {
    const value = (response as { data: { data: { uid: string } } })?.data?.data?.uid
    return typeof value === "string" && value.length > 0 ? value : ""
  } catch (error) {
    console.error("Could not extract UID from response:", response, error)
    return ""
  }
}

// Function to process all variants and create attribute values
const processVariantConfiguration = async (): Promise<void> => {
  const variantsToProcess = variantConfiguration.value.filter(
    (variant) => variant.values.length > 0,
  )

  if (variantsToProcess.length === 0) {
    return
  }

  console.log(`Processing ${variantsToProcess.length} variants...`)

  // Process each variant sequentially
  for (const variant of variantsToProcess) {
    await processVariant(variant)
  }

  console.log("All variants processed successfully")
}

// Process a single variant
const processVariant = async (variant: VariantConfiguration): Promise<void> => {
  const isCustomVariant = getVariantValue(variant) === "custom_type"
  let attributeUid: string

  if (isCustomVariant) {
    const customName = variant.customName?.trim()
    if (!customName) {
      console.warn("Custom variant has no name, skipping")
      return
    }

    // Always create new attribute for custom types
    console.log(`Creating custom attribute: "${customName}"`)
    attributeUid = await createAttributeAndGetUid(customName)

    // Update variant name with new attribute UID
    variant.name = {
      label: customName,
      value: attributeUid,
    }
  } else {
    attributeUid = typeof variant.name === "object" ? (variant.name?.value as string) : ""
    if (!attributeUid) {
      console.warn("Existing variant has no attribute UID, skipping")
      return
    }
    console.log(`Processing existing attribute: ${attributeUid}`)
  }

  // Process all values for this variant
  await processVariantValues(variant, attributeUid)
}

// Create custom attribute and return its UID
const createAttributeAndGetUid = async (customName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    createAttribute(
      {
        name: customName,
        data_type: "text",
        is_required: false,
        sort_order: 1,
        is_active: true,
      },
      {
        onSuccess: (response: unknown) => {
          const uid = extractUid(response)
          if (!uid) {
            reject(new Error(`No UID returned for custom attribute: ${customName}`))
            return
          }
          console.log(`Custom attribute "${customName}" created with UID: ${uid}`)
          resolve(uid)
        },
        onError: (error: unknown) => {
          console.error(`Failed to create custom attribute "${customName}":`, error)
          displayError(error)
          reject(new Error(String(error)))
        },
      },
    )
  })
}

// Process all values for a variant
const processVariantValues = async (
  variant: VariantConfiguration,
  attributeUid: string,
): Promise<void> => {
  const values = variant.values || []

  if (values.length === 0) {
    return
  }

  const processedValues: Array<{ label: string; value: string }> = []
  let valuesToProcess = 0

  // First, identify which values need processing and which are already processed
  for (const value of values) {
    const isObject =
      typeof value === "object" && value !== null && "label" in value && "value" in value
    const hasUID = isObject && value.label !== value.value && value.value !== "custom_type"

    if (hasUID) {
      // Already processed, keep as-is
      processedValues.push({
        label: value.label,
        value: value.value,
      })
      console.log(`Using existing UID for value "${value.label}": ${value.value}`)
    } else {
      valuesToProcess++
    }
  }

  if (valuesToProcess > 0) {
    console.log(`Creating ${valuesToProcess} new values for attribute: ${attributeUid}`)
  }

  // Process values that need API calls
  for (let index = 0; index < values.length; index++) {
    const value = values[index]
    const isObject =
      typeof value === "object" && value !== null && "label" in value && "value" in value
    const hasUID = isObject && value.label !== value.value && value.value !== "custom_type"

    if (!hasUID) {
      // This value needs processing
      console.log(`Processing value ${index + 1}/${values.length}:`, value)

      const labelString =
        typeof value === "object" && value !== null && "label" in value
          ? value.label
          : typeof value === "string"
            ? value
            : String(value)

      try {
        const valueUid = await createValueAndGetUid(value, attributeUid, index + 1)

        processedValues.push({
          label: labelString,
          value: valueUid,
        })

        console.log(`✅ Value "${labelString}" processed successfully`)
      } catch (error) {
        console.error(`❌ Failed to process value at index ${index}:`, error)
        // Throw error to stop processing - don't continue with failed API calls
        throw new Error(`Failed to create value "${labelString}": ${String(error)}`)
      }
    }
  }

  // Update variant with processed values
  variant.values = processedValues.map((v) => ({ label: v.label, value: v.value }))

  console.log(`✅ Finished processing values for attribute: ${attributeUid}`)
}

// Create a single value and return its UID
const createValueAndGetUid = async (
  value: string | { label: string; value: string },
  attributeUid: string,
  sortOrder: number,
): Promise<string> => {
  const valueString =
    typeof value === "object" && value !== null && "value" in value
      ? value.value
      : typeof value === "string"
        ? value
        : String(value)

  console.log(`Calling createAttributeValues for "${valueString}"`)

  return new Promise((resolve, reject) => {
    createAttributeValues(
      {
        value: valueString,
        sort_order: sortOrder,
        attributeUid: attributeUid,
      },
      {
        onSuccess: (response: unknown) => {
          const uid = extractUid(response)
          if (!uid) {
            reject(new Error(`No UID returned for value: ${valueString}`))
            return
          }
          resolve(uid)
        },
        onError: (error: unknown) => {
          reject(new Error(String(error)))
        },
      },
    )
  })
}

// Generate all possible variant combinations from variant configuration
const generateVariantCombinations = (): void => {
  const processedVariants = variantConfiguration.value.filter(
    (variant) => variant.values.length > 0,
  )

  if (processedVariants.length === 0) {
    return
  }

  console.log("Generating variant combinations...")

  // Get all possible combinations
  const combinations = generateCombinations(processedVariants)

  // Store existing variants for matching
  const existingVariants = [...variants.value]

  // Get default dimensions from first existing variant (for new variants)
  const defaultDimensions =
    existingVariants.length > 0
      ? {
          weight: existingVariants[0].weight || "0",
          length: existingVariants[0].length || "0",
          width: existingVariants[0].width || "0",
          height: existingVariants[0].height || "0",
        }
      : { weight: "0", length: "0", width: "0", height: "0" }

  // Clear existing variants array
  variants.value = []

  // Create a variant for each combination
  combinations.forEach((combination, index) => {
    const variantName = generateVariantName(combination)
    const attributes = generateVariantAttributes(combination)

    // Try to find an existing variant that matches these attributes
    const matchingVariant = existingVariants.find((existing) => {
      if (!existing.attributes || existing.attributes.length !== attributes.length) {
        return false
      }

      // Check if all attributes match
      return attributes.every((attr) =>
        existing.attributes.some(
          (existingAttr) =>
            existingAttr.attribute === attr.attribute && existingAttr.value === attr.value,
        ),
      )
    })

    const newVariant: IProductVariant = {
      name: matchingVariant?.name || variantName,
      sku: matchingVariant?.sku || `SKU-${Date.now()}-${index + 1}`,
      price: matchingVariant?.price || "",
      promo_price: matchingVariant?.promo_price || "",
      promo_expiry:
        matchingVariant?.promo_expiry ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cost_price: matchingVariant?.cost_price || "",
      weight: matchingVariant?.weight || defaultDimensions.weight,
      length: matchingVariant?.length || defaultDimensions.length,
      width: matchingVariant?.width || defaultDimensions.width,
      height: matchingVariant?.height || defaultDimensions.height,
      reorder_point: matchingVariant?.reorder_point || "",
      max_stock: matchingVariant?.max_stock || "",
      opening_stock: matchingVariant?.opening_stock || "",
      is_active: matchingVariant?.is_active ?? true,
      is_default: matchingVariant?.is_default ?? index === 0, // First variant is default
      batch_number: matchingVariant?.batch_number || "",
      expiry_date:
        matchingVariant?.expiry_date ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      attributes: attributes,
    }

    variants.value.push(newVariant)
  })

  console.log(`Generated ${variants.value.length} variant combinations`)
}

// Generate all possible combinations from processed variant configurations
const generateCombinations = (
  processedVariants: VariantConfiguration[],
): Array<Array<{ attributeUid: string; valueUid: string; valueLabel: string }>> => {
  if (processedVariants.length === 0) {
    return []
  }

  if (processedVariants.length === 1) {
    // Single variant - return each value as a separate combination
    const variant = processedVariants[0]
    const attributeUid = typeof variant.name === "object" ? (variant.name?.value as string) : ""

    return variant.values.map((value) => [
      {
        attributeUid: attributeUid,
        valueUid:
          typeof value === "object" && value !== null && "value" in value ? value.value : "",
        valueLabel:
          typeof value === "object" && value !== null && "label" in value
            ? value.label
            : String(value),
      },
    ])
  }

  // Multiple variants - generate cartesian product
  const firstVariant = processedVariants[0]
  const remainingVariants = processedVariants.slice(1)

  const firstAttributeUid =
    typeof firstVariant.name === "object" ? (firstVariant.name?.value as string) : ""
  const firstVariantCombinations = firstVariant.values.map((value) => ({
    attributeUid: firstAttributeUid,
    valueUid: typeof value === "object" && value !== null && "value" in value ? value.value : "",
    valueLabel:
      typeof value === "object" && value !== null && "label" in value ? value.label : String(value),
  }))

  const remainingCombinations = generateCombinations(remainingVariants)

  const allCombinations: Array<
    Array<{ attributeUid: string; valueUid: string; valueLabel: string }>
  > = []

  firstVariantCombinations.forEach((firstCombination) => {
    remainingCombinations.forEach((remainingCombination) => {
      allCombinations.push([firstCombination, ...remainingCombination])
    })
  })

  return allCombinations
}

// Generate variant name based on combination
const generateVariantName = (
  combination: Array<{ attributeUid: string; valueUid: string; valueLabel: string }>,
): string => {
  const productName = form.name || "Product"
  const valueLabels = combination.map((c) => c.valueLabel).join(" ")
  return `${productName} - ${valueLabels}`
}

// Generate variant attributes array
const generateVariantAttributes = (
  combination: Array<{ attributeUid: string; valueUid: string; valueLabel: string }>,
): IProductAttribute[] => {
  return combination.map((item) => ({
    attribute: item.attributeUid,
    value: item.valueUid,
    valueLabel: item.valueLabel,
  }))
}

// Form submission handler
const handleSubmit = async () => {
  if (!canProceed.value) return

  if (isLastStep.value) {
    // Format product data according to API schema
    const payload: IProductFormPayload = {
      name: form.name,
      description: form.description,
      story: form.story || "", // Add story field to your form if needed
      category: form.category?.value as string, // Assuming this is already a UUID
      brand: form.brand || "", // Add brand field to your form if needed
      is_active: true,
      is_variable: hasVariants.value,
      requires_approval: form.requires_approval || false, // Add this field to your form if needed
      variants: variants.value.map((variant) => ({
        name: variant.name,
        sku: variant.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate fallback SKU
        price: variant.price,
        promo_price: variant.promo_price,
        promo_expiry: variant.promo_expiry
          ? typeof variant.promo_expiry === "object" &&
            variant.promo_expiry &&
            (variant.promo_expiry as object) instanceof Date
            ? (variant.promo_expiry as Date).toISOString()
            : variant.promo_expiry
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
        cost_price: variant.cost_price,
        weight: variant.weight,
        length: variant.length,
        width: variant.width,
        height: variant.height,
        reorder_point: variant.reorder_point ? variant.reorder_point.toString() : "0", // Ensure integer, default to 0
        max_stock: variant.max_stock ? variant.max_stock.toString() : "0", // Ensure integer, default to 0
        opening_stock: variant.opening_stock ? variant.opening_stock.toString() : "0", // Ensure integer, default to 0
        is_active: variant.is_active ?? true,
        is_default: variant.is_default ?? false,
        batch_number: variant.batch_number,
        expiry_date: variant.expiry_date
          ? Object.prototype.toString.call(variant.expiry_date) === "[object Date]"
            ? (variant.expiry_date as unknown as Date).toISOString().split("T")[0] // Format as YYYY-MM-DD
            : variant.expiry_date
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default to 1 year from now
        attributes: variant.attributes || [],
      })),
    }

    const handleProductSuccess = (response: unknown) => {
      toast.success("Product created successfully")

      // Extract product UID from response
      const productUid = extractUid(response)

      if (productUid && form.images.length > 0) {
        // Handle image upload asynchronously without blocking the success callback
        ;(async () => {
          try {
            console.log(`Uploading ${form.images.length} images for product: ${productUid}`)

            // Filter out invalid images (only keep actual File objects, exclude null and URL strings)
            const validImages = form.images.filter((image) => image && image instanceof File)
            console.log(
              `Found ${validImages.length} valid images out of ${form.images.length} total images`,
            )

            if (validImages.length === 0) {
              console.log("No valid images to upload")
              return
            }

            // Upload all valid images
            for (let i = 0; i < validImages.length; i++) {
              const image = validImages[i]

              await new Promise<void>((resolve, reject) => {
                addProductImages(
                  {
                    product: productUid,
                    image: image as File,
                    is_primary: i === 0, // First image is primary
                    sort_order: i + 1,
                  },
                  {
                    onSuccess: () => {
                      console.log(`Image ${i + 1} uploaded successfully`)
                      resolve()
                    },
                    onError: (error: unknown) => {
                      console.error(`Failed to upload image ${i + 1}:`, error)
                      reject(new Error(String(error)))
                    },
                  },
                )
              })
            }

            toast.success("All images uploaded successfully")
          } catch (error) {
            console.error("Failed to upload some images:", error)
            toast.error("Product created but some images failed to upload")
          }
        })()
      }

      resetFormState()
      emit("update:modelValue", false)
      emit("refresh")
    }

    createProduct(payload, {
      onSuccess: handleProductSuccess,
      onError: displayError,
    })
  } else {
    // Handle step progression with variant processing
    if (step.value === 2 && hasVariants.value) {
      try {
        // Process all variants (custom and existing)
        await processVariantConfiguration()

        // Validate that all API calls were successful (all items have UIDs)
        const hasAllUIDs = validateAllUIDs()
        if (!hasAllUIDs) {
          throw new Error(
            "Some attributes or values failed to be created. Please check all fields and try again.",
          )
        }

        // Generate all variant combinations and create variants array
        generateVariantCombinations()

        // Log the variants array instead of variant configuration
        console.log("Generated Variants Array:", {
          step: step.value + 1, // Show what the next step will be
          hasVariants: hasVariants.value,
          variants: JSON.parse(JSON.stringify(variants.value)),
          timestamp: new Date().toISOString(),
        })

        // Move to next step only after successful processing
        step.value += 1
      } catch (error) {
        console.error("Failed to process variants:", error)
        displayError(error)
        // Don't increment step on error - user stays on current step
        return
      }
    } else {
      // Regular step progression for other steps
      step.value += 1
    }
  }
}

// Back button handler
const handleBack = () => {
  if (step.value > 1) {
    step.value -= 1
  } else {
    emit("update:modelValue", false)
  }
}

// Debug logging
onMounted(() => {
  console.log("ProductFormDrawer mounted with props:", props)
})
</script>
