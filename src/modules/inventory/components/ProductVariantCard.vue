<template>
  <div class="bg-core-25 border-core-300 rounded-xl border p-3">
    <div class="flex items-start justify-between gap-2">
      <div class="flex flex-wrap gap-1">
        <Chip
          v-for="attr in variant.attributes"
          :key="attr.uid"
          :label="attr.attribute_value"
          color="primary"
          size="sm"
        />
      </div>
      <DropdownMenu
        :items="variantActionItems"
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

    <p class="mt-2 text-sm font-semibold">{{ formatCurrency(Number(variant.price)) }}</p>

    <hr class="border-core-300 my-2" />

    <div class="flex items-center justify-between text-[11px]">
      <div class="border-core-300 flex items-center gap-1 border-r pr-2">
        <span class="text-core-600">Actual Stock:</span>
        <span class="text-core-800 font-semibold">{{ variant.sellable_stock }}</span>
      </div>
      <div class="border-core-300 flex items-center gap-1 border-r px-2">
        <span class="text-core-600">Reserved Stock:</span>
        <span class="text-core-800 font-semibold">{{ variant.reserved_stock }}</span>
      </div>
      <div class="flex items-center gap-1 ps-2">
        <span class="text-core-600">Available Stock:</span>
        <span class="text-core-800 font-semibold">{{ variant.available_stock }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { formatCurrency } from "@/utils/format-currency"
import type { IProductVariantDetails } from "../types"

interface Props {
  variant: IProductVariantDetails
  variantActionItems: Array<{
    label?: string
    icon?: string
    action?: () => void
    class?: string
    iconClass?: string
    divider?: boolean
  }>
}

defineProps<Props>()
</script>
