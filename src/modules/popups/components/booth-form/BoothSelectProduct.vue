<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import ProductSelectionItem from "@components/ProductSelectionItem.vue"
import { useGetProductCatalogsInfinite } from "@modules/inventory/api"
import type { IProductCatalogue } from "@modules/inventory/types"
import AddNewProductModal from "@modules/orders/components/create-order-form/AddNewProductModal.vue"
import { computed, ref } from "vue"
import { useInfinitePagination } from "@/composables/useInfinitePagination"
import { useDebouncedRef } from "@/composables/useDebouncedRef"

const props = withDefaults(
  defineProps<{
    selectedProducts: IProductCatalogue[]
    existingVariantSkus?: string[]
    viewMode?: "grid" | "list"
  }>(),
  {
    viewMode: "grid",
  },
)

const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 500)
const emit = defineEmits<{
  next: []
  "update:selectedProducts": [products: IProductCatalogue[]]
  "update:viewMode": [mode: "grid" | "list"]
}>()

// Use computed to sync with parent's viewMode
const currentViewMode = computed({
  get: () => props.viewMode,
  set: (value) => emit("update:viewMode", value),
})

const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
  useGetProductCatalogsInfinite(50, debouncedSearch)

// Flatten all pages into a single products array
const products = computed(() => {
  if (!data.value?.pages) return []
  return data.value.pages.flatMap((page) => page.results)
})

// Get total count from first page
const totalCount = computed(() => data.value?.pages?.[0]?.count ?? 0)

// Setup infinite scroll
const scrollContainer = useInfinitePagination(fetchNextPage, hasNextPage, 200).el

// Check if a product is selected
const isProductSelected = (productUid: string) => {
  return props.selectedProducts.some((p) => p.uid === productUid)
}

// Check if ALL variants of a product are already in popup inventory
const isProductFullyInPopup = (product: IProductCatalogue) => {
  if (!props.existingVariantSkus || props.existingVariantSkus.length === 0) return false
  if (!product.variants || product.variants.length === 0) return false
  // Check if ALL variants are in popup
  return product.variants.every((variant) => props.existingVariantSkus?.includes(variant.sku))
}

// Check if product has SOME variants already in popup
const hasPartiallySelectedVariants = (product: IProductCatalogue) => {
  if (!props.existingVariantSkus || props.existingVariantSkus.length === 0) return false
  if (!product.variants || product.variants.length === 0) return false
  return product.variants.some((variant) => props.existingVariantSkus?.includes(variant.sku))
}

// Toggle product selection
const toggleProductSelection = (product: IProductCatalogue) => {
  if (getAvailableProductQty(product) === 0 || isProductFullyInPopup(product)) return // Don't allow selection of out-of-stock or fully added products

  const index = props.selectedProducts.findIndex((p) => p.uid === product.uid)

  const updatedProducts = [...props.selectedProducts]

  if (index > -1) {
    // Remove from selection
    updatedProducts.splice(index, 1)
  } else {
    // Add to selection
    updatedProducts.push(product)
  }

  emit("update:selectedProducts", updatedProducts)
}

// Check if next button should be enabled
const canProceed = computed(() => props.selectedProducts.length > 0)

// Handle next button click
const handleNext = () => {
  if (canProceed.value) {
    emit("next")
  }
}

// Get available quantity for a product (sellable_stock - popup_quantity_taken across all variants)
const getAvailableProductQty = (product: IProductCatalogue) => {
  if (!product.variants || product.variants.length === 0) return 0

  return product.variants.reduce((total, variant) => {
    const sellableStock = Number(variant.sellable_stock ?? variant.available_stock ?? 0)
    const popupQtyTaken = Number(variant.popup_quantity_taken ?? 0)
    return total + Math.max(0, sellableStock - popupQtyTaken)
  }, 0)
}

const showAdd = ref(false)

const handleProductCreated = async (productUid: string) => {
  showAdd.value = false
  // Refetch products
  await refetch()
  // Find and auto-select the newly created product
  if (productUid) {
    const newProduct = products.value.find((p) => p.uid === productUid)
    if (newProduct && getAvailableProductQty(newProduct) > 0) {
      toggleProductSelection(newProduct)
    }
  }
}
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Select what they are buying</p>

    <div class="mb-8 flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        All Products <Chip :label="`${totalCount || products.length}`" />
      </h3>
      <div class="flex items-center gap-3 rounded-xl bg-white p-2">
        <TextField
          left-icon="search-lg"
          size="md"
          class="w-full"
          placeholder="Find product by name"
          v-model="searchQuery"
        />
        <AppButton
          :icon="currentViewMode === 'grid' ? 'list' : 'grid'"
          variant="outlined"
          @click="currentViewMode = currentViewMode === 'grid' ? 'list' : 'grid'"
        />
        <AppButton icon="add" class="flex-shrink-0" @click="showAdd = true" />
      </div>
    </div>

    <!-- Products List -->
    <section
      ref="scrollContainer"
      v-if="!isPending && products.length > 0"
      :class="
        currentViewMode === 'grid' ? 'grid grid-cols-2 gap-6 md:grid-cols-3' : 'flex flex-col gap-3'
      "
    >
      <ProductSelectionItem
        v-for="prod in products"
        :key="prod.uid"
        :image-url="prod.images?.[0]?.image"
        :name="prod.name"
        :selected="isProductSelected(prod.uid)"
        :disabled="getAvailableProductQty(prod) === 0 || isProductFullyInPopup(prod)"
        :view-mode="currentViewMode"
        @click="toggleProductSelection(prod)"
      >
        <template #badge>
          <Chip
            v-if="getAvailableProductQty(prod) === 0"
            label="Out of stock"
            size="sm"
            color="error"
            :class="
              currentViewMode === 'grid' ? 'absolute top-2 right-2 !rounded-lg' : 'flex-shrink-0'
            "
          />
          <Chip
            v-else-if="isProductFullyInPopup(prod)"
            label="Fully added"
            size="sm"
            color="success"
            :class="
              currentViewMode === 'grid' ? 'absolute top-2 right-2 !rounded-lg' : 'flex-shrink-0'
            "
          />
          <Chip
            v-else-if="hasPartiallySelectedVariants(prod)"
            label="Some added"
            size="sm"
            color="warning"
            :class="
              currentViewMode === 'grid' ? 'absolute top-2 right-2 !rounded-lg' : 'flex-shrink-0'
            "
          />
          <input
            v-else
            type="checkbox"
            :checked="isProductSelected(prod.uid)"
            :class="
              currentViewMode === 'grid'
                ? 'accent-primary-600 pointer-events-none absolute top-2 right-2 h-4 w-4 rounded border-gray-300 bg-white'
                : 'accent-primary-600 pointer-events-none h-4 w-4 flex-shrink-0 rounded border-gray-300'
            "
          />
        </template>

        <template #primaryInfo>
          <span class="text-primary-600 flex items-center gap-1">
            <Icon name="box" class="h-3 w-3" />
            {{ prod.variants?.length }} var.
          </span>
        </template>

        <template #secondaryInfo>
          <span class="flex items-center gap-1">
            <Icon name="box" class="h-3 w-3" />
            {{ getAvailableProductQty(prod) }}{{ currentViewMode === "list" ? " in stock" : "" }}
          </span>
        </template>
      </ProductSelectionItem>
    </section>

    <div v-if="isFetchingNextPage" class="flex items-center justify-center gap-2 py-4">
      <Icon name="loader" size="20" class="text-primary-600 animate-spin" />
      <span class="text-sm text-gray-500">Loading more...</span>
    </div>

    <EmptyState
      v-else-if="!isPending && products.length === 0"
      title="No Products Found"
      :description="searchQuery ? 'Try adjusting your search query' : 'Add products to get started'"
      class="!min-h-[500px] md:!bg-none"
    />

    <div v-if="isPending" class="flex items-center justify-center py-12">
      <Icon name="loader" size="64" class="!animate text-primary-600 !animate-spin" />
    </div>

    <div class="h-24" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 border-t bg-white p-6">
      <div v-if="selectedProducts.length > 0" class="mb-3 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          {{ selectedProducts.length }} product{{ selectedProducts.length > 1 ? "s" : "" }} selected
        </p>
        <button
          @click="emit('update:selectedProducts', [])"
          class="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Clear all
        </button>
      </div>
      <AppButton label="Next" class="w-full" :disabled="!canProceed" @click="handleNext" />
    </div>
  </div>

  <AddNewProductModal :open="showAdd" @close="showAdd = false" @success="handleProductCreated" />
</template>
