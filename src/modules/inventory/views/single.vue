<template>
  <div class="text-core-800 p-4 py-8">
    <PageHeader title="Product Details" inner />

    <ProductDetailsSkeleton v-if="isPending" />

    <EmptyState
      v-else-if="!product && !isPending"
      class="my-20"
      title="Product not found."
      description="The product you are looking for does not exist."
      action-label="Go to Inventory"
      action-icon="box-outline"
      @action="$router.push({ name: 'Inventory' })"
    />

    <div v-else>
      <div class="flex flex-col justify-between gap-3">
        <div class="flex items-center gap-2">
          <h5 class="text-core-700 !font-outfit font-regular text-lg md:text-xl md:font-semibold">
            {{ product?.data.name }}
          </h5>
          <Icon
            v-if="product?.data.is_hidden_from_storefront"
            name="eye-slash-outline"
            size="20"
            class="flex-shrink-0 text-gray-500"
          />

          <div class="flex-1" />

          <div class="flex items-center gap-1">
            <AppButton
              v-if="isHQ"
              label="Edit Images"
              icon="edit"
              variant="outlined"
              color="alt"
              class="!hidden bg-white lg:!inline-flex"
              @click="openImagesEditDrawer"
            />
            <DropdownMenu :items="actionItems" placement="bottom-end" :show-chevron="false">
              <template #trigger>
                <AppButton
                  :label="'Manage Product'"
                  icon="settings-02"
                  variant="outlined"
                  icon-placement="left"
                  class="!hidden lg:!inline-flex"
                />
                <AppButton icon="dots-vertical" variant="outlined" class="lg:!hidden" />
              </template>
            </DropdownMenu>
          </div>
        </div>
        <div class="inline-flex flex-wrap gap-2">
          <Chip
            v-if="product?.data.category_name"
            color="purple"
            icon="tag"
            :label="product.data.category_name"
          />
          <Chip :color="stockStatus.color" :label="stockStatus.label" showDot />
          <Chip v-if="isBestseller" color="error" icon="star-outline" label="Bestseller" />
          <Chip
            v-if="product?.data?.variants && product.data.variants.length > 1"
            color="blue"
            icon="shapes"
            :label="`${product?.data.variants.length} variants`"
          />
        </div>
      </div>

      <!-- Product Images Gallery -->
      <ProductImageGallery
        :images="sortedProductImages"
        :product-name="product?.data.name"
        @open-images-edit="openImagesEditDrawer"
      />

      <Tabs :tabs="tabs" v-model="activeTab" class="mt-5 mb-4 md:mt-8 md:mb-4" />

      <ProductOverview
        v-if="activeTab === 'overview' && product"
        class="mt-6"
        :product="product.data"
        :product-metrics="productMetrics"
        :loading="isPending"
        @edit-details="openProductEditDrawer"
        @edit-pricing="openVariantPricingEdit"
      />

      <ProductVariants
        v-else-if="activeTab === 'variants' && product"
        :product="product.data"
        :variant-columns="VARIANT_COLUMNS"
        :variant-action-items="getVariantActionItems"
        :loading="isPending"
        @variant-action="handleVariantAction"
        @add-variant="handleAddVariant"
      />

      <ProductOrders
        v-else-if="activeTab === 'orders' && product"
        :product="product.data"
        :orders="ordersData?.results || []"
        :order-columns="PRODUCT_ORDER_COLUMNS"
        :loading="isLoadingOrders"
        @create-order="handleCreateOrder"
        @order-action="handleOrderAction"
        @row-click="handleOrderRowClick"
      />

      <ProductMovementLogs
        v-else-if="activeTab === 'movement_logs' && product"
        :product="product.data"
        :movements="movementsData?.data.results || []"
        :movement-columns="
          product.data.variants.length > 1
            ? MOVEMENT_COLUMNS
            : MOVEMENT_COLUMNS.filter((col) => col.accessor !== 'variant')
        "
        :loading="isLoadingMovements"
      />
    </div>

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
      :header="product?.data.is_hidden_from_storefront ? 'Unhide Product' : 'Hide Product'"
      :paragraph="
        product?.data.is_hidden_from_storefront
          ? 'Are you sure you want to make this product visible on the storefront? Customers will be able to see and purchase it.'
          : 'Are you sure you want to hide this product from the storefront? Customers will not be able to see or purchase it.'
      "
      :variant="product?.data.is_hidden_from_storefront ? 'success' : 'warning'"
      info-box-variant="neutral"
      :action-label="product?.data.is_hidden_from_storefront ? 'Unhide' : 'Hide'"
      @confirm="handleToggleVisibility"
      :loading="isUpdatingProduct"
    />

    <AddReduceStockModal
      v-if="selectedVariant"
      :key="`stock-modal-${selectedVariant.uid}`"
      :open="showAddReduceStockModal"
      :type="stockModalType"
      :variant-uid="selectedVariant.uid"
      :product-name="product?.data.name || ''"
      :variant-attributes="selectedVariant.attributes"
      :variant-price="selectedVariant.price"
      :available-stock="selectedVariant.sellable_stock || selectedVariant.available_stock || 0"
      @close="showAddReduceStockModal = false"
      @success="handleStockSuccess"
    />

    <TransferRequestStockDrawer
      v-if="selectedVariant"
      :open="showTransferRequestDrawer"
      :type="transferRequestType"
      :variant-uid="selectedVariant.uid"
      :product-name="product?.data.name || ''"
      :variant-attributes="selectedVariant.attributes"
      :variant="selectedVariant"
      :product="product?.data"
      @close="showTransferRequestDrawer = false"
      @success="handleStockSuccess"
    />

    <!-- Product Edit Drawer -->
    <ProductEditDrawer
      ref="productEditDrawerRef"
      v-model="showProductEditDrawer"
      :product="productForEdit"
      :edit-mode="editMode"
      :variant="variantForEdit"
      :loading="isFetching"
      @refresh="handleStockSuccess"
      @add-category="showAddCategoryModal = true"
      @edit-variant-details="handleEditVariantDetails"
    />

    <!-- Add Category Modal -->
    <AddCategoryModal v-model="showAddCategoryModal" @success="handleCategoryCreated" />

    <!-- Manage Stock Modal -->
    <ManageStockModal
      v-if="product"
      :open="showManageStockModal"
      :product="product.data"
      @close="showManageStockModal = false"
      @success="handleStockSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"
import PageHeader from "@components/PageHeader.vue"
import { useGetProduct, useDeleteProduct, useUpdateProduct } from "../api"
import { useRoute, useRouter } from "vue-router"
import DropdownMenu from "@components/DropdownMenu.vue"
import { ref, computed, watch, onMounted } from "vue"
import Chip from "@components/Chip.vue"
import Tabs from "@components/Tabs.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import ProductDetailsSkeleton from "../components/skeletons/ProductDetailsSkeleton.vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useQueryClient } from "@tanstack/vue-query"
import EmptyState from "@components/EmptyState.vue"
import { VARIANT_COLUMNS, PRODUCT_ORDER_COLUMNS, MOVEMENT_COLUMNS } from "../constants"
import type { IProductVariantDetails } from "../types"
import ProductOverview from "../components/ProductOverview.vue"
import ProductVariants from "../components/ProductVariants.vue"
import ProductOrders from "../components/ProductOrders.vue"
import ProductMovementLogs from "../components/ProductMovementLogs.vue"
import AddReduceStockModal from "../components/AddReduceStockModal.vue"
import TransferRequestStockDrawer from "../components/TransferRequestStockDrawer.vue"
import ManageStockModal from "../components/ManageStockModal.vue"
import type { TOrder } from "@modules/orders/types"
import { useSettingsStore } from "@modules/settings/store"
import { useGetOrders } from "@modules/orders/api"
import { useGetProductMovements } from "../api"
import AppButton from "@components/AppButton.vue"
import ProductEditDrawer from "../components/ProductEditDrawer.vue"
import AddCategoryModal from "../components/AddCategoryModal.vue"
import ProductImageGallery from "../components/ProductImageGallery.vue"
import type { TProduct } from "../types"

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const settingsStore = useSettingsStore()
const isHQ = computed(() => settingsStore.activeLocation?.is_hq ?? true)
const uid = Array.isArray(route.params.uid) ? route.params.uid[0] : route.params.uid
const { data: product, isPending, isFetching } = useGetProduct(uid)
const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct()
const { mutate: updateProduct, isPending: isUpdatingProduct } = useUpdateProduct()

const orderParams = computed(() => ({
  product: uid,
}))
const { data: ordersData, isPending: isLoadingOrders } = useGetOrders(orderParams)

const {
  data: movementsData,
  isPending: isLoadingMovements,
  refetch: refetchMovements,
} = useGetProductMovements(uid)

// Initialize activeTab from query parameter or default to "overview"
const activeTab = ref((route.query.tab as string) || "overview")
const showDeleteConfirmationModal = ref(false)
const showHideConfirmationModal = ref(false)
const showAddReduceStockModal = ref(false)
const stockModalType = ref<"add" | "reduce">("add")
const showTransferRequestDrawer = ref(false)
const transferRequestType = ref<"transfer" | "request">("transfer")
const selectedVariant = ref<IProductVariantDetails | null>(null)
const showProductEditDrawer = ref(false)
const productForEdit = ref<TProduct | null>(null)
const editMode = ref<"product-details" | "variant-details" | "variants" | "images">(
  "product-details",
)
const variantForEdit = ref<IProductVariantDetails | null>(null)
const showAddCategoryModal = ref(false)
const showManageStockModal = ref(false)
const productEditDrawerRef = ref<{
  setCategoryFromModal: (category: { label: string; value: string }) => void
} | null>(null)

const openStockModal = (
  type: "add" | "reduce",
  variant: IProductVariantDetails | typeof product.value,
) => {
  if (!isHQ.value) {
    toast.error("Only HQ locations can manually add or reduce stock")
    return
  }

  stockModalType.value = type
  if (variant && "attributes" in variant) {
    selectedVariant.value = variant
  } else {
    // If it's the product (single variant), get the first variant
    selectedVariant.value = product.value?.data.variants[0] || null
  }
  showAddReduceStockModal.value = true
}

const handleStockSuccess = () => {
  queryClient.refetchQueries({ queryKey: ["products", uid] })
  refetchMovements()
}

const openTransferRequestDrawer = (
  type: "transfer" | "request",
  variant: IProductVariantDetails | typeof product.value,
) => {
  transferRequestType.value = type
  if (variant && "attributes" in variant) {
    selectedVariant.value = variant
  } else {
    // If it's the product (single variant), get the first variant
    selectedVariant.value = product.value?.data.variants[0] || null
  }
  showTransferRequestDrawer.value = true
}

const getStockActionItems = (item: IProductVariantDetails | typeof product.value) => {
  // Get available stock
  let availableStock = 0
  if (item && "available_stock" in item) {
    availableStock = item.available_stock || 0
  } else if (product.value?.data.variants.length === 1) {
    availableStock = product.value.data.variants[0].available_stock || 0
  }

  const items = []
  const hasMultipleLocations = (settingsStore.locations?.length || 0) > 1

  // Only HQ can add and reduce stock
  if (isHQ.value) {
    items.push({
      label: "Add Stock",
      icon: "box-add",
      action: (actionItem: IProductVariantDetails | typeof product.value) => {
        openStockModal("add", actionItem)
      },
    })

    // Only show Reduce Stock if stock is available
    if (availableStock > 0) {
      items.push({
        label: "Reduce Stock",
        icon: "box-add",
        action: (actionItem: IProductVariantDetails | typeof product.value) => {
          openStockModal("reduce", actionItem)
        },
      })
    }
  }

  // Only show transfer and request stock if there are multiple locations
  if (hasMultipleLocations) {
    // Any location can transfer stock (if stock is available)
    if (availableStock > 0) {
      items.push({
        label: "Transfer Stock",
        icon: "box",
        action: (actionItem: IProductVariantDetails | typeof product.value) => {
          openTransferRequestDrawer("transfer", actionItem)
        },
      })
    }

    // Any location can request stock
    items.push({
      label: "Request Stock",
      icon: "box-time",
      action: (actionItem: IProductVariantDetails | typeof product.value) => {
        openTransferRequestDrawer("request", actionItem)
      },
    })
  }

  return items
}

const openProductEditDrawer = () => {
  if (!product.value) return

  // Create a TProduct object from the detailed product data
  productForEdit.value = {
    uid: product.value.data.uid,
    name: product.value.data.name,
    total_stock: product.value.data.total_stock,
    sellable_stock: 0,
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    is_hidden_from_storefront: product.value.data.is_hidden_from_storefront,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
    primary_image: null,
    price: null,
    amount_sold: 0,
    quantity_sold: 0,
    memo_count: 0,
    return_count: 0,
  }

  editMode.value = "product-details"
  variantForEdit.value = null
  showProductEditDrawer.value = true
}

const openVariantPricingEdit = (variant: IProductVariantDetails) => {
  if (!product.value) return

  // Create a TProduct object from the detailed product data
  productForEdit.value = {
    uid: product.value.data.uid,
    name: product.value.data.name,
    total_stock: product.value.data.total_stock,
    sellable_stock: 0,
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    is_hidden_from_storefront: product.value.data.is_hidden_from_storefront,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
    primary_image: null,
    price: null,
    amount_sold: 0,
    quantity_sold: 0,
    memo_count: 0,
    return_count: 0,
  }

  // Always open in variant-details mode for price & weight editing
  editMode.value = "variant-details"
  variantForEdit.value = variant

  showProductEditDrawer.value = true
}

const openImagesEditDrawer = () => {
  if (!product.value) return

  // Create a TProduct object from the detailed product data
  productForEdit.value = {
    uid: product.value.data.uid,
    name: product.value.data.name,
    total_stock: product.value.data.total_stock,
    sellable_stock: 0,
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    is_hidden_from_storefront: product.value.data.is_hidden_from_storefront,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
    primary_image: null,
    price: null,
    amount_sold: 0,
    quantity_sold: 0,
    memo_count: 0,
    return_count: 0,
  }

  editMode.value = "images"
  variantForEdit.value = null
  showProductEditDrawer.value = true
}

const openPriceWeightEdit = () => {
  if (!product.value) return

  productForEdit.value = {
    uid: product.value.data.uid,
    name: product.value.data.name,
    total_stock: product.value.data.total_stock,
    sellable_stock: 0,
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    is_hidden_from_storefront: product.value.data.is_hidden_from_storefront,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
    primary_image: null,
    price: null,
    amount_sold: 0,
    quantity_sold: 0,
    memo_count: 0,
    return_count: 0,
  }

  // Always open in variant-details mode for price & weight editing
  editMode.value = "variant-details"
  variantForEdit.value = product.value.data.variants[0] || null

  showProductEditDrawer.value = true
}

const openVariantsManage = () => {
  if (!product.value) return

  productForEdit.value = {
    uid: product.value.data.uid,
    name: product.value.data.name,
    total_stock: product.value.data.total_stock,
    sellable_stock: 0,
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    is_hidden_from_storefront: product.value.data.is_hidden_from_storefront,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
    primary_image: null,
    price: null,
    amount_sold: 0,
    quantity_sold: 0,
    memo_count: 0,
    return_count: 0,
  }

  editMode.value = "variants"
  variantForEdit.value = null
  showProductEditDrawer.value = true
}

const handleEditVariantDetails = () => {
  // Open drawer immediately
  openPriceWeightEdit()

  // Refetch product data in the background
  queryClient.refetchQueries({ queryKey: ["products", uid] })
}

const actionItems = computed(() => {
  const items = []

  if (isHQ.value) {
    items.push(
      {
        label: "Edit Basic Details",
        icon: "edit",
        action: openProductEditDrawer,
      },
      {
        label: "Edit Images",
        icon: "edit",
        action: openImagesEditDrawer,
      },
      {
        label: "Edit Price & Weight",
        icon: "edit",
        action: openPriceWeightEdit,
      },
    )

    if (product?.value?.data.variants && product.value.data.variants.length > 1) {
      items.push({
        label: "Manage Variants",
        icon: "edit",
        action: openVariantsManage,
      })
    }
  }

  items.push({
    label: "Manage Stock",
    icon: "edit",
    action: () => {
      showManageStockModal.value = true
    },
  })

  if (isHQ.value) {
    const isHidden = product?.value?.data.is_hidden_from_storefront

    items.push(
      {
        label: isHidden ? "Unhide Product" : "Hide Product",
        icon: isHidden ? "eye-outline" : "eye-slash-outline",
        action: () => {
          showHideConfirmationModal.value = true
        },
      },
      {
        divider: true,
      },
      {
        label: "Delete Product",
        icon: "trash",
        action: () => {
          showDeleteConfirmationModal.value = true
        },
        class: "text-red-600 hover:bg-red-50",
        iconClass: "text-red-600",
      },
    )
  }

  return items
})

const tabs = computed(() => {
  const baseTabs = [{ key: "overview", title: "Overview" }]

  // Add Variants tab if product has multiple variants
  if (product.value?.data.variants && product.value.data.variants.length > 1) {
    baseTabs.push({ key: "variants", title: "Variants" })
  }

  // const locations = useSettingsStore().locations

  baseTabs.push({ key: "orders", title: "Orders" })

  // if (locations && locations.length > 1) {
  baseTabs.push({ key: "movement_logs", title: "Logs" })
  // }

  return baseTabs
})

const stockStatus = computed(() => {
  if (!product.value?.data) return { color: "primary" as const, label: "Unknown" }

  const variants = product.value.data.variants
  const totalStock = variants.reduce((sum, v) => sum + (v.sellable_stock || 0), 0)

  if (totalStock === 0) {
    return { color: "error" as const, label: "Out of Stock" }
  }

  // Check if any variant needs reorder
  const needsReorder = variants.some((v) => v.needs_reorder)
  if (needsReorder) {
    return { color: "warning" as const, label: "Low Stock" }
  }

  return { color: "success" as const, label: "In Stock" }
})

const isBestseller = computed(() => {
  // No bestseller data available from API, so defaulting to false
  return false
})

const productMetrics = computed(
  (): Array<{
    label: string
    value: number | string | { text: string; boldNumbers?: boolean }
    prev_value: number | string
    icon: string
    chipText?: string | { text: string; boldNumbers?: boolean }
  }> => {
    if (!product.value?.data) return []

    const productData = product.value.data
    const variants = productData.variants

    // Calculate totals from variants
    const totalSellableStock = variants.reduce((sum, v) => sum + (v.sellable_stock || 0), 0)
    const totalReservedStock = variants.reduce((sum, v) => sum + (v.reserved_stock || 0), 0)
    const totalAvailableStock = variants.reduce((sum, v) => sum + (v.available_stock || 0), 0)

    return [
      {
        label: "Actual Inventory",
        value: totalAvailableStock,
        prev_value: 0,
        icon: "shop",
        chipText: undefined,
      },
      {
        label: "Sellable Inventory",
        value: {
          text: `${totalSellableStock} in main`,
          boldNumbers: true,
        },
        prev_value: 0,
        icon: "shopping-cart",
        chipText:
          productData.popup_quantity_taken > 0 && isHQ.value
            ? {
                text: `+${productData.popup_quantity_taken} in popups`,
                boldNumbers: true,
              }
            : undefined,
      },
      {
        label: "Quantity Sold",
        value: productData.quantity_sold || 0,
        prev_value: 0,
        icon: "box-time",
        chipText: undefined,
      },
      {
        label: "Reserved Inventory",
        value: totalReservedStock,
        prev_value: 0,
        icon: "box-time",
        chipText: undefined,
      },
    ]
  },
)

const handleDeleteProduct = () => {
  if (!product.value) return

  deleteProduct(product.value?.data.uid, {
    onSuccess: () => {
      toast.success("Product deleted successfully")
      showDeleteConfirmationModal.value = false
      queryClient.refetchQueries({ queryKey: ["products"] })
      router.push({ name: "Inventory" })
    },
    onError: displayError,
  })
}

const handleToggleVisibility = () => {
  if (!product.value) return

  const isCurrentlyHidden = product.value.data.is_hidden_from_storefront
  const newHiddenState = !isCurrentlyHidden

  updateProduct(
    {
      uid: product.value.data.uid,
      is_hidden_from_storefront: newHiddenState,
    },
    {
      onSuccess: () => {
        toast.success(
          newHiddenState
            ? "Product hidden from storefront"
            : "Product is now visible on storefront",
        )
        showHideConfirmationModal.value = false
        queryClient.refetchQueries({ queryKey: ["products", uid] })
      },
      onError: displayError,
    },
  )
}

const getVariantActionItems = (variant: IProductVariantDetails) => {
  return getStockActionItems(variant).map((item) => ({
    ...item,
    action: () => item.action(variant),
  }))
}

const handleVariantAction = (action: string, variant: IProductVariantDetails) => {
  if (action === "edit") {
    openVariantPricingEdit(variant)
  }
}

const handleAddVariant = () => {
  if (!product.value) return

  // Create a TProduct object from the detailed product data
  productForEdit.value = {
    uid: product.value.data.uid,
    name: product.value.data.name,
    total_stock: product.value.data.total_stock,
    sellable_stock: 0,
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    is_hidden_from_storefront: product.value.data.is_hidden_from_storefront,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
    primary_image: null,
    price: null,
    amount_sold: 0,
    quantity_sold: 0,
    memo_count: 0,
    return_count: 0,
  }

  editMode.value = "variants"
  variantForEdit.value = null
  showProductEditDrawer.value = true
}

const handleCreateOrder = () => {
  console.log("Create order clicked")
}

const handleOrderAction = (action: string, order: TOrder) => {
  console.log("Order action:", action, order)
}

const handleOrderRowClick = (order: TOrder) => {
  console.log("Order row clicked:", order)
}

const handleCategoryCreated = (category: { label: string; value: string }) => {
  showAddCategoryModal.value = false
  if (productEditDrawerRef.value) {
    productEditDrawerRef.value.setCategoryFromModal(category)
  }
}

const sortedProductImages = computed(() => {
  if (!product.value?.data.images) return []

  // Sort images: primary first, then by sort_order
  return [...product.value.data.images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.sort_order - b.sort_order
  })
})

// Watch activeTab and update query parameter
watch(activeTab, (newTab) => {
  // Update the URL query parameter without navigation
  router.replace({
    query: {
      ...route.query,
      tab: newTab,
    },
  })
})

// Watch route query parameter and sync with activeTab
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && typeof newTab === "string" && newTab !== activeTab.value) {
      activeTab.value = newTab
    }
  },
)

// Validate and sync tab on mount
onMounted(() => {
  const validTabs = tabs.value.map((t) => t.key)
  const tabFromQuery = route.query.tab as string

  // If query tab exists but is invalid, reset to overview
  if (tabFromQuery && !validTabs.includes(tabFromQuery)) {
    activeTab.value = "overview"
    router.replace({
      query: {
        ...route.query,
        tab: "overview",
      },
    })
  }
})
</script>
