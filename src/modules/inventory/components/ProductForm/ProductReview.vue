<template>
  <div class="border-core-300 text-core-800 rounded-xl border px-6 py-4 text-left">
    <div class="mb-4 flex gap-2 border-b border-gray-200 pb-6">
      <div class="flex flex-1 flex-col gap-2">
        <p class="text-core-600 text-xs md:text-sm">Price</p>
        <h4 class="text-2xl font-bold">{{ formatCurrency(parseFloat(variant?.price || "0")) }}</h4>
      </div>
      <div class="flex flex-1 flex-col gap-2">
        <p class="text-core-600 text-xs md:text-sm">Total Stock</p>
        <h4 class="text-2xl font-bold">{{ variant?.opening_stock || "0" }}</h4>
      </div>
    </div>

    <div class="mb-4 flex gap-2 border-b border-gray-200 pb-6">
      <!-- Display product images -->
      <div v-if="productData.images && productData.images.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="(image, index) in productData.images.slice(0, 5)"
          :key="index"
          class="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-200"
        >
          <img
            :src="getImageUrl(image)"
            :alt="`Product image ${index + 1}`"
            class="h-full w-full object-cover"
          />
        </div>
      </div>
      <div v-else class="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
        <span class="text-xs text-gray-500">No image</span>
      </div>
    </div>

    <div class="mb-4">
      <p class="text-core-600 text-xs md:text-sm">Name</p>
      <p class="text-xs font-semibold md:text-sm">{{ productData.name || "Untitled Product" }}</p>
    </div>

    <div class="mb-4">
      <p class="text-core-600 mb-2 text-xs md:text-sm">Category</p>
      <Chip :label="getCategoryLabel(productData.category)" icon="tag" color="purple" size="sm" />
    </div>

    <div class="mb-4 border-b border-gray-200 pb-6">
      <p class="text-core-600 text-xs md:text-sm">Description</p>
      <p class="text-xs font-semibold md:text-sm">
        {{ productData.description || "No description provided." }}
      </p>
    </div>

    <div v-if="hasVariants" class="mb-4 border-b border-gray-200 pb-6">
      <p class="text-core-600 mb-2 text-xs md:text-sm">Product Type</p>
      <Chip label="Has Variants" icon="layers" color="blue" size="sm" />
    </div>

    <div class="flex gap-2">
      <div class="flex flex-1 flex-col gap-1">
        <p class="text-core-600 text-xs md:text-sm">Weight</p>
        <p class="text-xs font-semibold md:text-sm">{{ getWeightDisplay() }}</p>
      </div>
      <div class="flex flex-1 flex-col gap-1">
        <p class="text-core-600 text-xs md:text-sm">Dimensions</p>
        <p class="text-xs font-semibold md:text-sm">{{ getDimensionsDisplay() }}</p>
      </div>
    </div>

    <!-- Additional variant details if present -->
    <div v-if="variant?.sku" class="mt-4 border-t border-gray-200 pt-4">
      <div class="mb-2">
        <p class="text-core-600 text-xs md:text-sm">SKU</p>
        <p class="text-xs font-semibold md:text-sm">{{ variant.sku }}</p>
      </div>
    </div>

    <!-- Promotional pricing if present -->
    <div v-if="variant?.promo_price" class="mt-4 border-t border-gray-200 pt-4">
      <div class="mb-2">
        <p class="text-core-600 text-xs md:text-sm">Promotional Price</p>
        <p class="text-xs font-semibold md:text-sm">
          {{ formatCurrency(parseFloat(variant.promo_price)) }}
        </p>
      </div>
      <div v-if="variant?.promo_expiry" class="mb-2">
        <p class="text-core-600 text-xs md:text-sm">Promo Expires</p>
        <p class="text-xs font-semibold md:text-sm">{{ formatDate(variant.promo_expiry) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import { PRODUCT_DIMENSIONS } from "../../constants"
import Chip from "@components/Chip.vue"
import { IProductVariant } from "@modules/inventory/types"

interface ProductData {
  name: string
  category: { label: string; value: string } | null
  description: string
  images: Array<File>
}

interface Props {
  /** Product basic information */
  productData: ProductData
  /** Product variants array */
  variants: IProductVariant[]
  /** Whether product has variants */
  hasVariants: boolean
}

const props = defineProps<Props>()

// Get the primary variant (first one or default)
const variant = computed(() => {
  return props.variants?.[0] || null
})

// Category options mapping (should match the ones in ProductDetailsForm)
const categoryOptionsMap = {
  electronics: "Electronics",
  clothing: "Clothing & Fashion",
  "home-garden": "Home & Garden",
  "health-beauty": "Health & Beauty",
  sports: "Sports & Outdoors",
  "books-media": "Books & Media",
  "toys-games": "Toys & Games",
  "food-beverages": "Food & Beverages",
  automotive: "Automotive",
  jewelry: "Jewelry & Accessories",
  "art-crafts": "Art & Crafts",
  "pet-supplies": "Pet Supplies",
  "office-supplies": "Office Supplies",
  "baby-kids": "Baby & Kids",
  travel: "Travel & Luggage",
}

const getCategoryLabel = (categoryValue: { label: string; value: string } | null): string => {
  if (!categoryValue) return "Uncategorized"
  // If categoryValue is an object with label/value, return label
  if (typeof categoryValue === "object" && categoryValue !== null && "label" in categoryValue) {
    return (categoryValue as { label: string }).label || "Uncategorized"
  }
  // Otherwise, map from categoryOptionsMap
  return categoryOptionsMap[categoryValue as keyof typeof categoryOptionsMap] || categoryValue
}

const getImageUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

const getWeightDisplay = (): string => {
  if (!variant.value?.weight) return "Not specified"

  const weight = parseFloat(variant.value.weight)
  const matchingDimension = PRODUCT_DIMENSIONS.find((dim) => weight <= dim.max_weight)
  return matchingDimension?.shortLabel || "Very Heavy"
}

const getDimensionsDisplay = (): string => {
  const v = variant.value
  if (!v?.height || !v?.length || !v?.width) return "Not specified"

  return `H-${v.height}cm, L-${v.length}cm, W-${v.width}cm`
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ""
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}
</script>
