<template>
  <div class="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-start gap-2">
        <div class="relative">
          <div class="flex size-10 items-center justify-center rounded-xl bg-gray-100 p-2">
            <Icon name="shop-add" class="text-core-600" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <p class="truncate text-sm font-semibold">{{ product.name }}</p>
          <div class="flex gap-3">
            <div class="flex">
              <Icon name="cube" class="text-core-600 me-1 size-4" />
              <span class="text-sm font-bold">{{ product.total_stock }}</span>
            </div>
            <div class="flex">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
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
}

const props = defineProps<Props>()

const stockStatus = computed(() => {
  if (props.product.total_stock === 0) {
    return { label: "Out of Stock", color: "error" as const }
  } else if (props.product.needs_reorder) {
    return { label: "Low Stock", color: "warning" as const }
  } else {
    return { label: "In Stock", color: "success" as const }
  }
})
</script>
