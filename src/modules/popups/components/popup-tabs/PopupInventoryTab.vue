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
import {
  getInventoryVisibility,
  getPopupPriceRange,
  POPUP_INVENTORY_COLUMNS,
} from "@modules/popups/constants"
import { useMediaQuery } from "@vueuse/core"
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import SetupPopupBoothDrawer from "../SetupPopupBoothDrawer.vue"
import ManagePopupProductModal from "../ManagePopupProductModal.vue"
import AppButton from "@components/AppButton.vue"
import TextField from "@components/form/TextField.vue"
import DataTable from "@components/DataTable.vue"
import ProductAvatar from "@components/ProductAvatar.vue"
import { PopupEvent, PopupInventory } from "@modules/popups/types"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import PopupProductAvailabilityModal from "../PopupProductAvailabilityModal.vue"

const searchQuery = ref("")
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
const isMobile = useMediaQuery("(max-width: 768px)")

const {
  data: popupInventory,
  isPending,
  isFetching,
  refetch,
} = useGetPopupInventory(route.params.id as string, searchQuery.value)
const { mutate: updatePopupProduct, isPending: isUpdating } = useUpdatePopupProduct()
const { mutate: deletePopupProducts, isPending: isDeleting } = useDeletePopupProducts()

const isEmpty = computed(() => !popupInventory.value?.length)

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
      uids: [selectedProduct.value.uid],
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
  if (qty === 0) {
    return { label: "Out of Stock", color: "error" as const }
  } else if (qty < 5) {
    return { label: `${qty} in Stock`, color: "warning" as const }
  } else {
    return { label: `${qty} in Stock`, color: "success" as const }
  }
}

onMounted(() => {
  if (route.query.setup === "true") openAddProduct.value = true
})
</script>

<template>
  <EmptyState
    v-if="isEmpty"
    title="No products yet!"
    description="Once you add products to this popup’s inventory, they will appear here."
    action-icon="add"
    :action-label="isClosed ? undefined : 'Add Product'"
    class="!min-h-[40vh]"
    @action="!isClosed && (openAddProduct = true)"
  />

  <section v-else>
    <div
      class="mt-4 space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 pb-8 md:border md:bg-white"
    >
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          All Products <Chip :label="popupInventory?.length || 0" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="sm"
            class="w-full md:min-w-64"
            placeholder="Search by name"
            v-model="searchQuery"
          />

          <AppButton
            v-if="!isClosed"
            icon="add"
            size="sm"
            class="flex-shrink-0"
            :label="isMobile ? '' : 'Add Product'"
            @click="openAddProduct = true"
          />
        </div>
      </div>

      <DataTable
        :data="popupInventory || []"
        :columns="POPUP_INVENTORY_COLUMNS"
        :loading="isPending || isFetching"
        :show-pagination="false"
      >
        <template #cell:name="{ item }">
          <ProductAvatar
            :name="item.name"
            shape="rounded"
            :url="item.images?.[0]?.image"
            :variants-count="item.variants?.length"
          />
        </template>

        <template #cell:total_stock="{ value }">
          <span class="text-sm font-semibold">{{ value }}</span>
        </template>

        <template #cell:is_visible="{ item }">
          <Chip
            showDot
            :label="getInventoryVisibility(item)"
            :color="
              getInventoryVisibility(item) === 'Available'
                ? 'success'
                : getInventoryVisibility(item) === 'Unavailable'
                  ? 'error'
                  : 'primary'
            "
            size="sm"
          />
        </template>

        <template #cell:action="{ item }">
          <div class="flex items-center gap-2">
            <DropdownMenu
              v-if="!isClosed"
              :items="getActionMenu(item)"
              size="sm"
              @action="(action: string) => handleAction(action, item)"
            />
          </div>
        </template>

        <!-- mobile view cell templates -->
        <template #mobile="{ item }">
          <div :class="['border-warning-200 cursor-pointer rounded-xl border']">
            <div class="bg-warning-50 flex items-center gap-2.5 rounded-t-xl p-2">
              <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
                <img
                  v-if="item.images?.[0]?.image"
                  :src="item.images?.[0]?.image"
                  :alt="item.name"
                  class="h-full w-full rounded-xl object-cover"
                  loading="lazy"
                />
                <Icon v-else name="shop-add" :size="24" class="text-primary-700" />
              </span>
              <h3 class="!font-outfit truncate text-sm font-medium">
                {{ item.name }}
              </h3>
              <span class="ml-auto" />
              <span class="text-base font-semibold">{{ getPopupPriceRange(item) }}</span>
              <DropdownMenu
                v-if="!isClosed"
                :items="getActionMenu(item)"
                size="sm"
                @action="(action: string) => handleAction(action, item)"
              />
            </div>
            <div class="flex flex-wrap items-center gap-2 p-5 pb-3">
              <Chip
                icon="box"
                :color="getStockStatus(item).color"
                :label="getStockStatus(item).label"
              />
              <Chip
                v-if="item.variants?.length > 1"
                icon="shapes"
                color="blue"
                :label="`${item.variants.length} Variants`"
              />
              <Chip
                showDot
                :label="getInventoryVisibility(item)"
                :color="
                  getInventoryVisibility(item) === 'Available'
                    ? 'success'
                    : getInventoryVisibility(item) === 'Unavailable'
                      ? 'error'
                      : 'primary'
                "
                size="sm"
              />
            </div>
          </div>
        </template>
      </DataTable>
    </div>
  </section>

  <!-- Setup Booth Drawer - Available for both empty and populated states -->
  <SetupPopupBoothDrawer
    :open="openAddProduct"
    :existing-variant-skus="existingVariantSkus"
    @close="openAddProduct = false"
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
        ? 'You can always add the product back later if needed.'
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
