<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import type { ICustomer } from "@modules/customers/types"
import { computed } from "vue"

interface OrderItem {
  product: { uid: string; name: string; total_stock: number }
  variant: { uid: string; name: string; sku: string; price: string } | null
  quantity: number
  unit_price: number
  notes?: string
}

interface ShippingInfo {
  fulfilment_method: "pickup" | "delivery"
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
  coupon_code: string | null
  discount_amount: number
}

const props = defineProps<{
  orderItems: OrderItem[]
  customer: ICustomer | null
  shippingInfo: ShippingInfo
  paymentInfo: PaymentInfo
  productsTotal: number
  totalAmount: number
  loading: boolean
}>()

const emit = defineEmits<{
  prev: []
  submit: []
}>()

const customerName = computed(() => {
  if (!props.customer) return "Unknown Customer"
  const firstName = props.customer.first_name || ""
  const lastName = props.customer.last_name || ""
  return `${firstName} ${lastName}`.trim() || "Unknown Customer"
})
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="document-check" size="28" />
    </div>
    <p class="mb-4 text-sm">Double-check everything before confirming this order.</p>

    <div class="space-y-4">
      <!-- Customer Info -->
      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Customer Information</h3>
        <div class="space-y-2 text-sm">
          <p class="flex justify-between">
            <span class="text-gray-600">Name:</span>
            <span class="font-medium">{{ customerName }}</span>
          </p>
          <p v-if="customer?.email" class="flex justify-between">
            <span class="text-gray-600">Email:</span>
            <span class="font-medium">{{ customer.email }}</span>
          </p>
          <p v-if="customer?.phone" class="flex justify-between">
            <span class="text-gray-600">Phone:</span>
            <span class="font-medium">{{ customer.phone }}</span>
          </p>
        </div>
      </div>

      <!-- Order Items -->
      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Order Items</h3>
        <div class="space-y-3">
          <div
            v-for="(item, index) in orderItems"
            :key="index"
            class="border-core-200 flex items-center justify-between border-b pb-3 last:border-0"
          >
            <div class="flex-1">
              <p class="font-medium">{{ item.product.name }}</p>
              <p v-if="item.variant" class="text-xs text-gray-600">{{ item.variant.name }}</p>
              <p class="text-xs text-gray-600">Qty: {{ item.quantity }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium">{{ formatCurrency(item.unit_price) }}</p>
              <p class="text-xs text-gray-600">
                Subtotal: {{ formatCurrency(item.quantity * item.unit_price) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Shipping Info -->
      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Shipping Information</h3>
        <div class="space-y-2 text-sm">
          <p class="flex justify-between">
            <span class="text-gray-600">Method:</span>
            <span class="font-medium capitalize">{{ shippingInfo.fulfilment_method }}</span>
          </p>
          <p v-if="shippingInfo.fulfilment_method === 'delivery'" class="flex justify-between">
            <span class="text-gray-600">Address:</span>
            <span class="max-w-xs text-right font-medium">{{ shippingInfo.delivery_address }}</span>
          </p>
          <p v-if="shippingInfo.courier" class="flex justify-between">
            <span class="text-gray-600">Courier:</span>
            <span class="font-medium">{{ shippingInfo.courier }}</span>
          </p>
          <p class="flex justify-between">
            <span class="text-gray-600">Delivery Fee:</span>
            <span class="font-medium">{{ formatCurrency(shippingInfo.delivery_fee) }}</span>
          </p>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-3 text-sm font-semibold">Payment Summary</h3>
        <div class="space-y-2 text-sm">
          <p class="flex justify-between">
            <span class="text-gray-600">Products Total:</span>
            <span class="font-medium">{{ formatCurrency(productsTotal) }}</span>
          </p>
          <p class="flex justify-between">
            <span class="text-gray-600">Delivery Fee:</span>
            <span class="font-medium">{{ formatCurrency(shippingInfo.delivery_fee) }}</span>
          </p>
          <p v-if="paymentInfo.discount_amount > 0" class="flex justify-between text-red-600">
            <span>Discount:</span>
            <span class="font-medium">-{{ formatCurrency(paymentInfo.discount_amount) }}</span>
          </p>
          <div class="border-core-200 my-2 border-t"></div>
          <p class="flex justify-between text-base font-semibold">
            <span>Total Amount:</span>
            <span class="text-primary-600">{{ formatCurrency(totalAmount) }}</span>
          </p>
          <p class="flex justify-between">
            <span class="text-gray-600">Payment Status:</span>
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
          <p v-if="paymentInfo.payment_status === 'partially_paid'" class="flex justify-between">
            <span class="text-gray-600">Amount Paid:</span>
            <span class="font-medium">{{ formatCurrency(paymentInfo.payment_amount) }}</span>
          </p>
        </div>
      </div>
    </div>

    <div class="h-24" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-6">
      <AppButton
        label="Back"
        color="alt"
        variant="outlined"
        class="w-1/3"
        icon="arrow-left"
        @click="emit('prev')"
      />
      <AppButton label="Create Order" class="w-2/3" :loading="loading" @click="emit('submit')" />
    </div>
  </div>
</template>
