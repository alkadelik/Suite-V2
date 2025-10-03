<template>
  <div>
    <EmptyState
      v-if="!loading && orders.length === 0"
      icon="shopping-cart"
      title="No orders yet"
      description="Orders for this product will appear here once customers start purchasing."
      action-label="Create Order"
      action-icon="add"
      @action="$emit('create-order')"
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
            color="alt"
            label="Filter"
            class="!hidden md:!inline-flex"
          />
          <AppButton icon="filter-lines" size="sm" color="alt" label="" class="md:hidden" />
        </div>
      </div>

      <DataTable
        :data="orders"
        :columns="orderColumns"
        :loading="loading"
        :show-pagination="false"
        :enable-row-selection="true"
        @row-click="handleRowClick"
      >
        <template #cell:order_ref="{ value }">
          <span class="text-sm">{{ value }}</span>
        </template>

        <template #cell:order_date="{ value }">
          <span class="text-sm">{{ formatOrderDate(value as string) }}</span>
        </template>

        <template #cell:items="{ item }">
          <div class="max-w-[100px] truncate">
            {{ item.items.map((v) => v.product_name).join(", ") }}
          </div>
        </template>

        <template #cell:customer_info="{ item }">
          <Avatar v-if="item.customer" :name="`${item.customer_name}`" size="sm" />
          <Avatar v-else name="Guest Customer" size="sm" />
        </template>

        <template #cell:payment_status="{ value }">
          <Chip
            :label="getPaymentStatusLabel(String(value))"
            :icon="getPaymentStatusIcon(value as number)"
            :color="getPaymentStatusColor(value as number)"
            size="sm"
          />
        </template>

        <template #cell:action="{ item }">
          <div class="flex items-center gap-2">
            <Icon
              name="edit"
              @click.stop="handleOrderAction('edit', item)"
              class="hidden cursor-pointer hover:text-gray-600 md:inline-block"
            />
            <DropdownMenu
              :items="getOrderActionItems(item)"
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
          <OrderCard :order="item" :order-action-items="getOrderActionItems(item)" />
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Avatar from "@components/Avatar.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import type { IProductDetails } from "../types"
import type { TOrder } from "@modules/orders/types"
import type { TableColumn } from "@components/DataTable.vue"
import OrderCard from "@modules/orders/components/OrderCard.vue"

interface Props {
  product: IProductDetails
  orders: TOrder[]
  orderColumns: TableColumn<TOrder>[]
  loading?: boolean
}

interface Emits {
  (e: "create-order"): void
  (e: "order-action", action: string, order: TOrder): void
  (e: "row-click", order: TOrder): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const formatOrderDate = (date: string) => {
  return getSmartDateLabel(date)
}

const getPaymentStatusLabel = (status: string) => {
  // const paymentMethod = ORDER_PAYMENT_METHODS.find((m) => m.value === order.payment_mode)
  // const methodLabel = paymentMethod?.label || "Unknown"

  if (status === "paid") return `Paid`
  if (status === "partially_paid") return "Partially Paid"
  return "Unpaid"
}

const getPaymentStatusIcon = (status: number) => {
  if (status === 1) return "card-tick"
  if (status === 2) return "card-pos"
  return "card-remove"
}

const getPaymentStatusColor = (status: number) => {
  if (status === 1) return "success" as const
  if (status === 2) return "primary" as const
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
