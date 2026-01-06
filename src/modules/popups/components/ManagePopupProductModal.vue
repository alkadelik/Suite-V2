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
import { getPopupPriceRange } from "../constants"

interface Props {
  open: boolean
  selectedProduct: PopupInventory | null
}

interface VariantItem {
  uid: string
  popup_inventory_uid: string
  variant_sku: string
  variant_name: string
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

// Local state for managing the variants
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
  return products.find((p: IProductCatalogue) => p.uid === props.selectedProduct?.uid)
})

// Initialize variant items when modal opens
const initializeVariants = () => {
  if (!props.selectedProduct || !fullProduct.value) return

  // Map through all variants in the selected product
  variantItems.value = props.selectedProduct.variants.map((popupVariant) => {
    // Find the corresponding variant in the main catalogue to get accurate stock info
    const catalogueVariant = fullProduct.value?.variants?.find((v) => v.sku === popupVariant.sku)

    // Calculate available stock from main catalogue
    const sellableStock = Number(catalogueVariant?.sellable_stock ?? 0)
    const popupQtyTaken = Number(catalogueVariant?.popup_quantity_taken ?? 0)
    const currentPopupQuantity = Number(popupVariant.quantity)

    // Available stock = sellable_stock - popup_quantity_taken + current_popup_quantity
    // We add back the current popup quantity because it's already included in popup_quantity_taken
    const availableStock = sellableStock - popupQtyTaken + currentPopupQuantity

    return {
      uid: popupVariant.uid, // This is the popup_inventory variant uid
      popup_inventory_uid: popupVariant.popup_inventory_uid, // This is the main popup inventory product uid
      variant_sku: popupVariant.sku,
      variant_name: popupVariant.name,
      quantity: popupVariant.quantity,
      event_price: Number(popupVariant.event_price),
      available_stock: Math.max(0, availableStock),
      sellable_stock: sellableStock,
      popup_quantity_taken: popupQtyTaken,
      original_price: Number(popupVariant.original_price || popupVariant.price),
    }
  })

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
    delete validationErrors.value[item.uid]
    return true
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors: { quantity?: string; event_price?: string } = {}
      err.inner.forEach((error) => {
        if (error.path) errors[error.path as "quantity" | "event_price"] = error.message
      })
      validationErrors.value[item.uid] = errors
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

  const updatePayload = {
    popup_event: route.params.id as string,
    items: variantItems.value.map((item) => ({
      uid: item.popup_inventory_uid,
      event_price: item.event_price,
      quantity: item.quantity,
    })),
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
            <img
              v-if="selectedProduct.images?.[0]?.image"
              :src="selectedProduct.images[0].image"
              :alt="selectedProduct.name"
              class="h-full w-full rounded-lg object-cover"
            />
            <Icon v-else name="box" class="h-6 w-6 text-gray-400" />
          </div>
          <div class="flex-1 space-y-1.5">
            <h4 class="text-sm font-medium capitalize">{{ selectedProduct.name }}</h4>
            <p class="text-core-600 text-xs">
              {{ getPopupPriceRange(selectedProduct) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Variant Details -->
      <div class="space-y-3">
        <div v-for="item in variantItems" :key="item.uid" class="rounded-xl bg-white">
          <div class="flex items-center justify-between p-3">
            <div class="flex items-center gap-2">
              <Chip color="primary" :label="item.variant_name" size="sm" />
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
              :error="validationErrors[item.uid]?.quantity"
              @input="validateVariantItem(item)"
            />
            <TextField
              v-model="item.event_price"
              name="event_price"
              type="number"
              label="Event Price"
              placeholder="e.g. 59.99"
              :min="0"
              step="0.01"
              :error="validationErrors[item.uid]?.event_price"
              @input="validateVariantItem(item)"
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
