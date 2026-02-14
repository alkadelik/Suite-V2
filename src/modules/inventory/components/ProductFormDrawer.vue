<template>
  <component
    :is="isMobile ? Modal : Drawer"
    max-width="2xl"
    variant="fullscreen"
    :open="modelValue"
    title="Add Product"
    :position="drawerPosition"
    @close="emit('update:modelValue', false)"
  >
    <IconHeader icon-name="shop-add" :title="getHeaderTitle" :subtext="getHeaderText" />

    <form id="product-form" @submit.prevent="handleSubmit" class="min-h-full">
      <div>
        <!-- Step 1: Product Details -->
        <ProductDetailsForm
          v-if="step === 1"
          ref="productDetailsRef"
          v-model="form"
          :has-variants="hasVariants"
          @update:has-variants="hasVariants = $event"
          @add-category="showAddCategoryModal = true"
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
          :variants="variants"
        />

        <!-- Fallback -->
        <div v-else class="text-center text-gray-500">Step {{ step }} - Coming soon</div>
      </div>
    </form>

    <template #footer>
      <div class="flex w-full items-center">
        <!-- Navigation Buttons -->
        <div class="flex w-full items-center gap-2">
          <AppButton
            v-if="step > 1"
            variant="outlined"
            label="Back"
            class="flex-1"
            :disabled="isPending"
            @click="handleBack"
          />
          <AppButton
            :label="getSubmitButtonLabel"
            :loading="isPending"
            :disabled="isPending || !canProceed"
            :class="step === 1 ? 'w-full' : 'flex-1'"
            form="product-form"
            type="submit"
          />
        </div>
      </div>
    </template>

    <AddCategoryModal
      v-model="showAddCategoryModal"
      :teleport="false"
      @success="handleCategoryCreated"
    />
  </component>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import Drawer from "@components/Drawer.vue"
import AppButton from "@/components/AppButton.vue"
import type { IProductFormPayload, IGetProductResponse } from "../types"
import IconHeader from "@components/IconHeader.vue"
import ProductDetailsForm from "./ProductForm/ProductDetailsForm.vue"
import ProductManageCombinationsForm from "./ProductForm/ProductManageCombinationsForm.vue"
import ProductImagesForm from "./ProductForm/ProductImagesForm.vue"
import ProductVariantsForm from "./ProductForm/ProductVariantsForm.vue"
import AddCategoryModal from "./AddCategoryModal.vue"
import {
  useCreateProduct,
  useCreateAttribute,
  useCreateAttributeValues,
  useAddProductImage,
  useUpdateVariantImage,
} from "../api"
import baseApi from "@/composables/baseApi"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { htmlToMarkdown } from "@/utils/html-to-markdown"

// Import composables
import { useProductFormState } from "../composables/useProductFormState"
import { useVariantConfiguration } from "../composables/useVariantConfiguration"
import { useVariantValidation } from "../composables/useVariantValidation"
import { useVariantProcessing } from "../composables/useVariantProcessing"
import { useProductDrawerUtilities } from "../composables/useProductDrawerUtilities"
import { useMediaQuery } from "@vueuse/core"
import Modal from "@components/Modal.vue"

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

const showAddCategoryModal = ref(false)

// Ref to ProductDetailsForm component
const productDetailsRef = ref<{
  setCategory: (category: { label: string; value: string }) => void
} | null>(null)

const isMobile = useMediaQuery("(max-width: 1024px)")

// API mutations
const { mutateAsync: createProductAsync, isPending: isCreating } = useCreateProduct()
const { mutate: createAttribute, isPending: isCreatingAttribute } = useCreateAttribute()
const { mutate: createAttributeValues, isPending: isCreatingAttributeValues } =
  useCreateAttributeValues()
const { mutate: addProductImages, isPending: isAddingProductImages } = useAddProductImage()
const { mutateAsync: updateVariantImage, isPending: isUpdatingVariantImage } =
  useUpdateVariantImage()

// Composables
const { form, hasVariants, variants, variantConfiguration, resetFormState } = useProductFormState()

const { drawerPosition } = useProductDrawerUtilities()

const { step, isLastStep, previousStep } = useProductDrawerUtilities().useStepManagement({
  hasVariants,
})

const { getHeaderTitle, getHeaderText, getSubmitButtonLabel } =
  useProductDrawerUtilities().useDrawerHeaders({
    step,
    hasVariants,
    mode: "create",
  })

const variantConfigHelpers = useVariantConfiguration(
  computed(() => variantConfiguration.value),
  variants,
  computed(() => form.name),
)

const { canProceed, validateAllUIDs } = useVariantValidation({
  form,
  hasVariants,
  variantConfiguration,
  variants,
  step,
})

const variantProcessor = useVariantProcessing(variantConfiguration, {
  createAttribute,
  createAttributeValues,
})

// Computed loading state
const isPending = computed(() => {
  return (
    props.loading ||
    isCreating.value ||
    isCreatingAttribute.value ||
    isCreatingAttributeValues.value ||
    isAddingProductImages.value ||
    isUpdatingVariantImage.value
  )
})

/**
 * Handle category creation from AddCategoryModal
 * Sets the category in the ProductDetailsForm
 */
const handleCategoryCreated = (category: { label: string; value: string }) => {
  showAddCategoryModal.value = false

  if (productDetailsRef.value) {
    productDetailsRef.value.setCategory(category)
  }
}

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

// Watch for step changes to scroll to top
watch(step, () => {
  const drawerContent = document.querySelector(".drawer-body")
  if (drawerContent) {
    drawerContent.scrollTo({ top: 0, behavior: "smooth" })
  }
})

// Form submission handler
const handleSubmit = async () => {
  if (!canProceed.value) return

  if (isLastStep.value) {
    // Format product data according to API schema
    const payload: IProductFormPayload = {
      name: form.name,
      description: htmlToMarkdown(form.description),
      story: form.story || "",
      category: form.category?.value as string,
      brand: form.brand || "",
      is_active: true,
      is_variable: hasVariants.value,
      requires_approval: form.requires_approval || false,
      variants: variants.value.map((variant) => ({
        name: variant.name,
        sku: variant.sku || `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        price: variant.price,
        promo_price: variant.promo_price,
        promo_expiry: variant.promo_expiry
          ? typeof variant.promo_expiry === "object" &&
            variant.promo_expiry &&
            (variant.promo_expiry as object) instanceof Date
            ? (variant.promo_expiry as Date).toISOString()
            : variant.promo_expiry
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cost_price: variant.cost_price,
        weight: variant.weight,
        length: variant.length,
        width: variant.width,
        height: variant.height,
        reorder_point: variant.reorder_point ? variant.reorder_point.toString() : "0",
        max_stock: variant.max_stock ? variant.max_stock.toString() : "0",
        opening_stock: variant.opening_stock ? variant.opening_stock.toString() : "0",
        is_active: variant.is_active ?? true,
        is_default: variant.is_default ?? false,
        batch_number: variant.batch_number,
        expiry_date: variant.expiry_date
          ? Object.prototype.toString.call(variant.expiry_date) === "[object Date]"
            ? (variant.expiry_date as unknown as Date).toISOString().split("T")[0]
            : variant.expiry_date
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        attributes: variant.attributes || [],
      })),
    }

    const handleProductSuccess = async (response: unknown) => {
      // Extract product UID from response
      const productUid = variantProcessor.extractUid(response)

      if (productUid && form.images.length > 0) {
        try {
          console.log(`Uploading ${form.images.length} images for product: ${productUid}`)

          // Step 1: Upload product images (indices 0-4)
          const productImages = form.images
            .slice(0, 5)
            .map((image, index) => ({ image, index }))
            .filter(({ image }) => image && image instanceof File)

          if (productImages.length > 0) {
            for (const { image, index } of productImages) {
              await new Promise<void>((resolve, reject) => {
                addProductImages(
                  {
                    product: productUid,
                    image: image as File,
                    is_primary: index === 0,
                    sort_order: index + 1,
                  },
                  {
                    onSuccess: () => {
                      console.log(`Product image ${index + 1} uploaded successfully`)
                      resolve()
                    },
                    onError: (error: unknown) => {
                      console.error(`Failed to upload product image ${index + 1}:`, error)
                      reject(new Error(String(error)))
                    },
                  },
                )
              })
            }
            console.log(`Uploaded ${productImages.length} product images`)
          }

          // Step 2: Check if there are variant images to upload (indices 5+)
          const variantImageFiles = form.images.slice(5)
          const hasVariantImages = variantImageFiles.some((img) => img && img instanceof File)

          if (hasVariantImages && variants.value.length > 0) {
            // Fetch fresh product data to get variant UIDs
            console.log("Fetching product data to get variant UIDs for image upload...")
            const { data: freshProductData } = await baseApi.get<IGetProductResponse>(
              `/inventory/products/${productUid}/`,
            )

            if (freshProductData?.data?.variants) {
              const fetchedVariants = freshProductData.data.variants
              let variantImagesUploaded = 0

              // Upload variant images
              for (let i = 0; i < fetchedVariants.length; i++) {
                const variantImageIndex = 5 + i
                const variantImage = form.images[variantImageIndex]
                const variant = fetchedVariants[i]

                if (variantImage && variantImage instanceof File && variant?.uid) {
                  await updateVariantImage({
                    variantUid: variant.uid,
                    image: variantImage,
                  })
                  variantImagesUploaded++
                  console.log(
                    `Variant image ${i + 1} uploaded successfully for variant: ${variant.name}`,
                  )
                }
              }

              if (variantImagesUploaded > 0) {
                console.log(`Uploaded ${variantImagesUploaded} variant images`)
              }
            }
          }

          toast.success("Product created successfully")
        } catch (error) {
          console.error("Failed to upload some images:", error)
          toast.error("Product created but some images failed to upload")
        }
      } else {
        toast.success("Product created successfully")
      }

      // Reset form state only after all uploads complete
      step.value = 1
      hasVariants.value = false
      resetFormState()
      emit("update:modelValue", false)
      emit("refresh")
    }

    try {
      const response = await createProductAsync(payload)
      await handleProductSuccess(response)
    } catch (error) {
      displayError(error)
    }
  } else {
    // Handle step progression with variant processing
    if (step.value === 2 && hasVariants.value) {
      try {
        // Process all variants (custom and existing)
        await variantProcessor.processVariantConfiguration()

        // Validate that all API calls were successful
        const hasAllUIDs = validateAllUIDs()
        if (!hasAllUIDs) {
          throw new Error(
            "Some attributes or values failed to be created. Please check all fields and try again.",
          )
        }

        // Generate all variant combinations
        variantConfigHelpers.generateVariantCombinations()

        console.log("Generated Variants Array:", {
          step: step.value + 1,
          hasVariants: hasVariants.value,
          variants: JSON.parse(JSON.stringify(variants.value)),
          timestamp: new Date().toISOString(),
        })

        // Move to next step
        step.value += 1
      } catch (error) {
        console.error("Failed to process variants:", error)
        displayError(error)
        return
      }
    } else {
      // Regular step progression
      step.value += 1
    }
  }
}

// Back button handler
const handleBack = () => {
  previousStep()
}

/**
 * Set category after new category is created
 * Called from parent page
 */
const setCategoryFromModal = (category: { label: string; value: string }) => {
  if (productDetailsRef.value) {
    productDetailsRef.value.setCategory(category)
  }
}

// Expose method for parent components
defineExpose({
  setCategoryFromModal,
})
</script>
