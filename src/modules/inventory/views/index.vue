<template>
  <div class="p-4">
    <div class="hidden lg:block">
      <SectionHeader
        title="Inventory"
        subtitle="Manage and organize your product catalog efficiently."
        class="mb-4 md:mb-6"
      />
    </div>

    <!-- Initial Loading State for entire page -->
    <div
      v-if="isGettingProducts && !products"
      class="flex min-h-[70vh] items-center justify-center rounded-xl border-gray-200 md:border md:bg-white md:shadow-xs"
    >
      <Icon name="loader" size="120" class="text-primary-600 animate-spin" />
    </div>

    <!-- Content after loading -->
    <template v-else>
      <div class="hidden items-center justify-between md:flex">
        <h4 class="!font-outfit text-core-700 mb-2 text-xl font-semibold">Your product stats</h4>
      </div>
      <PageSummaryCards
        :items="productMetrics"
        default-icon="bag"
        default-icon-class="text-success-500"
      />

      <!-- Tabs for HQ users -->
      <div class="mt-6 w-full md:w-1/2">
        <Tabs v-if="isHQ" :tabs="tabs" v-model="activeTab" />
      </div>

      <!-- Requests Tab Content -->
      <InventoryRequests
        v-if="activeTab === 'requests' && isHQ"
        :key="requestsRefetchKey"
        @request-click="handleRequestClick"
      />

      <!-- Products Tab Content -->
      <template v-if="activeTab === 'products'">
        <EmptyState
          v-if="!products?.data?.results?.length"
          icon="box"
          title="No products found"
          description="Start adding products to manage your inventory."
          :action-label="isHQ ? 'Add Product' : undefined"
          :action-icon="isHQ ? 'add' : undefined"
          @action="showProductFormDrawer = true"
        />
        <div v-else class="mt-4 space-y-4 rounded-xl border-gray-200 pt-3 md:border md:bg-white">
          <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
            <h3 class="mb-2 hidden items-center gap-1 text-lg font-semibold md:mb-0 md:flex">
              All Products <Chip :label="String(filteredProducts.length)" />
            </h3>
            <div class="flex items-center gap-2">
              <TextField
                v-model="searchQuery"
                left-icon="search-lg"
                size="md"
                class="flex-1"
                placeholder="Search by product name or category"
              />
              <AppButton
                icon="filter-lines"
                size="sm"
                color="alt"
                label="Filter"
                @click="showFilterDrawer = true"
                class="!hidden md:!inline-flex"
              />
              <AppButton
                icon="filter-lines"
                size="sm"
                color="alt"
                label=""
                @click="showFilterDrawer = true"
                class="md:hidden"
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

          <DataTable
            :data="filteredProducts"
            :columns="PRODUCT_COLUMNS"
            :loading="isGettingProducts"
            :show-pagination="false"
            :enable-row-selection="true"
            @row-click="handleRowClick"
          >
            <template #cell:name="{ item }">
              <ProductAvatar
                :name="item.name"
                :url="item.primary_image?.image || undefined"
                :variants-count="item.variants_count > 1 ? item.variants_count : undefined"
                shape="rounded"
              />
            </template>

            <template #cell:category="{ value }">
              <Chip :label="String(value) || 'Uncategorized'" icon="tag" color="purple" size="sm" />
            </template>

            <template #cell:total_stock="{ value }">
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
                <Icon
                  v-if="isHQ"
                  name="copy-01"
                  @click.stop="handleAction('duplicate', item)"
                  class="hidden cursor-pointer hover:text-gray-600 md:inline-block"
                />
                <Icon
                  v-if="isHQ"
                  name="edit"
                  @click.stop="openProductEditDrawer(item)"
                  class="hidden cursor-pointer hover:text-gray-600 md:inline-block"
                />
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
      <!-- <ExportProductModal v-model="showExportProductModal" @close="showExportProductModal = false" /> -->

      <!-- drawers  -->
      <ProductFormDrawer
        ref="productFormDrawerRef"
        v-model="showProductFormDrawer"
        @refresh="refetchProducts"
        @add-category="showAddCategoryModal = true"
      />
      <ProductEditDrawer
        ref="productEditDrawerRef"
        v-model="showProductEditDrawer"
        :product="product"
        :edit-mode="editMode"
        :variant="variantForEdit"
        @refresh="refetchProducts"
        @add-category="showAddCategoryModal = true"
      />
      <FilterDrawer v-model="showFilterDrawer" @apply="handleApplyFilters" />

      <!-- Modals -->
      <AddCategoryModal v-model="showAddCategoryModal" @success="handleCategoryCreated" />
      <ReceiveRequestModal
        v-model="showReceiveRequestModal"
        :open="showReceiveRequestModal"
        :request="selectedRequest"
        @close="showReceiveRequestModal = false"
        @success="handleRequestSuccess"
      />
      <ManageStockModal
        v-if="productDetailsForStock?.data"
        :open="showManageStockModal"
        :product="productDetailsForStock.data"
        @close="showManageStockModal = false"
        @success="refetchProducts"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import { TProduct, type IInventoryTransferRequest, type IProductVariantDetails } from "../types"
import { PRODUCT_COLUMNS } from "../constants"
import { ref, computed, onMounted, watch } from "vue"
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
import ProductCard from "../components/ProductCard.vue"
import ManageStockModal from "../components/ManageStockModal.vue"
import { formatCurrency } from "@/utils/format-currency"
import SectionHeader from "@components/SectionHeader.vue"
import PageSummaryCards from "@components/PageSummaryCards.vue"
import Tabs from "@components/Tabs.vue"
import FilterDrawer from "../components/FilterDrawer.vue"
import { useGetProducts, useDeleteProduct, useGetProduct, useGetCategories } from "../api"
import ProductAvatar from "@components/ProductAvatar.vue"
import EmptyState from "@components/EmptyState.vue"
import { displayError } from "@/utils/error-handler"
import router from "@/router"
import { useSettingsStore } from "@modules/settings/store"
import { useInventoryStore } from "../store"
import { useRoute } from "vue-router"

const { data: products, isFetching: isGettingProducts, refetch: refetchProducts } = useGetProducts()
const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct()
const { data: categories } = useGetCategories()

const settingsStore = useSettingsStore()
const inventoryStore = useInventoryStore()

// Update store when products data changes
watch(
  () => products.value,
  (newProducts: typeof products.value) => {
    if (newProducts?.data) {
      inventoryStore.setProducts(
        newProducts.data.results as TProduct[],
        newProducts.data.count as number,
      )
    }
  },
  { immediate: true },
)

// Tabs state
const activeTab = ref("products")
const selectedRequest = ref<IInventoryTransferRequest | null>(null)
const showReceiveRequestModal = ref(false)
const requestsRefetchKey = ref(0)
const route = useRoute()

// Check if current location is HQ
const isHQ = computed(() => settingsStore.activeLocation?.is_hq || false)

// Tabs configuration
const tabs = computed(() => [
  { key: "products", title: "Products" },
  { key: "requests", title: "Requests" },
])

const showDeleteConfirmationModal = ref(false)
const showProductFormDrawer = ref(false)
const showProductEditDrawer = ref(false)
const showFilterDrawer = ref(false)
const product = ref<TProduct | null>(null)
const showAddCategoryModal = ref(false)
const searchQuery = ref("")

// Active filters
const activeFilters = ref<{
  categories: string[]
  status: string | null
  subCategory: string | null
}>({
  categories: [],
  status: null,
  subCategory: null,
})
const productFormDrawerRef = ref<{
  setCategoryFromModal: (category: { label: string; value: string }) => void
} | null>(null)
const productEditDrawerRef = ref<{
  setCategoryFromModal: (category: { label: string; value: string }) => void
} | null>(null)

// Manage stock modal state
const showManageStockModal = ref(false)
const editMode = ref<"product-details" | "variant-details" | "variants" | "images">(
  "product-details",
)
const variantForEdit = ref<IProductVariantDetails | null>(null)
const productUidForManageStock = ref<string | null>(null)
const productUidForEdit = ref<string | null>(null)

// Fetch product details for manage stock modal
const productUidForFetch = computed(() => productUidForManageStock.value || "")
const { data: productDetailsForStock } = useGetProduct(productUidForFetch, {
  enabled: computed(() => !!productUidForFetch.value),
})

// Fetch product details for edit drawer when needed
const productUidForEditFetch = computed(() => productUidForEdit.value || "")
const { data: productDetailsForEdit } = useGetProduct(productUidForEditFetch, {
  enabled: computed(() => !!productUidForEditFetch.value),
})

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
          needs_reorder: details.data.needs_reorder,
          variants_count: details.data.variants.length,
          is_active: details.data.is_active,
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
    }
  },
)

const handleRowClick = (clickedProduct: TProduct) => {
  router.push({ name: "Product-Details", params: { uid: clickedProduct.uid } })
}

// Calculate metrics from actual API data
const productMetrics = computed(() => {
  const productResults = products.value?.data?.results || []
  const totalProducts = products.value?.data?.count || 0
  const inStockProducts = productResults.filter((p: TProduct) => p.total_stock > 0).length
  const outOfStockProducts = productResults.filter((p: TProduct) => p.total_stock === 0).length
  const needsReorderProducts = productResults.filter((p: TProduct) => p.needs_reorder).length

  return [
    {
      label: "Total Products",
      value: totalProducts,
      prev_value: 0,
      icon: "box-filled",
    },
    {
      label: "In Stock",
      value: inStockProducts,
      prev_value: 0,
      icon: "box",
    },
    {
      label: "Out of Stock",
      value: outOfStockProducts,
      prev_value: 0,
      icon: "box-time",
    },
    {
      label: "Needs Reorder",
      value: needsReorderProducts,
      prev_value: 0,
      icon: "shopping-cart",
    },
  ]
})

const getStockStatus = (item: TProduct) => {
  if (item.total_stock === 0) {
    return { label: "Out of Stock", color: "error" as const }
  } else if (item.needs_reorder) {
    return { label: "Low Stock", color: "warning" as const }
  } else {
    return { label: "In Stock", color: "success" as const }
  }
}

// Format price range from API (e.g., "10000.00 - 20000.00" or "10000.00 - 10000.00")
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
    return formatCurrency(minPrice)
  }

  // Otherwise, show price range
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
}

// Helper functions for edit operations
const openProductEditDrawer = (item: TProduct) => {
  product.value = { ...item }
  editMode.value = "product-details"
  setTimeout(() => {
    showProductEditDrawer.value = true
  }, 0)
}

const openImagesEditDrawer = (item: TProduct) => {
  product.value = { ...item }
  editMode.value = "images"
  setTimeout(() => {
    showProductEditDrawer.value = true
  }, 0)
}

const openPriceWeightEdit = (item: TProduct) => {
  // Set edit mode first
  editMode.value = "variant-details"
  // Trigger fetch of full product details (watcher will handle opening drawer)
  productUidForEdit.value = item.uid
}

const openVariantsManage = (item: TProduct) => {
  product.value = { ...item }
  editMode.value = "variants"
  setTimeout(() => {
    showProductEditDrawer.value = true
  }, 0)
}

const openManageStockModal = (item: TProduct) => {
  productUidForManageStock.value = item.uid
  showManageStockModal.value = true
}

const getActionItems = (item: TProduct) => {
  const items = []

  items.push({
    id: "view",
    label: "View Product",
    icon: "eye-outline",
    action: () => handleAction("view", item),
  })

  if (isHQ.value) {
    items.push(
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
    )

    if (item.variants_count > 1) {
      items.push({
        id: "manage-variants",
        label: "Manage Variants",
        icon: "edit",
        action: () => openVariantsManage(item),
      })
    }
  }

  items.push({
    id: "manage-stock",
    label: "Manage Stock",
    icon: "edit",
    action: () => openManageStockModal(item),
  })

  if (isHQ.value) {
    items.push(
      {
        divider: true,
      },
      {
        id: "delete",
        label: "Delete Product",
        icon: "trash",
        class: "text-red-600 hover:bg-red-50",
        iconClass: "text-red-600",
        action: () => handleAction("delete", item),
      },
    )
  }

  return items
}

const handleAction = (
  action: "duplicate" | "view" | "delete" | "activate" | "deactivate",
  item: TProduct,
) => {
  console.log(action, item)

  if (action === "delete") {
    product.value = item
    showDeleteConfirmationModal.value = true
  } else if (action === "view") {
    router.push({ name: "Product-Details", params: { uid: item.uid } })
  } else if (action === "duplicate") {
    toast.info("Duplicate functionality coming soon")
  }
}

// Handle product deletion - following the customers page pattern
const handleDeleteProduct = () => {
  if (!product.value) return

  deleteProduct(product.value?.uid, {
    onSuccess: () => {
      toast.success("Product deleted successfully")
      showDeleteConfirmationModal.value = false
      product.value = null
      refetchProducts()
    },
    onError: displayError,
  })
}

// Function to handle opening add product drawer
const openAddProductDrawer = () => {
  showProductFormDrawer.value = true
  if (route.query.create !== "true") {
    router.replace({ name: "Inventory", query: { create: "true" } })
  }
}

const handleCategoryCreated = (category: { label: string; value: string }) => {
  showAddCategoryModal.value = false

  // Determine which drawer is currently open and set its category
  if (showProductFormDrawer.value && productFormDrawerRef.value) {
    productFormDrawerRef.value.setCategoryFromModal(category)
  } else if (showProductEditDrawer.value && productEditDrawerRef.value) {
    productEditDrawerRef.value.setCategoryFromModal(category)
  }
}

// Request handlers
const handleRequestClick = (request: IInventoryTransferRequest) => {
  selectedRequest.value = request
  showReceiveRequestModal.value = true
}

const handleRequestSuccess = () => {
  // Increment key to force InventoryRequests component to remount and refetch
  requestsRefetchKey.value++
}

onMounted(() => {
  if (route.query.create === "true") openAddProductDrawer()
})

watch(showProductFormDrawer, (isOpen) => {
  if (!isOpen && route.query.create === "true") {
    router.replace({ name: "Inventory", query: {} })
  }
})

// Clear product UID for edit when drawer is closed
watch(showProductEditDrawer, (isOpen) => {
  if (!isOpen) {
    productUidForEdit.value = null
    variantForEdit.value = null
  }
})

// Create a mapping of category UID to category name
const categoryUidToNameMap = computed(() => {
  const map: Record<string, string> = {}
  const categoryList = categories.value?.data?.results || []
  categoryList.forEach((category: { uid: string; name: string }) => {
    map[category.uid] = category.name
  })
  return map
})

// Handle filter application
const handleApplyFilters = (filters: {
  categories: string[]
  status: string | null
  subCategory: string | null
}) => {
  activeFilters.value = filters
}

// Filtered products based on active filters
const filteredProducts = computed(() => {
  const productResults = products.value?.data?.results || []

  // If no filters or search are active, return all products
  const hasActiveFilters =
    activeFilters.value.categories.length > 0 ||
    activeFilters.value.status !== null ||
    activeFilters.value.subCategory !== null ||
    searchQuery.value.trim() !== ""

  if (!hasActiveFilters) {
    return productResults
  }

  return productResults.filter((product: TProduct) => {
    // Search filter (by name or category)
    if (searchQuery.value.trim() !== "") {
      const query = searchQuery.value.toLowerCase()
      const matchesName = product.name.toLowerCase().includes(query)
      const matchesCategory = product.category?.toLowerCase().includes(query) || false

      if (!matchesName && !matchesCategory) {
        return false
      }
    }

    // Category filter
    if (activeFilters.value.categories.length > 0) {
      // Convert category UIDs to names
      const selectedCategoryNames = activeFilters.value.categories.map(
        (uid) => categoryUidToNameMap.value[uid],
      )

      if (!product.category || !selectedCategoryNames.includes(product.category)) {
        return false
      }
    }

    // Status filter
    if (activeFilters.value.status !== null) {
      const isInStock = product.total_stock > 0
      if (activeFilters.value.status === "in_stock" && !isInStock) {
        return false
      }
      if (activeFilters.value.status === "out_of_stock" && isInStock) {
        return false
      }
    }

    // Sub-category filter (simple vs complex)
    if (activeFilters.value.subCategory !== null) {
      const isSimple = product.variants_count === 1
      if (activeFilters.value.subCategory === "simple" && !isSimple) {
        return false
      }
      if (activeFilters.value.subCategory === "complex" && isSimple) {
        return false
      }
    }

    return true
  })
})
</script>
