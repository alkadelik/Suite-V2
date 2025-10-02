<template>
  <div class="bg-core-25 border-core-300 rounded-xl border p-3">
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1">
        <h4 class="mb-1 text-sm font-semibold">{{ customerName }}</h4>
        <p class="text-core-600 text-xs">{{ getSmartDateLabel(order.order_date) }}</p>
      </div>
      <DropdownMenu
        :items="orderActionItems"
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

    <div class="mt-2 flex flex-wrap items-center gap-2">
      <!-- notes count -->
      <Chip
        icon="note"
        color="purple"
        :label="`${itemsNoteCount} notes`"
        variant="outlined"
        size="sm"
      />
      <!-- returns count -->
      <Chip
        icon="refresh-2"
        :label="`${returnedItemsCount} returns`"
        variant="outlined"
        color="primary"
        size="sm"
      />
      <!-- memos count (placeholder for now) -->
      <Chip icon="message-2" color="error" :label="`0 memos`" variant="outlined" size="sm" />
    </div>

    <hr class="border-core-300 my-2" />

    <div>
      <p class="text-core-600 mb-2 text-xs">Order state</p>
      <div class="flex flex-wrap gap-2">
        <!-- Payment status -->
        <Chip
          :icon="getPaymentStatusIcon(order.payment_status)"
          :label="getPaymentStatusLabel(order.payment_status)"
          variant="outlined"
          :color="getPaymentStatusColor(order.payment_status)"
          size="sm"
        />
        <!-- Fulfillment status -->
        <Chip
          icon="box-time"
          :label="getFulfillmentLabel()"
          variant="outlined"
          :color="getFulfillmentColor()"
          size="sm"
        />
        <!-- Shipping mode -->
        <Chip
          :icon="order.shipping_mode ? 'truck-fast' : 'location'"
          :label="order.shipping_mode ? 'Delivery' : 'Pick up'"
          variant="outlined"
          color="blue"
          size="sm"
        />
        <!-- Order channel -->
        <Chip :icon="getChannelIcon()" :label="getChannelLabel()" variant="outlined" size="sm" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { getCustomerName } from "@modules/orders/utilities"
import { anonymousCustomer, ORDER_CHANNELS, ORDER_PAYMENT_METHODS } from "@modules/orders/constants"
import type { TOrder } from "@modules/orders/types"

interface Props {
  order: TOrder
  orderActionItems: Array<{
    label?: string
    icon?: string
    action?: () => void
    class?: string
    iconClass?: string
    divider?: boolean
  }>
}

const props = defineProps<Props>()

const customerName = computed(() =>
  props.order.customer_info
    ? getCustomerName(props.order.customer_info)
    : getCustomerName(anonymousCustomer),
)

const returnedItemsCount = computed(() => {
  return props.order.items?.filter((item) => item.is_returned).length || 0
})

const itemsNoteCount = computed(() => {
  return props.order.items?.filter((item) => item.note).length || 0
})

const isFulfilled = computed(() => {
  return props.order?.status && props.order.items.every((item) => item.delivered_qty >= item.qty)
})

const getPaymentStatusLabel = (status: number) => {
  const paymentMethod = ORDER_PAYMENT_METHODS.find((m) => m.value === props.order.payment_mode)
  const methodLabel = paymentMethod?.label || "Unknown"

  if (status === 1) return `Paid (${methodLabel})`
  if (status === 2) return "Partially Paid"
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

const getFulfillmentLabel = () => {
  if (props.order.is_voided) return "Voided"
  if (isFulfilled.value) return "Fulfilled"

  const totalQty = props.order.items?.reduce((acc, item) => acc + item.qty, 0) || 0
  const deliveredQty =
    props.order.items?.reduce((acc, item) => acc + (item.delivered_qty || 0), 0) || 0

  if (deliveredQty === 0) return "Ongoing"
  return `Ongoing (${deliveredQty}/${totalQty})`
}

const getFulfillmentColor = () => {
  if (props.order.is_voided) return "error" as const
  if (isFulfilled.value) return "success" as const
  return undefined
}

const getChannelIcon = () => {
  if (props.order.order_ref?.startsWith("1")) return "global"
  if (props.order.order_ref?.startsWith("2")) {
    return ORDER_CHANNELS.find((x) => x.value === props.order.channel)?.icon ?? "MenuBoard"
  }
  return "clipboard-text"
}

const getChannelLabel = () => {
  if (props.order.order_ref?.startsWith("1")) return "Storefront"
  if (props.order.order_ref?.startsWith("2")) {
    return ORDER_CHANNELS.find((x) => x.value === props.order.channel)?.label ?? "Unknown"
  }
  return "PopUp"
}
</script>
