<template>
  <div>
    <EmptyState
      v-if="!loading && movements.length === 0"
      icon="arrow-2"
      title="No movement logs yet"
      description="Stock movement logs for this product will appear here once inventory changes occur."
    />

    <div v-else class="space-y-4 rounded-xl border-gray-200 pt-3 md:border md:bg-white">
      <div class="flex items-center justify-between md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          All Movements <Chip :label="String(movements.length)" />
        </h3>
        <div class="flex items-center gap-2">
          <AppButton
            icon="filter-lines"
            size="sm"
            color="alt"
            label="Filter"
            class="!hidden md:!inline-flex"
          />
          <AppButton icon="filter-lines" size="sm" color="alt" label="" class="md:hidden" />
          <AppButton icon="share-06" size="sm" label="Export" class="!hidden md:!inline-flex" />
          <AppButton icon="share-06" size="sm" label="" class="md:hidden" />
        </div>
      </div>

      <DataTable
        :data="movements"
        :columns="movementColumns"
        :loading="loading"
        :show-pagination="true"
        :enable-row-selection="false"
        @row-click="handleRowClick"
      >
        <template #cell:created_at="{ value }">
          <span class="text-sm">{{ formatMovementDate(value as string) }}</span>
        </template>

        <template #cell:variant="{ item }">
          <div class="flex flex-wrap gap-1">
            <Chip
              v-if="getVariantFromId(item.variant)?.attributes[0]"
              :label="getVariantFromId(item.variant)?.attributes[0].attribute_value"
              color="primary"
              size="sm"
            />
            <Chip
              v-if="getVariantFromId(item.variant)?.attributes[1]"
              :label="getVariantFromId(item.variant)?.attributes[1].attribute_value"
              color="primary"
              size="sm"
            />
          </div>
        </template>

        <template #cell:type="{ value }">
          <Chip
            :label="value === 'in' ? 'In' : 'Out'"
            :icon="value === 'in' ? 'arrow-up' : 'arrow-down'"
            :color="value === 'in' ? 'success' : 'error'"
            size="sm"
            class="!rounded"
          />
        </template>

        <template #cell:quantity="{ value }">
          <span class="text-sm font-semibold">{{ value }}</span>
        </template>

        <template #cell:variant_cost_price="{ value }">
          <span class="text-sm">{{ formatCurrency(Number(value)) }}</span>
        </template>

        <template #cell:reason="{ value }">
          <span class="text-sm">{{ formatReason(value as string) }}</span>
        </template>

        <template #cell:created_by="{ value }">
          <span class="text-sm">{{ value }}</span>
        </template>

        <template #mobile="{ item }">
          <ProductMovementCard
            :movement="item"
            :variant-info="getVariantFromId(item.variant)"
            @click="handleRowClick(item)"
          />
        </template>
      </DataTable>
    </div>

    <!-- Movement Details Modal -->
    <MovementDetailsModal
      :open="showMovementModal"
      :movement="selectedMovement!"
      :show-sku="product.variants.length > 1"
      :variant-info="selectedMovement ? getVariantFromId(selectedMovement.variant) : undefined"
      @close="showMovementModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import EmptyState from "@components/EmptyState.vue"
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import ProductMovementCard from "./ProductMovementCard.vue"
import MovementDetailsModal from "./MovementDetailsModal.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { formatCurrency } from "@/utils/format-currency"
import type { IProductDetails, IInventoryMovement } from "../types"
import type { TableColumn } from "@components/DataTable.vue"

interface Props {
  product: IProductDetails
  movements: IInventoryMovement[]
  movementColumns: TableColumn<IInventoryMovement>[]
  loading?: boolean
}

defineProps<Props>()

const showMovementModal = ref(false)
const selectedMovement = ref<IInventoryMovement | null>(null)

const formatMovementDate = (date: string) => {
  return getSmartDateLabel(date)
}

const formatReason = (reason: string) => {
  // Convert snake_case to Title Case
  return reason
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

const handleRowClick = (movement: IInventoryMovement) => {
  selectedMovement.value = movement
  showMovementModal.value = true
}

const getVariantFromId = (variantId: string) => {
  // For mock data, we'll create a simple mapping
  // In production, this would lookup the actual variant from the product
  const mockVariants: Record<
    string,
    { attributes: Array<{ uid: string; attribute_value: string }> }
  > = {
    "var-blue-large": {
      attributes: [
        { uid: "1", attribute_value: "Blue" },
        { uid: "2", attribute_value: "Large" },
      ],
    },
    "var-red-medium": {
      attributes: [
        { uid: "3", attribute_value: "Red" },
        { uid: "4", attribute_value: "Medium" },
      ],
    },
    "var-green-small": {
      attributes: [
        { uid: "5", attribute_value: "Green" },
        { uid: "6", attribute_value: "Small" },
      ],
    },
  }
  return mockVariants[variantId] || { attributes: [] }
}
</script>
