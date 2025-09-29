<script setup lang="ts">
import { computed, ref } from "vue"
import Chip from "@/components/Chip.vue"
// import { useSalesStore } from "~/stores/sales"
import { getSmartDateLabel } from "@/utils/formatDate"
import { formatCurrency } from "@/utils/format-currency"
import {
  anonymousCustomer,
  ORDER_CHANNELS,
  ORDER_PAYMENT_METHODS,
  ORDER_PAYMENT_STATUS,
  ORDER_SHIPPING_COMPANIES,
} from "../constants"
import { pluralize } from "@/utils/pluralize"
import Icon from "@components/Icon.vue"
import { getCustomerName } from "../utilities"
import type { TOrder, TOrderItem } from "../types"

const props = withDefaults(
  defineProps<{
    order: TOrder
    showActions?: boolean
    showItems?: boolean
    hideMarkPaid?: boolean
    isPopup?: boolean
    loading?: boolean
  }>(),
  {
    order: () => ({}) as TOrder,
    showActions: true,
    showItems: true,
    hideMarkPaid: false,
    isPopup: false,
    loading: false,
  },
)

const emit = defineEmits([
  "click",
  "view",
  "void",
  "delete",
  "edit",
  "open:dropdown",
  "edit:date",
  "complete",
  "issue",
  "share",
  "edit:payment",
  "mark:paid",
  "return",
  "open:paid",
  "toggle:fulfilled",
])

const isFulfilled = computed(() => {
  return props.order?.status && props?.order.items.every((item) => item.delivered_qty >= item.qty)
})

// const menuItems = computed(() => {
//   return [
//     { label: "Edit date", action: () => emit("edit:date") },
//     isFulfilled.value ? false : { label: "Fulfil Order", action: () => emit("complete") },
//     { label: "Complaints", action: () => emit("issue") },
//     {
//       label:
//         props.order?.payment_status === 1
//           ? "Share receipt"
//           : props.order?.payment_status === 2
//             ? "Share invoice/receipt"
//             : "Share invoice",
//       action: () => emit("share"),
//     },
//     props.order?.payment_status === 1
//       ? false
//       : { label: "Update payment", action: () => emit("edit:payment") },
//     // { label: "Return item", action: () => emit("return") },
//     {
//       label: "Void order",
//       class: "text-error",
//       action: () => emit("void"),
//     },
//     !props.order?.payment_status
//       ? {
//           label: "Delete order",
//           class: "text-error",
//           action: () => emit("delete"),
//         }
//       : false,
//   ].filter(Boolean)
// })

// const salesStore = useSalesStore()

const customerName = computed(() =>
  props.order?.customer_info
    ? getCustomerName(props.order.customer_info)
    : getCustomerName(anonymousCustomer),
)

const returnedItemsCount = computed(() => {
  return props.order.items?.filter((item) => item.is_returned).length || 0
})
const itemsNoteCount = computed(() => {
  return props.order.items?.filter((item) => item.note).length || 0
})

// latest and not more than 1 min
// const isLatest = computed(() => {
//   return (
//     salesStore.latestOrder.id == props.order.order_ref &&
//     salesStore.latestOrder.timestamp > Date.now() - 60 * 1000
//   )
// })
const isLatest = ref(false)

const showOrderItems = ref<Record<string, boolean>>({})

const toggleOrderItems = () => {
  if (!props.order?.is_voided) {
    showOrderItems.value[props.order?.order_ref] = !showOrderItems.value[props.order?.order_ref]
  }
}

const showNoteModal = ref(false)
const activeNote = ref({ itemName: "", note: "" })
const openNote = (item: { product_info: { product_name: string }; note: string }) => {
  activeNote.value = { itemName: item.product_info?.product_name || "Unknown", note: item.note }
  showNoteModal.value = true
}

const getItemSkuPrice = (item: TOrderItem) => {
  return (
    item.product_info?.sku?.find((sku) => {
      return sku.option1 === item.selected_option1 && sku.option2 === item.selected_option2
    })?.price || item.price_sold
  )
}

const paymentMode = computed(() =>
  props.order?.order_ref?.startsWith("1")
    ? "Online"
    : (ORDER_PAYMENT_METHODS.find((x) => x.value === props?.order.payment_mode)?.label ?? ""),
)

const outstandingBalance = computed(() => {
  const { total_amount, paid_amount, payment_status } = props.order
  if (payment_status != 1) return Number(total_amount) - Number(paid_amount)
  return 0
})
</script>

<template>
  <div
    class="bg-core-25 border-core-300 mb-3 cursor-pointer rounded-xl border p-3"
    :class="{ relative: isLatest, 'opacity-75': order.is_voided }"
    @click="toggleOrderItems"
  >
    <div>
      <div class="flex items-start gap-2.5">
        <div class="flex-1 truncate text-sm">
          <div class="mb-1 flex items-center gap-1">
            <h4 class="truncate text-left text-sm font-medium capitalize">
              {{ customerName }}
            </h4>
            <span
              v-if="order?.is_voided"
              v-tooltip.right="
                order?.void_reason
                  ? `VOIDED: ${order?.void_reason}`
                  : 'This order has been voided and will not be processed.'
              "
            >
              <Icon name="InfoCircle" class="text-error" :size="20" />
            </span>
            <span class="ml-4 flex-1 text-right text-sm font-semibold">
              {{ formatCurrency(+order.total_amount) }}
            </span>
          </div>
          <div class="mb-1 flex items-center justify-between gap-2">
            <p class="text-core-600 flex flex-wrap items-center text-xs">
              <span :class="{ 'text-xl': isPopup }">
                #{{ order?.order_ref.slice(isPopup ? order?.order_ref?.length - 6 : 0) }}
              </span>
              <span v-if="!isPopup" class="text-primary-500 px-1">&bull;</span>
              <span v-if="!isPopup">
                {{ getSmartDateLabel(order.order_date) }}
              </span>
            </p>
            <p class="truncate text-sm">
              {{
                order.items?.reduce((acc, item) => acc + (item.delivered_qty || 0), 0) +
                "/" +
                order.items?.reduce((acc, item) => acc + item.qty, 0)
              }}
            </p>
          </div>
        </div>
      </div>
      <div v-if="!isPopup" class="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <!-- notes count -->
        <Chip icon="note" color="error" :label="`3 notes`" variant="outlined"> </Chip>
        <!-- returns count -->
        <Chip
          icon="refresh-2"
          :label="`${returnedItemsCount} returns`"
          variant="outlined"
          class="text-primary-500"
        >
        </Chip>
        <!-- memos count -->
        <Chip icon="message-2" color="purple" :label="`${itemsNoteCount} notes`" variant="outlined">
        </Chip>
      </div>
    </div>

    <!-- Items Section -->
    <div
      v-if="showItems && showOrderItems[order.order_ref]"
      class="border-core-50 mt-2 space-y-3 border-t pt-2"
    >
      <div
        v-for="(item, x) in order?.items"
        :key="x"
        class="flex cursor-pointer items-center gap-2.5"
        @click.stop="openNote(item)"
      >
        <!-- image -->
        <img v-if="item.images?.length" :src="item.images[0].image" class="h-8 w-8 rounded-md" />
        <img
          v-else
          src="https://res.cloudinary.com/dwwxvzind/image/upload/v1757112704/Icon_Box_keqfxr.png"
          alt="image placeholder"
          class="h-8 w-8 rounded-md"
        />
        <div class="flex-1 truncate">
          <div class="flex justify-between gap-1">
            <!-- name -->
            <h4 class="truncate text-left text-xs font-medium capitalize">
              {{ item.product_info?.product_name || "Unknown" }}
            </h4>
            <!-- price sold && original price -->
            <div class="flex items-end gap-0.5">
              <span
                v-if="getItemSkuPrice(item) !== item.price_sold"
                class="text-core-400 text-xs line-through"
              >
                {{ formatCurrency(+getItemSkuPrice(item)) }}
              </span>
              <span class="text-xs font-medium">{{ formatCurrency(item.price_sold) }}</span>
            </div>
          </div>
          <div class="flex justify-between gap-1">
            <!-- Qty, selected variant, note -->
            <p class="text-primary-300 flex items-center gap-0.5 text-xs">
              <!-- <span class="text-primary-400">Qty: {{ item.qty }}</span> -->
              <span
                v-if="[item.selected_option1, item.selected_option2].filter(Boolean).length"
                class="text-core-600"
              >
                {{ item.selected_option1 }} {{ item.selected_option2 ? "|" : "" }}
                {{ item.selected_option2 }}
              </span>
              <span v-if="item.note" class="text-primary-500 px-1">&bull;</span>
              <Icon v-if="item.note" name="ClipboardText" size="16" class="text-purple-800" />
            </p>
            <!--  -->
            <button
              v-if="isPopup"
              type="button"
              class="flex items-center gap-0.5 text-sm"
              :class="isFulfilled ? 'text-primary-500' : 'text-primary-300'"
              @click="emit('toggle:fulfilled')"
            >
              Fulfilled
            </button>
            <div
              v-else
              class="inline-flex items-center gap-1 text-xs font-medium"
              :class="
                item.delivered_qty == item.qty
                  ? 'text-success-600'
                  : item.delivered_qty && item.delivered_qty < item.qty
                    ? 'text-blue-500'
                    : 'text-error-600'
              "
            >
              <div
                class="h-1.5 w-1.5 rounded-full"
                :class="
                  item.delivered_qty == item.qty
                    ? 'bg-success-600'
                    : item.delivered_qty && item.delivered_qty < item.qty
                      ? 'bg-blue-500'
                      : 'bg-error-600'
                "
              ></div>
              {{
                item.delivered_qty == item.qty
                  ? "Fulfilled"
                  : item.delivered_qty && item.delivered_qty < item.qty
                    ? `Partly fulfilled ${item.delivered_qty}/${item.qty}`
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
          <span class="text-core-700 font-medium">{{
            formatCurrency(+order?.products_total)
          }}</span>
        </p>
        <p
          v-if="order.shipping_mode"
          class="text-core-600 flex items-center justify-between gap-1 text-sm"
        >
          <span class="flex flex-col">
            <span>
              Delivery ({{
                ORDER_SHIPPING_COMPANIES.find((x) => String(x.value) == order?.shipping_company)
                  ?.label || order?.shipping_company
              }}):
            </span>
            <span v-if="order?.shipping_provider === 'shipbubble'" class="text-xs">
              Provided by
              <img
                src="https://res.cloudinary.com/do2uxmtsx/image/upload/v1752203568/shipbubble_vgrkbu.png"
                alt="Shipbubble"
                class="ml-1 inline-block h-3.5 align-middle"
              />
            </span>
          </span>
          <span class="text-core-700 font-medium">{{
            formatCurrency(+order?.shipping_price)
          }}</span>
        </p>
        <p class="flex items-center justify-between gap-1 text-base">
          <span class="text-core-700 font-medium"> Total Amount </span>
          <span class="text-core-700 font-bold">{{ formatCurrency(+order?.total_amount) }}</span>
        </p>
        <p
          v-if="order?.payment_status == 2"
          class="text-error flex items-center justify-between gap-1 text-sm"
        >
          <span> Outstanding Bal. </span>
          <span>{{ formatCurrency(outstandingBalance) }}</span>
        </p>
      </div>
    </div>

    <hr class="border-core-300 my-2" />

    <div>
      <div class="mb-2 flex justify-between">
        <h4 class="text-core-700 text-sm">Order state</h4>
        <!--  -->
        <!-- <Dropdown
          v-if="showActions && !order.is_voided"
          :items="menuItems"
          @toggle="emit('open:dropdown')"
        ></Dropdown> -->
      </div>
      <!-- footer chips -->
      <div class="flex justify-between gap-1">
        <div class="flex flex-wrap gap-x-1 gap-y-2">
          <!-- payment status -->
          <Chip
            icon="card-tick"
            :label="
              ORDER_PAYMENT_STATUS.find((x) => String(x.value) === String(order.payment_status))
                ?.label + (order.payment_status == 1 && paymentMode ? ` (${paymentMode})` : '')
            "
            variant="outlined"
            :color="
              ORDER_PAYMENT_STATUS.find((x) => String(x.value) === String(order.payment_status))
                ?.color
            "
          >
          </Chip>
          <!-- shipping mode -->
          <Chip
            v-if="!isPopup"
            :icon="order.shipping_mode ? 'truck-fast' : 'location'"
            :label="order.shipping_mode ? 'Delivery' : 'Pick up'"
            variant="outlined"
            color="blue"
            dense
            :disabled="order.is_voided"
          >
          </Chip>
          <!-- Fulfilment -->
          <Chip
            v-if="!isPopup"
            icon="box-time"
            :label="isFulfilled ? 'Fulfilled' : order.is_voided ? 'Voided' : 'Ongoing'"
            variant="outlined"
            dense
            :disabled="order.is_voided"
          />
          <!-- order channels -->
          <template v-if="!isPopup">
            <Chip
              v-if="order?.order_ref?.startsWith('2')"
              dense
              variant="outlined"
              :icon="ORDER_CHANNELS.find((x) => x.value === order.channel)?.icon ?? 'MenuBoard'"
              :label="ORDER_CHANNELS.find((x) => x.value === order.channel)?.label"
              :disabled="order.is_voided"
            >
            </Chip>
            <Chip
              v-else
              dense
              variant="outlined"
              :icon="order?.order_ref?.startsWith('1') ? 'global' : 'clipboard-text'"
              :label="order?.order_ref?.startsWith('1') ? 'Storefront' : 'PopUp'"
              :disabled="order.is_voided"
            >
            </Chip>
          </template>
        </div>

        <Chip
          v-if="isPopup && order.payment_status == 1"
          dense
          class="flex items-center gap-1"
          :disabled="order.is_voided"
        >
          <span>Paid to: </span>
          <Icon name="ShopAdd" size="20" class="text-primary-600" />
        </Chip>

        <Chip
          v-if="isPopup && order.payment_status !== 1 && !hideMarkPaid"
          dense
          class="border-primary-200 text-primary-500 flex items-center gap-1 !rounded-md border-2"
          :disabled="order.is_voided"
          @click="emit('mark:paid')"
        >
          <div class="bg-primary-500/40 flex size-4 items-center justify-center rounded-sm">
            <Icon name="material-symbols-light:check" class="text-primary-500 size-3" />
          </div>
          Mark as Paid
        </Chip>
      </div>
    </div>

    <!-- <span
      v-if="!isPopup && isLatest"
      class="bg-primary-500 absolute top-0.5 left-0 animate-bounce rounded-lg px-1 py-0.5 text-[10px] text-white"
    >
      New
    </span> -->
  </div>
</template>
