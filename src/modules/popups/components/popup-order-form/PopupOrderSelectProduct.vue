<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import ProductSelectionItem from "@components/ProductSelectionItem.vue"
import { useGetPopupInventory } from "@modules/popups/api"
import { PopupInventory } from "@modules/popups/types"
import { getPopupPriceRange, getInventoryQty } from "@modules/popups/constants"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

const props = withDefaults(
  defineProps<{
    selectedProducts: PopupInventory[]
    viewMode?: "grid" | "list"
  }>(),
  {
    viewMode: "grid",
  },
)

const route = useRoute()

const searchQuery = ref("")
const emit = defineEmits<{
  next: []
  "update:selectedProducts": [products: PopupInventory[]]
  "update:viewMode": [mode: "grid" | "list"]
}>()

// Use computed to sync with parent's viewMode
const currentViewMode = computed({
  get: () => props.viewMode,
  set: (value) => emit("update:viewMode", value),
})

const { data: products, isFetching } = useGetPopupInventory(route.params.id as string)

// Filtered products based on search query
const filteredProducts = computed(() => {
  if (!products.value) return []

  if (!searchQuery.value.trim()) {
    return products.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return products.value.filter((product: PopupInventory) =>
    product.name.toLowerCase().includes(query),
  )
})

// Check if a product is selected
const isProductSelected = (productUid: string) => {
  return props.selectedProducts.some((p) => p.uid === productUid)
}

// Toggle product selection
const toggleProductSelection = (product: PopupInventory) => {
  const totalQuantity = getInventoryQty(product)
  if (totalQuantity === 0) return // Don't allow selection of out-of-stock products

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
        All Products <Chip :label="`${products?.length || 0}`" />
      </h3>
      <div class="flex items-center gap-3">
        <TextField
          left-icon="search-lg"
          size="md"
          class="w-full"
          placeholder="Search by name"
          v-model="searchQuery"
        />
        <AppButton
          :icon="currentViewMode === 'grid' ? 'list' : 'grid'"
          variant="outlined"
          @click="currentViewMode = currentViewMode === 'grid' ? 'list' : 'grid'"
        />
      </div>
    </div>

    <!-- Products List -->
    <section
      v-if="!isFetching && filteredProducts.length > 0"
      :class="
        currentViewMode === 'grid' ? 'grid grid-cols-2 gap-6 md:grid-cols-3' : 'flex flex-col gap-3'
      "
    >
      <ProductSelectionItem
        v-for="prod in filteredProducts"
        :key="prod.uid"
        :image-url="prod.images?.[0]?.image"
        :name="prod.name"
        :selected="isProductSelected(prod.uid)"
        :disabled="getInventoryQty(prod) === 0"
        :view-mode="currentViewMode"
        @click="toggleProductSelection(prod)"
      >
        <template #badge>
          <Chip
            v-if="getInventoryQty(prod) === 0"
            label="Out of stock"
            size="sm"
            color="error"
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
            <Icon name="tag" class="h-3 w-3" />
            {{ getPopupPriceRange(prod) }}
          </span>
        </template>

        <template #secondaryInfo>
          <span class="flex items-center gap-1">
            <Icon name="box" class="h-3 w-3" />
            {{ getInventoryQty(prod) }}{{ currentViewMode === "list" ? " in stock" : "" }}
          </span>
        </template>
      </ProductSelectionItem>
    </section>

    <EmptyState
      v-else-if="!isFetching && filteredProducts.length === 0"
      title="No Products Found"
      :description="searchQuery ? 'Try adjusting your search query' : 'Add products to get started'"
      class="!min-h-[500px] md:!bg-none"
    />

    <div v-if="isFetching" class="flex items-center justify-center py-12">
      <Icon name="loader" size="64" class="!animate text-primary-600 !animate-spin" />
    </div>

    <div class="h-32" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 border-t bg-white p-4 md:p-6">
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
