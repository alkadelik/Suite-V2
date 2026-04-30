<template>
  <div class="space-y-4 rounded-xl border-gray-200 pt-3 md:border md:bg-white">
    <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
      <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
        Variants <Chip :label="String(product.variants.length || 0)" />
      </h3>
      <div class="flex items-center gap-2">
        <TextField
          v-model="search"
          left-icon="search-lg"
          size="md"
          class="flex-1"
          placeholder="Search by SKU or variant name"
        />
        <AppButton
          icon="filter-lines"
          size="sm"
          :color="activeFilterCount ? 'primary' : 'alt'"
          :variant="activeFilterCount ? 'outlined' : 'filled'"
          label="Filter"
          :badge="activeFilterCount || undefined"
          class="!hidden flex-shrink-0 md:!inline-flex"
          @click="showFilter = true"
        />
        <AppButton
          icon="filter-lines"
          size="sm"
          :color="activeFilterCount ? 'primary' : 'alt'"
          :variant="activeFilterCount ? 'outlined' : 'filled'"
          label=""
          :badge="activeFilterCount || undefined"
          class="flex-shrink-0 md:hidden"
          @click="showFilter = true"
        />
        <AppButton
          icon="edit"
          size="sm"
          label="Manage Variants"
          class="!hidden flex-shrink-0 md:!inline-flex"
          @click="$emit('add-variant')"
        />
        <AppButton
          icon="add"
          size="sm"
          label=""
          class="flex-shrink-0 md:hidden"
          @click="$emit('add-variant')"
        />
        <AppButton icon="edit" size="sm" label="" class="md:hidden" @click="$emit('add-variant')" />
      </div>
    </div>

    <DataTable
      :data="variants"
      :columns="variantColumns"
      :loading="loading"
      :show-pagination="false"
      :empty-state="{
        title: 'No results match this filter',
        description: 'Try adjusting or clearing your filters.',
        actionLabel: 'Clear Filter',
        actionIcon: 'x-close',
      }"
      @empty-action="clearFilters"
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
        <span class="text-core-600 text-sm font-semibold">{{ format(Number(value)) }}</span>
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

    <ListFilterDrawer
      v-model="showFilter"
      :filter-groups="filterGroups"
      @apply="handleApplyFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import ProductAvatar from "@components/ProductAvatar.vue"
import ProductVariantCard from "./ProductVariantCard.vue"
import ListFilterDrawer from "@components/ListFilterDrawer.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useGetVariantsByProduct } from "../api"
import type { IProductDetails, IProductVariantDetails } from "../types"
import type { TableColumn } from "@components/DataTable.vue"
import type { FilterGroup } from "@components/ListFilterDrawer.vue"

interface Props {
  product: IProductDetails
  variantColumns: TableColumn<IProductVariantDetails>[]
  variantActionItems: (variant: IProductVariantDetails) => Array<{
    label: string
    icon: string
    action: () => void
  }>
}

interface Emits {
  (e: "variant-action", action: string, variant: IProductVariantDetails): void
  (e: "add-variant"): void
}

const props = defineProps<Props>()
defineEmits<Emits>()
const { format } = useFormatCurrency()

const search = ref("")
const debouncedSearch = useDebouncedRef(search, 750)
const showFilter = ref(false)
const activeFilters = ref<Record<string, string | null>>({})

const variantParams = computed(() => {
  const params: Record<string, string> = { product: props.product.uid }
  if (debouncedSearch.value) params.search = debouncedSearch.value
  if (activeFilters.value.stock_status) params.stock_status = activeFilters.value.stock_status
  return params
})

const { data: variantsData, isFetching: loading } = useGetVariantsByProduct(variantParams)
const variants = computed(() => variantsData.value?.data?.results || props.product.variants || [])

const filterGroups: FilterGroup[] = [
  {
    key: "stock_status",
    label: "Stock Status",
    options: [
      { value: "in_stock", label: "In Stock", color: "success", showDot: true },
      { value: "low_stock", label: "Low Stock", color: "warning", showDot: true },
      { value: "out_of_stock", label: "Out of Stock", color: "error", showDot: true },
    ],
  },
]

const activeFilterCount = computed(() => {
  return Object.values(activeFilters.value).filter((v) => v !== null && v !== undefined).length
})

const handleApplyFilters = (filters: Record<string, string | null>) => {
  activeFilters.value = filters
}

const clearFilters = () => {
  activeFilters.value = {}
  search.value = ""
}
</script>
