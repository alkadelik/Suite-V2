<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import { useMediaQuery } from "@vueuse/core"
import { TOrder } from "../types"
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import { startCase } from "@/utils/format-strings"
import Icon from "@components/Icon.vue"
import { computed } from "vue"

const props = defineProps<{ open: boolean; order: TOrder }>()
const emit = defineEmits(["close", "refresh"])

const isMobile = useMediaQuery("(max-width: 1028px)")

const customerName = computed(() => {
  return props.order.customer_name || "Unknown Customer"
})

const itemsCount = computed(() => {
  return props.order.items.reduce((sum, item) => sum + item.quantity, 0)
})

const productsTotal = computed(() => {
  return Number(props.order.subtotal)
})

const deliveryFee = computed(() => {
  return Number(props.order.delivery_fee)
})
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    title="Order Details"
    max-width="2xl"
    variant="fullscreen"
    @close="emit('close')"
  >
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="shop-add" size="28" />
    </div>
    <p class="mb-4 text-sm">Details of this order.</p>

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
                <span class="text-primary-700 ml-1 text-xs font-medium">
                  (x{{ item.quantity }})
                </span>
              </h4>
              <p v-if="item.variant_name" class="text-core-500 text-xs">
                {{ item.variant_name.split(" - ")[1] || item.variant_name }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-medium">
              {{ formatCurrency(Number(item.total_price)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
        <p class="text-sm font-medium">{{ customerName }}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <Icon name="sms" class="text-core-600 h-4 w-4" />
            <span class="text-sm font-medium">{{ order.customer_email || "N/A" }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon name="call" class="text-core-600 h-4 w-4" />
            <span class="text-sm font-medium">{{ order.customer_phone || "N/A" }}</span>
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
          <span class="font-medium">{{ formatCurrency(productsTotal) }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Delivery Fee</span>
          <span class="font-medium">{{ deliveryFee > 0 ? formatCurrency(deliveryFee) : "-" }}</span>
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
          <span class="text-primary-600">{{ formatCurrency(order.total_amount) }}</span>
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
          <span class="font-medium">{{ formatCurrency(order.total_paid) }}</span>
        </p>
        <p v-if="order.outstanding_balance > 0" class="flex justify-between text-sm">
          <span class="text-core-600">Outstanding Balance</span>
          <span class="font-medium text-red-600">{{
            formatCurrency(order.outstanding_balance)
          }}</span>
        </p>
      </div>

      <!-- Shipping & Delivery -->
      <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
        <h4 class="text-sm font-medium">Shipping & Delivery</h4>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Order Date</span>
          <span class="font-medium">{{ formatDate(order.order_date || order.created_at) }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Has this product been delivered?</span>
          <span class="font-medium">{{
            order.fulfilment_status === "fulfilled" ? "Yes" : "No"
          }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">{{
            order.fulfilment_status === "fulfilled"
              ? "How was it delivered?"
              : "How will it be delivered?"
          }}</span>
          <span class="font-medium">{{ startCase(order.fulfilment_method) }}</span>
        </p>
        <p
          v-if="order.fulfilment_method === 'delivery' && order.delivery_address"
          class="flex justify-between text-sm"
        >
          <span class="text-core-600">Delivery Address</span>
          <span class="font-medium">{{ order.delivery_address }}</span>
        </p>
        <p
          v-if="order.fulfilment_method === 'delivery' && order.courier"
          class="flex justify-between text-sm"
        >
          <span class="text-core-600">Courier</span>
          <span class="font-medium">{{ order.courier }}</span>
        </p>
      </div>
    </div>
  </component>
</template>
