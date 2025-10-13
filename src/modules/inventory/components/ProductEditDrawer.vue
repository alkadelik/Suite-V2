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
        <ProductImagesForm v-else-if="props.editMode === 'images'" v-model="form.images" />

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
          />

          <!-- Step 3/4: Product Images -->
          <ProductImagesForm
            v-else-if="(step === 3 && !hasVariants) || (step === 4 && hasVariants)"
            v-model="form.images"
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
  useGetProduct,
} from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import LoadingIcon from "@components/LoadingIcon.vue"

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
    isLoadingProduct.value
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

// Watch for drawer opening to set productUidToFetch
watch(
  () => [props.modelValue, props.product] as const,
  ([isOpen, product]) => {
    if (isOpen && product?.uid) {
      productUidToFetch.value = product.uid
    }
  },
  { immediate: true },
)

// Watch for product data to populate form
watch(
  () => productData.value,
  (data) => {
    if (data?.data) {
      const product = data.data

      populateFormState({
        name: product.name || "",
        description: product.description || "",
        story: product.story || "",
        brand: product.brand || "",
        requires_approval: product.requires_approval || false,
        category: product.category
          ? { label: product.category_name || "", value: product.category || "" }
          : null,
        images:
          product.images && product.images.length > 0
            ? [
                ...product.images
                  .slice()
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .slice(0, 5)
                  .map((img) => img.image),
                ...Array(Math.max(0, 5 - product.images.length)).fill(null),
              ]
            : [],
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

    const validImages = form.images.filter((image) => image && image instanceof File)

    if (validImages.length === 0) {
      toast.info("No new images to upload")
      resetFormState()
      emit("update:modelValue", false)
      emit("refresh")
      return
    }

    try {
      for (let i = 0; i < validImages.length; i++) {
        const image = validImages[i]

        await new Promise<void>((resolve, reject) => {
          addProductImages(
            {
              product: productUid,
              image: image as File,
              is_primary: i === 0,
              sort_order: i + 1,
            },
            {
              onSuccess: () => resolve(),
              onError: (error: unknown) => reject(new Error(String(error))),
            },
          )
        })
      }

      toast.success("Images uploaded successfully")
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
  const totalSteps = isVariantsMode ? 3 : hasVariants.value ? 4 : 3
  const isLast = step.value === totalSteps

  if (isLast) {
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

      const productUid = productUidToFetch.value

      if (productUid && form.images.length > 0) {
        ;(async () => {
          try {
            const validImages = form.images.filter((image) => image && image instanceof File)

            if (validImages.length > 0) {
              for (let i = 0; i < validImages.length; i++) {
                const image = validImages[i]

                await new Promise<void>((resolve, reject) => {
                  addProductImages(
                    {
                      product: productUid,
                      image: image as File,
                      is_primary: i === 0,
                      sort_order: i + 1,
                    },
                    {
                      onSuccess: () => resolve(),
                      onError: (error: unknown) => reject(new Error(String(error))),
                    },
                  )
                })
              }

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

        variantConfigHelpers.generateVariantCombinations()

        console.log("Generated Variants Array:", {
          step: step.value + 1,
          hasVariants: hasVariants.value,
          variants: JSON.parse(JSON.stringify(variants.value)),
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
