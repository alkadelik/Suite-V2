<template>
  <div class="text-core-800 p-4 pb-8">
    <button
      @click="$router.back()"
      class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      <Icon name="arrow-left" class="h-8 w-8 text-gray-600" />
    </button>

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
      <div class="border-primary-700 bg-primary-25 mt-4 flex gap-2 rounded-xl border p-4 md:gap-5">
        <div
          class="border-core-300 bg-core-200 flex size-10 items-center justify-center rounded-full border md:size-20"
        >
          <Icon name="box-filled" class="text-primary-600 !size-5 md:!size-8" />
        </div>
        <div class="flex flex-1 flex-col justify-between gap-2 md:gap-3 md:py-1">
          <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h5 class="text-core-700 !font-outfit font-regular text-lg md:text-xl md:font-semibold">
              {{ product?.data.name }}
            </h5>
            <div class="flex items-center gap-2">
              <Icon name="moneys" class="text-core-600" size="24" />
              <h4 class="text-xl font-bold md:text-2xl">
                {{ productPrice }}
              </h4>
            </div>
          </div>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-2 md:mt-0">
            <div class="inline-flex flex-wrap gap-2">
              <Chip
                v-if="product?.data?.variants && product.data.variants.length > 1"
                color="blue"
                icon="shapes"
                :label="`${product?.data.variants.length} variants`"
                class="md:hidden"
              />
              <Chip
                v-if="product?.data.category"
                color="purple"
                icon="tag"
                :label="product.data.category"
              />
              <Chip :color="stockStatus.color" :label="stockStatus.label" showDot />
              <Chip v-if="isBestseller" color="error" icon="star-outline" label="Bestseller" />
            </div>
            <Chip
              v-if="product?.data?.variants && product.data.variants.length > 1"
              color="blue"
              icon="shapes"
              :label="`${product?.data.variants.length} variants`"
              class="!hidden md:!inline-flex"
            />
          </div>
        </div>
        <div>
          <DropdownMenu
            :items="actionItems"
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
      </div>

      <Tabs :tabs="tabs" v-model="activeTab" class="mt-5 mb-4 md:mt-8 md:mb-0" />

      <ProductOverview
        v-if="activeTab === 'overview' && product"
        :product="product.data"
        :product-metrics="productMetrics"
        :variant-columns="VARIANT_COLUMNS"
        :variant-action-items="getVariantActionItems"
        :loading="isPending"
        @variant-action="handleVariantAction"
        @add-variant="handleAddVariant"
      />

      <ProductOrders
        v-else-if="activeTab === 'orders' && product"
        :product="product.data"
        :orders="MOCK_PRODUCT_ORDERS"
        :order-columns="PRODUCT_ORDER_COLUMNS"
        :loading="false"
        @create-order="handleCreateOrder"
        @order-action="handleOrderAction"
        @row-click="handleOrderRowClick"
      />

      <ProductMovementLogs
        v-else-if="activeTab === 'movement_logs' && product"
        :product="product.data"
        :movements="MOCK_INVENTORY_MOVEMENTS"
        :movement-columns="
          product.data.variants.length > 1
            ? MOVEMENT_COLUMNS
            : MOVEMENT_COLUMNS.filter((col) => col.accessor !== 'variant')
        "
        :loading="false"
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
  </div>
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { useGetProduct, useDeleteProduct } from "../api"
import { useRoute, useRouter } from "vue-router"
import DropdownMenu from "@components/DropdownMenu.vue"
import { ref, computed } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import Chip from "@components/Chip.vue"
import Tabs from "@components/Tabs.vue"
import LoadingIcon from "@components/LoadingIcon.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useQueryClient } from "@tanstack/vue-query"
import EmptyState from "@components/EmptyState.vue"
import {
  VARIANT_COLUMNS,
  PRODUCT_ORDER_COLUMNS,
  MOCK_PRODUCT_ORDERS,
  MOVEMENT_COLUMNS,
  MOCK_INVENTORY_MOVEMENTS,
} from "../constants"
import type { IProductVariantDetails } from "../types"
import ProductOverview from "../components/ProductOverview.vue"
import ProductOrders from "../components/ProductOrders.vue"
import ProductMovementLogs from "../components/ProductMovementLogs.vue"
import AddReduceStockModal from "../components/AddReduceStockModal.vue"
import TransferRequestStockDrawer from "../components/TransferRequestStockDrawer.vue"
import type { TOrder } from "@modules/orders/types"
import { useSettingsStore } from "@modules/settings/store"

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const settingsStore = useSettingsStore()
const uid = Array.isArray(route.params.uid) ? route.params.uid[0] : route.params.uid
const { data: product, isPending } = useGetProduct(uid)
const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct()

const activeTab = ref("overview")
const showDeleteConfirmationModal = ref(false)
const showAddReduceStockModal = ref(false)
const stockModalType = ref<"add" | "reduce">("add")
const showTransferRequestDrawer = ref(false)
const transferRequestType = ref<"transfer" | "request">("transfer")
const selectedVariant = ref<IProductVariantDetails | null>(null)

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

  const items = [
    {
      label: "Add Stock",
      icon: "box-add",
      action: (actionItem: IProductVariantDetails | typeof product.value) => {
        openStockModal("add", actionItem)
      },
    },
  ]

  // Only show these items if stock is available
  if (availableStock > 0) {
    items.push({
      label: "Reduce Stock",
      icon: "box-add",
      action: (actionItem: IProductVariantDetails | typeof product.value) => {
        openStockModal("reduce", actionItem)
      },
    })

    // Only show Transfer Stock if active location is HQ
    if (settingsStore.activeLocation?.is_hq) {
      items.push({
        label: "Transfer Stock",
        icon: "box",
        action: (actionItem: IProductVariantDetails | typeof product.value) => {
          openTransferRequestDrawer("transfer", actionItem)
        },
      })
    }
  }

  items.push({
    label: "Request Stock",
    icon: "box-time",
    action: (actionItem: IProductVariantDetails | typeof product.value) => {
      openTransferRequestDrawer("request", actionItem)
    },
  })

  return items
}

const actionItems = computed(() => [
  {
    label: "Edit Product",
    icon: "edit",
    action: () => {
      console.log("Editing product:", product.value)
    },
  },
  ...(product?.value?.data.variants.length && !(product.value.data.variants.length > 1)
    ? getStockActionItems(product.value).map((item) => ({
        ...item,
        action: () => item.action(product.value),
      }))
    : []),
  {
    label: "View Stock Movement",
    icon: "arrow-2",
    action: () => {
      console.log("Viewing stock movement:", product.value)
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
])

const tabs = ref([
  { key: "overview", title: "Overview" },
  { key: "orders", title: "Orders" },
  { key: "movement_logs", title: "Movement Logs" },
])

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
      label: "Amount Sold(Revenue)",
      value: productData.amount_sold || 0,
      prev_value: 0,
      icon: "box-filled",
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
    {
      label: "Memo Count",
      value: productData.memo_count || 0,
      prev_value: 0,
      icon: "box-time",
    },
    {
      label: "Return Count",
      value: productData.return_count || 0,
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
  console.log(action, variant)
}

const handleAddVariant = () => {
  console.log("Add variant clicked")
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

const productPrice = computed(() => {
  if (!product.value?.data.variants.length) return "-"

  const variants = product.value.data.variants
  if (variants.length === 1) {
    return formatCurrency(Number(variants[0].price))
  }

  const prices = variants.map((v) => Number(v.price))
  const uniquePrices = [...new Set(prices)]

  if (uniquePrices.length === 1) {
    return formatCurrency(uniquePrices[0])
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
})
</script>
