<template>
  <PageHeader title="Inventory" :count="products?.data?.count" count-label="products" />

  <div class="p-4 pt-5 md:pt-4">
    <div class="hidden lg:block">
      <SectionHeader
        title="Inventory"
        subtitle="Manage and organize your product catalog efficiently."
        class="mb-4 md:mb-6"
      />
    </div>

    <!-- Mobile summary (LYW-2692): a large plain Stock Value stat on top, then exactly
         two cards — Low Stock and Stale Products. Do NOT render the full metric grid
         on mobile; the 4-card grid is desktop-only (block below). -->
    <div class="lg:hidden">
      <div v-if="canViewStockValue" class="mb-4">
        <div v-if="isLoadingDashboard" class="animate-pulse space-y-2">
          <div class="h-4 w-24 rounded bg-gray-200" />
          <div class="h-9 w-32 rounded bg-gray-200" />
        </div>
        <template v-else>
          <p class="text-core-600 flex items-center gap-1.5 text-sm">
            <Icon name="dollar-circle" size="18" />
            Stock Value
          </p>
          <p class="text-core-800 mt-1 text-4xl font-bold">
            {{ truncate(productDashboard?.total_stock_value ?? 0) }}
          </p>
        </template>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <StatCard
          v-for="item in mobileMetrics"
          :key="item.label"
          :stat="item"
          :loading="isLoadingDashboard"
        />
      </div>
    </div>

    <!-- Desktop summary: full metric grid -->
    <div
      class="hidden gap-4 lg:grid"
      :class="productMetrics.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'"
    >
      <StatCard
        v-for="item in productMetrics"
        :key="item.label"
        :stat="item"
        :loading="isLoadingDashboard"
      />
    </div>

    <!-- Product/request tabs for multi-location stores -->
    <div v-if="locationsCount > 1" class="mt-6 w-full md:w-1/2">
      <Tabs :tabs="tabs" v-model="activeTab" />
    </div>

    <!-- Requests Tab Content -->
    <InventoryRequests v-if="activeTab === 'requests'" @request-click="handleRequestClick" />

    <!-- Products Tab Content -->
    <template v-if="activeTab === 'products'">
      <!-- Always visible content with search bar -->
      <div class="mt-4 space-y-4 rounded-xl border-gray-200 pt-3 md:border md:bg-white">
        <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
          <h3 class="mb-2 hidden items-center gap-1 text-lg font-semibold md:mb-0 md:flex">
            All Products <Chip :label="String(products?.data?.count || 0)" />
          </h3>
          <div class="flex items-center gap-2">
            <TextField
              :model-value="search"
              @update:model-value="(val) => (search = val)"
              left-icon="search-lg"
              size="sm"
              class="flex-1"
              placeholder="Search by name or category..."
            />
            <AppButton
              icon="filter-lines"
              size="sm"
              :color="productFilterCount ? 'primary' : 'alt'"
              :variant="productFilterCount ? 'outlined' : 'filled'"
              label="Filter"
              :badge="productFilterCount || undefined"
              class="!hidden md:!inline-flex"
              @click="showFilterDrawer = true"
            />
            <AppButton
              icon="filter-lines"
              size="sm"
              :color="productFilterCount ? 'primary' : 'alt'"
              :variant="productFilterCount ? 'outlined' : 'filled'"
              label=""
              :badge="productFilterCount || undefined"
              class="md:hidden"
              @click="showFilterDrawer = true"
            />
            <AppButton
              v-if="isHQ"
              icon="add"
              size="sm"
              label="Add Product"
              @click="openAddProductDrawer"
              class="!hidden md:!inline-flex"
            />
            <AppButton
              v-if="isHQ"
              icon="add"
              size="sm"
              label=""
              @click="openAddProductDrawer"
              class="md:hidden"
            />
          </div>
        </div>

        <!-- Empty State: Only show when no products exist AND no search/filters are active -->
        <EmptyState
          v-if="
            !isPending &&
            filteredProducts.length === 0 &&
            !search &&
            activeFilters.category === null &&
            activeFilters.status === null &&
            activeFilters.subCategory === null
          "
          icon="box"
          title="No products found"
          :description="
            isHQ
              ? 'Start adding products to manage your inventory.'
              : 'No products are available at this location.'
          "
          :action-label="isHQ ? 'Add Product' : undefined"
          :action-icon="isHQ ? 'add' : undefined"
          @action="openAddProductDrawer"
        />

        <!-- DataTable: Show when loading OR when there are results OR when search/filters are active -->
        <DataTable
          v-else
          :data="filteredProducts"
          :columns="PRODUCT_COLUMNS"
          :loading="isFetching"
          :show-pagination="true"
          :items-per-page="itemsPerPage"
          :current-page="page"
          :total-items-count="products?.data?.count || 0"
          :total-page-count="Math.ceil((products?.data?.count || 0) / itemsPerPage) || 1"
          :server-pagination="true"
          @row-click="handleRowClick"
          @pagination-change="(d) => (page = d.currentPage)"
        >
          <template #cell:name="{ item }">
            <div class="flex min-w-0 items-center gap-2">
              <ProductAvatar
                :name="item.name"
                :url="item.primary_image?.image || undefined"
                :variants-count="item.variants_count > 1 ? item.variants_count : undefined"
                shape="rounded"
                class="min-w-0 flex-1"
              />
              <Chip
                v-if="isHQ && (item.popup_quantity_taken ?? 0) > 0"
                icon="calendar-tick"
                color="warning"
                size="sm"
                class="flex-shrink-0"
                :label="`${item.popup_quantity_taken} in Popups`"
              />
              <Icon
                v-if="item.is_hidden_from_storefront"
                name="eye-slash-outline"
                size="16"
                class="flex-shrink-0 text-gray-500"
              />
            </div>
          </template>

          <template #cell:category="{ value }">
            <div class="max-w-48">
              <Chip :label="String(value) || 'Uncategorized'" icon="tag" color="purple" size="sm" />
            </div>
          </template>

          <template #cell:sellable_stock="{ value }">
            <span class="text-sm font-semibold">{{ value }}</span>
          </template>

          <template #cell:status="{ item }">
            <Chip
              showDot
              :label="getStockStatus(item).label"
              :color="getStockStatus(item).color"
              size="sm"
            />
          </template>

          <template #cell:price="{ value }">
            <span class="text-core-600 text-sm">{{ formatPriceRange(value) }}</span>
          </template>

          <template #cell:action="{ item }">
            <div class="flex items-center gap-2">
              <DropdownMenu
                :items="getActionItems(item)"
                placement="bottom-end"
                :show-chevron="false"
                size="sm"
                trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
                @click.stop
              >
                <template #trigger>
                  <Icon name="dots-vertical" />
                </template>
              </DropdownMenu>
            </div>
          </template>

          <!-- mobile view cell templates -->
          <template #mobile="{ item }">
            <ProductCard
              @click="handleRowClick(item)"
              :product="item"
              :action-items="getActionItems(item)"
            />
          </template>
        </DataTable>
      </div>
    </template>

    <!-- modals -->
    <ConfirmationModal
      v-model="showDeleteConfirmationModal"
      @close="showDeleteConfirmationModal = false"
      header="Delete Product"
      paragraph="Are you sure you want to delete this product?"
      variant="error"
      @confirm="handleDeleteProduct"
      :loading="isDeletingProduct"
    />
    <ConfirmationModal
      v-model="showHideConfirmationModal"
      @close="showHideConfirmationModal = false"
      :header="product?.is_hidden_from_storefront ? 'Unhide Product' : 'Hide Product'"
      :paragraph="
        product?.is_hidden_from_storefront
          ? 'Are you sure you want to make this product visible on the storefront? Customers will be able to see and purchase it.'
          : 'Are you sure you want to hide this product from the storefront? Customers will not be able to see or purchase it.'
      "
      :variant="product?.is_hidden_from_storefront ? 'success' : 'warning'"
      info-box-variant="neutral"
      :action-label="product?.is_hidden_from_storefront ? 'Unhide' : 'Hide'"
      :loading="isUpdatingProduct"
      @confirm="handleToggleVisibility"
    />
    <!-- <ExportProductModal v-model="showExportProductModal" @close="showExportProductModal = false" /> -->

    <!-- drawers  -->
    <ProductFormDrawer
      v-if="showProductFormDrawer"
      v-model="showProductFormDrawer"
      :source-product-uid="productUidForDuplicate"
    />
    <ProductEditDrawer
      v-if="showProductEditDrawer"
      ref="productEditDrawerRef"
      v-model="showProductEditDrawer"
      :product="product"
      :edit-mode="editMode"
      :variant="variantForEdit"
      :variant-attribute-keys="variantAttributeKeysForEdit"
      @add-category="showAddCategoryModal = true"
      @edit-variant-details="handleEditVariantDetails"
    />
    <FilterDrawer
      v-if="showFilterDrawer || hasOpenedFilterDrawer"
      v-model="showFilterDrawer"
      @apply="handleApplyFilters"
    />

    <!-- Modals -->
    <AddCategoryModal
      v-model="showAddCategoryModal"
      :teleport="true"
      @success="handleCategoryCreated"
    />
    <ReceiveRequestModal
      v-model="showReceiveRequestModal"
      :open="showReceiveRequestModal"
      :request="selectedRequest"
      @close="showReceiveRequestModal = false"
    />
    <ManageStockModal
      v-if="productDetailsForStock?.data"
      :open="showManageStockModal"
      :product="productDetailsForStock.data"
      @close="showManageStockModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import { TProduct, type IInventoryTransferRequest, type IProductVariantDetails } from "../types"
import { PRODUCT_COLUMNS } from "../constants"
import { ref, computed, watch, nextTick } from "vue"
import { useQueryClient } from "@tanstack/vue-query"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import { toast } from "@/composables/useToast"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import ProductFormDrawer from "../components/ProductFormDrawer.vue"
import ProductEditDrawer from "../components/ProductEditDrawer.vue"
import AddCategoryModal from "../components/AddCategoryModal.vue"
import InventoryRequests from "../components/InventoryRequests.vue"
import ReceiveRequestModal from "../components/ReceiveRequestModal.vue"
import { inventoryCache } from "../cache"
import { inventoryKeys } from "../queryKeys"
import ProductCard from "../components/ProductCard.vue"
import ManageStockModal from "../components/ManageStockModal.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { useUserRoles } from "@/composables/useUserRoles"
import SectionHeader from "@components/SectionHeader.vue"
import PageHeader from "@components/PageHeader.vue"
import Tabs from "@components/Tabs.vue"
import FilterDrawer from "../components/FilterDrawer.vue"
import {
  useGetProducts,
  useDeleteProduct,
  useGetProduct,
  useUpdateProduct,
  useGetProductDashboard,
  useGetTransferRequests,
} from "../api"
import ProductAvatar from "@components/ProductAvatar.vue"
import EmptyState from "@components/EmptyState.vue"
import { displayError } from "@/utils/error-handler"
import router from "@/router"
import { useSettingsStore } from "@modules/settings/store"
import { useRoute } from "vue-router"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { usePremiumAccess } from "@/composables/usePremiumAccess"
import StatCard from "@components/StatCard.vue"

const { format, truncate } = useFormatCurrency()

const formatPriceRange = (
  value: string | number | boolean | Record<string, unknown> | null | undefined,
): string => {
  if (!value || typeof value !== "string") return "-"

  // Split the price range string
  const parts = value.split(" - ")
  if (parts.length !== 2) return "-"

  const minPrice = parseFloat(parts[0])
  const maxPrice = parseFloat(parts[1])

  // If prices are invalid
  if (isNaN(minPrice) || isNaN(maxPrice)) return "-"

  // If min and max are the same, show single price
  if (minPrice === maxPrice) {
    return format(minPrice)
  }

  // Otherwise, show price range
  return `${format(minPrice)} - ${format(maxPrice)}`
}

const page = ref(1)
const itemsPerPage = ref(10)
const search = ref("")
const debouncedSearch = useDebouncedRef(search, 750)

// Active filters
const activeFilters = ref<{
  category: string | null
  status: string | null
  subCategory: string | null
}>({
  category: null,
  status: null,
  subCategory: null,
})

const combinedParams = computed(() => {
  const params: Record<string, string | number> = {
    limit: itemsPerPage.value,
  }
  if (debouncedSearch.value) {
    params.name = debouncedSearch.value
    // Omit offset entirely while searching — sending it breaks product search (LYW-2603).
  } else {
    params.offset = (page.value - 1) * itemsPerPage.value
  }
  if (activeFilters.value.category) params.category = activeFilters.value.category
  if (activeFilters.value.status) params.stock_status = activeFilters.value.status
  if (activeFilters.value.subCategory) params.variant_type = activeFilters.value.subCategory
  return params
})

// isFetching (not just isPending) so the table also shows its loading state during
// background refetches, e.g. right after a successful stock change invalidates the list.
const { data: products, isPending, isFetching } = useGetProducts(combinedParams)
const { data: productDashboard, isPending: isLoadingDashboard } = useGetProductDashboard()
const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct()
const { mutate: updateProduct, isPending: isUpdatingProduct } = useUpdateProduct()
const queryClient = useQueryClient()
const settingsStore = useSettingsStore()
const { checkPremiumAccess } = usePremiumAccess()

// Tabs state
const activeTab = ref("products")
const selectedRequest = ref<IInventoryTransferRequest | null>(null)
const showReceiveRequestModal = ref(false)
const route = useRoute()

// Check if current location is HQ
const isHQ = computed(() => settingsStore.activeLocation?.is_hq || false)
const locationsCount = computed(() => settingsStore.locations?.length || 0)

// Pending transfer-requests count for the Requests tab pill (LYW-2625).
// Fires for any active location in a multi-location store.
// Scoped to requests addressed TO this location (to_location = the location being
// asked to grant; from_location = the requester), so requests this location made
// elsewhere don't inflate the pill.
const pendingRequestParams = computed(() => ({
  status: "pending",
  to_location: settingsStore.activeLocation?.uid || "",
  limit: 1,
}))
const { data: pendingRequests } = useGetTransferRequests(pendingRequestParams, {
  enabled: () => locationsCount.value > 1 && !!settingsStore.activeLocation?.uid,
})
const pendingRequestsCount = computed(() => pendingRequests.value?.data?.count || 0)

// Tabs configuration
const tabs = computed(() => [
  { key: "products", title: "Products" },
  { key: "requests", title: "Requests", count: pendingRequestsCount.value },
])

const showDeleteConfirmationModal = ref(false)
const showHideConfirmationModal = ref(false)
const showProductFormDrawer = ref(false)
const showProductEditDrawer = ref(false)
const showFilterDrawer = ref(false)
const hasOpenedFilterDrawer = ref(false)
const product = ref<TProduct | null>(null)
const showAddCategoryModal = ref(false)

const productEditDrawerRef = ref<{
  setCategoryFromModal: (category: { label: string; value: string }) => void
} | null>(null)

// Manage stock modal state
const showManageStockModal = ref(false)
// LYW-2443: holds the source product UID when "Duplicate Product" is clicked
const productUidForDuplicate = ref<string | null>(null)
const editMode = ref<"product-details" | "variant-details" | "variants" | "images">(
  "product-details",
)
const variantForEdit = ref<IProductVariantDetails | null>(null)
const variantAttributeKeysForEdit = ref<string[]>([])
const productUidForManageStock = ref<string | null>(null)
const productUidForEdit = ref<string | null>(null)

// Fetch product details for manage stock modal. Gate on the selected product UID
// (not the modal-open flag) so the query stays active through the post-mutation
// refetch and isn't disabled in the same tick the cache is invalidated (LYW-2647).
const productUidForFetch = computed(() => productUidForManageStock.value || "")
const { data: productDetailsForStock } = useGetProduct(productUidForFetch, {
  enabled: () => !!productUidForManageStock.value,
})

// Fetch product details for edit drawer when needed
const productUidForEditFetch = computed(() => productUidForEdit.value || "")
const { data: productDetailsForEdit } = useGetProduct(productUidForEditFetch)

// Watch for product details to be loaded and set variant for edit
watch(
  () => productDetailsForEdit.value,
  (details) => {
    // Only process if we have a pending edit request and drawer is not already open
    if (
      details?.data &&
      editMode.value === "variant-details" &&
      productUidForEdit.value &&
      !showProductEditDrawer.value
    ) {
      // Set the first variant for editing
      variantForEdit.value = details.data.variants[0] || null
      // Update product with fetched details
      if (details.data) {
        product.value = {
          uid: details.data.uid,
          name: details.data.name,
          total_stock: details.data.total_stock,
          sellable_stock: details.data.variants.reduce(
            (sum, v) => sum + (v.sellable_stock || 0),
            0,
          ),
          needs_reorder: details.data.needs_reorder,
          variants_count: details.data.variants.length,
          is_active: details.data.is_active,
          is_hidden_from_storefront: details.data.is_hidden_from_storefront,
          category: details.data.category,
          created_at: details.data.created_at,
          primary_image: null,
          price: details.data.variants[0]?.price || null,
          amount_sold: 0,
          quantity_sold: 0,
          memo_count: 0,
          return_count: 0,
        }
      }
      // Open the drawer after data is loaded
      setTimeout(() => {
        showProductEditDrawer.value = true
      }, 0)
    }
  },
)

// Clear edit state when drawer closes to prevent stale data issues
watch(
  () => showProductEditDrawer.value,
  (isOpen) => {
    if (!isOpen) {
      // Clear the edit request when drawer closes
      productUidForEdit.value = null
      variantForEdit.value = null
      variantAttributeKeysForEdit.value = []
    }
  },
)

const handleRowClick = (clickedProduct: TProduct) => {
  router.push({ name: "Product-Details", params: { uid: clickedProduct.uid } })
}

const { canViewStockValue } = useUserRoles()

const productMetrics = computed(() => {
  const stats = productDashboard.value

  const cards = [
    {
      label: "Total Products",
      value: stats?.total_products ?? 0,
      icon: "box-filled",
      iconClass: "text-success-500",
      percentage: 0,
    },
    ...(canViewStockValue.value
      ? [
          {
            label: "Stock Value",
            value: truncate(stats?.total_stock_value ?? 0),
            icon: "moneys",
            iconClass: "text-bloom-700",
            percentage: 0,
          },
        ]
      : []),
    {
      label: "Low Stock",
      value: stats?.low_stock_count ?? 0,
      icon: "box-time",
      iconClass: "text-warning-500",
      percentage: 0,
    },
    {
      label: "Stale Products",
      value: stats?.stale_products_count ?? 0,
      icon: "box-filled",
      iconClass: "text-error-500",
      percentage: 0,
    },
  ]

  return cards
})

// Mobile shows ONLY these two summary cards; Stock Value renders as the hero stat
// above them and Total Products lives in the page header count (LYW-2692).
const mobileMetrics = computed(() =>
  productMetrics.value.filter((m) => m.label === "Low Stock" || m.label === "Stale Products"),
)

const getStockStatus = (item: TProduct) => {
  if (item.sellable_stock === 0) {
    return { label: "Out of Stock", color: "error" as const }
  } else if (item.needs_reorder) {
    return { label: "Low Stock", color: "warning" as const }
  } else {
    return { label: "In Stock", color: "success" as const }
  }
}

// Helper functions for edit operations
const openProductEditDrawer = (item: TProduct) => {
  product.value = { ...item }
  editMode.value = "product-details"
  variantAttributeKeysForEdit.value = []
  setTimeout(() => {
    showProductEditDrawer.value = true
  }, 0)
}

const openImagesEditDrawer = (item: TProduct) => {
  product.value = { ...item }
  editMode.value = "images"
  variantAttributeKeysForEdit.value = []
  setTimeout(() => {
    showProductEditDrawer.value = true
  }, 0)
}

const openPriceWeightEdit = (item: TProduct, variantAttributeKeys: string[] = []) => {
  // Set edit mode first
  editMode.value = "variant-details"
  variantAttributeKeysForEdit.value = variantAttributeKeys
  // Trigger fetch of full product details (watcher will handle opening drawer)
  productUidForEdit.value = item.uid
}

const openVariantsManage = (item: TProduct) => {
  product.value = { ...item }
  editMode.value = "variants"
  variantAttributeKeysForEdit.value = []
  setTimeout(() => {
    showProductEditDrawer.value = true
  }, 0)
}

// After the variants step saves, reopen the drawer in price & weight mode so the
// newly added variants get their selling price — mirrors the product details page
// flow (LYW-2679). nextTick lets the drawer-close watcher clear stale edit state
// before we set up the follow-up edit.
const handleEditVariantDetails = (variantAttributeKeys: string[]) => {
  const item = product.value
  if (!item) return
  void nextTick(async () => {
    // Ensure the just-saved variants are in the cache before the drawer reopens
    await queryClient.refetchQueries({ queryKey: inventoryKeys.products.detail(item.uid) })
    openPriceWeightEdit(item, variantAttributeKeys)
  })
}

const openManageStockModal = (item: TProduct) => {
  productUidForManageStock.value = item.uid
  showManageStockModal.value = true
}

const getActionItems = (item: TProduct) => {
  // Child locations can only view products and manage stock
  if (!isHQ.value) {
    return [
      {
        id: "view",
        label: "View Product",
        icon: "eye-outline",
        action: () => handleAction("view", item),
      },
      {
        id: "manage-stock",
        label: "Manage Stock",
        icon: "edit",
        action: () => openManageStockModal(item),
      },
    ]
  }

  // HQ has full access to all actions
  return [
    {
      id: "view",
      label: "View Product",
      icon: "eye-outline",
      action: () => handleAction("view", item),
    },
    {
      id: "duplicate",
      label: "Duplicate Product",
      icon: "copy",
      action: () => handleAction("duplicate", item),
    },
    {
      divider: true,
    },
    {
      id: "edit-basic",
      label: "Edit Basic Details",
      icon: "edit",
      action: () => openProductEditDrawer(item),
    },
    {
      id: "edit-images",
      label: "Edit Images",
      icon: "edit",
      action: () => openImagesEditDrawer(item),
    },
    {
      id: "edit-price",
      label: "Edit Price & Weight",
      icon: "edit",
      action: () => openPriceWeightEdit(item),
    },
    ...(item.variants_count > 1
      ? [
          {
            id: "manage-variants",
            label: "Manage Variants",
            icon: "edit",
            action: () => openVariantsManage(item),
          },
        ]
      : []),
    {
      id: "manage-stock",
      label: "Manage Stock",
      icon: "edit",
      action: () => openManageStockModal(item),
    },
    {
      divider: true,
    },
    item.is_hidden_from_storefront
      ? {
          id: "unhide",
          label: "Unhide Product",
          icon: "eye-outline",
          action: () => handleAction("unhide", item),
        }
      : {
          id: "hide",
          label: "Hide Product",
          icon: "eye-slash-outline",
          action: () => handleAction("hide", item),
        },
    {
      id: "delete",
      label: "Delete Product",
      icon: "trash",
      class: "text-red-600 hover:bg-red-50",
      iconClass: "text-red-600",
      action: () => handleAction("delete", item),
    },
  ]
}

const handleAction = (
  action: "duplicate" | "view" | "delete" | "activate" | "deactivate" | "hide" | "unhide",
  item: TProduct,
) => {
  console.log(action, item)

  if (action === "delete") {
    product.value = item
    showDeleteConfirmationModal.value = true
  } else if (action === "hide" || action === "unhide") {
    product.value = item
    showHideConfirmationModal.value = true
  } else if (action === "view") {
    router.push({ name: "Product-Details", params: { uid: item.uid } })
  } else if (action === "duplicate") {
    if (!checkPremiumAccess()) return
    productUidForDuplicate.value = item.uid
    showProductFormDrawer.value = true
  }
}

// Handle product deletion
const handleDeleteProduct = () => {
  if (!product.value) return

  const deletedUid = product.value.uid
  deleteProduct(deletedUid, {
    onSuccess: () => {
      toast.success("Product deleted successfully")
      showDeleteConfirmationModal.value = false
      product.value = null
      inventoryCache.productDeleted(queryClient, deletedUid)
    },
    onError: displayError,
  })
}

// Handle toggling product visibility (hide/unhide)
const handleToggleVisibility = () => {
  if (!product.value) return

  const isCurrentlyHidden = product.value.is_hidden_from_storefront
  const newHiddenState = !isCurrentlyHidden
  const toggledUid = product.value.uid

  updateProduct(
    { uid: toggledUid, is_hidden_from_storefront: newHiddenState },
    {
      onSuccess: () => {
        toast.success(
          newHiddenState
            ? "Product hidden from storefront"
            : "Product is now visible on storefront",
        )
        showHideConfirmationModal.value = false
        product.value = null
        inventoryCache.productUpdated(queryClient, toggledUid)
      },
      onError: displayError,
    },
  )
}

// Function to handle opening add product drawer
const openAddProductDrawer = () => {
  // Check premium access before opening drawer
  if (!checkPremiumAccess()) return

  showProductFormDrawer.value = true
  if (route.query.create !== "true") {
    router.replace({ name: "Inventory", query: { create: "true" } })
  }
}

const handleCategoryCreated = (category: { label: string; value: string }) => {
  showAddCategoryModal.value = false

  // Only handle ProductEditDrawer category updates here
  if (showProductEditDrawer.value && productEditDrawerRef.value) {
    productEditDrawerRef.value.setCategoryFromModal(category)
  }
}

// Request handlers
const handleRequestClick = (request: IInventoryTransferRequest) => {
  selectedRequest.value = request
  showReceiveRequestModal.value = true
}

// Watch for route query to open create modal/drawer
watch(
  () => route.query.create,
  (newVal) => {
    if (newVal === "true") {
      openAddProductDrawer()
    }
  },
  { immediate: true },
)

watch(showProductFormDrawer, (isOpen) => {
  if (!isOpen) {
    productUidForDuplicate.value = null
    if (route.query.create === "true") {
      router.replace({ name: "Inventory", query: {} })
    }
  }
})

// Clear product UID for edit when drawer is closed
watch(showProductEditDrawer, (isOpen) => {
  if (!isOpen) {
    productUidForEdit.value = null
    variantForEdit.value = null
    router.replace({ name: "Inventory", query: {} })
  }
})

// Clear the product UID a short while after the modal closes so the detail query
// goes inactive eventually, but stays active long enough for the post-mutation
// refetch (invalidated on success while the modal was still open) to land in the
// cache — otherwise reopening shows stale stock (LYW-2647).
watch(showManageStockModal, (isOpen) => {
  if (!isOpen) {
    setTimeout(() => {
      if (!showManageStockModal.value) productUidForManageStock.value = null
    }, 1500)
  }
})

// Track if filter drawer has ever been opened to prevent mount flash
watch(showFilterDrawer, (isOpen) => {
  if (isOpen) {
    hasOpenedFilterDrawer.value = true
  }
})

const productFilterCount = computed(() => {
  let count = 0
  if (activeFilters.value.category !== null) count++
  if (activeFilters.value.status !== null) count++
  if (activeFilters.value.subCategory !== null) count++
  return count
})

// Handle filter application
const handleApplyFilters = (filters: {
  category: string | null
  status: string | null
  subCategory: string | null
}) => {
  activeFilters.value = filters
  page.value = 1
}

// Products from server (filtering is now server-side)
const filteredProducts = computed(() => products.value?.data?.results || [])
</script>
