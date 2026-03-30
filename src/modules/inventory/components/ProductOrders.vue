<template>
  <div>
    <EmptyState
      v-if="!loading && orders.length === 0"
      icon="shopping-cart"
      title="No orders yet"
      description="Orders for this product will appear here once customers start purchasing."
    />

    <div v-else class="space-y-4 rounded-xl border-gray-200 pt-3 md:border md:bg-white">
      <div class="flex items-center justify-between md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          Orders <Chip :label="String(orders.length)" />
        </h3>
        <div class="flex items-center gap-2">
          <AppButton
            icon="filter-lines"
            size="sm"
            :color="activeFilterCount ? 'primary' : 'alt'"
            :variant="activeFilterCount ? 'outlined' : 'filled'"
            label="Filter"
            :badge="activeFilterCount || undefined"
            class="!hidden md:!inline-flex"
            @click="showFilter = true"
          />
          <AppButton
            icon="filter-lines"
            size="sm"
            :color="activeFilterCount ? 'primary' : 'alt'"
            :variant="activeFilterCount ? 'outlined' : 'filled'"
            label=""
            :badge="activeFilterCount || undefined"
            class="md:hidden"
            @click="showFilter = true"
          />
        </div>
      </div>

      <ListFilterDrawer
        v-model="showFilter"
        :filter-groups="filterGroups"
        @apply="handleApplyFilters"
      />

      <DataTable
        :data="orders"
        :columns="orderColumns"
        :loading="loading"
        :show-pagination="false"
        :empty-state="{
          title: 'No results match this filter',
          description: 'Try adjusting or clearing your filters.',
          actionLabel: 'Clear Filter',
          actionIcon: 'x-close',
        }"
        @empty-action="clearFilters"
        @row-click="handleRowClick"
      >
        <template #cell:order_number="{ value }">
          <span class="text-sm">{{ value }}</span>
        </template>

        <template #cell:created_at="{ value }">
          <span class="text-sm">{{ formatOrderDate(value as string) }}</span>
        </template>

        <template #cell:customer_info="{ item }">
          <Avatar v-if="item.customer" :name="`${item.user_name || 'Customer'}`" size="sm" />
          <Avatar v-else name="Guest Customer" size="sm" />
        </template>

        <template #cell:payment_status="{ value }">
          <Chip
            :label="getPaymentStatusLabel(String(value))"
            :icon="getPaymentStatusIcon(value as string)"
            :color="getPaymentStatusColor(value as string)"
            size="sm"
          />
        </template>

        <!-- Mobile card view -->
        <template #mobile="{ item }">
          <OrderCard :order="item" :order-action-items="getOrderActionItems(item)" />
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import EmptyState from "@components/EmptyState.vue"
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Avatar from "@components/Avatar.vue"
import ListFilterDrawer from "@components/ListFilterDrawer.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { useGetOrders } from "@modules/orders/api"
import type { IProductDetails } from "../types"
import type { TOrder } from "@modules/orders/types"
import type { TableColumn } from "@components/DataTable.vue"
import type { FilterGroup } from "@components/ListFilterDrawer.vue"
import OrderCard from "@modules/orders/components/OrderCard.vue"

interface Props {
  product: IProductDetails
  orderColumns: TableColumn<TOrder>[]
}

interface Emits {
  (e: "create-order"): void
  (e: "order-action", action: string, order: TOrder): void
  (e: "row-click", order: TOrder): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showFilter = ref(false)
const activeFilters = ref<Record<string, string | null>>({})

const orderParams = computed(() => {
  const params: Record<string, string> = { product: props.product.uid }
  if (activeFilters.value.payment_status) params.payment_status = activeFilters.value.payment_status
  if (activeFilters.value.fulfilment_status)
    params.fulfilment_status = activeFilters.value.fulfilment_status
  if (activeFilters.value.source) params.source = activeFilters.value.source
  return params
})

const { data: ordersData, isFetching: loading } = useGetOrders(orderParams)
const orders = computed(() => ordersData.value?.results || [])

const filterGroups: FilterGroup[] = [
  {
    key: "payment_status",
    label: "Payment Status",
    options: [
      { value: "paid", label: "Paid", color: "success", showDot: true },
      { value: "partially_paid", label: "Partially Paid", color: "primary", showDot: true },
      { value: "unpaid", label: "Unpaid", color: "error", showDot: true },
    ],
  },
  {
    key: "fulfilment_status",
    label: "Fulfilment Status",
    options: [
      { value: "fulfilled", label: "Fulfilled", color: "success", showDot: true },
      {
        value: "partially_fulfilled",
        label: "Partially Fulfilled",
        color: "warning",
        showDot: true,
      },
      { value: "unfulfilled", label: "Unfulfilled", color: "error", showDot: true },
    ],
  },
  {
    key: "source",
    label: "Source",
    options: [
      { value: "internal", label: "Internal" },
      { value: "external", label: "External" },
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
}

const formatOrderDate = (date: string) => {
  return getSmartDateLabel(date)
}

const getPaymentStatusLabel = (status: string) => {
  if (status === "paid") return `Paid`
  if (status === "partially_paid") return "Partially Paid"
  return "Unpaid"
}

const getPaymentStatusIcon = (status: string) => {
  if (status === "paid") return "card-tick"
  if (status === "partially_paid") return "card-pos"
  return "card-remove"
}

const getPaymentStatusColor = (status: string) => {
  if (status === "paid") return "success" as const
  if (status === "partially_paid") return "primary" as const
  return "error" as const
}

const getOrderActionItems = (order: TOrder) => [
  {
    label: "View Details",
    icon: "eye-outline",
    action: () => handleOrderAction("view", order),
  },
]

const handleOrderAction = (action: string, order: TOrder) => {
  emit("order-action", action, order)
}

const handleRowClick = (order: TOrder) => {
  emit("row-click", order)
}
</script>
