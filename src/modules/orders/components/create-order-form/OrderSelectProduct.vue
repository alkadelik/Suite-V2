<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { useGetProductCatalogsInfinite } from "@modules/inventory/api"
import type { IProductCatalogue } from "@modules/inventory/types"
import { computed, ref } from "vue"
import AddNewProductModal from "./AddNewProductModal.vue"
import { useInfinitePagination } from "@/utils/useInfinitePagination"

const props = defineProps<{
  selectedProducts: IProductCatalogue[]
}>()

const searchQuery = ref("")
const emit = defineEmits<{
  next: []
  "update:selectedProducts": [products: IProductCatalogue[]]
}>()

const { data, isPending, fetchNextPage, hasNextPage, refetch } = useGetProductCatalogsInfinite(20)

// Flatten all pages into a single products array
const products = computed(() => {
  if (!data.value?.pages) return []
  return data.value.pages.flatMap((page) => page.results)
})

// Get total count from first page
const totalCount = computed(() => data.value?.pages?.[0]?.count ?? 0)

// @ts-expect-error - Used as template ref, not read in script
const scrollContainer = useInfinitePagination(fetchNextPage, hasNextPage, 200).el

// Filtered products based on search query
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) {
    return products.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return products.value.filter(
    (product: IProductCatalogue) =>
      product.name.toLowerCase().includes(query) ||
      product.category_name?.toLowerCase().includes(query),
  )
})

// Check if a product is selected
const isProductSelected = (productUid: string) => {
  return props.selectedProducts.some((p) => p.uid === productUid)
}

// Toggle product selection
const toggleProductSelection = (product: IProductCatalogue) => {
  if (getAvailableProductQty(product) === 0) return // Don't allow selection of out-of-stock products

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

// Handle successful product creation
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
      <div class="flex items-center gap-3">
        <TextField
          left-icon="search-lg"
          size="md"
          class="w-full"
          placeholder="Search by name"
          v-model="searchQuery"
        />
        <AppButton icon="add" @click="showAdd = true" />
      </div>
    </div>

    <section
      ref="scrollContainer"
      v-if="!isPending && filteredProducts.length > 0"
      class="grid grid-cols-2 gap-6 md:grid-cols-3"
    >
      <div
        v-for="prod in filteredProducts"
        :key="prod.uid"
        class="rounded-xl bg-white p-1.5 transition-all"
        :class="
          getAvailableProductQty(prod) === 0
            ? 'cursor-not-allowed opacity-60'
            : isProductSelected(prod.uid)
              ? 'ring-primary-600 cursor-pointer shadow-lg ring-2'
              : 'cursor-pointer hover:shadow-lg'
        "
        @click="toggleProductSelection(prod)"
      >
        <div class="relative flex h-[88px] items-center justify-center rounded-xl bg-gray-200">
          <img
            v-if="prod.images?.length"
            :src="prod.images[0]?.image"
            alt=""
            class="h-full w-full rounded-xl object-cover"
          />
          <Icon v-else name="box" size="40" />

          <Chip
            v-if="getAvailableProductQty(prod) === 0"
            label="Out of stock"
            size="sm"
            color="error"
            class="absolute top-2 right-2 !rounded-lg"
          />
          <input
            v-else
            type="checkbox"
            :checked="isProductSelected(prod.uid)"
            class="accent-primary-600 pointer-events-none absolute top-2 right-2 h-4 w-4 rounded border-gray-300 bg-white"
          />
        </div>
        <div class="space-y-1 p-1 py-2">
          <h4 class="line-clamp-1 text-xs font-medium">{{ prod.name }}</h4>
          <div class="flex justify-between gap-2 text-xs">
            <span class="text-primary-600 flex items-center gap-1">
              <Icon name="box" class="h-3 w-3" />
              {{ prod.variants?.length }} var.
            </span>
            <!--  -->
            <span class="flex items-center gap-1">
              <Icon name="box" class="h-3 w-3" />
              {{ getAvailableProductQty(prod) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <EmptyState
      v-else-if="!isPending && filteredProducts.length === 0"
      title="No Products Found"
      :description="searchQuery ? 'Try adjusting your search query' : 'Add products to get started'"
      class="!min-h-[500px] md:!bg-none"
    />

    <div v-if="isPending" class="flex items-center justify-center py-12">
      <Icon name="loader" size="64" class="!animate text-primary-600 !animate-spin" />
    </div>

    <div class="h-32" />

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
