<script setup lang="ts">
import { computed, ref } from "vue"
import Chip from "@/components/Chip.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { formatCurrency, truncateCurrency } from "@/utils/format-currency"
import { anonymousCustomer, ORDER_PAYMENT_STATUS } from "../constants"
import { pluralize } from "@/utils/pluralize"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import type { TOrder } from "../types"

const props = withDefaults(
  defineProps<{
    order: TOrder
    showActions?: boolean
    customActions?: Array<{
      label?: string
      icon?: string
      action?: () => void
      class?: string
      iconClass?: string
      divider?: boolean
    }>
  }>(),
  {
    order: () => ({}) as TOrder,
    showActions: true,
  },
)

const emit = defineEmits([
  "click",
  "view-memos",
  "share-invoice",
  "update-payment",
  "void-order",
  "delete-order",
  "fulfill",
])

const isFulfilled = computed(() => {
  return props.order?.fulfilment_status === "fulfilled"
})

const isBuyerCreated = computed(() => {
  return props.order?.source?.includes("storefront")
})

const menuItems = computed(() => {
  const showVoid =
    (isFulfilled.value || props.order?.payment_status !== "unpaid") && !isBuyerCreated.value
  const showDelete =
    !isFulfilled.value && props.order?.payment_status === "unpaid" && !isBuyerCreated.value

  return props.customActions?.length
    ? props.customActions
    : [
        { label: "View details", icon: "eye", action: () => emit("click") },
        { label: "View memos", icon: "note", action: () => emit("view-memos") },
        {
          label: `Share ${props.order.payment_status === "paid" ? "receipt" : "invoice"}`,
          icon: "share",
          action: () => emit("share-invoice"),
        },
        ...(props.order.payment_status !== "paid"
          ? [{ label: "Update Payment", icon: "money-add", action: () => emit("update-payment") }]
          : []),
        ...(isFulfilled.value
          ? []
          : [{ label: "Fulfill Order", icon: "money-add", action: () => emit("fulfill") }]),
        ...(showVoid || showDelete ? [{ divider: true }] : []),
        ...(showVoid
          ? [
              {
                label: "Void Order",
                icon: "trash",
                class: "text-red-600 hover:bg-red-50",
                iconClass: "text-red-600",
                action: () => emit("void-order"),
              },
            ]
          : []),
        ...(showDelete
          ? [
              {
                label: "Delete Order",
                icon: "trash",
                class: "text-red-600 hover:bg-red-50",
                iconClass: "text-red-600",
                action: () => emit("delete-order"),
              },
            ]
          : []),
      ]
})

const itemsNoteCount = computed(() => {
  return props.order.items?.filter((item) => item.notes).length || 0
})

const showOrderItems = ref<Record<string, boolean>>({})

const toggleOrderItems = () => {
  showOrderItems.value[props.order?.order_number] = !showOrderItems.value[props.order?.order_number]
}

const outstandingBalance = computed(() => {
  return props.order.outstanding_balance || 0
})
</script>

<template>
  <div :class="['border-warning-200 cursor-pointer rounded-xl border']" @click="toggleOrderItems">
    <div class="bg-warning-50 rounded-t-xl p-2">
      <div class="flex items-start gap-2.5">
        <div class="flex-1 truncate text-sm">
          <div class="mb-1 flex items-center gap-1">
            <h3 class="!font-outfit truncate text-left text-sm font-semibold capitalize">
              {{ order.customer_name || anonymousCustomer.full_name }}
            </h3>
            <!-- truncates from 100k upwards -->
            <span class="ml-4 flex-1 text-right text-base font-semibold">
              {{
                +order.total_amount >= 100000
                  ? truncateCurrency(+order.total_amount)
                  : formatCurrency(+order.total_amount, { kobo: true })
              }}
            </span>
            <DropdownMenu
              v-if="showActions && order.fulfilment_status !== 'voided'"
              :items="menuItems"
            />
          </div>
          <div class="mb-1 flex items-center justify-between gap-2">
            <p class="text-core-600 flex items-center text-xs">
              <span>#{{ order?.order_number }}</span>
              <span class="text-primary-500 px-1">&bull;</span>
              <span>{{ getSmartDateLabel(order.created_at) }}</span>
            </p>
            <!-- <p class="truncate text-sm">
              {{
                order.items?.reduce((acc, item) => acc + (item.qty_fulfilled || 0), 0) +
                "/" +
                order.items?.reduce((acc, item) => acc + item.quantity, 0)
              }}
            </p> -->
          </div>
        </div>
      </div>
    </div>

    <!-- body -->
    <div class="px-5 py-3">
      <div
        v-if="itemsNoteCount > 0"
        class="border-core-50 flex flex-wrap items-center gap-2 space-y-3 border-b pb-2 text-sm"
      >
        <!-- memos count -->
        <Chip
          v-if="itemsNoteCount > 0"
          icon="message-2"
          color="purple"
          :label="`${itemsNoteCount} ${pluralize('memo', itemsNoteCount)}`"
          variant="outlined"
        />
      </div>

      <!-- Items Section -->
      <div v-if="showOrderItems[order.order_number]" class="space-y-3">
        <div
          v-for="(item, x) in order?.items"
          :key="x"
          class="flex cursor-pointer items-center gap-2.5"
        >
          <!-- image placeholder -->
          <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
            <Icon name="box" :size="24" class="text-primary-700" />
          </span>

          <div class="flex-1 truncate">
            <div class="flex justify-between gap-1">
              <!-- name -->
              <h4 class="!font-outfit truncate text-left text-sm font-medium capitalize">
                {{ item.product_name || "Unknown" }}
              </h4>
              <!-- price -->
              <span class="text-xs font-medium">{{ formatCurrency(+item.unit_price) }}</span>
            </div>
            <div class="flex justify-between gap-1">
              <!-- Variant, note -->
              <p class="text-primary-300 flex items-center gap-0.5 text-xs">
                <span v-if="item.variant_name" class="text-core-600">
                  {{ item.variant_name }}
                </span>
                <span v-if="item.notes" class="text-primary-500 px-1">&bull;</span>
                <Icon v-if="item.notes" name="ClipboardText" size="16" class="text-purple-800" />
              </p>
              <!--  -->
              <div
                class="inline-flex items-center gap-1 text-xs font-medium"
                :class="
                  item.qty_fulfilled == item.quantity
                    ? 'text-success-600'
                    : item.qty_fulfilled && item.qty_fulfilled < item.quantity
                      ? 'text-blue-500'
                      : 'text-error-600'
                "
              >
                <div
                  class="h-1.5 w-1.5 rounded-full"
                  :class="
                    item.qty_fulfilled == item.quantity
                      ? 'bg-success-600'
                      : item.qty_fulfilled && item.qty_fulfilled < item.quantity
                        ? 'bg-blue-500'
                        : 'bg-error-600'
                  "
                ></div>
                {{
                  item.qty_fulfilled == item.quantity
                    ? "Fulfilled"
                    : item.qty_fulfilled && item.qty_fulfilled < item.quantity
                      ? `Partly fulfilled ${item.qty_fulfilled}/${item.quantity}`
                      : "Unfulfilled"
                }}
              </div>
            </div>
          </div>
        </div>

        <hr class="border-core-50 border-dashed" />

        <div class="space-y-1.5">
          <p class="text-core-600 flex items-center justify-between gap-1 text-sm">
            <span>
              Subtotal ({{ order?.items?.length }} {{ pluralize("item", order?.items?.length) }}):
            </span>
            <span class="text-core-700 font-medium">{{ formatCurrency(+order?.subtotal) }}</span>
          </p>
          <p
            v-if="order.fulfilment_method === 'delivery'"
            class="text-core-600 flex items-center justify-between gap-1 text-sm"
          >
            <span>Delivery Fee:</span>
            <span class="text-core-700 font-medium">{{
              formatCurrency(+order?.delivery_fee)
            }}</span>
          </p>
          <p class="flex items-center justify-between gap-1 text-base">
            <span class="text-core-700 font-medium"> Total Amount </span>
            <span class="text-core-700 font-bold">{{ formatCurrency(+order?.total_amount) }}</span>
          </p>
          <p
            v-if="order?.payment_status === 'partially_paid'"
            class="text-error flex items-center justify-between gap-1 text-sm"
          >
            <span> Outstanding Bal. </span>
            <span>{{ formatCurrency(outstandingBalance) }}</span>
          </p>
        </div>
      </div>

      <hr v-if="showOrderItems[order.order_number]" class="border-core-300 my-2 border-dashed" />

      <div>
        <div class="mb-2 flex justify-between">
          <h4 class="text-core-700 !font-outfit text-sm">Order state</h4>
        </div>
        <!-- footer chips -->
        <div class="flex justify-between gap-1">
          <div class="flex flex-wrap gap-x-1 gap-y-2">
            <!-- payment status -->
            <Chip
              icon="card-tick"
              :label="
                ORDER_PAYMENT_STATUS.find((x) => x.value === order.payment_status)?.label ||
                order.payment_status
              "
              variant="outlined"
              :color="ORDER_PAYMENT_STATUS.find((x) => x.value === order.payment_status)?.color"
            />
            <!-- fulfilment method -->
            <Chip
              :icon="order.fulfilment_method === 'delivery' ? 'truck-fast' : 'location'"
              :label="order.fulfilment_method === 'delivery' ? 'Delivery' : 'Pick up'"
              variant="outlined"
              color="blue"
              dense
            />
            <!-- Fulfilment status -->
            <Chip
              icon="box-time"
              :label="
                isFulfilled
                  ? 'Fulfilled'
                  : order.fulfilment_status === 'partially_fulfilled'
                    ? 'Partial'
                    : 'Ongoing'
              "
              variant="outlined"
              dense
            />
            <!-- source -->
            <Chip
              dense
              variant="outlined"
              :icon="order.source === 'internal' ? 'clipboard-text' : 'global'"
              :label="order.source === 'internal' ? 'Internal' : 'External'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
