<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import { startCase } from "@/utils/format-strings"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import type { ICustomer } from "@modules/customers/types"
import { computed } from "vue"
import { IShippingCourier } from "@modules/shared/types"
import { DELIVERY_PAYMENT_OPTION } from "@modules/orders/constants"

interface OrderItem {
  product: { uid: string; product_name: string; total_stock: number; image?: string | null }
  variant: {
    uid: string
    name: string
    sku: string
    price: string
    original_price?: number
  } | null
  quantity: number
  unit_price: number
  notes?: string
}

interface ShippingInfo {
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "fulfilled" | "unfulfilled"
  delivery_address: string | { label: string; value: string }
  delivery_type: "standard" | "express"
  delivery_method: "manual" | "shipbubble" | "custom"
  courier: string | IShippingCourier
  delivery_fee: number
  order_date: string
  order_channel: { label: string; value: string }
  has_shipping: boolean
  delivery_payment_option: string
  express_delivery_option?: string
  manual_delivery_option?: string
}

interface PaymentInfo {
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_amount: number
  payment_source?: { label: string; value: string }
  coupon_code: string | null
  discount_amount: number
}

const props = defineProps<{
  orderItems: OrderItem[]
  customer: ICustomer | null
  shippingInfo: ShippingInfo
  paymentInfo: PaymentInfo
  productsTotal: number
  deliveryFee: number
  vatAmount: number
  totalAmount: number
  loading: boolean
  isFreeShipping: boolean
}>()

const emit = defineEmits<{
  prev: []
  submit: []
}>()

const customerName = computed(() => {
  if (!props.customer) return "Unknown Customer"
  const firstName = props.customer.first_name || ""
  const lastName = props.customer.last_name || ""
  return `${firstName} ${lastName}`.trim() || props.customer?.full_name || "Unknown Customer"
})

const itemsCount = computed(() => {
  return props.orderItems.reduce((sum, item) => sum + Number(item.quantity), 0)
})

const deliveryTypeLabel = computed(() => {
  if (props.shippingInfo.fulfilment_method !== "delivery") return null

  const type = startCase(props.shippingInfo.delivery_type)

  // Express delivery doesn't have a method, it's just express
  if (props.shippingInfo.delivery_type === "express") {
    return type
  }

  // Standard delivery has methods
  let method = ""
  if (props.shippingInfo.delivery_method === "manual") {
    method = "Manual"
  } else if (props.shippingInfo.delivery_method === "shipbubble") {
    method = "Shipbubble"
  } else if (props.shippingInfo.delivery_method === "custom") {
    method = "Custom"
  }

  return method ? `${type} - ${method}` : type
})

const deliveryPaymentLabel = computed(() => {
  if (props.shippingInfo.fulfilment_method !== "delivery") return null
  const option = DELIVERY_PAYMENT_OPTION.find(
    (opt) => opt.value === props.shippingInfo.delivery_payment_option,
  )
  if (!option) return "N/A"

  const isFulfilled = props.shippingInfo.fulfilment_status === "fulfilled"
  return isFulfilled
    ? option.label.replace("pays", "paid").replace("Shipping", "shipping")
    : option.label
})
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="shop-add" size="28" />
    </div>
    <p class="mb-4 text-sm">Double-check everything before confirming this order.</p>

    <div
      v-if="shippingInfo.delivery_method === 'shipbubble'"
      class="bg-primary-25 text-warning-700 border-warning-300 my-6 flex items-center gap-3 rounded-xl border px-3 py-3 md:px-6"
    >
      <span
        class="border-primary-200 ring-primary-100 flex size-8 flex-shrink-0 items-center justify-center rounded-full border-2 ring-2 ring-offset-2"
      >
        <Icon name="info-circle" size="20" />
      </span>
      <div class="text-sm">
        <p class="font-medium">Heads Up!</p>
        <p>
          The delivery for this order will be handled by ShipBubble, not Leyyow. Once you proceed, a
          secure payment window will open for you to pay the delivery fee.
        </p>
      </div>
    </div>

    <div class="space-y-4">
      <!-- Order Items -->

      <div class="border-core-300 bg-core-25 my-6 space-y-4 rounded-xl border p-4">
        <div
          v-for="(item, idx) in orderItems"
          :key="`${item.product.uid}-${item.variant?.uid || idx}`"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="item.product.image"
              :src="item.product.image"
              :alt="item.product.product_name"
              class="h-10 w-10 rounded-lg object-cover"
            />
            <div v-else class="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <Icon name="box" class="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h4 class="text-sm font-medium">
                {{ item.product.product_name }}
                <span class="text-primary-700 ml-1 text-xs font-medium">
                  (x{{ item.quantity }})
                </span>
              </h4>
              <p v-if="item.variant" class="text-core-500 text-xs">
                {{ item.variant.name.split(" - ")[1] || item.variant.name }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <span
              v-if="item.variant?.original_price && item.variant.original_price !== item.unit_price"
              class="text-core-400 text-xs line-through"
            >
              {{ formatCurrency(item.quantity * item.variant.original_price) }}
            </span>
            <span class="ml-1 text-sm font-medium">
              {{ formatCurrency(Number(item.quantity * item.unit_price)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
        <p class="text-sm font-medium">{{ customerName }}</p>
        <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-1">
            <Icon name="sms" size="16" class="text-core-600 flex-shrink-0" />
            <span class="truncate text-sm font-medium">{{ customer?.email || "N/A" }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon name="call" size="16" class="text-core-600 flex-shrink-0" />
            <span class="truncate text-sm font-medium">{{ customer?.phone || "N/A" }}</span>
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
          <span class="text-core-600"
            >Delivery Fee
            <span v-if="isFreeShipping" class="text-primary-600 text-xs"
              >(Free Shipping)</span
            ></span
          >
          <span class="font-medium" :class="{ 'font-normal! line-through': isFreeShipping }">
            {{ deliveryFee > 0 ? formatCurrency(deliveryFee, { kobo: true }) : "-" }}
          </span>
        </p>
        <p v-if="vatAmount > 0" class="flex justify-between text-sm">
          <span class="text-core-600">VAT (7.5%)</span>
          <span class="font-medium">{{ formatCurrency(vatAmount, { kobo: true }) }}</span>
        </p>
        <p
          v-if="paymentInfo.discount_amount > 0"
          class="flex justify-between text-sm text-green-600"
        >
          <span>Discount</span>
          <span class="font-medium"
            >-{{ formatCurrency(paymentInfo.discount_amount, { kobo: true }) }}</span
          >
        </p>
        <div class="border-core-200 my-2 border-t border-dashed"></div>
        <div class="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <div class="text-right">
            <span class="text-primary-600">{{ formatCurrency(totalAmount, { kobo: true }) }}</span>
            <br />
            <span class="text-core-600 text-sm font-normal line-through" v-if="isFreeShipping">
              {{ formatCurrency(totalAmount + deliveryFee, { kobo: true }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
        <h4 class="text-sm font-medium">Payment Information</h4>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Payment Status</span>
          <span
            class="font-medium"
            :class="{
              'text-green-600': paymentInfo.payment_status === 'paid',
              'text-yellow-600': paymentInfo.payment_status === 'partially_paid',
              'text-red-600': paymentInfo.payment_status === 'unpaid',
            }"
          >
            {{ startCase(paymentInfo.payment_status) }}
          </span>
        </p>
        <p v-if="paymentInfo.payment_source" class="flex justify-between text-sm">
          <span class="text-core-600">Payment Method</span>
          <span class="font-medium">{{ paymentInfo.payment_source.label }}</span>
        </p>
        <p v-if="paymentInfo.payment_status !== 'unpaid'" class="flex justify-between text-sm">
          <span class="text-core-600">Amount Paid</span>
          <span class="font-medium">{{
            formatCurrency(paymentInfo.payment_amount, { kobo: true })
          }}</span>
        </p>
      </div>

      <!-- Shipping & Delivery -->
      <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
        <h4 class="text-sm font-medium">Shipping & Delivery</h4>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Order Date</span>
          <span class="font-medium">{{ formatDate(shippingInfo.order_date) }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Order Channel</span>
          <span class="font-medium">{{ shippingInfo.order_channel.label }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Has this product been delivered?</span>
          <span class="font-medium">{{
            shippingInfo.fulfilment_status === "fulfilled" ? "Yes" : "No"
          }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">{{
            shippingInfo.fulfilment_status === "fulfilled"
              ? "How was it delivered?"
              : "How will it be delivered?"
          }}</span>
          <span class="font-medium">{{ startCase(shippingInfo.fulfilment_method) }}</span>
        </p>
        <template v-if="shippingInfo.fulfilment_method === 'delivery'">
          <p class="flex justify-between text-sm">
            <span class="text-core-600">{{
              shippingInfo.fulfilment_status === "fulfilled"
                ? "Who paid for delivery?"
                : "Who will pay for delivery?"
            }}</span>
            <span class="font-medium">{{ deliveryPaymentLabel }}</span>
          </p>
          <p v-if="deliveryTypeLabel" class="flex justify-between text-sm">
            <span class="text-core-600">Delivery Type</span>
            <span class="font-medium">{{ deliveryTypeLabel }}</span>
          </p>
          <p v-if="shippingInfo.delivery_address" class="flex justify-between text-sm">
            <span class="text-core-600">Delivery Address</span>
            <span class="max-w-[60%] text-right font-medium">
              {{
                typeof shippingInfo.delivery_address === "string"
                  ? shippingInfo.delivery_address
                  : shippingInfo.delivery_address?.label
              }}
            </span>
          </p>
          <p
            v-if="
              shippingInfo.courier &&
              (shippingInfo.delivery_type === 'standard' ||
                shippingInfo.delivery_payment_option === 'customer_pays_courier')
            "
            class="flex justify-between text-sm"
          >
            <span class="text-core-600">Courier</span>
            <span class="font-medium">
              {{ (shippingInfo.courier as IShippingCourier)?.courier_name || shippingInfo.courier }}
            </span>
          </p>
        </template>
      </div>
    </div>

    <div class="h-24" />

    <div
      class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-4 md:p-6"
    >
      <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
      <AppButton label="Create Order" class="w-2/3" :loading="loading" @click="emit('submit')" />
    </div>
  </div>
</template>
