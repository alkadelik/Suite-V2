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
      <!-- LYW-2443: skeleton while the source product is being fetched -->
      <ProductEditSkeleton v-if="isLoadingDuplicate" />

      <div v-else>
        <!-- Step 1: Product Details -->
        <ProductDetailsForm
          v-if="step === 1"
          ref="productDetailsRef"
          v-model="form"
          :has-variants="hasVariants"
          :errors="submitAttempted ? currentStepValidation.productDetailsErrors : undefined"
          @update:has-variants="hasVariants = $event"
          @add-category="showAddCategoryModal = true"
        />

        <!-- Step 2: Variants Configuration (only if hasVariants is true) -->
        <ProductVariantsForm
          v-else-if="step === 2 && hasVariants"
          v-model="variantConfiguration"
          :errors="submitAttempted ? currentStepValidation.variantConfigurationErrors : undefined"
        />

        <!-- Step 2/3: Inventory & Pricing -->
        <ProductManageCombinationsForm
          v-else-if="(step === 2 && !hasVariants) || (step === 3 && hasVariants)"
          v-model="variants"
          :product-name="form.name"
          :errors="submitAttempted ? currentStepValidation.inventoryErrors : undefined"
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
            :disabled="isPending"
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
import ProductEditSkeleton from "./skeletons/ProductEditSkeleton.vue"
import {
  useCreateProduct,
  useCreateAttribute,
  useCreateAttributeValues,
  useAddProductImage,
  useUpdateVariantImage,
  useGetProduct,
} from "../api"
import baseApi from "@/composables/baseApi"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { useQueryClient } from "@tanstack/vue-query"
import { htmlToMarkdown, markdownToHtml } from "@/utils/html-to-markdown"
import { useImageConverter } from "@/composables/useImageConverter"
import { useAuthStore } from "@modules/auth/store"
import { scrollToAndFocusValidationTarget } from "@/utils/validations"

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
  /** UID of a product to duplicate. When set, the form is prefilled with that
   *  product's data: name suffixed with " (Copy)", opening stock reset to 0,
   *  images left blank for the user to re-upload (carry-over is gated on a
   *  CORS config on the DO Spaces bucket — see prefillFromSource). */
  sourceProductUid?: string | null
}

interface Emits {
  /** Update the modelValue */
  "update:modelValue": [value: boolean]
  /** Emitted when drawer should refresh parent data */
  refresh: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  sourceProductUid: null,
})

const emit = defineEmits<Emits>()

const showAddCategoryModal = ref(false)
const submitAttempted = ref(false)

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
const { form, hasVariants, variants, variantConfiguration, resetFormState, populateFormState } =
  useProductFormState()

const queryClient = useQueryClient()
const { renameProductImage } = useImageConverter()
const storeName = useAuthStore().user?.store_slug || "product"

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

const { currentStepValidation, validateAllUIDs } = useVariantValidation({
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
    isUpdatingVariantImage.value ||
    isPreparingDuplicateImages.value
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

// LYW-2443: fetch the source product when in duplicate mode
const sourceUidRef = computed(() => props.sourceProductUid || "")
const { data: sourceProductData, isFetching: isFetchingSource } = useGetProduct(sourceUidRef, {
  enabled: computed(() => !!props.sourceProductUid && props.modelValue),
})

// While true, fetching source images and converting them to File objects.
// Used to keep the skeleton visible during this phase and to gate the submit
// button via isPending.
const isPreparingDuplicateImages = ref(false)

// Show a loading state in the drawer body while we wait for source data on
// first open AND while we're converting source image URLs to File objects.
// Once both finish (or for a non-duplicate flow), we render the prefilled form.
const isLoadingDuplicate = computed(
  () =>
    !!props.sourceProductUid &&
    props.modelValue &&
    ((isFetchingSource.value && !sourceProductData.value) || isPreparingDuplicateImages.value),
)

/**
 * Build the populate payload from a fetched source product. Extracted so it
 * can be invoked both from the sourceProductData watcher (when data arrives
 * async) and from the modelValue watcher (when data is already cached on a
 * subsequent open of the same source product).
 */
const prefillFromSource = (data: typeof sourceProductData.value) => {
  if (!data?.data || !props.modelValue || !props.sourceProductUid) return
  const src = data.data

  // Image carry-over is temporarily disabled: the source images are served
  // from a DigitalOcean Spaces bucket that doesn't return CORS headers, so
  // `fetch()` can't read them in the browser. Once CORS is configured on the
  // bucket, swap `images: []` for `images: [...productImages, ...variantImages]`
  // (the URL gatherers below) and the existing convertSourceImagesToFiles
  // pipeline takes over without further changes.
  //
  // const productImages =
  //   src.images && src.images.length > 0
  //     ? [
  //         ...src.images
  //           .slice()
  //           .sort((a, b) => a.sort_order - b.sort_order)
  //           .slice(0, 5)
  //           .map((img) => img.image),
  //         ...Array(Math.max(0, 5 - src.images.length)).fill(null),
  //       ]
  //     : Array(5).fill(null)
  // const variantImages =
  //   src.variants && src.variants.length > 0
  //     ? src.variants.map((variant) => variant.image || null)
  //     : []

  populateFormState({
    name: `${src.name || ""} (Copy)`,
    description: markdownToHtml(src.description || ""),
    story: src.story || "",
    brand: src.brand || "",
    requires_approval: src.requires_approval || false,
    category: src.category ? { label: src.category_name || "", value: src.category } : null,
    images: [], // see CORS note above; user uploads images manually for now
    hasVariants: src.is_variable || false,
    variants:
      src.variants?.map((variant) => ({
        name: variant.name || "",
        sku: "", // Force a new SKU on submit
        price: variant.price || "",
        promo_price: variant.promo_price || "",
        promo_expiry: variant.promo_expiry || "",
        cost_price: variant.cost_price || "",
        weight: variant.weight || "",
        length: variant.length || "",
        width: variant.width || "",
        height: variant.height || "",
        reorder_point:
          variant.reorder_point !== null && variant.reorder_point !== undefined
            ? variant.reorder_point.toString()
            : "",
        max_stock:
          variant.max_stock !== null && variant.max_stock !== undefined
            ? variant.max_stock.toString()
            : "",
        opening_stock: "0",
        is_active: variant.is_active ?? true,
        is_default: variant.is_default ?? false,
        batch_number: "",
        expiry_date: variant.expiry_date || "",
        attributes: variant.attributes || [],
      })) || undefined,
    variantConfiguration:
      src.is_variable && src.variants && src.variants.length > 1
        ? (() => {
            const attributeMap = new Map<
              string,
              {
                attributeUid: string
                attributeName: string
                values: Map<string, string>
              }
            >()
            src.variants.forEach((variant) => {
              variant.attributes.forEach((attr) => {
                if (!attributeMap.has(attr.attribute)) {
                  attributeMap.set(attr.attribute, {
                    attributeUid: attr.attribute,
                    attributeName: attr.attribute_name,
                    values: new Map(),
                  })
                }
                attributeMap.get(attr.attribute)!.values.set(attr.value, attr.attribute_value)
              })
            })
            return Array.from(attributeMap.values()).map((attrData) => ({
              name: { label: attrData.attributeName, value: attrData.attributeUid },
              customName: "",
              values: Array.from(attrData.values.entries()).map(([valueUid, valueName]) => ({
                label: valueName,
                value: valueUid,
              })),
            }))
          })()
        : undefined,
  })
}

/**
 * LYW-2443: convert any URL-string entries in `form.images` to File objects
 * by fetching each URL and wrapping its blob. Runs in parallel.
 *
 * The image upload endpoint accepts only File via FormData, so this MUST run
 * before submit. We do it eagerly right after prefill (while the skeleton is
 * still visible) rather than on submit so the user has clear visibility:
 *   - If a URL can't be fetched (CORS, network, server-side error page), the
 *     slot drops to null. The user sees the blank slot in step 3/4 and can
 *     re-upload manually.
 *   - We toast a single summary if any failed, so the user knows.
 */
const convertSourceImagesToFiles = async (): Promise<void> => {
  const tasks: Array<Promise<{ index: number; ok: boolean }>> = []
  for (let i = 0; i < form.images.length; i++) {
    const img = form.images[i]
    if (typeof img !== "string" || !img) continue
    const index = i
    const url = img
    tasks.push(
      (async () => {
        try {
          const response = await fetch(url)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const blob = await response.blob()
          // Reject anything that isn't actually an image (e.g. a CORS-redirect
          // HTML error page that returned 200).
          if (!blob.type.startsWith("image/")) {
            throw new Error(`Unexpected MIME type: ${blob.type || "unknown"}`)
          }
          const filename = url.split("/").pop()?.split("?")[0] || `duplicate-image-${index}.jpg`
          form.images[index] = new File([blob], filename, { type: blob.type })
          return { index, ok: true }
        } catch (err) {
          console.warn(`[LYW-2443] Failed to carry over source image at index ${index}:`, err)
          form.images[index] = null
          return { index, ok: false }
        }
      })(),
    )
  }
  if (tasks.length === 0) return
  const results = await Promise.all(tasks)
  const failed = results.filter((r) => !r.ok).length
  if (failed > 0) {
    toast.info(
      failed === results.length
        ? "Source product images couldn't be carried over. Please upload them on the Images step."
        : `${failed} of ${results.length} source image${results.length === 1 ? "" : "s"} couldn't be carried over. Please re-upload missing slots on the Images step.`,
    )
  }
}

/**
 * Run prefill + (when in duplicate mode) eager image conversion. Keeping this
 * single function ensures the skeleton stays visible until everything is ready.
 */
const runPrefillAndConvertImages = async (data: typeof sourceProductData.value) => {
  if (!data?.data || !props.modelValue || !props.sourceProductUid) return
  prefillFromSource(data)
  isPreparingDuplicateImages.value = true
  try {
    await convertSourceImagesToFiles()
  } finally {
    isPreparingDuplicateImages.value = false
  }
}

// Reset form on drawer open, then re-apply prefill if cached source data is
// already available (handles the case where useGetProduct returns cached data
// synchronously and the data watcher doesn't fire on subsequent opens).
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return
    resetFormState()
    submitAttempted.value = false
    if (props.sourceProductUid && sourceProductData.value) {
      void runPrefillAndConvertImages(sourceProductData.value)
    }
  },
  { immediate: true },
)

// When source product data arrives async (cache miss), prefill + convert.
watch(
  () => sourceProductData.value,
  (data) => {
    void runPrefillAndConvertImages(data)
  },
)

// Watch for step changes to scroll to top
watch(step, () => {
  submitAttempted.value = false
  const drawerContent = document.querySelector(".drawer-body")
  if (drawerContent) {
    drawerContent.scrollTo({ top: 0, behavior: "smooth" })
  }
})

// Form submission handler
const handleSubmit = async () => {
  submitAttempted.value = true

  if (!currentStepValidation.value.valid) {
    scrollToAndFocusValidationTarget(currentStepValidation.value.firstErrorTarget)
    return
  }

  if (isLastStep.value) {
    // Defensive: if a source-image conversion is somehow still in flight (the
    // skeleton normally prevents the user reaching submit, but reactivity is
    // async), wait for it before proceeding so we never submit a string URL.
    while (isPreparingDuplicateImages.value) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

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
          // Deduplicate by File reference to prevent uploading the same file multiple times
          // (defensive fix for a Windows-specific bug where the same File can appear in multiple slots)
          const seenFiles = new Set<File>()
          const productImages = form.images
            .slice(0, 5)
            .map((image, index) => ({ image, index }))
            .filter(({ image }) => {
              if (!image || !(image instanceof File)) return false
              if (seenFiles.has(image)) return false
              seenFiles.add(image)
              return true
            })

          if (productImages.length > 0) {
            for (const { image, index } of productImages) {
              const renamedImage = renameProductImage(image as File, storeName)
              await new Promise<void>((resolve, reject) => {
                addProductImages(
                  {
                    product: productUid,
                    image: renamedImage,
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

              // Build a lookup map keyed by sorted attribute UIDs so variant
              // images are matched by identity, not by array position (the API
              // may return variants in a different order than they were sent)
              const variantUidByAttrKey = new Map<string, string>()
              for (const fv of fetchedVariants) {
                if (fv.attributes?.length) {
                  const key = fv.attributes
                    .map((a) => `${a.attribute}:${a.value}`)
                    .sort()
                    .join("|")
                  variantUidByAttrKey.set(key, fv.uid)
                }
              }

              for (let i = 0; i < variants.value.length; i++) {
                const variantImageIndex = 5 + i
                const variantImage = form.images[variantImageIndex]

                if (variantImage && variantImage instanceof File) {
                  const formAttrs = variants.value[i].attributes || []
                  const key = formAttrs
                    .map((a) => `${a.attribute}:${a.value}`)
                    .sort()
                    .join("|")
                  const matchedUid = variantUidByAttrKey.get(key)

                  if (matchedUid) {
                    await updateVariantImage({
                      variantUid: matchedUid,
                      image: renameProductImage(variantImage, storeName),
                    })
                    variantImagesUploaded++
                    console.log(
                      `Variant image ${i + 1} uploaded for variant: ${variants.value[i].name}`,
                    )
                  }
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

      // Invalidate all product-related caches so every view shows fresh data
      await queryClient.invalidateQueries({ queryKey: ["products"] })

      // Reset form state only after all uploads complete
      submitAttempted.value = false
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
        submitAttempted.value = false
        step.value += 1
      } catch (error) {
        console.error("Failed to process variants:", error)
        displayError(error)
        return
      }
    } else {
      // Regular step progression
      submitAttempted.value = false
      step.value += 1
    }
  }
}

// Back button handler
const handleBack = () => {
  submitAttempted.value = false
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
