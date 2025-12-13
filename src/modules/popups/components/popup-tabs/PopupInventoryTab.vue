<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import { useGetPopupInventory, useUpdatePopupProduct } from "@modules/popups/api"
import { POPUP_INVENTORY_COLUMNS } from "@modules/popups/constants"
import { useMediaQuery } from "@vueuse/core"
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import SetupPopupBoothDrawer from "../SetupPopupBoothDrawer.vue"
import AppButton from "@components/AppButton.vue"
import TextField from "@components/form/TextField.vue"
import DataTable from "@components/DataTable.vue"
import ProductAvatar from "@components/ProductAvatar.vue"
import { PopupInventory } from "@modules/popups/types"
import Modal from "@components/Modal.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"

const searchQuery = ref("")
const openAddProduct = ref(false)
const showFilter = ref(false)
const selectedProduct = ref<PopupInventory | null>(null)
const openManageProduct = ref(false)
const showConfirmationModal = ref(false)
const confirmationAction = ref<"enable" | "disable" | null>(null)

// Form data for managing product
const productForm = ref({ price: 0, quantity: 0 })

const route = useRoute()
const isMobile = useMediaQuery("(max-width: 768px)")

const { data: popupInventory, isPending, refetch } = useGetPopupInventory(route.params.id as string)
const { mutate: updatePopupProduct, isPending: isUpdating } = useUpdatePopupProduct()

const isEmpty = computed(() => !popupInventory.value?.length)

const getActionMenu = (item: PopupInventory) => [
  { label: "Manage Product", icon: "eye", action: () => handleAction("Manage Product", item) },
  { divider: true },
  {
    label: item.is_visible ? "Disable Availability" : "Enable Availability",
    icon: item.is_visible ? "eye-slash" : "eye",
    class: item.is_visible
      ? "text-orange-600 hover:bg-orange-50"
      : "text-green-600 hover:bg-green-50",
    iconClass: item.is_visible ? "text-orange-600" : "text-green-600",
    action: () =>
      handleAction(item.is_visible ? "Disable Availability" : "Enable Availability", item),
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
    // Populate form with current product data
    productForm.value = {
      price: Number(item.event_price) || 0,
      quantity: item.quantity || 0,
    }
    openManageProduct.value = true
  } else if (action === "Enable Availability") {
    confirmationAction.value = "enable"
    showConfirmationModal.value = true
  } else if (action === "Disable Availability") {
    confirmationAction.value = "disable"
    showConfirmationModal.value = true
  }
}

const closeManageModal = () => {
  openManageProduct.value = false
  selectedProduct.value = null
}

const saveProductChanges = () => {
  if (!selectedProduct.value) return

  const payload = {
    popup_event: route.params.id as string,
    items: [
      {
        uid: selectedProduct.value.uid,
        event_price: productForm.value.price,
        quantity: productForm.value.quantity,
      },
    ],
  }

  updatePopupProduct(payload, {
    onSuccess: () => {
      toast.success(`Product updated successfully`)
      closeManageModal()
      refetch()
    },
    onError: displayError,
  })
}

const handleConfirmAction = () => {
  if (!selectedProduct.value || !confirmationAction.value) return
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

const closeConfirmationModal = () => {
  showConfirmationModal.value = false
  confirmationAction.value = null
  selectedProduct.value = null
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
    action-label="Add Product"
    class="!min-h-[40vh]"
    @action="
      () => {
        console.log('Add product')
        openAddProduct = true
      }
    "
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
            size="md"
            class="w-full md:min-w-64"
            placeholder="Search by customer or order ref"
            v-model="searchQuery"
          />

          <AppButton
            icon="filter-lines"
            variant="outlined"
            size="sm"
            color="alt"
            class="flex-shrink-0"
            :label="isMobile ? '' : 'Filter'"
            @click="showFilter = true"
          />

          <AppButton
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
        :loading="isPending"
        :show-pagination="false"
      >
        <template #cell:name="{ item }">
          <ProductAvatar
            :name="item.variant_name || item.product_name"
            :url="undefined"
            :variants-count="undefined"
          />
        </template>

        <template #cell:category="{ value }">
          <Chip :label="String(value) || 'Uncategorized'" icon="tag" color="purple" size="sm" />
        </template>

        <template #cell:total_stock="{ value }">
          <span class="text-sm font-semibold">{{ value }}</span>
        </template>

        <template #cell:is_visible="{ value }">
          <Chip
            showDot
            :label="value ? 'Available' : 'Unavailable'"
            :color="value ? 'success' : 'error'"
            size="sm"
          />
        </template>

        <template #cell:price="{ value }">
          <span class="text-core-600 text-sm">{{ value ? formatCurrency(+value) : "-" }}</span>
        </template>

        <template #cell:action="{ item }">
          <DropdownMenu
            :items="getActionMenu(item)"
            size="sm"
            @action="(action: string) => handleAction(action, item)"
          />
        </template>

        <!-- mobile view cell templates -->
        <template #mobile="{ item }">
          <div
            class="bg-core-25 border-core-300 w-full gap-2 overflow-hidden rounded-lg border p-2 md:gap-4"
          >
            <div class="flex items-start gap-2">
              <div class="bg-core-100 flex size-10 items-center justify-center rounded-xl p-2">
                <Icon name="shop-add" class="text-core-600" />
              </div>

              <div class="flex flex-1 flex-col gap-1">
                <h4 class="truncate text-sm font-semibold">{{ item.product_name }}</h4>
                <!-- price range -->
                <div class="flex gap-3 text-sm">
                  {{ formatCurrency(Number(item.event_price)) }}
                </div>
              </div>

              <div>
                <DropdownMenu
                  :items="getActionMenu(item)"
                  size="sm"
                  @action="(action: string) => handleAction(action, item)"
                />
              </div>
            </div>

            <div class="mt-4 flex gap-1">
              <Chip
                showDot
                :label="item.is_visible ? 'Available' : 'Unavailable'"
                :color="item.is_visible ? 'success' : 'error'"
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
    @close="openAddProduct = false"
    @refresh="refetch"
  />

  <!-- Modal to manage price and quantity of a particular product -->
  <Modal
    :open="openManageProduct"
    title="Manage Product"
    max-width="lg"
    variant="bottom-nav"
    @close="closeManageModal"
  >
    <div v-if="selectedProduct" class="rounded-xl bg-white">
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
              <Icon name="box" class="h-3 w-3" />
              {{
                Number(selectedProduct.event_price) > 0
                  ? formatCurrency(Number(selectedProduct.event_price))
                  : "Set price"
              }}
            </span>
          </div>
        </div>
        <Chip
          color="success"
          :label="`${selectedProduct.available_quantity} in Stock`"
          icon="box"
        />
      </div>
      <div class="border-core-200 grid gap-4 border-t p-4">
        <!-- Quantity and Price -->
        <div class="grid grid-cols-2 gap-4">
          <TextField
            v-model="productForm.quantity"
            name="quantity"
            type="number"
            label="Quantity"
            placeholder="1"
            :min="1"
            :max="selectedProduct.available_quantity || 999999"
          />
          <TextField
            v-model="productForm.price"
            name="price"
            type="number"
            label="Event Price"
            placeholder="e.g. 59.99"
            :min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>

    <!-- Modal Actions -->
    <template #footer>
      <div class="flex gap-3">
        <AppButton
          label="Save Changes"
          class="flex-1"
          :loading="isUpdating"
          @click="saveProductChanges"
        />
      </div>
    </template>
  </Modal>

  <!-- Confirmation Modal for Toggle Availability -->
  <ConfirmationModal
    v-model="showConfirmationModal"
    :header="
      confirmationAction === 'enable'
        ? 'Enable Product Availability'
        : 'Disable Product Availability'
    "
    :paragraph="
      confirmationAction === 'enable'
        ? `Are you sure you want to enable availability for '${selectedProduct?.product_name}'? Customers will be able to see and purchase this product.`
        : `Are you sure you want to disable availability for '${selectedProduct?.product_name}'? This product will no longer be visible to customers.`
    "
    :info-message="`You can ${confirmationAction === 'disable' ? 're-activate' : 'de-activate '} it later if needed.`"
    :variant="confirmationAction === 'disable' ? 'warning' : 'success'"
    :action-label="confirmationAction === 'enable' ? 'Enable' : 'Disable'"
    :loading="isUpdating"
    @confirm="handleConfirmAction"
    @close="closeConfirmationModal"
  />
</template>
