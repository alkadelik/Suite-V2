<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { useMediaQuery } from "@vueuse/core"
import { TOrder } from "../types"
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import { startCase } from "@/utils/format-strings"
import Icon from "@components/Icon.vue"
import { computed } from "vue"
import { useSettingsStore } from "@modules/settings/store"
import { clipboardCopy } from "@/utils/others"
import AppButton from "@components/AppButton.vue"

type UnknownRecord = Record<string, unknown>

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v)

const toText = (v: unknown, fallback = "-") => {
  if (v === null || v === undefined) return fallback
  if (typeof v === "string") {
    const s = v.trim()
    return s.length ? s : fallback
  }
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : fallback
  if (typeof v === "boolean" || typeof v === "bigint") return String(v)
  return fallback
}

const pickFirst = (obj: UnknownRecord, keys: string[]) => {
  for (const k of keys) {
    const v = obj[k]
    const t = toText(v, "")
    if (t) return v
  }
  return undefined
}

const toNumber = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const cleaned = v.replace(/[₦,\s]/g, "").trim()
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

const props = defineProps<{
  open: boolean
  order: TOrder
  customActions?: Array<{
    label?: string
    icon?: string
    action?: () => void
    class?: string
    iconClass?: string
    divider?: boolean
  }>
}>()

const emit = defineEmits([
  "close",
  "refresh",
  "view-memos",
  "mark-as-paid",
  "share-receipt",
  "share-invoice",
  "share-payment-link",
  "update-payment",
  "fulfill",
  "void-order",
  "delete-order",
])

const isMobile = useMediaQuery("(max-width: 1028px)")

/**
 * ✅ NORMALISE SHIPPING FIELDS (this is what fixes the mobile `--`)
 */
const shipping = computed(() => {
  const x = props.order as unknown as UnknownRecord

  const orderObj = isRecord(x["order"]) ? x["order"] : undefined
  const shippingDetails = isRecord(x["shipping_details"]) ? x["shipping_details"] : undefined

  // IDs
  const orderId =
    pickFirst(orderObj ?? x, ["order_number", "orderNumber", "uid", "id"]) ??
    pickFirst(x, ["order_number", "orderNumber", "uid", "id"])

  const shipmentId =
    pickFirst(x, ["shipment_id", "shipmentId", "shipbubble_order_id", "shipbubbleOrderId"]) ??
    (shippingDetails ? pickFirst(shippingDetails, ["shipment_id", "shipmentId"]) : undefined)

  // Courier
  const courierName =
    pickFirst(x, ["courier_name", "courierName", "courier"]) ??
    (orderObj ? pickFirst(orderObj, ["courier_name", "courierName", "courier"]) : undefined)

  // Fees
  const deliveryFeeRaw =
    pickFirst(x, ["delivery_fee", "deliveryFee", "price", "fee", "shipping_fee"]) ??
    (orderObj
      ? pickFirst(orderObj, ["delivery_fee", "deliveryFee", "price", "fee", "shipping_fee"])
      : undefined)

  const deliveryFee = toNumber(deliveryFeeRaw)

  // Dates
  const expectedDeliveryDate =
    pickFirst(x, ["expected_delivery_date", "delivery_date", "deliveryDate"]) ??
    (orderObj
      ? pickFirst(orderObj, ["expected_delivery_date", "delivery_date", "deliveryDate"])
      : undefined)

  // Tracking
  const trackingUrl =
    (shippingDetails ? pickFirst(shippingDetails, ["tracking_url", "trackingUrl"]) : undefined) ??
    pickFirst(x, ["tracking_url", "trackingUrl"])

  return {
    orderIdText: toText(orderId, "--"),
    shipmentIdText: toText(shipmentId, "--"),
    courierNameText: toText(courierName, "--"),

    expectedDeliveryDateText:
      typeof expectedDeliveryDate === "string" && expectedDeliveryDate.trim()
        ? formatDate(expectedDeliveryDate)
        : "--",

    deliveryFeeText:
      typeof deliveryFee === "number" && deliveryFee > 0
        ? formatCurrency(deliveryFee, { kobo: true })
        : "--",

    trackingUrl: typeof trackingUrl === "string" ? trackingUrl : undefined,
  }
})

/* the rest of your existing code below can remain the same */
const customerName = computed(() => props.order.customer_name || "Unknown Customer")
const itemsCount = computed(() =>
  (props.order.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
)
const productsTotal = computed(() => toNumber(props.order.subtotal) ?? 0)
const deliveryFee = computed(() => toNumber(props.order.delivery_fee) ?? 0)

const storeVatRate = computed(() => {
  const rate = useSettingsStore().storeDetails?.tax_rate
  return rate ? `${Number(rate) * 100}%` : "7.5%"
})

const isFulfilled = computed(() => props.order?.fulfilment_status === "fulfilled")
const isBuyerCreated = computed(() => props.order?.source?.includes("storefront"))

const menuItems = computed(() => {
  if (props.customActions && props.customActions.length > 0) return props.customActions

  const paymentStatus = props.order?.payment_status
  const showVoid = (isFulfilled.value || paymentStatus !== "unpaid") && !isBuyerCreated.value
  const showDelete = !isFulfilled.value && paymentStatus === "unpaid" && !isBuyerCreated.value

  return [
    { label: "View memos", icon: "note", action: () => emit("view-memos") },
    ...(paymentStatus !== "paid"
      ? [{ label: "Mark as Paid", icon: "money-add", action: () => emit("mark-as-paid") }]
      : []),
    ...(paymentStatus === "paid" || paymentStatus === "partially_paid"
      ? [{ label: "Share receipt", icon: "share", action: () => emit("share-receipt") }]
      : []),
    ...(paymentStatus === "unpaid" || paymentStatus === "partially_paid"
      ? [{ label: "Share invoice", icon: "share", action: () => emit("share-invoice") }]
      : []),
    ...(paymentStatus === "unpaid" || paymentStatus === "partially_paid"
      ? [{ label: "Share payment link", icon: "share", action: () => emit("share-payment-link") }]
      : []),
    ...(paymentStatus !== "paid"
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
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex items-center justify-between px-6 py-4">
        <h2 class="text-core-800 text-lg font-semibold">
          Order #{{ shipping.orderIdText }}
          <Icon
            name="copy"
            size="14"
            class="text-primary-600 ml-2 cursor-pointer hover:animate-bounce"
            @click="clipboardCopy(order.order_number)"
          />
        </h2>
        <button
          type="button"
          @click="emit('close')"
          class="text-core-800 hover:text-core-600 transition-colors"
        >
          <Icon name="close-circle" size="20" />
        </button>
      </div>
    </template>

    <div v-if="order.fulfilment_status !== 'voided'" class="mb-4 flex justify-end">
      <DropdownMenu :items="menuItems" size="sm">
        <template #trigger>
          <AppButton icon="settings-02" label="Manage Order" variant="outlined" size="sm" />
        </template>
      </DropdownMenu>
    </div>

    <div
      v-else
      class="bg-error-25 text-error-700 border-error-300 mb-4 flex items-center gap-3 rounded-xl border px-3 py-3"
    >
      <span
        class="border-error-200 ring-error-100 flex size-6 flex-shrink-0 items-center justify-center rounded-full border-2 ring-2 ring-offset-2"
      >
        <Icon name="info-circle" size="16" />
      </span>
      <div class="text-sm">
        <p>
          This is order has been voided and all its items are no longer available for fulfillment.
        </p>
      </div>
    </div>

    <div class="space-y-4">
      <!-- Order Items -->
      <div class="border-core-300 bg-core-25 my-6 space-y-4 rounded-xl border p-4">
        <div
          v-for="(item, idx) in order.items"
          :key="`${item.uid}-${idx}`"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <Icon name="box" class="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h4 class="text-sm font-medium">
                {{ item.product_name }}
                <span class="text-primary-700 ml-1 text-xs font-medium"
                  >(x{{ item.quantity }})</span
                >
              </h4>
              <p v-if="item.variant_name" class="text-core-500 text-xs">
                {{ item.variant_name.split(" - ")[1] || item.variant_name }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-medium">
              {{
                toNumber(item.total_price)
                  ? formatCurrency(toNumber(item.total_price)!, { kobo: true })
                  : "-"
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
        <p class="text-sm font-medium">{{ customerName }}</p>
        <div class="flex flex-col gap-2">
          <div class="flex min-w-0 items-center gap-1">
            <Icon name="sms" class="text-core-600 h-4 w-4 shrink-0" />
            <span class="truncate text-sm font-medium">{{ order.customer_email || "N/A" }}</span>
          </div>
          <div class="flex min-w-0 items-center gap-1">
            <Icon name="call" class="text-core-600 h-4 w-4 shrink-0" />
            <span class="truncate text-sm font-medium">{{ order.customer_phone || "N/A" }}</span>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
        <h4 class="text-sm font-medium">Order Summary</h4>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Total items count</span>
          <span class="font-medium">{{ itemsCount }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Subtotal</span>
          <span class="font-medium">{{ formatCurrency(productsTotal, { kobo: true }) }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Delivery Fee</span>
          <span class="font-medium">
            {{ deliveryFee > 0 ? formatCurrency(deliveryFee, { kobo: true }) : "-" }}
          </span>
        </p>
        <p
          v-if="order.tax_amount && Number(order.tax_amount) > 0"
          class="flex justify-between text-sm"
        >
          <span class="text-core-600">
            VAT ({{ order.tax_rate_used ? `${+order.tax_rate_used * 100}%` : storeVatRate }})
          </span>
          <span class="font-medium">{{ formatCurrency(Number(order.tax_amount)) }}</span>
        </p>
        <p
          v-if="Number(order.discount_amount) > 0"
          class="flex justify-between text-sm text-green-600"
        >
          <span>Discount</span>
          <span class="font-medium">-{{ formatCurrency(Number(order.discount_amount)) }}</span>
        </p>
        <div class="border-core-200 my-2 border-t border-dashed"></div>
        <p class="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span class="text-primary-600">
            {{ formatCurrency(order.total_amount, { kobo: true }) }}
          </span>
        </p>
      </div>

      <!-- Payment Information -->
      <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
        <h4 class="text-sm font-medium">Payment Information</h4>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Payment Status</span>
          <span
            class="font-medium"
            :class="{
              'text-green-600': order.payment_status === 'paid',
              'text-yellow-600': order.payment_status === 'partially_paid',
              'text-red-600': order.payment_status === 'unpaid',
            }"
          >
            {{ startCase(order.payment_status) }}
          </span>
        </p>
        <p v-if="order.payment_status !== 'unpaid'" class="flex justify-between text-sm">
          <span class="text-core-600">Amount Paid</span>
          <span class="font-medium">{{ formatCurrency(order.total_paid, { kobo: true }) }}</span>
        </p>
        <p v-if="order.outstanding_balance > 0" class="flex justify-between text-sm">
          <span class="text-core-600">Outstanding Balance</span>
          <span class="font-medium text-red-600">
            {{ formatCurrency(order.outstanding_balance, { kobo: true }) }}
          </span>
        </p>
      </div>

      <!-- Shipping & Delivery -->
      <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Order ID</span>
          <span class="font-medium">{{ shipping.orderIdText }}</span>
        </p>

        <p class="flex justify-between text-sm">
          <span class="text-core-600">Shipment ID</span>
          <span class="font-medium">{{ shipping.shipmentIdText }}</span>
        </p>

        <p class="flex justify-between text-sm">
          <span class="text-core-600">Courier</span>
          <span class="font-medium">{{ shipping.courierNameText }}</span>
        </p>

        <p class="flex justify-between text-sm">
          <span class="text-core-600">Expected Delivery Date</span>
          <span class="font-medium">{{ shipping.expectedDeliveryDateText }}</span>
        </p>

        <p class="flex justify-between text-sm">
          <span class="text-core-600">Delivery Fee</span>
          <span class="font-medium">{{ shipping.deliveryFeeText }}</span>
        </p>

        <div v-if="shipping.trackingUrl" class="flex items-center justify-between gap-6 text-sm">
          <span class="text-core-600 flex-shrink-0">Tracking ID</span>
          <div class="flex items-center gap-2 truncate">
            <a
              :href="shipping.trackingUrl"
              target="_blank"
              class="text-primary-600 max-w-sm truncate font-medium underline underline-offset-2"
            >
              {{ shipping.trackingUrl }}
            </a>
            <Icon
              name="copy"
              size="28"
              class="text-primary-600 cursor-pointer"
              @click="clipboardCopy(shipping.trackingUrl)"
            />
          </div>
        </div>
      </div>
    </div>
  </component>
</template>
