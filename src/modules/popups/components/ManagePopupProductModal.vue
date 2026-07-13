<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useRoute } from "vue-router"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import SelectField from "@components/form/SelectField.vue"
import StepperField from "@components/form/StepperField.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { PopupInventory } from "@modules/popups/types"
import { useUpdatePopupProduct } from "@modules/popups/api"
import { useGetProduct } from "@modules/inventory/api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { getPopupPriceRange } from "../constants"

interface Props {
  open: boolean
  selectedProduct: PopupInventory | null
}

type ActionValue = "add" | "remove" | "update_price"

interface VariantItem {
  uid: string
  popup_inventory_uid: string
  variant_sku: string
  variant_name: string
  /** Current quantity allocated to this popup */
  quantity: number
  /** Unsold quantity still available in this popup */
  popup_available: number
  /** Stock left in main inventory that can still be moved to popups */
  main_stock_left: number
  event_price: number
  original_price: number
  /** User input: quantity to add/remove (delta) */
  quantity_input: string | number
  /** User input: new event price */
  price_input: string | number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  refresh: []
}>()

const route = useRoute()

const { format } = useFormatCurrency()

// Fetch full product by uid — only when modal is open
const { data: fullProduct, isFetching: isLoadingProduct } = useGetProduct(
  () => props.selectedProduct?.uid ?? "",
  { enabled: () => props.open && !!props.selectedProduct?.uid },
)

const actionOptions: { label: string; value: ActionValue }[] = [
  { label: "Add Stock", value: "add" },
  { label: "Remove Stock", value: "remove" },
  { label: "Update Price", value: "update_price" },
]

const selectedActionOption = ref<{ label: string; value: ActionValue } | null>(null)
const selectedAction = computed(() => selectedActionOption.value?.value)

// Local state for managing the variants
const variantItems = ref<VariantItem[]>([])

const { mutate: updatePopupProduct, isPending: isUpdating } = useUpdatePopupProduct()

interface ValidationErrors {
  [variantUid: string]: {
    quantity?: string
    price?: string
  }
}
const validationErrors = ref<ValidationErrors>({})

const initializeVariants = () => {
  if (!props.selectedProduct || !fullProduct.value) return

  variantItems.value = props.selectedProduct.variants.map((popupVariant) => {
    const catalogueVariant = fullProduct.value?.data?.variants?.find(
      (v) => v.sku === popupVariant.sku,
    )

    const sellableStock = Number(catalogueVariant?.sellable_stock ?? 0)
    // const popupQtyTaken = Number(catalogueVariant?.popup_quantity_taken ?? 0)
    const quantity = Number(popupVariant.quantity)

    return {
      uid: popupVariant.uid,
      popup_inventory_uid: popupVariant.popup_inventory_uid,
      variant_sku: popupVariant.sku,
      variant_name: popupVariant.name,
      quantity,
      popup_available: Math.min(quantity, Number(popupVariant.available_quantity ?? quantity)),
      main_stock_left: Math.max(0, sellableStock),
      event_price: Number(popupVariant.event_price),
      original_price: Number(popupVariant.original_price || popupVariant.price),
      quantity_input: 0,
      price_input: Number(popupVariant.event_price),
    }
  })

  validationErrors.value = {}
}

watch(fullProduct, (product) => {
  if (product) initializeVariants()
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      variantItems.value = []
      validationErrors.value = {}
      selectedActionOption.value = null
    }
  },
)

// Reset inputs and errors when switching actions
watch(selectedAction, () => {
  variantItems.value.forEach((item) => {
    item.quantity_input = 0
    item.price_input = item.event_price
  })
  validationErrors.value = {}
})

const parseNumber = (value: string | number) => Number(String(value).replace(/,/g, ""))

// Quantity entered by the user (empty input counts as 0 / no change)
const getQuantityInput = (item: VariantItem) => {
  if (item.quantity_input === "" || item.quantity_input === null) return 0
  return parseNumber(item.quantity_input)
}

// Validate a single variant item for the selected action
const validateVariantItem = (item: VariantItem) => {
  const errors: { quantity?: string; price?: string } = {}

  if (selectedAction.value === "add" || selectedAction.value === "remove") {
    const qty = getQuantityInput(item)

    if (Number.isNaN(qty)) {
      errors.quantity = "Quantity must be a number"
    } else if (!Number.isInteger(qty)) {
      errors.quantity = "Quantity must be a whole number"
    } else if (qty < 0) {
      errors.quantity = "Quantity cannot be negative"
    } else if (selectedAction.value === "add" && qty > item.main_stock_left) {
      errors.quantity = `Only ${item.main_stock_left} left in your main inventory`
    } else if (selectedAction.value === "remove" && qty > item.popup_available) {
      errors.quantity = `Only ${item.popup_available} can be removed`
    }
  } else if (selectedAction.value === "update_price") {
    const price = parseNumber(item.price_input)

    if (item.price_input === "" || Number.isNaN(price)) {
      errors.price = "Price is required"
    } else if (price < 0) {
      errors.price = "Price must be at least 0"
    }
  }

  if (Object.keys(errors).length > 0) {
    validationErrors.value[item.uid] = errors
    return false
  }

  delete validationErrors.value[item.uid]
  return true
}

const validateAllItems = () => {
  return variantItems.value.map((v) => validateVariantItem(v)).every((r) => r)
}

// Variants the user has actually changed for the selected action
const changedItems = computed(() => {
  if (selectedAction.value === "add" || selectedAction.value === "remove") {
    return variantItems.value.filter((item) => getQuantityInput(item) > 0)
  }
  if (selectedAction.value === "update_price") {
    return variantItems.value.filter(
      (item) =>
        item.price_input !== "" &&
        !Number.isNaN(parseNumber(item.price_input)) &&
        parseNumber(item.price_input) !== item.event_price,
    )
  }
  return []
})

const canSave = computed(() => {
  return (
    !!selectedAction.value &&
    !isLoadingProduct.value &&
    changedItems.value.length > 0 &&
    Object.keys(validationErrors.value).length === 0
  )
})

// Contextual stock chip per action
const stockChip = (item: VariantItem) => {
  if (selectedAction.value === "add") {
    return {
      label: `${item.main_stock_left} in inventory`,
      color: item.main_stock_left < 5 ? ("error" as const) : ("success" as const),
    }
  }
  if (selectedAction.value === "remove") {
    return {
      label: `${item.popup_available} in popup`,
      color: item.popup_available < 5 ? ("error" as const) : ("success" as const),
    }
  }
  return { label: `${item.quantity} in popup`, color: "success" as const }
}

const infoMessage = computed(() => {
  switch (selectedAction.value) {
    case "add":
      return "Quantities to add are validated against available stock in your main inventory."
    case "remove":
      return "Removed quantities are returned to your main inventory."
    case "update_price":
      return "Event prices only apply to this popup event."
    default:
      return "Select an action to add stock, remove stock or update event prices."
  }
})

const submitButtonLabel = computed(() => {
  return selectedActionOption.value?.label ?? "Save Changes"
})

// Save changes
const saveChanges = () => {
  if (!selectedAction.value) return
  if (!validateAllItems() || changedItems.value.length === 0) return

  const updatePayload = {
    popup_event: route.params.id as string,
    items: changedItems.value.map((item) => {
      const qty = getQuantityInput(item)
      const newQuantity =
        selectedAction.value === "add"
          ? item.quantity + qty
          : selectedAction.value === "remove"
            ? item.quantity - qty
            : item.quantity

      return {
        uid: item.popup_inventory_uid,
        quantity: newQuantity,
        event_price:
          selectedAction.value === "update_price"
            ? parseNumber(item.price_input)
            : item.event_price,
      }
    }),
  }

  updatePopupProduct(updatePayload, {
    onSuccess: () => {
      const messages: Record<ActionValue, string> = {
        add: "Stock added to popup successfully",
        remove: "Stock removed from popup successfully",
        update_price: "Event price updated successfully",
      }
      toast.success(messages[selectedAction.value as ActionValue])
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
      <!-- Action Selector -->
      <SelectField
        v-model="selectedActionOption"
        label="Select Action"
        placeholder="Select action"
        :options="actionOptions"
        required
      />

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
        <!-- Loading skeleton -->
        <template v-if="isLoadingProduct">
          <div
            v-for="n in selectedProduct.variants.length || 2"
            :key="n"
            class="rounded-xl bg-white p-3"
          >
            <div class="mb-3 flex items-center justify-between">
              <div class="h-6 w-32 animate-pulse rounded-full bg-gray-200" />
              <div class="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div class="h-10 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </template>

        <div v-else v-for="item in variantItems" :key="item.uid" class="rounded-xl bg-white">
          <div class="flex items-center justify-between p-3">
            <div class="flex items-center gap-2">
              <Chip color="primary" :label="item.variant_name" size="sm" />
              <span class="text-core-600 flex items-center gap-1 text-xs">
                <Icon name="tag" class="h-3 w-3" />
                {{ format(item.original_price) }}
              </span>
            </div>
            <Chip
              :color="stockChip(item).color"
              :label="stockChip(item).label"
              icon="box"
              size="sm"
            />
          </div>

          <!-- Action-specific fields -->
          <div
            v-if="selectedAction === 'add' || selectedAction === 'remove'"
            class="border-core-200 border-t p-3"
          >
            <StepperField
              v-model="item.quantity_input"
              :name="`quantity-${item.uid}`"
              :label="selectedAction === 'add' ? 'Quantity to add' : 'Quantity to remove'"
              placeholder="0"
              :error="validationErrors[item.uid]?.quantity"
              @update:model-value="validateVariantItem(item)"
            />
          </div>

          <div v-else-if="selectedAction === 'update_price'" class="border-core-200 border-t p-3">
            <TextField
              v-model="item.price_input"
              :name="`event_price-${item.uid}`"
              type="number"
              format="currency"
              step="0.01"
              label="Event Price"
              placeholder="e.g. 59.99"
              :min="0"
              :error="validationErrors[item.uid]?.price"
              @input="validateVariantItem(item)"
            />
          </div>
        </div>
      </div>

      <!-- Info message -->
      <div v-if="!isLoadingProduct" class="bg-core-50 rounded-lg p-3">
        <p class="text-core-600 text-xs">
          <Icon name="info-circle" class="mr-1 inline h-3 w-3" />
          {{ infoMessage }}
        </p>
      </div>
    </div>

    <!-- Modal Actions -->
    <template #footer>
      <div class="flex gap-3">
        <AppButton
          :label="submitButtonLabel"
          class="flex-1"
          :loading="isUpdating"
          :disabled="!canSave"
          @click="saveChanges"
        />
      </div>
    </template>
  </Modal>
</template>
