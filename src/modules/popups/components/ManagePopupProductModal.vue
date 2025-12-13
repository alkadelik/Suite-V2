<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useRoute } from "vue-router"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import { formatCurrency } from "@/utils/format-currency"
import { PopupInventory } from "@modules/popups/types"
import { useUpdatePopupProduct } from "@modules/popups/api"
import { useGetProductCatalogs } from "@modules/inventory/api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import type { IProductCatalogue } from "@modules/inventory/types"
import * as yup from "yup"

interface Props {
  open: boolean
  selectedProduct: PopupInventory | null
}

interface VariantItem {
  uid: string
  variant_uid: string
  variant_name: string
  variant_sku: string
  quantity: number
  event_price: number
  available_stock: number
  sellable_stock: number
  popup_quantity_taken: number
  original_price: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  refresh: []
}>()

const route = useRoute()

// Fetch all products to get the full product details with all variants
const { data: productsResponse } = useGetProductCatalogs()

// Local state for managing the variant
const variantItems = ref<VariantItem[]>([])

const { mutate: updatePopupProduct, isPending: isUpdating } = useUpdatePopupProduct()

interface ValidationErrors {
  [variantUid: string]: {
    quantity?: string
    event_price?: string
  }
}
const validationErrors = ref<ValidationErrors>({})

// Find the full product from the catalogue
const fullProduct = computed<IProductCatalogue | undefined>(() => {
  if (!props.selectedProduct || !productsResponse.value) return undefined

  const products = productsResponse.value.results || []
  return products.find((p: IProductCatalogue) =>
    p.variants?.some((v) => v.sku === props.selectedProduct?.variant_sku),
  )
})

// Initialize variant items when modal opens
const initializeVariants = () => {
  if (!props.selectedProduct || !fullProduct.value) return

  // Find the variant in the main catalogue to get accurate stock info
  const catalogueVariant = fullProduct.value.variants?.find(
    (v) => v.sku === props.selectedProduct?.variant_sku,
  )

  if (!catalogueVariant) return

  // Calculate available stock from main catalogue
  const sellableStock = Number(catalogueVariant.sellable_stock)
  const popupQtyTaken = Number(catalogueVariant.popup_quantity_taken ?? 0)

  // Available stock = sellable_stock - popup_quantity_taken + current_popup_quantity
  // We add back the current popup quantity because it's already included in popup_quantity_taken
  const availableStock = sellableStock - popupQtyTaken

  // Set the current product variant
  variantItems.value = [
    {
      uid: props.selectedProduct.uid, // popup inventory uid
      variant_uid: props.selectedProduct.variant,
      variant_name: props.selectedProduct.variant_name,
      variant_sku: props.selectedProduct.variant_sku,
      quantity: props.selectedProduct.quantity,
      event_price: Number(props.selectedProduct.event_price),
      available_stock: Math.max(0, availableStock),
      sellable_stock: sellableStock,
      popup_quantity_taken: popupQtyTaken,
      original_price: Number(props.selectedProduct.original_price || catalogueVariant.price),
    },
  ]

  validationErrors.value = {}
}

// Watch for modal open/close
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      initializeVariants()
    } else {
      variantItems.value = []
      validationErrors.value = {}
    }
  },
)

// Validate a single variant item
const validateVariantItem = async (item: VariantItem) => {
  // For existing items, we include their current quantity in available stock
  // For new items, popup_quantity_taken already excludes them
  const maxAvailable = item.available_stock

  const schema = yup.object({
    quantity: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .typeError("Quantity must be a number")
      .required("Quantity is required")
      .positive("Quantity must be greater than 0")
      .integer("Quantity must be a whole number")
      .max(maxAvailable, `Only ${maxAvailable} available in stock`),
    event_price: yup
      .number()
      .transform((value, originalValue) => (originalValue === "" ? undefined : value))
      .typeError("Price must be a number")
      .required("Price is required")
      .min(0, "Price must be at least 0"),
  })

  try {
    await schema.validate(
      { quantity: item.quantity, event_price: item.event_price },
      { abortEarly: false },
    )
    delete validationErrors.value[item.variant_uid]
    return true
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors: { quantity?: string; event_price?: string } = {}
      err.inner.forEach((error) => {
        if (error.path) errors[error.path as "quantity" | "event_price"] = error.message
      })
      validationErrors.value[item.variant_uid] = errors
    }
    return false
  }
}

// Validate all variant items
const validateAllItems = async () => {
  const results = await Promise.all(variantItems.value.map((v) => validateVariantItem(v)))
  return results.every((r) => r)
}

// Check if form is valid
const canSave = computed(() => {
  return (
    variantItems.value.length > 0 &&
    variantItems.value.every((v) => v.quantity > 0 && v.event_price >= 0) &&
    Object.keys(validationErrors.value).length === 0
  )
})

// Save changes
const saveChanges = async () => {
  const isValid = await validateAllItems()
  if (!isValid || !canSave.value) return

  const item = variantItems.value[0]

  const updatePayload = {
    popup_event: route.params.id as string,
    items: [
      {
        uid: item.uid,
        event_price: item.event_price,
        quantity: item.quantity,
      },
    ],
  }

  updatePopupProduct(updatePayload, {
    onSuccess: () => {
      toast.success("Product updated successfully")
      emit("refresh")
      emit("close")
    },
    onError: displayError,
  })
}

const closeModal = () => {
  emit("close")
}
</script>

<template>
  <Modal
    :open="open"
    title="Manage Product"
    max-width="lg"
    variant="bottom-nav"
    @close="closeModal"
  >
    <div v-if="selectedProduct" class="space-y-4">
      <!-- Product Header -->
      <div class="rounded-xl bg-white">
        <div class="flex gap-4 p-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Icon name="box" class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 space-y-1.5">
            <h4 class="text-sm font-medium capitalize">{{ selectedProduct.product_name }}</h4>
            <div class="flex items-center gap-1.5">
              <span
                v-if="
                  selectedProduct.original_price &&
                  Number(selectedProduct.original_price) !== Number(selectedProduct.event_price)
                "
                class="text-core-300 line-through"
                style="font-size: 11px"
              >
                {{ formatCurrency(Number(selectedProduct.original_price)) }}
              </span>
              <span class="text-primary-600 flex items-center gap-1 text-xs">
                <Icon name="tag" class="h-3 w-3" />
                {{ formatCurrency(Number(selectedProduct.event_price)) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Variant Details -->
      <div class="space-y-3">
        <div v-for="item in variantItems" :key="item.variant_uid" class="rounded-xl bg-white">
          <div class="flex items-center justify-between p-3">
            <div class="flex items-center gap-2">
              <Chip
                color="primary"
                :label="item.variant_name.split(' - ').slice(1).join(' - ') || item.variant_name"
                size="sm"
              />
              <span class="text-core-600 flex items-center gap-1 text-xs">
                <Icon name="tag" class="h-3 w-3" />
                {{ formatCurrency(item.original_price) }}
              </span>
            </div>
            <Chip
              color="success"
              :label="`${item.available_stock} in Stock`"
              icon="box"
              size="sm"
            />
          </div>

          <div class="border-core-200 grid grid-cols-2 gap-3 border-t p-3">
            <TextField
              v-model="item.quantity"
              name="quantity"
              type="number"
              label="Quantity"
              placeholder="1"
              :min="1"
              :max="item.available_stock"
              :error="validationErrors[item.variant_uid]?.quantity"
              @blur="validateVariantItem(item)"
            />
            <TextField
              v-model="item.event_price"
              name="event_price"
              type="number"
              label="Event Price"
              placeholder="e.g. 59.99"
              :min="0"
              step="0.01"
              :error="validationErrors[item.variant_uid]?.event_price"
              @blur="validateVariantItem(item)"
            />
          </div>
        </div>
      </div>

      <!-- Info message -->
      <div class="bg-core-50 rounded-lg p-3">
        <p class="text-core-600 text-xs">
          <Icon name="info-circle" class="mr-1 inline h-3 w-3" />
          Quantities are validated against available stock in your main inventory.
        </p>
      </div>
    </div>

    <!-- Modal Actions -->
    <template #footer>
      <div class="flex gap-3">
        <AppButton
          label="Save Changes"
          class="flex-1"
          :loading="isUpdating"
          :disabled="!canSave"
          @click="saveChanges"
        />
      </div>
    </template>
  </Modal>
</template>
