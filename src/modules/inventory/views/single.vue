<template>
  <div class="text-core-800 p-4 pb-8">
    <div class="mb-4 flex items-center justify-between">
      <button
        @click="$router.back()"
        class="flex items-center justify-between gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <Icon name="arrow-left" class="h-8 w-8 text-gray-600" />
      </button>
      <div class="flex items-center gap-1">
        <AppButton
          label="Edit Images"
          icon="edit"
          variant="outlined"
          color="alt"
          class="!hidden bg-white md:!inline-flex"
          @click="openImagesEditDrawer"
        />
        <DropdownMenu :items="actionItems" placement="bottom-end" :show-chevron="false">
          <template #trigger>
            <AppButton
              :label="'Manage Product'"
              icon="dots-vertical"
              variant="outlined"
              icon-placement="right"
              class="!hidden md:!inline-flex"
            />
            <AppButton icon="dots-vertical" variant="outlined" class="md:!hidden" />
          </template>
        </DropdownMenu>
      </div>
    </div>

    <LoadingIcon v-if="isPending" class="mx-auto my-20" />
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
        <h5 class="text-core-700 !font-outfit font-regular text-lg md:text-xl md:font-semibold">
          {{ product?.data.name }}
        </h5>
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
      <div v-if="sortedProductImages.length > 0" class="mt-6 mb-6">
        <!-- Mobile Layout -->
        <div class="md:hidden">
          <!-- Primary Image - Full Width -->
          <div
            v-if="sortedProductImages[0]"
            class="relative mb-3 h-30 w-full overflow-hidden rounded-lg border border-gray-200"
          >
            <img
              :src="sortedProductImages[0].image"
              :alt="sortedProductImages[0].alt_text || product?.data.name"
              class="h-full w-full object-cover"
            />
            <AppButton
              icon="edit"
              variant="outlined"
              color="alt"
              size="sm"
              class="!absolute top-2 left-2 !h-8 !w-8 bg-white !p-0"
              @click="openImagesEditDrawer"
            />
            <div
              class="absolute top-2 right-2 flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700"
            >
              <Icon name="heart-rounded" class="h-3 w-3" />
              <span>Primary</span>
            </div>
          </div>
          <!-- Other Images - Grid (max 4) -->
          <div v-if="sortedProductImages.length > 1" class="grid grid-cols-4 gap-2">
            <div
              v-for="image in sortedProductImages.slice(1, 5)"
              :key="image.uid"
              class="aspect-square overflow-hidden rounded-lg border border-gray-200"
            >
              <img
                :src="image.image"
                :alt="image.alt_text || product?.data.name"
                class="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden gap-3 overflow-x-auto md:flex">
          <div
            v-for="(image, index) in sortedProductImages"
            :key="image.uid"
            :class="[
              'relative h-35 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200',
              index === 0 ? 'w-64' : 'w-32',
            ]"
          >
            <img
              :src="image.image"
              :alt="image.alt_text || product?.data.name"
              class="h-full w-full object-cover"
            />
            <div
              v-if="index === 0"
              class="absolute top-2 right-2 flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700"
            >
              <Icon name="heart-rounded" class="h-3 w-3" />
              <span>Primary</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs :tabs="tabs" v-model="activeTab" class="mt-5 mb-4 md:mt-8 md:mb-0" />

      <ProductOverview
        v-if="activeTab === 'overview' && product"
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

    <AddReduceStockModal
      v-if="selectedVariant"
      :open="showAddReduceStockModal"
      :type="stockModalType"
      :variant-uid="selectedVariant.uid"
      :product-name="product?.data.name || ''"
      :variant-attributes="selectedVariant.attributes"
      :variant-price="selectedVariant.price"
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
      v-model="showProductEditDrawer"
      :product="productForEdit"
      :edit-mode="editMode"
      :variant="variantForEdit"
      @refresh="handleStockSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { useGetProduct, useDeleteProduct } from "../api"
import { useRoute, useRouter } from "vue-router"
import DropdownMenu from "@components/DropdownMenu.vue"
import { ref, computed, watch, onMounted } from "vue"
import Chip from "@components/Chip.vue"
import Tabs from "@components/Tabs.vue"
import LoadingIcon from "@components/LoadingIcon.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
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
import type { TOrder } from "@modules/orders/types"
import { useSettingsStore } from "@modules/settings/store"
import { useGetOrders } from "@modules/orders/api"
import { useGetInventoryMovements } from "../api"
import AppButton from "@components/AppButton.vue"
import ProductEditDrawer from "../components/ProductEditDrawer.vue"
import type { TProduct } from "../types"

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const settingsStore = useSettingsStore()
const uid = Array.isArray(route.params.uid) ? route.params.uid[0] : route.params.uid
const { data: product, isPending } = useGetProduct(uid)
const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct()

const orderParams = computed(() => ({
  product: uid,
}))
const { data: ordersData, isPending: isLoadingOrders } = useGetOrders(orderParams)

const { data: movementsData, isPending: isLoadingMovements } = useGetInventoryMovements()

// Initialize activeTab from query parameter or default to "overview"
const activeTab = ref((route.query.tab as string) || "overview")
const showDeleteConfirmationModal = ref(false)
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

const openStockModal = (
  type: "add" | "reduce",
  variant: IProductVariantDetails | typeof product.value,
) => {
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

  // Only HQ can add and reduce stock
  if (settingsStore.activeLocation?.is_hq) {
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

  return items
}

const openProductEditDrawer = () => {
  if (!product.value) return

  // Create a TProduct object from the detailed product data
  productForEdit.value = {
    uid: product.value.data.uid,
    name: product.value.data.name,
    total_stock: product.value.data.total_stock,
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
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
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
  }

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
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
  }

  editMode.value = "images"
  variantForEdit.value = null
  showProductEditDrawer.value = true
}

const actionItems = computed(() => [
  {
    label: "Edit Product",
    icon: "edit",
    action: openProductEditDrawer,
  },
  ...(product?.value?.data.variants.length && !(product.value.data.variants.length > 1)
    ? getStockActionItems(product.value).map((item) => ({
        ...item,
        action: () => item.action(product.value),
      }))
    : []),
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
])

const tabs = computed(() => {
  const baseTabs = [{ key: "overview", title: "Overview" }]

  // Add Variants tab if product has multiple variants
  if (product.value?.data.variants && product.value.data.variants.length > 1) {
    baseTabs.push({ key: "variants", title: "Variants" })
  }

  baseTabs.push(
    { key: "orders", title: "Orders" },
    { key: "movement_logs", title: "Movement Logs" },
  )

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

const productMetrics = computed(() => {
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
    },
    {
      label: "Sellable Inventory",
      value: totalSellableStock,
      prev_value: 0,
      icon: "shopping-cart",
    },
    {
      label: "Quantity Sold",
      value: productData.quantity_sold || 0,
      prev_value: 0,
      icon: "box-time",
    },
    {
      label: "Reserved Inventory",
      value: totalReservedStock,
      prev_value: 0,
      icon: "box-time",
    },
  ]
})

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
    needs_reorder: product.value.data.needs_reorder,
    variants_count: product.value.data.variants.length,
    is_active: product.value.data.is_active,
    category: product.value.data.category,
    created_at: product.value.data.created_at,
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
