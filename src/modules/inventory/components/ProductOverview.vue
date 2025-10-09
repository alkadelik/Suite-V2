<template>
  <div>
    <div class="mb-7 flex flex-col gap-2">
      <p class="text-core-600 inline-flex items-center gap-2 text-sm font-semibold md:text-base">
        <Icon name="tag" class="h-4 w-4" /> Total Sales
      </p>
      <h3 class="text-core-800 text-2xl font-semibold md:text-3xl">
        {{ formatCurrency(product.amount_sold) }}
      </h3>
      <div class="flex items-center gap-2">
        <p class="text-core-600 text-xs md:text-sm">vs. 0 last wk</p>
        <div class="flex gap-2">
          <Chip icon="refresh-2" :label="`${product.return_count} returns`" />
          <Chip icon="message-2" :label="`${product.memo_count} memos`" color="blue" />
        </div>
      </div>
    </div>

    <PageSummaryCards
      :items="productMetrics"
      default-icon="bag"
      default-icon-class="text-success-500"
    />

    <div class="mt-8 flex flex-col gap-3 md:flex-row">
      <div class="w-7/12 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-core-700 text-sm font-semibold md:text-base">Product Information</p>
          <AppButton
            variant="text"
            color="alt"
            size="sm"
            class="!h-9 !w-9 bg-white !p-0"
            icon="edit"
          />
        </div>

        <div class="pb-4">
          <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Name</p>
          <p class="text-core-800 text-xs font-semibold md:text-sm">
            {{ product.name || "Unknown" }}
          </p>
        </div>
        <div>
          <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Description</p>
          <p class="text-core-800 text-xs font-semibold md:text-sm">
            {{ product.description || "No description available for this product." }}
          </p>
        </div>
      </div>
      <div class="w-5/12 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-core-700 text-sm font-semibold md:text-base">Details</p>
          <AppButton
            variant="text"
            color="alt"
            size="sm"
            class="!h-9 !w-9 bg-white !p-0"
            icon="edit"
          />
        </div>

        <div class="flex flex-col gap-4">
          <div>
            <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Price</p>
            <p class="text-core-800 text-xs font-semibold md:text-sm">
              {{ productPrice }}
            </p>
          </div>
          <div v-if="product.variants.length > 1">
            <InfoBox variant="warning" message="Weight & Dimensions vary per variant." />
          </div>
          <div v-else class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Weight</p>
              <p class="text-core-800 text-xs font-semibold md:text-sm">
                {{ product.variants[0].weight }}kg
              </p>
            </div>
            <div>
              <p class="text-core-600 mb-1 text-xs font-semibold md:text-sm">Dimension</p>
              <p class="text-core-800 text-xs font-semibold md:text-sm">
                L-{{ Number(product.variants[0].length) }}cm W-{{
                  Number(product.variants[0].width)
                }}cm H-{{ Number(product.variants[0].height) }}cm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="mt-6">
      <h3 class="text-core-700 mb-4 text-lg font-semibold md:text-xl">Product Promos</h3>
      <div class="border-primary-700 bg-primary-25 mt-4 flex gap-2 rounded-xl border p-4 md:gap-5">
        <div class="flex flex-1 flex-col justify-between gap-2 md:gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-between gap-2">
              <h5 class="text-core-400 text-lg font-semibold line-through md:text-xl">
                {{ formatCurrency(5000) }}
              </h5>
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
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import PageSummaryCards from "@components/PageSummaryCards.vue"
import { formatCurrency } from "@/utils/format-currency"
import type { IProductDetails } from "../types"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import AppButton from "@components/AppButton.vue"
import InfoBox from "@components/InfoBox.vue"

interface Props {
  product: IProductDetails
  productMetrics: Array<{
    label: string
    value: number | string
    prev_value: number | string
    icon: string
  }>
  loading?: boolean
}

const props = defineProps<Props>()

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
