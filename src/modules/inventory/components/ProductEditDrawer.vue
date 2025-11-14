<template>
  <Drawer
    :open="modelValue"
    :title="drawerTitle"
    :position="drawerPosition"
    max-width="xl"
    @close="emit('update:modelValue', false)"
  >
    <IconHeader icon-name="shop-add" :title="getHeaderTitle" :subtext="getHeaderText" />

    <!-- Loading state for fetching product -->
    <LoadingIcon v-if="isLoadingProduct" class="min-h-[400px]" />

    <form v-else id="product-edit-form" @submit.prevent="handleSubmit" class="min-h-full">
      <div>
        <!-- Product Details Only Mode -->
        <ProductDetailsForm
          v-if="props.editMode === 'product-details'"
          ref="productDetailsRef"
          v-model="form"
          :has-variants="hasVariants"
          :disable-variants-toggle="true"
          @update:has-variants="hasVariants = $event"
          @add-category="emit('add-category')"
        />

        <!-- Variant Details Mode - Edit price and dimensions for one variant -->
        <ProductManageCombinationsForm
          v-else-if="props.editMode === 'variant-details'"
          v-model="variants"
          :product-name="form.name"
          :hide-stock="true"
        />

        <!-- Images Edit Mode - Edit product images only -->
        <ProductImagesForm
          v-else-if="props.editMode === 'images'"
          v-model="form.images"
          :variants="variants"
          :edit-mode="true"
          :existing-image-ids="existingImageIds"
          @update:removed-image-ids="removedImageIds = $event"
        />

        <!-- Variants Edit Mode (skip product details, start from variants) -->
        <template v-else-if="props.editMode === 'variants'">
          <!-- Step 1 for variants mode: Variants Configuration -->
          <ProductVariantsForm v-if="step === 1" v-model="variantConfiguration" />

          <!-- Step 2 for variants mode: Inventory & Pricing -->
          <ProductManageCombinationsForm
            v-else-if="step === 2"
            v-model="variants"
            :product-name="form.name"
            :hide-stock="true"
            :disable-price="true"
            :hide-weight="true"
            :deleted-variants="deletedVariants"
          />

          <!-- Step 3 for variants mode: Product Images -->
          <ProductImagesForm v-else-if="step === 3" v-model="form.images" />
        </template>

        <!-- Full Edit Mode (multi-step) -->
        <template v-else>
          <!-- Step 1: Product Details -->
          <ProductDetailsForm
            v-if="step === 1"
            ref="productDetailsRef"
            v-model="form"
            :has-variants="hasVariants"
            :disable-variants-toggle="true"
            @update:has-variants="hasVariants = $event"
            @add-category="emit('add-category')"
          />

          <!-- Step 2: Variants Configuration (only if hasVariants is true) -->
          <ProductVariantsForm
            v-else-if="step === 2 && hasVariants"
            v-model="variantConfiguration"
          />

          <!-- Step 2/3: Inventory & Pricing -->
          <ProductManageCombinationsForm
            v-else-if="(step === 2 && !hasVariants) || (step === 3 && hasVariants)"
            v-model="variants"
            :product-name="form.name"
            :deleted-variants="deletedVariants"
          />

          <!-- Step 3/4: Product Images -->
          <ProductImagesForm
            v-else-if="(step === 3 && !hasVariants) || (step === 4 && hasVariants)"
            v-model="form.images"
            :variants="variants"
          />

          <!-- Fallback -->
          <div v-else class="text-center text-gray-500">Step {{ step }} - Coming soon</div>
        </template>
      </div>
    </form>

    <template #footer>
      <div class="flex w-full items-center">
        <!-- Product Details Mode, Variant Details Mode, or Images Mode: Single-step Save -->
        <div
          v-if="
            props.editMode === 'product-details' ||
            props.editMode === 'variant-details' ||
            props.editMode === 'images'
          "
          class="flex w-full items-center gap-2"
        >
          <AppButton
            label="Save Changes"
            :loading="isPending"
            :disabled="isPending || !canProceed"
            class="w-full"
            form="product-edit-form"
            type="submit"
          />
        </div>

        <!-- Multi-step Navigation (for variants edit mode and full edit mode) -->
        <div v-else class="flex w-full items-center gap-2">
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
            form="product-edit-form"
            type="submit"
          />
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import Drawer from "@components/Drawer.vue"
import AppButton from "@/components/AppButton.vue"
import type {
  IProductFormPayload,
  IProductDetailsUpdatePayload,
  TProduct,
  IProductVariantDetails,
  IProductVariant,
  IGetProductResponse,
} from "../types"
import IconHeader from "@components/IconHeader.vue"
import ProductDetailsForm from "./ProductForm/ProductDetailsForm.vue"
import ProductManageCombinationsForm from "./ProductForm/ProductManageCombinationsForm.vue"
import ProductImagesForm from "./ProductForm/ProductImagesForm.vue"
import ProductVariantsForm from "./ProductForm/ProductVariantsForm.vue"
import {
  useUpdateProduct,
  useUpdateVariant,
  useCreateAttribute,
  useCreateAttributeValues,
  useAddProductImage,
  useUpdateProductImage,
  useDeleteProductImage,
  useGetProduct,
  useBulkVariantOperations,
  useUpdateVariantImage,
} from "../api"
import baseApi from "@/composables/baseApi"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import LoadingIcon from "@components/LoadingIcon.vue"
import { useQueryClient } from "@tanstack/vue-query"

// Import composables
import { useProductFormState } from "../composables/useProductFormState"
import { useVariantConfiguration } from "../composables/useVariantConfiguration"
import { useVariantValidation } from "../composables/useVariantValidation"
import { useVariantProcessing } from "../composables/useVariantProcessing"
import { useProductDrawerUtilities } from "../composables/useProductDrawerUtilities"

type TProductEditMode = "product-details" | "variant-details" | "variants" | "images"

interface Props {
  /** Whether the drawer is open/visible */
  modelValue: boolean
  /** Product data for editing (required) */
  product: TProduct | null
  /** Loading state for async operations */
  loading?: boolean
  /** Edit mode - determines which form sections are shown */
  editMode?: TProductEditMode
  /** Variant to edit (required for variant-details mode) */
  variant?: IProductVariantDetails | null
}

interface Emits {
  /** Update the modelValue */
  "update:modelValue": [value: boolean]
  /** Emitted when drawer should refresh parent data */
  refresh: []
  /** Emitted when Add New Category is clicked */
  "add-category": []
  /** Emitted when a new category is successfully created */
  "category-created": [category: { label: string; value: string }]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  product: null,
  editMode: "product-details",
  variant: null,
})

const emit = defineEmits<Emits>()

// Query client for cache invalidation
const queryClient = useQueryClient()

// Ref to ProductDetailsForm component
const productDetailsRef = ref<{
  setCategory: (category: { label: string; value: string }) => void
} | null>(null)

// API mutations
const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()
const { mutate: updateVariant, isPending: isUpdatingVariant } = useUpdateVariant()
const { mutate: createAttribute, isPending: isCreatingAttribute } = useCreateAttribute()
const { mutate: createAttributeValues, isPending: isCreatingAttributeValues } =
  useCreateAttributeValues()
const { mutate: addProductImages, isPending: isAddingProductImages } = useAddProductImage()
const { mutate: updateProductImage, isPending: isUpdatingImage } = useUpdateProductImage()
const { mutate: deleteProductImage, isPending: isDeletingImage } = useDeleteProductImage()
const { mutateAsync: bulkVariantOperations, isPending: isBulkOperating } =
  useBulkVariantOperations()
const { mutateAsync: updateVariantImage, isPending: isUpdatingVariantImage } =
  useUpdateVariantImage()

// Product fetching
const productUidToFetch = ref<string>("")
const { data: productData, isLoading: isLoadingProduct } = useGetProduct(
  computed(() => productUidToFetch.value),
  { enabled: computed(() => !!productUidToFetch.value) },
)

// Composables
const { form, hasVariants, variants, variantConfiguration, resetFormState, populateFormState } =
  useProductFormState()

const { drawerPosition } = useProductDrawerUtilities()

// Track deleted variants (without UIDs - we look them up from originalVariantUids map)
const deletedVariants = ref<IProductVariant[]>([])

// Track original variant UIDs (key: attribute combo, value: variant uid)
const originalVariantUids = ref<Map<string, string>>(new Map())

// Track variant details with UIDs for image uploads
const variantDetailsWithUids = ref<IProductVariantDetails[]>([])

// Track existing image UIDs (parallel array to form.images)
const existingImageIds = ref<Array<string | null>>([])

// Track removed image UIDs
const removedImageIds = ref<string[]>([])

// Track if variant images were uploaded (to force refetch on reopen)
const variantImagesWereUploaded = ref(false)

const { step, previousStep } = useProductDrawerUtilities().useStepManagement({
  hasVariants,
  editMode: props.editMode,
})

const { getHeaderTitle, getHeaderText, getSubmitButtonLabel } =
  useProductDrawerUtilities().useDrawerHeaders({
    step,
    hasVariants,
    editMode: props.editMode,
    mode: "edit",
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
  editMode: props.editMode,
})

const variantProcessor = useVariantProcessing(variantConfiguration, {
  createAttribute,
  createAttributeValues,
})

// Computed loading state
const isPending = computed(() => {
  return (
    props.loading ||
    isUpdating.value ||
    isUpdatingVariant.value ||
    isCreatingAttribute.value ||
    isCreatingAttributeValues.value ||
    isAddingProductImages.value ||
    isUpdatingImage.value ||
    isDeletingImage.value ||
    isLoadingProduct.value ||
    isBulkOperating.value ||
    isUpdatingVariantImage.value
  )
})

// Computed drawer title based on edit mode
const drawerTitle = computed(() => {
  switch (props.editMode) {
    case "product-details":
      return "Edit Product Details"
    case "variant-details":
      return "Edit SKU Details"
    case "variants":
      return "Edit Variants"
    case "images":
      return "Edit Product Images"
    default:
      return "Edit Product"
  }
})

// Watch for drawer opening to manage product fetching
watch(
  () => [props.modelValue, props.product] as const,
  ([isOpen, product]) => {
    if (isOpen && product?.uid) {
      // Drawer is opening - always invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["products", product.uid] })
      productUidToFetch.value = product.uid

      // Reset variant images uploaded flag
      variantImagesWereUploaded.value = false

      // Reset deleted variants when drawer opens
      deletedVariants.value = []
      // Reset original variant UIDs
      originalVariantUids.value.clear()
      // Reset removed image IDs
      removedImageIds.value = []
    }
  },
  { immediate: true },
)

// Watch for image swaps to also swap the corresponding UIDs
watch(
  () => form.images,
  (newImages, oldImages) => {
    if (!props.editMode || props.editMode !== "images" || !oldImages) return

    // Detect if images were swapped (primarily for "Make Primary" functionality)
    // Check if position 0 changed and it's an existing image
    if (
      newImages[0] !== oldImages[0] &&
      newImages[0] &&
      typeof newImages[0] === "string" &&
      oldImages[0] &&
      typeof oldImages[0] === "string"
    ) {
      // Find where the new primary image came from
      const newPrimaryIndex = oldImages.findIndex((img) => img === newImages[0])

      if (newPrimaryIndex > 0) {
        // Swap the UIDs as well
        const newExistingIds = [...existingImageIds.value]
        const tempId = newExistingIds[0]
        newExistingIds[0] = newExistingIds[newPrimaryIndex]
        newExistingIds[newPrimaryIndex] = tempId
        existingImageIds.value = newExistingIds
        console.log("Swapped image UIDs for primary change")
      }
    }
  },
  { deep: true },
)

/**
 * Generate a unique key for a variant based on its attributes
 * Used to match variants before and after regeneration
 */
const generateVariantKey = (attributes: { attribute: string; value: string }[]): string => {
  return attributes
    .map((attr) => `${attr.attribute}:${attr.value}`)
    .sort()
    .join("|")
}

// Watch for product data to populate form
watch(
  () => productData.value,
  (data) => {
    if (data?.data) {
      const product = data.data

      // Populate existing image IDs
      if (product.images && product.images.length > 0) {
        const sortedImages = product.images
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .slice(0, 5)

        existingImageIds.value = [
          ...sortedImages.map((img) => img.uid),
          ...Array(Math.max(0, 5 - product.images.length)).fill(null),
        ]
      } else {
        existingImageIds.value = Array(5).fill(null)
      }

      // Populate original variant UIDs map and store full variant details
      if (product.variants && product.variants.length > 0) {
        originalVariantUids.value.clear()
        variantDetailsWithUids.value = product.variants
        product.variants.forEach((variant) => {
          if (variant.attributes && variant.attributes.length > 0) {
            const key = generateVariantKey(variant.attributes)
            originalVariantUids.value.set(key, variant.uid)
          }
        })
        console.log(
          `Tracked ${originalVariantUids.value.size} original variant UIDs`,
          originalVariantUids.value,
        )
      }

      // Prepare product images (indices 0-4)
      const productImages =
        product.images && product.images.length > 0
          ? [
              ...product.images
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .slice(0, 5)
                .map((img) => img.image),
              ...Array(Math.max(0, 5 - product.images.length)).fill(null),
            ]
          : Array(5).fill(null)

      // Prepare variant images (indices 5+)
      const variantImages =
        product.variants && product.variants.length > 0
          ? product.variants.map((variant) => variant.image || null)
          : []

      populateFormState({
        name: product.name || "",
        description: product.description || "",
        story: product.story || "",
        brand: product.brand || "",
        requires_approval: product.requires_approval || false,
        category: product.category
          ? { label: product.category_name || "", value: product.category || "" }
          : null,
        images: [...productImages, ...variantImages],
        hasVariants: product.is_variable || false,
        variants:
          product.variants && product.variants.length > 0
            ? product.variants.map((variant) => ({
                name: variant.name || "",
                sku: variant.sku || "",
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
                opening_stock:
                  variant.available_stock !== null && variant.available_stock !== undefined
                    ? variant.available_stock.toString()
                    : "",
                is_active: variant.is_active ?? true,
                is_default: variant.is_default ?? false,
                batch_number: variant.batch_number || "",
                expiry_date: variant.expiry_date || "",
                attributes: variant.attributes || [],
              }))
            : undefined,
        variantConfiguration:
          product.is_variable && product.variants && product.variants.length > 1
            ? (() => {
                // Reconstruct variant configuration from attributes
                const attributeMap = new Map<
                  string,
                  {
                    attributeUid: string
                    attributeName: string
                    values: Map<string, string>
                  }
                >()

                product.variants.forEach((variant) => {
                  variant.attributes.forEach((attr) => {
                    if (!attributeMap.has(attr.attribute)) {
                      attributeMap.set(attr.attribute, {
                        attributeUid: attr.attribute,
                        attributeName: attr.attribute_name,
                        values: new Map(),
                      })
                    }
                    const attrData = attributeMap.get(attr.attribute)!
                    attrData.values.set(attr.value, attr.attribute_value)
                  })
                })

                return Array.from(attributeMap.values()).map((attrData) => ({
                  name: {
                    label: attrData.attributeName,
                    value: attrData.attributeUid,
                  },
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
  },
  { immediate: true },
)

// Watch for variant prop to populate form in variant-details mode
watch(
  () => [props.editMode, props.variant, props.modelValue] as const,
  ([editMode, variant, isOpen]) => {
    if (isOpen && editMode === "variant-details" && variant) {
      const mappedAttributes = (variant.attributes || []).map((attr) => ({
        attribute: attr.attribute,
        value: attr.value,
        valueLabel: attr.attribute_value || attr.value,
      }))

      variants.value = [
        {
          name: variant.name || "",
          sku: variant.sku || "",
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
          opening_stock:
            variant.available_stock !== null && variant.available_stock !== undefined
              ? variant.available_stock.toString()
              : "",
          is_active: variant.is_active ?? true,
          is_default: variant.is_default ?? false,
          batch_number: variant.batch_number || "",
          expiry_date: variant.expiry_date || "",
          attributes: mappedAttributes,
        },
      ]
    }
  },
  { immediate: true },
)

// Form submission handler
const handleSubmit = async () => {
  if (!canProceed.value) return

  // Product Details Mode
  if (props.editMode === "product-details") {
    const payload: IProductDetailsUpdatePayload = {
      name: form.name,
      description: form.description,
      story: form.story || "",
      category: form.category?.value as string,
      brand: form.brand || "",
      is_active: true,
      is_variable: hasVariants.value,
      requires_approval: form.requires_approval || false,
    }

    updateProduct(
      { uid: productUidToFetch.value, ...payload } as IProductFormPayload & { uid: string },
      {
        onSuccess: () => {
          toast.success("Product details updated successfully")
          // Invalidate the product query to ensure fresh data on next open
          queryClient.invalidateQueries({ queryKey: ["products", productUidToFetch.value] })
          resetFormState()
          emit("update:modelValue", false)
          emit("refresh")
        },
        onError: displayError,
      },
    )
    return
  }

  // Variant Details Mode
  if (props.editMode === "variant-details") {
    if (!props.variant || variants.value.length === 0) {
      toast.error("No variant data to update")
      return
    }

    const variantData = variants.value[0]
    const payload: Omit<IProductVariant, "opening_stock"> = {
      name: variantData.name,
      sku: variantData.sku,
      price: variantData.price,
      promo_price: variantData.promo_price,
      promo_expiry: variantData.promo_expiry
        ? typeof variantData.promo_expiry === "object" &&
          variantData.promo_expiry &&
          (variantData.promo_expiry as object) instanceof Date
          ? (variantData.promo_expiry as Date).toISOString()
          : variantData.promo_expiry
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cost_price: variantData.cost_price,
      weight: variantData.weight,
      length: variantData.length,
      width: variantData.width,
      height: variantData.height,
      reorder_point: variantData.reorder_point || "0",
      max_stock: variantData.max_stock || "0",
      is_active: variantData.is_active ?? true,
      is_default: variantData.is_default ?? false,
      batch_number: variantData.batch_number,
      expiry_date: variantData.expiry_date
        ? Object.prototype.toString.call(variantData.expiry_date) === "[object Date]"
          ? (variantData.expiry_date as unknown as Date).toISOString().split("T")[0]
          : variantData.expiry_date
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      attributes: variantData.attributes || [],
    }

    updateVariant(
      { uid: props.variant.uid, ...payload },
      {
        onSuccess: () => {
          toast.success("Variant updated successfully")
          // Invalidate the product query to ensure fresh data on next open
          queryClient.invalidateQueries({ queryKey: ["products", productUidToFetch.value] })
          resetFormState()
          emit("update:modelValue", false)
          emit("refresh")
        },
        onError: displayError,
      },
    )
    return
  }

  // Images Edit Mode
  if (props.editMode === "images") {
    const productUid = productUidToFetch.value

    if (!productUid) {
      toast.error("No product ID found")
      return
    }

    try {
      // Step 1: Delete removed images
      if (removedImageIds.value.length > 0) {
        for (const imageId of removedImageIds.value) {
          await new Promise<void>((resolve, reject) => {
            deleteProductImage(imageId, {
              onSuccess: () => resolve(),
              onError: (error: unknown) => reject(new Error(String(error))),
            })
          })
        }
        console.log(`Deleted ${removedImageIds.value.length} images`)
      }

      // Step 2: Handle primary image changes and sort order updates
      // Check if position 0 (primary) has an existing image that needs to be marked as primary
      const primaryImage = form.images[0]
      const primaryImageId = existingImageIds.value[0]

      if (primaryImage && typeof primaryImage === "string" && primaryImageId) {
        // This is an existing image at primary position
        // We need to ensure it's marked as primary (in case it was swapped)
        await new Promise<void>((resolve, reject) => {
          updateProductImage(
            {
              uid: primaryImageId,
              is_primary: true,
              sort_order: 1,
            },
            {
              onSuccess: () => resolve(),
              onError: (error: unknown) => reject(new Error(String(error))),
            },
          )
        })
        console.log("Updated primary image")
      }

      // Step 3: Update sort order for all other existing images
      for (let i = 1; i < form.images.length; i++) {
        const image = form.images[i]
        const imageId = existingImageIds.value[i]

        // Only update if it's an existing image (string URL with ID)
        if (image && typeof image === "string" && imageId) {
          await new Promise<void>((resolve, reject) => {
            updateProductImage(
              {
                uid: imageId,
                is_primary: false,
                sort_order: i + 1,
              },
              {
                onSuccess: () => resolve(),
                onError: (error: unknown) => reject(new Error(String(error))),
              },
            )
          })
        }
      }

      // Step 4: Upload new product images (File objects - indices 0-4)
      const newImages = form.images
        .slice(0, 5)
        .map((image, index) => ({ image, index }))
        .filter(({ image }) => image && image instanceof File)

      if (newImages.length > 0) {
        for (const { image, index } of newImages) {
          await new Promise<void>((resolve, reject) => {
            addProductImages(
              {
                product: productUid,
                image: image as File,
                is_primary: index === 0,
                sort_order: index + 1,
              },
              {
                onSuccess: () => resolve(),
                onError: (error: unknown) => reject(new Error(String(error))),
              },
            )
          })
        }
        console.log(`Uploaded ${newImages.length} new product images`)
      }

      // Step 5: Upload variant images (File objects - indices 5+)
      const variantImagesUploaded: number[] = []
      if (variantDetailsWithUids.value.length > 0) {
        for (let i = 0; i < variantDetailsWithUids.value.length; i++) {
          const variantImageIndex = 5 + i
          const variantImage = form.images[variantImageIndex]
          const variant = variantDetailsWithUids.value[i]

          // Only upload if it's a new File (not existing URL string)
          if (variantImage && variantImage instanceof File && variant?.uid) {
            await updateVariantImage({
              variantUid: variant.uid,
              image: variantImage,
            })
            variantImagesUploaded.push(i)
          }
        }
        if (variantImagesUploaded.length > 0) {
          console.log(`Uploaded ${variantImagesUploaded.length} variant images`)
          // Mark that variant images were uploaded so we refetch on next open
          variantImagesWereUploaded.value = true
        }
      }

      // Success!
      const totalChanges =
        removedImageIds.value.length +
        newImages.length +
        variantImagesUploaded.length +
        (primaryImage && typeof primaryImage === "string" ? 1 : 0)

      if (totalChanges > 0) {
        toast.success(
          `Images updated successfully (${newImages.length} product, ${variantImagesUploaded.length} variant)`,
        )
      } else {
        toast.info("No changes to images")
      }

      // Invalidate the product query to ensure fresh data on next open
      queryClient.invalidateQueries({ queryKey: ["products", productUidToFetch.value] })
      resetFormState()
      emit("update:modelValue", false)
      emit("refresh")
    } catch (error) {
      displayError(error)
    }
    return
  }

  // Full Edit Mode or Variants Mode - Multi-step submission
  const isVariantsMode = props.editMode === "variants"
  const totalSteps = isVariantsMode ? 2 : hasVariants.value ? 4 : 3
  const isLast = step.value === totalSteps

  if (isLast) {
    // Handle Variants Mode with bulk operations
    if (isVariantsMode) {
      const productUid = productUidToFetch.value
      if (!productUid) {
        toast.error("No product ID found")
        return
      }

      try {
        // Identify variants to delete by looking up their UIDs from originalVariantUids map
        const toDelete: string[] = []
        deletedVariants.value.forEach((variant) => {
          if (variant.attributes && variant.attributes.length > 0) {
            const key = generateVariantKey(variant.attributes)
            const uid = originalVariantUids.value.get(key)
            if (uid) {
              toDelete.push(uid)
            }
          }
        })

        // Separate current variants into new (to add) - only variants without existing UIDs
        const toAdd: IProductVariant[] = []

        variants.value.forEach((variant) => {
          if (!variant.attributes || variant.attributes.length === 0) {
            // Single variant case - check if it existed before
            const existingUid = originalVariantUids.value.values().next().value
            if (!existingUid) {
              // New variant - no existing UID
              toAdd.push(variant)
            }
            return
          }

          const key = generateVariantKey(variant.attributes)
          const existingUid = originalVariantUids.value.get(key)

          if (!existingUid) {
            // New variant (attribute combination didn't exist before) - add to create list
            toAdd.push(variant)
          }
        })

        // Map variants to the correct format for the API
        const mappedToAdd = toAdd.map((variant) => ({
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
        }))

        console.log("Bulk variant operations:", {
          to_delete: toDelete,
          to_add: mappedToAdd,
        })

        // Step 1: Call bulk operations for deletions AND additions in same payload
        // This handles: delete-only, add-only, OR delete+add together
        const hasBulkOperations = toDelete.length > 0 || mappedToAdd.length > 0
        if (hasBulkOperations) {
          await bulkVariantOperations({
            productUid,
            to_delete: toDelete.length > 0 ? toDelete : undefined,
            to_add: mappedToAdd.length > 0 ? mappedToAdd : undefined,
          })
          console.log(
            `Bulk operations completed: ${toDelete.length} deleted, ${mappedToAdd.length} added`,
          )
        }

        // Show success message with comprehensive summary
        const changesSummary = []
        if (toDelete.length > 0) changesSummary.push(`${toDelete.length} deleted`)
        if (mappedToAdd.length > 0) changesSummary.push(`${mappedToAdd.length} added`)

        console.log("All variant operations completed:", changesSummary.join(", "))

        if (changesSummary.length > 0) {
          toast.success(`Variants updated successfully (${changesSummary.join(", ")})`)
        } else {
          toast.info("No variant changes to apply")
        }

        // Invalidate the product query to ensure fresh data on next open
        queryClient.invalidateQueries({ queryKey: ["products", productUidToFetch.value] })
        resetFormState()
        emit("update:modelValue", false)
        emit("refresh")
      } catch (error) {
        console.error("Failed to update variants:", error)
        displayError(error)
      }
      return
    }

    // Handle Full Edit Mode (original logic)
    const payload: IProductFormPayload = {
      name: form.name,
      description: form.description,
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

    const handleProductSuccess = () => {
      toast.success("Product updated successfully")
      step.value = 1
      hasVariants.value = false

      const productUid = productUidToFetch.value

      if (productUid && form.images.length > 0) {
        ;(async () => {
          try {
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
                      onSuccess: () => resolve(),
                      onError: (error: unknown) => reject(new Error(String(error))),
                    },
                  )
                })
              }
              console.log(`Uploaded ${productImages.length} product images`)
            }

            // Step 2: Check if there are variant images to upload (indices 5+)
            const hasVariantImages = form.images.slice(5).some((img) => img && img instanceof File)

            if (hasVariantImages && hasVariants.value) {
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
                  }
                }

                if (variantImagesUploaded > 0) {
                  console.log(`Uploaded ${variantImagesUploaded} variant images`)
                  // Mark that variant images were uploaded so we refetch on next open
                  variantImagesWereUploaded.value = true
                }
              }
            }

            const totalUploaded = productImages.length
            if (totalUploaded > 0 || hasVariantImages) {
              toast.success("All images uploaded successfully")
            }
          } catch (error) {
            console.error("Failed to upload some images:", error)
            toast.error("Product updated but some images failed to upload")
          }
        })()
      }

      resetFormState()
      emit("update:modelValue", false)
      emit("refresh")
    }

    updateProduct(
      { uid: productUidToFetch.value, ...payload },
      {
        onSuccess: handleProductSuccess,
        onError: displayError,
      },
    )
  } else {
    // Handle step progression with variant processing
    const shouldProcessVariants =
      (isVariantsMode && step.value === 1) ||
      (step.value === 2 && hasVariants.value && !isVariantsMode)

    if (shouldProcessVariants) {
      try {
        await variantProcessor.processVariantConfiguration()

        const hasAllUIDs = validateAllUIDs()
        if (!hasAllUIDs) {
          throw new Error(
            "Some attributes or values failed to be created. Please check all fields and try again.",
          )
        }

        // Generate combinations and capture deleted variants
        const deleted = variantConfigHelpers.generateVariantCombinations()
        // Deleted variants are IProductVariant[] without UIDs
        // UIDs will be looked up from originalVariantUids map when needed
        deletedVariants.value = deleted

        console.log("Generated Variants Array:", {
          step: step.value + 1,
          hasVariants: hasVariants.value,
          variants: JSON.parse(JSON.stringify(variants.value)),
          deletedVariants: JSON.parse(JSON.stringify(deletedVariants.value)),
          timestamp: new Date().toISOString(),
        })

        step.value += 1
      } catch (error) {
        console.error("Failed to process variants:", error)
        displayError(error)
        return
      }
    } else {
      step.value += 1
    }
  }
}

// Back button handler
const handleBack = () => {
  // When going back from combinations step, clear deleted variants
  // so they recalculate when user proceeds forward again
  const isVariantsMode = props.editMode === "variants"
  const isCombinationsStep =
    (isVariantsMode && step.value === 2) || (step.value === 3 && hasVariants.value)

  if (isCombinationsStep) {
    deletedVariants.value = []
  }

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
