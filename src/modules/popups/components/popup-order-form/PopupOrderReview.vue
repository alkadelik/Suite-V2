<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import type { ICustomer } from "@modules/customers/types"
import { PopupInventory } from "@modules/popups/types"
import { computed } from "vue"

interface PopupOrderItem {
  product: PopupInventory
  quantity: number
  unit_price: number
  notes?: string
}

interface ShippingInfo {
  fulfilment_method: "pickup" | "delivery"
  fulfilment_status: "unfulfilled" | "fulfilled"
  delivery_address: string
  delivery_method: "manual" | "automatic"
  courier: string
  delivery_fee: number
  order_date: string
  order_channel: string
  has_shipping: boolean
}

interface PaymentInfo {
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_amount: number
  payment_mode?: { label: string; value: string }
  coupon_code: string | null
  discount_amount: number
}

const props = defineProps<{
  orderItems: PopupOrderItem[]
  customer: ICustomer | null
  shippingInfo: ShippingInfo
  paymentInfo: PaymentInfo
  productsTotal: number
  totalAmount: number
  loading: boolean
  itemsCount: number
  deliveryFee: number
}>()

const emit = defineEmits<{
  prev: []
  submit: []
}>()

const customerName = computed(() => {
  if (!props.customer) return "Unknown Customer"
  return (
    props.customer.full_name ||
    `${props.customer.first_name || ""} ${props.customer.last_name || ""}`.trim() ||
    props.customer.email ||
    "Unknown Customer"
  )
})

const getItemTotal = (item: PopupOrderItem) => {
  return item.quantity * item.unit_price
}
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="clipboard-text" size="28" />
    </div>
    <p class="mb-4 text-sm">Review and confirm order details before creating.</p>

    <!-- Order Items -->
    <section class="mb-8">
      <h3 class="mb-4 text-lg font-semibold">Order Items</h3>
      <div class="border-core-300 bg-core-25 space-y-4 rounded-xl border p-4">
        <div
          v-for="item in orderItems"
          :key="item.product.uid"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="item.product.product_image"
              :src="item.product.product_image"
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
              <p v-if="item.product.variant_name" class="text-core-500 text-xs">
                {{ item.product.variant_name }}
              </p>
              <p v-if="item.notes" class="text-core-500 text-xs italic">{{ item.notes }}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-medium">
              {{ formatCurrency(getItemTotal(item)) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Customer Details -->
    <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
      <h4 class="text-sm font-medium">Customer Details</h4>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Name</span>
        <span class="font-medium">{{ customerName }}</span>
      </p>
      <div v-if="customer?.email" class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <Icon name="sms" class="text-core-600 h-4 w-4" />
          <span class="text-core-600 text-sm">Email</span>
        </div>
        <span class="text-sm font-medium">{{ customer.email }}</span>
      </div>
      <div v-if="customer?.phone" class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <Icon name="call" class="text-core-600 h-4 w-4" />
          <span class="text-core-600 text-sm">Phone</span>
        </div>
        <span class="text-sm font-medium">{{ customer.phone }}</span>
      </div>
    </div>

    <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
      <h4 class="text-sm font-medium">Order Summary</h4>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Total items count</span>
        <span class="font-medium">{{ itemsCount }}</span>
      </p>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Subtotal</span>
        <span class="font-medium">{{ formatCurrency(productsTotal) }}</span>
      </p>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Delivery Fee</span>
        <span class="font-medium">{{
          deliveryFee > 0 ? formatCurrency(deliveryFee) : "Free"
        }}</span>
      </p>
      <p v-if="paymentInfo.discount_amount > 0" class="flex justify-between text-sm text-green-600">
        <span>Discount</span>
        <span class="font-medium">-{{ formatCurrency(paymentInfo.discount_amount) }}</span>
      </p>
      <div class="border-core-200 my-2 border-t border-dashed"></div>
      <p class="flex justify-between text-lg font-semibold">
        <span>Total:</span>
        <span class="text-primary-600">{{ formatCurrency(totalAmount) }}</span>
      </p>
    </div>

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
      <p v-if="paymentInfo.payment_mode" class="flex justify-between text-sm">
        <span class="text-core-600">Payment Method</span>
        <span class="font-medium">{{ paymentInfo.payment_mode.label }}</span>
      </p>
      <p v-if="paymentInfo.payment_status !== 'unpaid'" class="flex justify-between text-sm">
        <span class="text-core-600">Amount Paid</span>
        <span class="font-medium">{{ formatCurrency(paymentInfo.payment_amount) }}</span>
      </p>
    </div>

    <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
      <h4 class="text-sm font-medium">Shipping & Delivery</h4>
      <p class="flex justify-between text-sm">
        <span class="text-core-600">Order Date</span>
        <span class="font-medium">{{ formatDate(shippingInfo.order_date) }}</span>
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
      <p
        v-if="shippingInfo.fulfilment_method === 'delivery' && shippingInfo.delivery_address"
        class="flex justify-between text-sm"
      >
        <span class="text-core-600">Delivery Address</span>
        <span class="font-medium">{{ shippingInfo.delivery_address }}</span>
      </p>
      <p
        v-if="shippingInfo.fulfilment_method === 'delivery' && shippingInfo.courier"
        class="flex justify-between text-sm"
      >
        <span class="text-core-600">Courier</span>
        <span class="font-medium">{{ shippingInfo.courier }}</span>
      </p>
    </div>

    <div class="h-24" />

    <div
      class="border-core-200 bg-base-background fixed right-0 bottom-0 left-0 flex gap-3 border-t p-6"
    >
      <AppButton
        label="Back"
        color="alt"
        variant="outlined"
        class="w-1/3"
        icon="arrow-left"
        @click="emit('prev')"
      />
      <AppButton
        label="Add Sales"
        class="w-2/3"
        icon="plus"
        :loading="loading"
        @click="emit('submit')"
      />
    </div>
  </div>
</template>
