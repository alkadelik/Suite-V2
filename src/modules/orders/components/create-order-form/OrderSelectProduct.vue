<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { useGetProductCatalogs } from "@modules/inventory/api"
import type { IProductCatalogue } from "@modules/inventory/types"
import { computed, ref } from "vue"

const props = defineProps<{
  selectedProducts: IProductCatalogue[]
}>()

const searchQuery = ref("")
const emit = defineEmits<{
  next: []
  "update:selectedProducts": [products: IProductCatalogue[]]
}>()

const { data: productsData, isFetching } = useGetProductCatalogs()
const products = computed(() => productsData?.value?.results ?? [])

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
  if (product.total_stock === 0) return // Don't allow selection of out-of-stock products

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
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="box" size="28" />
    </div>
    <p class="mb-4 text-sm">Select what they are buying</p>

    <div class="mb-8 flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        All Products <Chip :label="`${productsData?.count || products.length}`" />
      </h3>
      <div class="flex items-center gap-3">
        <TextField
          left-icon="search-lg"
          size="md"
          class="w-full"
          placeholder="Search by name"
          v-model="searchQuery"
        />
        <AppButton icon="filter-lines" variant="outlined" color="alt" class="flex-shrink-0" />
        <AppButton icon="add" class="flex-shrink-0" />
      </div>
    </div>

    <section v-if="!isFetching && filteredProducts.length > 0" class="grid grid-cols-3 gap-6">
      <div
        v-for="prod in filteredProducts"
        :key="prod.uid"
        class="rounded-xl bg-white p-1.5 transition-all"
        :class="
          prod.total_stock === 0
            ? 'cursor-not-allowed opacity-60'
            : isProductSelected(prod.uid)
              ? 'ring-primary-600 cursor-pointer shadow-lg ring-2'
              : 'cursor-pointer hover:shadow-lg'
        "
        @click="toggleProductSelection(prod)"
      >
        <div class="relative flex h-[88px] items-center justify-center rounded-xl bg-gray-200">
          <img v-if="prod.images?.length" :src="prod.images[0]" alt="" class="h-20 rounded-xl" />
          <Icon v-else name="box" class="h-20 w-20" />

          <Chip
            v-if="prod.total_stock === 0"
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
              {{ prod.total_stock }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <EmptyState
      v-else-if="!isFetching && filteredProducts.length === 0"
      title="No Products Found"
      :description="searchQuery ? 'Try adjusting your search query' : 'Add products to get started'"
      class="!min-h-[500px] md:!bg-none"
    />

    <div v-else class="flex min-h-[500px] items-center justify-center">
      <div class="text-center">
        <Icon name="box" class="text-core-300 mx-auto mb-4 h-16 w-16 animate-pulse" />
        <p class="text-core-400 text-sm">Loading products...</p>
      </div>
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
</template>
