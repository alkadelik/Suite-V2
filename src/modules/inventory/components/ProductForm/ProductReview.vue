<template>
  <div class="space-y-4 text-left">
    <div class="border-core-300 text-core-800 rounded-xl border px-6 py-4 text-left">
      <!-- Single variant pricing and stock -->
      <div
        v-if="!hasVariants || variants.length <= 1"
        class="mb-4 flex gap-2 border-b border-gray-200 pb-6"
      >
        <div class="flex flex-1 flex-col gap-2">
          <p class="text-core-600 text-xs md:text-sm">Price</p>
          <h4 class="text-2xl font-bold">
            {{ formatCurrency(parseFloat(variant?.price || "0")) }}
          </h4>
        </div>
        <div class="flex flex-1 flex-col gap-2">
          <p class="text-core-600 text-xs md:text-sm">Total Stock</p>
          <h4 class="text-2xl font-bold">{{ variant?.opening_stock || "0" }}</h4>
        </div>
      </div>

      <!-- Multiple variants pricing and stock summary -->
      <div v-else class="mb-4 flex gap-2 border-b border-gray-200 pb-6">
        <div class="flex flex-1 flex-col gap-2">
          <p class="text-core-600 text-xs md:text-sm">Price Range</p>
          <h4 class="text-2xl font-bold">{{ getPriceRange() }}</h4>
        </div>
        <div class="flex flex-1 flex-col gap-2">
          <p class="text-core-600 text-xs md:text-sm">Total Stock</p>
          <h4 class="text-2xl font-bold">{{ getTotalStock() }}</h4>
        </div>
      </div>

      <div class="mb-4 flex gap-2 border-b border-gray-200 pb-6">
        <!-- Display product images -->
        <div
          v-if="productData.images && productData.images.filter((img) => img).length > 0"
          class="flex flex-wrap gap-2"
        >
          <div
            v-for="(image, index) in productData.images.filter((img) => img).slice(0, 5)"
            :key="index"
            class="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-200"
          >
            <img
              :src="getImageUrl(image!)"
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
    </div>

    <!-- Variants table for multiple variants -->
    <div v-if="hasVariants && variants.length > 1" class="mb-4 border-gray-200 pb-6">
      <div class="rounded-lg">
        <!-- Table Header with count and attribute names -->
        <div class="flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-900">
              Product Variants ({{ variants.length }})
            </h3>
          </div>
          <div class="flex gap-2">
            <Chip
              v-for="(attributeName, index) in getAttributeNames()"
              :key="`attr-name-${index}`"
              :label="attributeName"
              size="sm"
              :color="index === 0 ? 'success' : 'blue'"
            />
          </div>
        </div>

        <!-- Column Header -->
        <div class="flex items-center justify-between bg-gray-50 p-3">
          <div class="flex-1">
            <h3 class="text-xs font-medium text-gray-900">Variant</h3>
          </div>
          <div class="w-20 text-center">
            <h3 class="text-xs font-medium text-gray-900">Stock</h3>
          </div>
          <div class="w-24 text-center">
            <h3 class="text-xs font-medium text-gray-900">Price</h3>
          </div>
        </div>

        <!-- Variant Rows -->
        <div class="bg-white">
          <div
            v-for="(variantItem, index) in variants"
            :key="`variant-${index}`"
            class="flex items-center gap-3 border-b border-gray-200 p-3 last:border-b-0"
          >
            <!-- Variant Name with Chips -->
            <div class="flex-1">
              <div class="flex flex-wrap gap-1">
                <Chip
                  v-for="(attributeValue, attrIndex) in getVariantDisplayValues(variantItem)"
                  :key="`attr-${attrIndex}`"
                  :label="attributeValue"
                  size="sm"
                />
              </div>
            </div>

            <!-- Stock -->
            <div class="w-20 text-center">
              <span class="text-xs font-semibold">{{ variantItem.opening_stock || "0" }}</span>
            </div>

            <!-- Price -->
            <div class="w-24 text-center">
              <span class="text-xs font-semibold">{{
                formatCurrency(parseFloat(variantItem.price || "0"))
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { formatCurrency } from "@/utils/format-currency"
import { PRODUCT_DIMENSIONS, PRODUCT_ATTRIBUTES } from "../../constants"
import Chip from "@components/Chip.vue"
import { IProductVariant } from "@modules/inventory/types"

interface ProductData {
  name: string
  category: { label: string; value: string } | null
  description: string
  images: Array<File | null>
}

interface Props {
  /** Product basic information */
  productData: ProductData
  /** Product variants array */
  variants: IProductVariant[]
  /** Whether product has variants */
  hasVariants: boolean
  /** Map of attribute UIDs to their names */
  attributeNames?: Record<string, string>
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
  // Ensure the file is actually a File object before creating object URL
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }

  // Fallback for invalid file objects
  console.error("Invalid file object passed to getImageUrl:", file)
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4="
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

// Get price range for multiple variants
const getPriceRange = (): string => {
  if (!props.variants || props.variants.length === 0) return "₦0.00"

  const prices = props.variants.map((v) => parseFloat(v.price || "0")).filter((p) => p > 0)

  if (prices.length === 0) return "₦0.00"

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  if (minPrice === maxPrice) {
    return formatCurrency(minPrice)
  }

  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
}

// Get total stock for all variants
const getTotalStock = (): string => {
  if (!props.variants || props.variants.length === 0) return "0"

  const totalStock = props.variants
    .map((v) => parseInt(v.opening_stock || "0"))
    .reduce((sum, stock) => sum + stock, 0)

  return totalStock.toString()
}

// Get unique attribute names from all variants
const getAttributeNames = (): string[] => {
  if (!props.variants || props.variants.length === 0) return []

  // Get the first variant to analyze its attributes
  const firstVariant = props.variants[0]

  if (!firstVariant.attributes || firstVariant.attributes.length === 0) {
    return ["Variant"]
  }

  // Extract actual attribute names using PRODUCT_ATTRIBUTES lookup
  const attributeNames: string[] = []
  const seenAttributeUids = new Set<string>()

  // Get unique attribute UIDs from the first variant
  firstVariant.attributes.forEach((attr) => {
    if (!seenAttributeUids.has(attr.attribute)) {
      seenAttributeUids.add(attr.attribute)

      // First try the passed attributeNames prop (for custom attributes)
      if (props.attributeNames && props.attributeNames[attr.attribute]) {
        attributeNames.push(props.attributeNames[attr.attribute])
      } else {
        // Then look up the attribute name from PRODUCT_ATTRIBUTES
        const attributeOption = PRODUCT_ATTRIBUTES.value.find(
          (option) => option.value === attr.attribute,
        )

        if (attributeOption) {
          attributeNames.push(attributeOption.label)
        } else {
          // Fallback to attribute UID if not found
          attributeNames.push(`Attribute ${attr.attribute}`)
        }
      }
    }
  })

  return attributeNames.length > 0 ? attributeNames : ["Variant"]
}

// Extract display values from variant attributes for chips
const getVariantDisplayValues = (variantItem: IProductVariant): string[] => {
  // Always extract from variant name since it contains the human-readable labels
  const nameParts = variantItem.name.split(" - ")
  if (nameParts.length > 1) {
    // Split the value part by spaces to get individual attribute values
    return nameParts[1].split(" ")
  }

  // Fallback: if name doesn't have the expected format, try to get from attributes
  if (variantItem.attributes && variantItem.attributes.length > 0) {
    return variantItem.attributes.map((attr) => {
      if (typeof attr === "object" && attr !== null && "value" in attr) {
        return attr.value
      }
      return String(attr)
    })
  }

  // Last fallback: just return the variant name
  return [variantItem.name]
}
</script>
