<script setup lang="ts">
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import {
  useDeletePopupProducts,
  useGetPopupInventory,
  useUpdatePopupProduct,
} from "@modules/popups/api"
import { getInventoryVisibility, getPopupPriceRange } from "@modules/popups/constants"
import { computed, onMounted, ref, watch } from "vue"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useRoute } from "vue-router"
import SetupPopupBoothDrawer from "../SetupPopupBoothDrawer.vue"
import ManagePopupProductModal from "../ManagePopupProductModal.vue"
// import AppButton from "@components/AppButton.vue"
import TextField from "@components/form/TextField.vue"
import { PopupEvent, PopupInventory } from "@modules/popups/types"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import PopupProductAvailabilityModal from "../PopupProductAvailabilityModal.vue"

const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 500)
const openAddProduct = ref(false)
// const showFilter = ref(false)
const selectedProduct = ref<PopupInventory | null>(null)
const openManageProduct = ref(false)
const openManageAvailability = ref(false)
const showConfirmationModal = ref(false)
const confirmationAction = ref<"enable" | "disable" | "remove" | null>(null)

const props = defineProps<{ popup: PopupEvent }>()
const isClosed = computed(() => props.popup.status === "closed")

const route = useRoute()
// const isMobile = useMediaQuery("(max-width: 768px)")

const {
  data: popupInventory,
  isPending,
  isFetching,
  refetch,
} = useGetPopupInventory(route.params.id as string, debouncedSearch)
const { mutate: updatePopupProduct, isPending: isUpdating } = useUpdatePopupProduct()
const { mutate: deletePopupProducts, isPending: isDeleting } = useDeletePopupProducts()

// Get all existing variant SKUs in the popup inventory
const existingVariantSkus = computed(() => {
  return popupInventory.value?.flatMap((item) => item.variants?.map((v) => v.sku) || []) || []
})

const getActionMenu = (item: PopupInventory) => [
  { label: "Manage Product", icon: "edit", action: () => handleAction("Manage Product", item) },
  { divider: true },
  {
    label: "Manage Availability",
    icon: "eye",
    action: () => handleAction("Manage Availability", item),
  },
  { divider: true },
  {
    label: "Remove Product",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => handleAction("Remove Product", item),
  },
]

const handleAction = (action: string, item: PopupInventory) => {
  selectedProduct.value = item
  if (action === "Manage Product") {
    openManageProduct.value = true
  } else if (action === "Manage Availability") {
    openManageAvailability.value = true
  } else if (action === "Enable Availability") {
    confirmationAction.value = "enable"
    showConfirmationModal.value = true
  } else if (action === "Disable Availability") {
    confirmationAction.value = "disable"
    showConfirmationModal.value = true
  } else if (action === "Remove Product") {
    confirmationAction.value = "remove"
    showConfirmationModal.value = true
  }
}
const closeManageModal = () => {
  openManageProduct.value = false
  selectedProduct.value = null
}

const closeAvailabilityModal = () => {
  openManageAvailability.value = false
  selectedProduct.value = null
}

const handleConfirmAction = () => {
  if (!selectedProduct.value || !confirmationAction.value) return

  if (confirmationAction.value === "remove") {
    const payload = {
      popup_event: route.params.id as string,
      uids: selectedProduct.value.variants.map((v) => v.popup_inventory_uid),
    }

    deletePopupProducts(payload, {
      onSuccess: () => {
        toast.success("Product removed successfully")
        // Close confirmation modal
        showConfirmationModal.value = false
        confirmationAction.value = null
        selectedProduct.value = null

        // Refresh data
        refetch()
      },
      onError: displayError,
    })
  } else {
    const payload = {
      popup_event: route.params.id as string,
      items: [
        {
          uid: selectedProduct.value.uid,
          is_visible: confirmationAction.value === "enable",
        },
      ],
    }

    updatePopupProduct(payload, {
      onSuccess: () => {
        toast.success(
          `Product ${confirmationAction.value === "enable" ? "enabled" : "disabled"} successfully`,
        )
        // Close confirmation modal
        showConfirmationModal.value = false
        confirmationAction.value = null
        selectedProduct.value = null

        // Refresh data
        refetch()
      },
      onError: displayError,
    })
  }
}

const closeConfirmationModal = () => {
  showConfirmationModal.value = false
  confirmationAction.value = null
  selectedProduct.value = null
}

const getItemQty = (item: PopupInventory) => {
  return item.variants?.reduce((acc, variant) => acc + variant.available_quantity, 0) || 0
}

const getStockStatus = (item: PopupInventory) => {
  const qty = getItemQty(item)
  return {
    label: `${qty} units`,
    color: qty === 0 ? ("error" as const) : qty < 5 ? ("warning" as const) : ("blue" as const),
  }
}

const getVisibilityColor = (item: PopupInventory) => {
  const status = getInventoryVisibility(item)
  if (status === "Available") return "success" as const
  if (status === "Unavailable") return "error" as const
  return "primary" as const
}

onMounted(() => {
  if (route.query.setup === "true" || route.query.action === "add-products")
    openAddProduct.value = true
})

watch(
  () => route.query.action,
  (action) => {
    if (action === "add-products") openAddProduct.value = true
  },
)
</script>

<template>
  <EmptyState
    v-if="!popupInventory?.length || isPending"
    title="No products yet!"
    description="Once you add products to this popup’s inventory, they will appear here."
    action-icon="add"
    :loading="isPending"
    :action-label="isClosed ? undefined : 'Add Product'"
    class="!min-h-[40vh]"
    @action="!isClosed && (openAddProduct = true)"
  />

  <section v-else>
    <div class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white">
      <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center md:px-4">
        <div class="flex items-center gap-2">
          <span class="bg-leyyow-100 flex size-10 items-center justify-center rounded-lg">
            <Icon name="box" size="24" class="text-primary-700" />
          </span>
          <h3 class="flex items-center gap-1 text-lg font-semibold md:mb-0">
            Popup Inventory <Chip :label="popupInventory?.length || 0" />
          </h3>
        </div>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="sm"
            class="w-full md:min-w-64"
            placeholder="Search by name"
            v-model="searchQuery"
          />

          <!-- <AppButton
            v-if="!isClosed"
            icon="add"
            size="sm"
            class="flex-shrink-0"
            :label="isMobile ? '' : 'Add Product'"
            @click="openAddProduct = true"
          /> -->
        </div>
      </div>

      <!-- Card list: compact rows that adapt between mobile and desktop -->
      <div
        :class="[
          'flex flex-col gap-2 transition-opacity md:gap-0 md:divide-y md:divide-gray-100',
          isFetching ? 'opacity-60' : '',
        ]"
      >
        <div
          v-for="item in popupInventory"
          :key="item.uid"
          class="flex items-start gap-3 rounded-xl border border-gray-200 p-3 md:items-center md:gap-4 md:rounded-none md:border-0 md:px-4 md:py-3"
        >
          <!-- Product image -->
          <span
            class="flex size-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100"
          >
            <img
              v-if="item.images?.[0]?.image"
              :src="item.images?.[0]?.image"
              :alt="item.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <Icon v-else name="shop-add" :size="20" class="text-primary-700" />
          </span>

          <!-- Content: stacks on mobile, single row on desktop -->
          <div class="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <!-- Name + (mobile) price + menu on one line -->
            <div class="flex min-w-0 items-center gap-2 md:flex-1">
              <h4 class="!font-outfit min-w-0 flex-1 truncate text-sm font-medium capitalize">
                {{ item.name }}
              </h4>
              <span class="flex-shrink-0 text-sm font-semibold whitespace-nowrap md:hidden">
                {{ getPopupPriceRange(item) }}
              </span>
              <DropdownMenu
                v-if="!isClosed"
                class="md:hidden"
                :items="getActionMenu(item)"
                size="sm"
                @action="(action: string) => handleAction(action, item)"
              />
            </div>

            <!-- Price (desktop) -->
            <span class="hidden flex-shrink-0 text-sm font-semibold whitespace-nowrap md:block">
              {{ getPopupPriceRange(item) }}
            </span>

            <!-- Stock + availability chips -->
            <div class="flex flex-wrap items-center gap-1.5 md:flex-shrink-0">
              <Chip
                size="sm"
                icon="box"
                :color="getStockStatus(item).color"
                :label="getStockStatus(item).label"
              />
              <Chip
                showDot
                size="sm"
                :label="getInventoryVisibility(item)"
                :color="getVisibilityColor(item)"
              />
            </div>

            <!-- Menu (desktop) -->
            <DropdownMenu
              v-if="!isClosed"
              class="hidden md:flex"
              :items="getActionMenu(item)"
              size="sm"
              @action="(action: string) => handleAction(action, item)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Setup Booth Drawer - Available for both empty and populated states -->
  <SetupPopupBoothDrawer
    v-if="openAddProduct"
    :open="openAddProduct"
    :existing-variant-skus="existingVariantSkus"
    @close="openAddProduct = false"
    :popup-name="props.popup.name"
    @refresh="refetch"
  />

  <!-- Modal to manage price and quantity of a particular product -->
  <ManagePopupProductModal
    :open="openManageProduct"
    :selected-product="selectedProduct"
    :existing-variant-skus="existingVariantSkus"
    @close="closeManageModal"
    @refresh="refetch"
  />

  <!-- Manage Product Availability -->
  <PopupProductAvailabilityModal
    :open="openManageAvailability"
    :selected-product="selectedProduct"
    @close="closeAvailabilityModal"
    @refresh="refetch"
  />

  <!-- Confirmation Modal for Toggle Availability and Remove Product -->
  <ConfirmationModal
    v-model="showConfirmationModal"
    header="Remove Product"
    :paragraph="
      confirmationAction === 'enable'
        ? `Are you sure you want to enable availability for '${selectedProduct?.name}'? Customers will be able to see and purchase this product.`
        : confirmationAction === 'disable'
          ? `Are you sure you want to disable availability for '${selectedProduct?.name}'? This product will no longer be visible to customers.`
          : `Are you sure you want to remove '${selectedProduct?.name}' from this popup event? This action cannot be undone.`
    "
    :info-message="
      confirmationAction === 'remove'
        ? 'You can re-add the product afterwards.'
        : `You can ${confirmationAction === 'disable' ? 're-activate' : 'de-activate '} it later if needed.`
    "
    :variant="
      confirmationAction === 'remove'
        ? 'error'
        : confirmationAction === 'disable'
          ? 'warning'
          : 'success'
    "
    :action-label="
      confirmationAction === 'enable'
        ? 'Enable'
        : confirmationAction === 'disable'
          ? 'Disable'
          : 'Remove'
    "
    :loading="confirmationAction === 'remove' ? isDeleting : isUpdating"
    @confirm="handleConfirmAction"
    @close="closeConfirmationModal"
  />
</template>
