<template>
  <Drawer
    :open="modelValue"
    :title="mode === 'add' ? 'Add Product' : 'Edit Product'"
    :position="drawerPosition"
    max-width="xl"
    @close="emit('update:modelValue', false)"
  >
    <IconHeader icon-name="shop-add" :subtext="getHeaderText" />

    <form id="product-form" @submit.prevent="handleSubmit" class="h-full flex-1 overflow-y-auto">
      <div>
        <!-- Step 1: Product Details -->
        <ProductDetailsForm
          v-if="step === 1"
          v-model="form"
          :has-variants="hasVariants"
          @update:has-variants="hasVariants = $event"
        />

        <!-- Step 2: Variants Configuration (only if hasVariants is true) -->
        <div v-else-if="step === 2 && hasVariants" class="text-center text-gray-500">
          <ProductVariantsForm />
        </div>

        <!-- Step 2/3: Inventory & Pricing -->
        <ProductManageCombinationsForm
          v-else-if="(step === 2 && !hasVariants) || (step === 3 && hasVariants)"
          v-model="variants"
          :product-name="form.name"
        />

        <!-- Step 3/4: Review -->
        <div
          v-else-if="(step === 3 && !hasVariants) || (step === 4 && hasVariants)"
          class="text-center text-gray-500"
        >
          <ProductReview :product-data="form" :variants="variants" :has-variants="hasVariants" />
        </div>

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
            :loading="isPending || isCreating"
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
import { ref, computed, onMounted, reactive, onUnmounted } from "vue"
import Drawer from "@components/Drawer.vue"
import AppButton from "@/components/AppButton.vue"
import { IProductFormPayload, TProduct, TProductFormMode } from "../types"
import IconHeader from "@components/IconHeader.vue"
import ProductDetailsForm from "./ProductForm/ProductDetailsForm.vue"
import ProductManageCombinationsForm from "./ProductForm/ProductManageCombinationsForm.vue"
import { IProductVariant } from "../types"
import ProductReview from "./ProductForm/ProductReview.vue"
import ProductVariantsForm from "./ProductForm/ProductVariantsForm.vue"
import { useCreateProduct } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"

interface Props {
  /** Whether the drawer is open/visible */
  modelValue: boolean
  /** Form mode - add new product or edit existing */
  mode?: TProductFormMode
  /** Product data for editing (required when mode is 'edit') */
  product?: TProduct | null
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
  mode: "add",
  product: null,
  loading: false,
})

const emit = defineEmits<Emits>()

// API Calls
const { mutate: createProduct, isPending: isCreating } = useCreateProduct()

// Reactive state
const isMobile = ref(false)
// const formKey = ref(0) // Force form re-render when switching modes
const step = ref(1) // Current step in multi-step form
const hasVariants = ref(true)
const form = reactive({
  name: "",
  description: "",
  category: null as { label: string; value: string } | null,
  images: [] as Array<File>,
  story: "",
  brand: "",
  requires_approval: false,
})

// Variants array for inventory management
const variants = ref<IProductVariant[]>([])

// Computed properties
const totalSteps = computed(() => {
  return hasVariants.value ? 4 : 3
})

const isLastStep = computed(() => {
  return step.value === totalSteps.value
})

const canProceed = computed(() => {
  if (step.value === 1) {
    return form.name.trim() !== "" && form.category !== null
  } else if ((step.value === 2 && !hasVariants.value) || (step.value === 3 && hasVariants.value)) {
    // Validate inventory step - ensure we have at least basic pricing, stock info, and dimensions
    const variant = variants.value[0]
    return (
      variant &&
      variant.price.trim() !== "" &&
      variant.opening_stock.trim() !== "" &&
      variant.height.trim() !== "" &&
      variant.length.trim() !== "" &&
      variant.width.trim() !== ""
    )
  }
  // Add validation for other steps as needed
  return true
})

// Computed loading state based on mode
const isPending = computed(() => {
  //   return props.mode === "add" ? isCreating.value : isUpdating.value
  return props.loading || false
})

// Dynamic header text based on current step and variant status
const getHeaderText = computed(() => {
  if (step.value === 1) {
    return "Add images and details about your product, e.g. name, price."
  } else if (step.value === 2 && !hasVariants.value) {
    return "Enter available quantity and price for your product."
  } else if (step.value === 3 && !hasVariants.value) {
    return "Review your product details before submission."
  } else if (step.value === 2 && hasVariants.value) {
    return "Add the different options your product comes in (like size or colour). For example: Size → Large, Color → Red."
  } else if (step.value === 3 && hasVariants.value) {
    return "Enter available quantity and price for each variant combination."
  } else if (step.value === 4 && hasVariants.value) {
    return "Review your product details before submission."
  }
  return ""
})

// Watch for changes in product or mode to force form re-render
// watch([() => props.product, () => props.mode, () => props.modelValue], () => {
//   if (props.modelValue) {
//     // Reset form when opening
//     step.value = 1
//     hasVariants.value = false

//     if (props.mode === "edit" && props.product) {
//       // Populate form with existing product data
//       form.name = props.product.name || ""
//       form.description = props.product.description || ""
//       form.category?.value = props.product.category || null
//       hasVariants.value = props.product.hasVariants || false

//       // Initialize variants array with existing data
//       if (props.product.variants && props.product.variants.length > 0) {
//         variants.value = [...props.product.variants]
//       } else {
//         // Initialize with default variant for no-variants product
//         variants.value = [
//           {
//             name: props.product.name || "Default",
//             sku: props.product.sku || "",
//             price: props.product.price || "",
//             promo_price: props.product.promo_price || "",
//             promo_expiry: props.product.promo_expiry || "",
//             cost_price: props.product.cost_price || "",
//             weight: props.product.weight || "",
//             length: props.product.length || "",
//             width: props.product.width || "",
//             height: props.product.height || "",
//             reorder_point: props.product.reorder_point || "",
//             max_stock: props.product.max_stock || "",
//             opening_stock: props.product.opening_stock || "",
//             is_active: props.product.is_active ?? true,
//             is_default: true,
//             batch_number: props.product.batch_number || "",
//             expiry_date: props.product.expiry_date || "",
//             attributes: props.product.attributes || [],
//           },
//         ]
//       }
//     } else {
//       // Reset form for new product
//       form.name = ""
//       form.description = ""
//       form.category = null
//       hasVariants.value = false

//       // Initialize with empty variant for new product
//       variants.value = [
//         {
//           name: "Default",
//           sku: "",
//           price: "",
//           promo_price: "",
//           promo_expiry: "",
//           cost_price: "",
//           weight: "",
//           length: "",
//           width: "",
//           height: "",
//           reorder_point: "",
//           max_stock: "",
//           opening_stock: "",
//           is_active: true,
//           is_default: true,
//           batch_number: "",
//           expiry_date: "",
//           attributes: [],
//         },
//       ]
//     }
//   }
//   formKey.value += 1
// })

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

// Form submission handler
const handleSubmit = () => {
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

    console.log("Submitting product:", JSON.stringify(payload, null, 2))
    createProduct(payload, {
      onSuccess: () => {
        toast.success("Product created successfully")
        emit("update:modelValue", false)
        emit("refresh")
      },
      onError: displayError,
    })
  } else {
    // Move to next step
    step.value += 1
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
