<template>
  <div
    @click="$emit('click')"
    :class="['border-warning-200 cursor-pointer rounded-xl border', props.class]"
  >
    <div class="bg-warning-50 flex items-center gap-2.5 rounded-t-xl p-2">
      <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
        <img
          v-if="product.primary_image?.image"
          :src="product.primary_image.image"
          :alt="product.primary_image.alt_text || product.name"
          class="h-full w-full rounded-xl object-cover"
          loading="lazy"
        />
        <Icon name="shop-add" :size="24" class="text-primary-700" />
      </span>
      <h3 class="!font-outfit truncate text-sm font-medium">
        {{ product.name }}
      </h3>
      <span class="ml-auto" />
      <span class="text-base font-semibold">{{ formattedPrice }}</span>
      <DropdownMenu :items="actionItems" />
    </div>
    <div class="flex flex-wrap items-center gap-2 p-5 pb-3">
      <Chip icon="box" :color="stockStatus.color" :label="stockStatus.label" />
      <Chip
        v-if="product.variants_count > 1"
        icon="shapes"
        color="blue"
        :label="`${product.variants_count} Variants`"
      />
      <Chip icon="tag" color="purple" :label="`${product.category || 'Uncategorized'}`" />
      <Chip v-if="product.is_best_seller" icon="star" color="error" :label="`Best Seller`" />
    </div>
  </div>
  <!-- <div @click="$emit('click')" class="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-start gap-2">
        <div class="relative flex-shrink-0">
          <img
            v-if="product.primary_image?.image"
            :src="product.primary_image.image"
            :alt="product.primary_image.alt_text || product.name"
            class="size-10 rounded-xl object-cover"
            loading="lazy"
          />
          <div v-else class="flex size-10 items-center justify-center rounded-xl bg-gray-100 p-2">
            <Icon name="shop-add" class="text-core-600" />
          </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <div class="flex min-w-0 items-center gap-2">
            <p class="truncate text-sm font-semibold">{{ product.name }}</p>
            <Icon
              v-if="!product.is_active"
              name="eye-slash-outline"
              size="14"
              class="flex-shrink-0 text-gray-500"
            />
          </div>
          <div class="flex gap-3">
            <div v-if="formattedPrice" class="flex items-center">
              <Icon name="moneys" class="text-core-600 me-1 size-4" />
              <span class="text-sm font-bold">{{ formattedPrice }}</span>
            </div>
            <div class="flex items-center">
              <Icon name="cube" class="text-core-600 me-1 size-4" />
              <span class="text-sm font-bold">{{ product.total_stock }}</span>
            </div>
            <div
              class="flex items-center"
              :class="{ 'hidden md:flex': product.variants_count === 1 }"
            >
              <Icon name="shapes" class="text-core-600 me-1 size-4" />
              <span class="text-sm font-bold">{{ product.variants_count }}</span>
            </div>
          </div>
        </div>
      </div>

      <DropdownMenu
        :items="actionItems"
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

    <div class="mt-4 flex flex-wrap gap-1">
      <Chip
        v-if="product.variants_count > 1"
        icon="shapes"
        :label="`${product.variants_count} Variants`"
        color="blue"
        size="sm"
      />
      <Chip icon="tag" :label="product.category || 'Uncategorized'" color="purple" size="sm" />
      <Chip showDot :label="stockStatus.label" :color="stockStatus.color" size="sm" />
      <Chip
        showDot
        :label="product.is_active ? 'Active' : 'Inactive'"
        :color="product.is_active ? 'success' : 'error'"
        size="sm"
      />
    </div>
  </div> -->
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { formatCurrency } from "@/utils/format-currency"
import type { TProduct } from "../types"

interface Props {
  product: TProduct
  actionItems: Array<{
    id?: string
    label?: string
    icon?: string
    action?: () => void
    class?: string
    iconClass?: string
    divider?: boolean
  }>
  /* Custom CSS classes */
  class?: string
}

const props = defineProps<Props>()

const stockStatus = computed(() => {
  if (props.product.total_stock === 0) {
    return { label: "Out of Stock", color: "error" as const }
  } else if (props.product.needs_reorder) {
    return { label: "Low Stock", color: "warning" as const }
  } else {
    return { label: `${props.product.total_stock} in Stock`, color: "success" as const }
  }
})

const formattedPrice = computed(() => {
  if (!props.product.price) return null

  if (props.product.price.includes(" - ")) {
    const [minPrice, maxPrice] = props.product.price.split(" - ").map((p) => Number(p.trim()))

    if (minPrice === maxPrice) {
      return formatCurrency(minPrice)
    }

    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
  }

  return formatCurrency(Number(props.product.price))
})
</script>
