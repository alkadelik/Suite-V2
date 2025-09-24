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

    <div class="mt-4 space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:mt-8 md:border">
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          All Products <Chip :label="String(PRODUCTS.length)" />
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
        :data="PRODUCTS"
        :columns="PRODUCT_COLUMNS"
        :loading="false"
        :show-pagination="false"
        :enable-row-selection="true"
        @row-click="handleRowClick"
      >
        <template #cell:name="{ item }">
          <div>
            <ProductAvatar
              :name="item.product_name"
              :url="item.images.length > 0 ? item.images[0].image : undefined"
              :variants="item.has_variant"
            />
          </div>
        </template>

        <template #cell:category="{ value }">
          <Chip
            :label="value != null ? String(value) : undefined"
            icon="tag"
            color="purple"
            size="sm"
          />
        </template>

        <template #cell:price="{ value }">
          <span class="text-core-600 text-sm">{{
            formatCurrency(typeof value === "number" ? value : undefined)
          }}</span>
        </template>

        <template #cell:total_stock="{ value }">
          <span class="text-sm font-semibold">{{ value }}</span>
        </template>

        <template #cell:status="{ item }">
          <Chip
            showDot
            :label="item.total_stock > 0 ? 'In Stock' : 'Out of Stock'"
            :color="item.total_stock > 0 ? 'success' : 'error'"
            size="sm"
          />
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
        <template #mobile-content="{ item }">
          <div class="space-y-2">
            <div class="flex items-start gap-2">
              <div class="relative">
                <img
                  v-if="item.images.length > 0"
                  :src="item.images[0].image"
                  :alt="item.product_name"
                  class="size-10 flex-shrink-0 rounded-lg border-2 border-transparent object-cover transition-all duration-200 hover:scale-105"
                  loading="lazy"
                />
                <div
                  v-else
                  class="flex size-10 items-center justify-center rounded-xl bg-gray-100 p-2"
                >
                  <Icon name="shop-add" class="text-core-600" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <p class="truncate text-sm font-semibold">{{ item.product_name }}</p>
                <div class="flex gap-3">
                  <div class="flex">
                    <Icon name="moneys" class="text-core-600 me-1 size-4" />
                    <span class="text-sm font-bold">{{ formatCurrency(item.price) }}</span>
                  </div>
                  <div class="flex">
                    <Icon name="cube" class="text-core-600 me-1 size-4" />
                    <span class="text-sm font-bold">{{ item.total_stock }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 flex gap-1">
              <Chip
                v-if="item.sku.length > 1"
                icon="shapes"
                :label="`${item.sku.length} Variants`"
                color="blue"
                size="sm"
              />
              <Chip icon="tag" :label="item.category || 'Uncategorized'" color="purple" size="sm" />
              <Chip
                showDot
                :label="item.total_stock > 0 ? 'In Stock' : 'Out of Stock'"
                :color="item.total_stock > 0 ? 'success' : 'error'"
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
    <!-- <DeleteConfirmationModal
      v-model="showDeleteConfirmationModal"
      @close="showDeleteConfirmationModal = false"
      header="Delete Product"
      paragraph="Are you sure you want to delete this product?"
      @delete="
        () => {
          console.log(product)
          showDeleteConfirmationModal = false
        }
      "
    />
    <ExportProductModal v-model="showExportProductModal" @close="showExportProductModal = false" /> -->

    <!-- drawers  -->
    <ProductFormDrawer v-model="showProductFormDrawer" :mode="formMode" :product="product" />
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
import ProductAvatar from "@components/ProductAvatar.vue"
import { TProduct, TProductFormMode } from "../types"
import { PRODUCT_COLUMNS, PRODUCTS } from "../constants"
import { ref } from "vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import { toast } from "@/composables/useToast"
// import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import ProductFormDrawer from "../components/ProductFormDrawer.vue"
// import ExportProductModal from "../components/ExportProductModal.vue"
// import ViewProductDrawer from "../components/ViewProductDrawer.vue"
import { formatCurrency } from "@/utils/format-currency"
import SectionHeader from "@components/SectionHeader.vue"
import PageSummaryCards from "@components/PageSummaryCards.vue"

const formMode = ref<TProductFormMode>("add")
const showDeleteConfirmationModal = ref(false)
const showProductFormDrawer = ref(false)
const showViewProductDrawer = ref(false)
// const showExportProductModal = ref(false)
const product = ref<TProduct | null>(null)

const handleRowClick = (clickedProduct: TProduct) => {
  product.value = { ...clickedProduct }
  formMode.value = "view"
  showViewProductDrawer.value = true
}

const productMetrics = ref([
  {
    label: "Total Products",
    value: PRODUCTS.length + 120,
    prev_value: 2,
    icon: "box-filled",
  },
  {
    label: "Stale Products",
    value: 23,
    prev_value: 25,
    icon: "box-time",
  },
  {
    label: "Actual Inventory",
    value: 23,
    prev_value: 25,
    icon: "shop",
  },
  {
    label: "Sellable Inventory",
    value: 23,
    prev_value: 25,
    icon: "shopping-cart",
  },
])

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

const handleAction = (action: "duplicate" | "edit" | "view" | "delete", item: TProduct) => {
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
      id: Date.now(), // temporary ID
      product_name: `${item.product_name} (Copy)`,
      sku: item.sku.map((s) => ({ ...s, id: Date.now() + Math.random() })),
    }
    product.value = duplicatedProduct
    formMode.value = "add"
    setTimeout(() => {
      showProductFormDrawer.value = true
    }, 0)
    toast.success("Product duplicated successfully")
  }
}

// const handleProductSubmit = (payload: IProductFormPayload, mode: TProductFormMode) => {
//   console.log("Product form submitted:", payload, mode)

//   if (mode === "edit" && product.value) {
//     // Update logic here - you might want to call an API or update your data store
//     console.log("Updating product:", product.value.id, payload)
//   } else if (mode === "add") {
//     // Add logic here
//     console.log("Adding new product:", payload)
//   }

//   showProductFormDrawer.value = false
//   product.value = null // Clear selected product
//   // Refresh product list or update state as needed
// }

// Function to handle opening add product drawer
const openAddProductDrawer = () => {
  product.value = null // Clear any existing product data
  formMode.value = "add"
  showProductFormDrawer.value = true
}
</script>
