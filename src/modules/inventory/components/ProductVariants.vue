<template>
  <div class="space-y-4 rounded-xl border-gray-200 pt-3 md:border md:bg-white">
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
          label="Manage Variants"
          class="!hidden md:!inline-flex"
          @click="$emit('add-variant')"
        />
        <AppButton icon="add" size="sm" label="" class="md:hidden" @click="$emit('add-variant')" />
      </div>
    </div>

    <DataTable
      :data="product.variants || []"
      :columns="variantColumns"
      :loading="loading"
      :show-pagination="false"
      :enable-row-selection="true"
    >
      <template #cell:image="{ item }">
        <ProductAvatar :url="item.image || undefined" size="sm" shape="rounded" />
      </template>

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
        <span class="text-core-600 text-sm font-semibold">{{ formatCurrency(Number(value)) }}</span>
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
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import ProductAvatar from "@components/ProductAvatar.vue"
import ProductVariantCard from "./ProductVariantCard.vue"
import { formatCurrency } from "@/utils/format-currency"
import type { IProductDetails, IProductVariantDetails } from "../types"
import type { TableColumn } from "@components/DataTable.vue"

interface Props {
  product: IProductDetails
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

defineProps<Props>()
defineEmits<Emits>()
</script>
