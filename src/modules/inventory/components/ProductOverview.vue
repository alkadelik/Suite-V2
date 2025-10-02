<template>
  <div>
    <h3 class="text-core-700 mb-4 text-lg font-semibold md:text-xl">Your Product Stats</h3>

    <PageSummaryCards
      :items="productMetrics"
      default-icon="bag"
      default-icon-class="text-success-500"
    />

    <Collapsible header="Product Details" class="mt-8">
      <template #body>
        <div class="mb-4 border-b border-gray-200 pb-4">
          <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Description</p>
          <p class="text-core-800 text-xs font-semibold md:text-sm">
            {{ product.description || "No description available for this product." }}
          </p>
        </div>
        <div
          class="grid grid-cols-2 gap-4"
          :class="product.images.length ? 'mb-4 border-b border-gray-200 pb-4' : ''"
        >
          <div>
            <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Price</p>
            <p class="text-core-800 text-xs font-semibold md:text-sm">
              {{ productPrice }}
            </p>
          </div>
          <div>
            <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Total Stock</p>
            <p class="text-core-800 text-xs font-semibold md:text-sm">
              {{ product.variants[0].sellable_stock }}
            </p>
          </div>
          <div>
            <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Weight</p>
            <p class="text-core-800 text-xs font-semibold md:text-sm">
              {{ product.variants[0].weight }}kg
            </p>
          </div>
          <div>
            <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Dimension</p>
            <p class="text-core-800 text-xs font-semibold md:text-sm">
              L-{{ Number(product.variants[0].length) }}cm W-
              {{ Number(product.variants[0].width) }}cm H-{{ Number(product.variants[0].height) }}cm
            </p>
          </div>
        </div>
        <div v-if="product.images.length" class="mt-4 flex gap-2">
          <img
            v-for="image in product.images"
            :key="image.uid"
            :src="image.image"
            class="w-1/6 rounded-lg object-cover md:h-24 md:w-24"
            alt=""
          />
        </div>
      </template>
    </Collapsible>

    <div
      v-if="product.variants && product.variants.length > 1"
      class="mt-6 space-y-4 rounded-xl border-gray-200 pt-3 md:mt-8 md:border md:bg-white"
    >
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          Variants <Chip :label="String(product.variants.length || 0)" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="md"
            class="flex-1"
            placeholder="Search by SKU or variant name"
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
            label="Add Variant"
            class="!hidden md:!inline-flex"
            @click="$emit('add-variant')"
          />
          <AppButton
            icon="add"
            size="sm"
            label=""
            class="md:hidden"
            @click="$emit('add-variant')"
          />
        </div>
      </div>

      <DataTable
        :data="product.variants || []"
        :columns="variantColumns"
        :loading="loading"
        :show-pagination="false"
        :enable-row-selection="true"
      >
        <template #cell:sku="{ item }">
          <div class="flex flex-wrap gap-1">
            <Chip
              v-for="attr in item.attributes"
              :key="attr.uid"
              :label="attr.attribute_value"
              color="blue"
              size="sm"
            />
          </div>
        </template>

        <template #cell:price="{ value }">
          <span class="text-core-600 text-sm font-semibold">{{
            formatCurrency(Number(value))
          }}</span>
        </template>

        <template #cell:sellable_stock="{ value }">
          <span class="text-sm font-semibold">{{ value }}</span>
        </template>

        <template #cell:reserved_stock="{ value }">
          <span class="text-sm font-semibold">{{ value }}</span>
        </template>

        <template #cell:available_stock="{ value }">
          <span class="text-sm font-semibold">{{ value }}</span>
        </template>

        <template #cell:action="{ item }">
          <div class="flex items-center gap-2">
            <Icon
              name="edit"
              @click.stop="$emit('variant-action', 'edit', item)"
              class="hidden cursor-pointer hover:text-gray-600 md:inline-block"
            />
            <DropdownMenu
              :items="variantActionItems(item)"
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

        <!-- Mobile card view -->
        <template #mobile="{ item }">
          <ProductVariantCard :variant="item" :variant-action-items="variantActionItems(item)" />
        </template>
      </DataTable>
    </div>

    <div class="mt-6">
      <h3 class="text-core-700 mb-4 text-lg font-semibold md:text-xl">Product Promos</h3>
      <div class="border-primary-700 bg-primary-25 mt-4 flex gap-2 rounded-xl border p-4 md:gap-5">
        <div class="flex flex-1 flex-col justify-between gap-2 md:gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-between gap-2">
              <!-- original price -->
              <h5 class="text-core-400 text-lg font-semibold line-through md:text-xl">
                {{ formatCurrency(5000) }}
              </h5>
              <!-- promo price -->
              <h5 class="text-core-800 text-xl font-semibold md:text-2xl">
                {{ formatCurrency(4000) }}
              </h5>
            </div>
          </div>
          <p class="text-core-700 inline-flex items-center gap-1 text-sm md:text-base">
            <Icon name="calendar" class="text-core-700 inline" size="16" /> Ends Sept 30, 2025
          </p>
          <div class="flex gap-2">
            <Chip color="success" label="Active" showDot />
            <Chip color="blue" icon="tag" :label="`${formatCurrency(5000)} off`" />
            <Chip color="purple" icon="box-outline" label="Product Only" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import PageSummaryCards from "@components/PageSummaryCards.vue"
import Collapsible from "@components/Collapsible.vue"
import DataTable from "@components/DataTable.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import ProductVariantCard from "./ProductVariantCard.vue"
import { formatCurrency } from "@/utils/format-currency"
import type { IProductDetails, IProductVariantDetails } from "../types"
import type { TableColumn } from "@components/DataTable.vue"

interface Props {
  product: IProductDetails
  productMetrics: Array<{
    label: string
    value: number | string
    prev_value: number | string
    icon: string
  }>
  variantColumns: TableColumn<IProductVariantDetails>[]
  variantActionItems: (variant: IProductVariantDetails) => Array<{
    label: string
    icon: string
    action: () => void
  }>
  loading?: boolean
}

interface Emits {
  (e: "variant-action", action: string, variant: IProductVariantDetails): void
  (e: "add-variant"): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const productPrice = computed(() => {
  if (!props.product.variants.length) return "-"

  const variants = props.product.variants
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
