<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useRoute } from "vue-router"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import { formatCurrency } from "@/utils/format-currency"
import { PopupInventory, PopupInventoryVariant } from "@modules/popups/types"
import { useUpdatePopupProduct } from "@modules/popups/api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { getPopupPriceRange } from "../constants"
import Switch from "@components/form/Switch.vue"

interface Props {
  open: boolean
  selectedProduct: PopupInventory | null
}

interface VariantVisibilityItem {
  uid: string
  popup_inventory_uid: string
  variant_name: string
  variant_sku: string
  event_price: number
  original_price: number
  quantity: number
  is_visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  refresh: []
}>()

const route = useRoute()

// Local state for managing the variant visibility
const variantItems = ref<VariantVisibilityItem[]>([])

const { mutate: updatePopupProduct, isPending: isUpdating } = useUpdatePopupProduct()

// Initialize variant items when modal opens
const initializeVariants = () => {
  if (!props.selectedProduct) return

  // Map through all variants in the selected product
  variantItems.value = props.selectedProduct.variants.map((popupVariant: PopupInventoryVariant) => {
    return {
      uid: popupVariant.uid,
      variant_name: popupVariant.name,
      variant_sku: popupVariant.sku,
      popup_inventory_uid: popupVariant.popup_inventory_uid,
      quantity: Number(popupVariant.quantity),
      event_price: Number(popupVariant.event_price),
      original_price: Number(popupVariant.original_price || popupVariant.price),
      is_visible: popupVariant.is_visible,
    }
  })
}

// Watch for modal open/close
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      initializeVariants()
    } else {
      variantItems.value = []
    }
  },
)

// Check if all variants are visible or hidden
const allVisible = computed(() => variantItems.value.every((item) => item.is_visible))
const allHidden = computed(() => variantItems.value.every((item) => !item.is_visible))

// Show all or hide all variants
const showAll = () => {
  variantItems.value.forEach((item) => {
    item.is_visible = true
  })
}

const hideAll = () => {
  variantItems.value.forEach((item) => {
    item.is_visible = false
  })
}

// Check if there are any changes
const hasChanges = computed(() => {
  if (!props.selectedProduct) return false

  return variantItems.value.some((item) => {
    const original = props.selectedProduct?.variants.find((v) => v.uid === item.uid)
    return original && original.is_visible !== item.is_visible
  })
})

// Save changes
const saveChanges = () => {
  if (!hasChanges.value) {
    closeModal()
    return
  }

  const updatePayload = {
    popup_event: route.params.id as string,
    items: variantItems.value.map((item) => ({
      uid: item.popup_inventory_uid,
      is_visible: item.is_visible,
    })),
  }

  updatePopupProduct(updatePayload, {
    onSuccess: () => {
      toast.success("Product availability updated successfully")
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
    title="Manage Availability"
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

      <!-- Variant Visibility List -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h5 class="text-sm font-medium text-gray-700">Variant Visibility</h5>

          <!-- Show All / Hide All -->
          <div v-if="variantItems.length > 1" class="flex gap-2">
            <button
              type="button"
              @click="showAll"
              :disabled="allVisible"
              class="text-primary-600 hover:text-primary-700 text-xs font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              Show All
            </button>
            <span class="text-gray-300">|</span>
            <button
              type="button"
              @click="hideAll"
              :disabled="allHidden"
              class="text-xs font-medium text-gray-600 transition-opacity hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hide All
            </button>
          </div>
        </div>
        <div v-for="item in variantItems" :key="item.uid" class="rounded-xl bg-white">
          <div class="flex items-center justify-between p-4">
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <Chip color="primary" :label="item.variant_name" size="sm" />
                <span class="text-core-600 flex items-center gap-1 text-xs">
                  <Icon name="tag" class="h-3 w-3" />
                  {{ formatCurrency(item.event_price) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>Qty: {{ item.quantity }}</span>
                <span>•</span>
                <span>Original: {{ formatCurrency(item.original_price) }}</span>
              </div>
            </div>

            <!-- Toggle Switch -->
            <Switch v-model="item.is_visible" />
          </div>
        </div>
      </div>

      <!-- Info message -->
      <div class="bg-core-50 rounded-lg p-3">
        <p class="text-core-600 text-xs">
          <Icon name="info-circle" class="mr-1 inline h-3 w-3" />
          Toggle visibility to control which variants customers can see and purchase at this event.
        </p>
      </div>
    </div>

    <!-- Modal Actions -->
    <template #footer>
      <div class="flex gap-3">
        <AppButton label="Cancel" variant="outlined" class="flex-1" @click="closeModal" />
        <AppButton
          label="Save Changes"
          class="flex-1"
          :loading="isUpdating"
          :disabled="!hasChanges"
          @click="saveChanges"
        />
      </div>
    </template>
  </Modal>
</template>
