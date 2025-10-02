<template>
  <div class="p-4">
    <SectionHeader
      title="Inventory"
      subtitle="Manage and organize your product catalog efficiently."
      class="mb-4 md:mb-6"
    />

    <div class="hidden items-center justify-between md:flex">
      <h4 class="!font-outfit text-core-700 mb-2 text-xl font-semibold">Your product stats</h4>
    </div>
    <PageSummaryCards
      :items="productMetrics"
      default-icon="bag"
      default-icon-class="text-success-500"
    />

    <EmptyState
      v-if="!isGettingProducts && products?.data?.results.length === 0"
      icon="box"
      title="No products found"
      description="Start adding products to manage your inventory."
      action-label="Add Product"
      action-icon="add"
      @action="showProductFormDrawer = true"
    />
    <div
      v-else
      class="mt-4 space-y-4 rounded-xl border-gray-200 pt-3 md:mt-8 md:border md:bg-white"
    >
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          All Products <Chip :label="String(products?.data?.count || 0)" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
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
            class="!hidden md:!inline-flex"
          />
          <AppButton icon="filter-lines" size="sm" color="alt" label="" class="md:hidden" />
          <AppButton
            icon="add"
            size="sm"
            label="Add Product"
            @click="openAddProductDrawer"
            class="!hidden md:!inline-flex"
          />
          <AppButton
            icon="add"
            size="sm"
            label=""
            @click="openAddProductDrawer"
            class="md:hidden"
          />
        </div>
      </div>

      <DataTable
        :data="products?.data?.results || []"
        :columns="PRODUCT_COLUMNS"
        :loading="isGettingProducts"
        :show-pagination="false"
        :enable-row-selection="true"
        @row-click="handleRowClick"
      >
        <template #cell:name="{ item }">
          <ProductAvatar
            :name="item.name"
            :url="undefined"
            :variants-count="item.variants_count > 1 ? item.variants_count : undefined"
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
          <span class="text-core-600 text-sm">{{ value ? formatCurrency(+value) : "-" }}</span>
        </template>

        <template #cell:action="{ item }">
          <div class="flex items-center gap-2">
            <Icon
              name="copy-01"
              @click.stop="handleAction('duplicate', item)"
              class="hidden cursor-pointer hover:text-gray-600 md:inline-block"
            />
            <Icon
              name="edit"
              @click.stop="handleAction('edit', item)"
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
          <div class="space-y-2">
            <div class="flex items-start gap-2">
              <div class="relative">
                <div class="flex size-10 items-center justify-center rounded-xl bg-gray-100 p-2">
                  <Icon name="shop-add" class="text-core-600" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <p class="truncate text-sm font-semibold">{{ item.name }}</p>
                <div class="flex gap-3">
                  <div class="flex">
                    <Icon name="cube" class="text-core-600 me-1 size-4" />
                    <span class="text-sm font-bold">{{ item.total_stock }}</span>
                  </div>
                  <div class="flex">
                    <Icon name="shapes" class="text-core-600 me-1 size-4" />
                    <span class="text-sm font-bold">{{ item.variants_count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 flex gap-1">
              <Chip
                v-if="item.variants_count > 1"
                icon="shapes"
                :label="`${item.variants_count} Variants`"
                color="blue"
                size="sm"
              />
              <Chip icon="tag" :label="item.category || 'Uncategorized'" color="purple" size="sm" />
              <Chip
                showDot
                :label="getStockStatus(item).label"
                :color="getStockStatus(item).color"
                size="sm"
              />
              <Chip
                showDot
                :label="item.is_active ? 'Active' : 'Inactive'"
                :color="item.is_active ? 'success' : 'error'"
                size="sm"
              />
            </div>
          </div>
        </template>

        <template #mobile-actions="{ item }">
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
      </DataTable>
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
    <!-- <ExportProductModal v-model="showExportProductModal" @close="showExportProductModal = false" /> -->

    <!-- drawers  -->
    <ProductFormDrawer
      v-model="showProductFormDrawer"
      :mode="formMode"
      :product="product"
      @refresh="refetchProducts"
    />
    <!-- <ViewProductDrawer
      v-model="showViewProductDrawer"
      :mode="formMode"
      :product="product"
      @close="showViewProductDrawer = false"
    /> -->
  </div>
</template>

<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import { TProduct, TProductFormMode } from "../types"
import { PRODUCT_COLUMNS } from "../constants"
import { ref, computed } from "vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import { toast } from "@/composables/useToast"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import ProductFormDrawer from "../components/ProductFormDrawer.vue"
// import ExportProductModal from "../components/ExportProductModal.vue"
// import ViewProductDrawer from "../components/ViewProductDrawer.vue"
import { formatCurrency } from "@/utils/format-currency"
import SectionHeader from "@components/SectionHeader.vue"
import PageSummaryCards from "@components/PageSummaryCards.vue"
import { useGetProducts, useDeleteProduct } from "../api"
import ProductAvatar from "@components/ProductAvatar.vue"
import EmptyState from "@components/EmptyState.vue"
import { displayError } from "@/utils/error-handler"
import router from "@/router"

const { data: products, isPending: isGettingProducts, refetch: refetchProducts } = useGetProducts()
const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct()

const formMode = ref<TProductFormMode>("add")
const showDeleteConfirmationModal = ref(false)
const showProductFormDrawer = ref(false)
const showViewProductDrawer = ref(false)
// const showExportProductModal = ref(false)
const product = ref<TProduct | null>(null)

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

const getActionItems = (item: TProduct) => [
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
    id: "edit",
    label: "Edit Product",
    icon: "edit",
    action: () => handleAction("edit", item),
  },
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
]

const handleAction = (
  action: "duplicate" | "edit" | "view" | "delete" | "activate" | "deactivate",
  item: TProduct,
) => {
  console.log(action, item)

  if (action === "edit") {
    // Set product data BEFORE opening the drawer
    product.value = { ...item } // Create a copy to avoid reference issues
    formMode.value = "edit"
    // Use nextTick to ensure reactive updates are processed
    setTimeout(() => {
      showProductFormDrawer.value = true
    }, 0)
  } else if (action === "delete") {
    product.value = item
    showDeleteConfirmationModal.value = true
  } else if (action === "view") {
    product.value = item
    showViewProductDrawer.value = true
  } else if (action === "duplicate") {
    // Create a copy of the product for duplication
    const duplicatedProduct = {
      ...item,
      uid: `${Date.now()}`, // Generate new uid
      name: `${item.name} (Copy)`,
    }
    product.value = duplicatedProduct
    formMode.value = "add"
    setTimeout(() => {
      showProductFormDrawer.value = true
    }, 0)
    toast.success("Product duplicated successfully")
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
  product.value = null // Clear any existing product data
  formMode.value = "add"
  showProductFormDrawer.value = true
}
</script>
