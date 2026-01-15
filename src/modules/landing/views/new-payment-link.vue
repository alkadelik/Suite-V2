<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import { TOrder } from "@modules/orders/types"
import { ref } from "vue"
import { computed } from "vue"

const order = ref<TOrder>({
  uid: "order_123456789",
  order_number: "ID123456789",
  order_date: new Date().toString(),
  payment_status: "partially_paid",
  coupon: null,
  courier: "",
  created_at: new Date().toString(),
  customer: "customer_123",
  customer_email: "danielolabode@gmail.com",
  customer_phone: "+234808262233",
  customer_name: "Daniel Olabode",
  delivery_address: "123 Main Street, Lagos, Nigeria",
  delivery_fee: "2000",
  delivery_method: "manual",
  discount_amount: "1500",
  fulfilment_method: "delivery",
  fulfilment_status: "unfulfilled",
  items: [
    {
      uid: "item_1",
      variant: "variant_1",
      variant_name: "Pack of 3",
      variant_sku: "SS-P3-001",
      product_name: "Smile Socks",
      popup_inventory: null,
      quantity: 1,
      unit_price: "15000",
      total_price: "15000",
      fulfilment_status: "unfulfilled",
      qty_fulfilled: 0,
      notes: "",
    },
    {
      uid: "item_2",
      variant: "variant_2",
      variant_name: "Pack of 2",
      variant_sku: "SS-P2-001",
      product_name: "Smile Socks",
      popup_inventory: null,
      quantity: 1,
      unit_price: "10000",
      total_price: "10000",
      fulfilment_status: "unfulfilled",
      qty_fulfilled: 0,
      notes: "",
    },
    {
      uid: "item_3",
      variant: "variant_3",
      variant_name: "Single Pair",
      variant_sku: "SS-SP-001",
      product_name: "Smile Socks",
      popup_inventory: null,
      quantity: 2,
      unit_price: "5000",
      total_price: "10000",
      fulfilment_status: "unfulfilled",
      qty_fulfilled: 0,
      notes: "",
    },
  ],
  location: "location_123",
  location_name: "Main Store",
  outstanding_balance: 28500,
  rate: "1",
  source: "internal",
  store: "store_123",
  store_name: "Smile Socks",
  subtotal: "25000",
  total_amount: 28500,
  total_paid: 0,
  tracking_number: "",
  user: "user_123",
  user_name: "Store Admin",
  is_voided: false,
})

const orderSummary = computed(() => {
  return {
    "Total Items": order.value.items.length,
    Subtotal: formatCurrency(Number(order.value.subtotal)),
    Discount: formatCurrency(Number(order.value.discount_amount)),
    Shipping: formatCurrency(Number(order.value.delivery_fee)),
    divider1: true,
    "Total Amount": formatCurrency(Number(order.value.total_amount)),
    "Last Payment": formatCurrency(Number(order.value.total_paid)),
    divider2: true,
    "Amount Due": formatCurrency(Number(order.value.outstanding_balance)),
  }
})

const isEmpty = true
</script>

<template>
  <div class="pb-8 lg:pb-20">
    <header
      class="border-core-100 border-b bg-[url(@/assets/images/background-pattern.png)] bg-cover bg-center bg-no-repeat"
    >
      <nav
        :class="[
          'mx-auto max-w-7xl px-4 py-6 lg:px-12 lg:py-10',
          'flex items-center justify-between',
        ]"
      >
        <a href="https://leyyow.com" target="_blank" rel="noopener noreferrer">
          <img src="/images/logos/leyyow-logo-2.svg?url" alt="Leyyow logo" class="h-7" />
        </a>

        <a
          href="https://suite.leyyow.com/signup"
          class="text-primary-700 text-sm font-semibold lg:text-base"
          target="_blank"
          rel="noopener noreferrer"
        >
          Create a live invoice
        </a>
      </nav>
    </header>

    <EmptyState
      v-if="isEmpty"
      title="We couldn't find that order."
      :description="`If you're trying to pay for an order, please check the link or contact {merchantName} if you think this is a mistake.`"
    >
      <template #image>
        <img src="@/assets/images/empty-order.svg?url" class="mx-auto mb-4" />
      </template>
      <template #action>
        <div class="flex justify-center gap-6">
          <AppButton variant="outlined" icon="sms" label="Send an email" />
          <AppButton variant="outlined" icon="call" label="Call" />
        </div>
      </template>
    </EmptyState>

    <main v-else class="mx-auto max-w-7xl px-4 py-6 lg:px-12 lg:py-10">
      <section class="space-y-5">
        <div class="flex items-end justify-between">
          <!-- store logo -->
          <div class="inline-flex">
            <h1 class="font-oswald! text-2xl font-bold uppercase">{{ order.store_name }}</h1>
          </div>
          <!-- store contact -->
          <div
            class="bg-warning-25 text-warning-700 border-warning-300 rounded-lg border p-4 text-sm"
            :class="{ 'hidden lg:block': true }"
          >
            <span class="font-semibold">Need help?</span> Contact
            <span class="font-semibold">{{ order.store_name }}</span> at
            <a href="tel:+234808262233" class="font-semibold">+234 808 262 233</a>
          </div>
        </div>

        <!-- invoice merchant and customer details -->
        <div
          :class="[
            'bg-[url(@/assets/images/background-pattern.png)] bg-contain bg-center bg-repeat',
            'bg-base-background grid grid-cols-2 gap-4 rounded-xl border border-gray-300',
            'px-4 py-6 text-gray-700 lg:p-10',
          ]"
        >
          <!-- merchant details -->
          <div class="text-xs lg:text-base">
            <Chip show-dot label="Invoice" radius="md" size="md" />
            <h2 class="mt-4 text-sm font-semibold text-gray-900 lg:text-xl">Smile Socks</h2>
            <a href="mailto:smilessocks@gmail.com" class="my-1 block truncate">
              smilessocks@gmail.com
            </a>
            <a href="tel:+234808262233" class="block">+234 808 262 233</a>
          </div>
          <!-- customer details -->
          <div class="pt-7 text-right text-xs lg:text-base">
            <span>Sold to:</span>
            <h2 class="text-sm font-semibold text-gray-900 lg:text-base">
              {{ order.customer_name }}
            </h2>
            <a :href="`mailto:${order.customer_email}`" class="my-1 block truncate">
              {{ order.customer_email }}
            </a>
            <a :href="`tel:${order.customer_phone}`" class="block">{{ order.customer_phone }}</a>
          </div>
        </div>
      </section>

      <h3 class="my-8 text-lg font-bold text-gray-900 lg:text-xl">
        Thank you for shopping at Smile socks’s Store
      </h3>

      <section class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
        <!-- order status, shipping and items -->
        <div class="lg:col-span-2">
          <!-- order status -->
          <div class="grid grid-cols-2 gap-6 text-sm lg:grid-cols-3 lg:text-base">
            <div>
              <h5 class="text-core-600 mb-1">Order ID</h5>
              <p class="font-medium">{{ order.order_number }}</p>
            </div>
            <!--  -->
            <div>
              <h5 class="text-core-600 mb-1">Order date</h5>
              <p class="font-medium">{{ formatDate(order.order_date) }}</p>
            </div>
            <!--  -->
            <div>
              <h5 class="text-core-600 mb-1">Payment status</h5>
              <Chip
                :icon="order.payment_status === 'paid' ? 'card-tick' : 'card-pos'"
                :label="startCase(order.payment_status)"
                :color="
                  order.payment_status === 'paid'
                    ? 'success'
                    : order.payment_status === 'partially_paid'
                      ? 'warning'
                      : 'error'
                "
              />
            </div>
          </div>
          <!-- shipping details -->
          <div class="mt-6 grid grid-cols-2 gap-6 border-t border-gray-200 pt-6 lg:grid-cols-3">
            <div>
              <h5 class="text-core-600 mb-1">Shipped to</h5>
              <p class="font-medium">{{ order.delivery_address }}</p>
            </div>
            <!--  -->
            <div>
              <h5 class="text-core-600 mb-1">Delivery date</h5>
              <p class="font-medium">{{ formatDate(order.created_at) }}</p>
            </div>
            <!--  -->
            <div class="col-span-2 lg:col-span-1">
              <h5 class="text-core-600 mb-1">Delivery provider</h5>
              <p class="font-medium">{{ order.courier || "GOKADA" }}</p>
              <Chip color="blue" show-dot class="mt-1 py-4! text-xs">
                Shipping is provided by
                <img
                  src="/images/shipbubble-logo.png"
                  alt="Shipbubble logo"
                  class="ml-1 inline object-contain"
                />
              </Chip>
            </div>
          </div>

          <!-- order items -->
          <table class="text-core-700 mt-10 hidden w-full lg:table">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50 text-left text-sm">
                <th class="px-4 py-3 font-medium">#</th>
                <th class="px-4 py-3 font-medium">Item</th>
                <th class="px-4 py-3 font-medium">Price</th>
                <th class="px-4 py-3 font-medium">Quantity</th>
                <th class="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in order.items"
                :key="index"
                class="border-b border-gray-200 text-sm"
              >
                <td class="px-4 py-6">{{ index + 1 }}</td>
                <td class="px-4 py-6">{{ item.product_name }}</td>
                <td class="px-4 py-6">{{ formatCurrency(item.unit_price) }}</td>
                <td class="px-4 py-6">{{ item.quantity }}</td>
                <td class="px-4 py-6">
                  {{ formatCurrency(Number(item.unit_price) * item.quantity) }}
                </td>
              </tr>
            </tbody>
          </table>
          <!-- mobile order items -->
          <div class="mt-8 space-y-4 border-y border-gray-200 py-6 lg:hidden">
            <div v-for="(item, index) in order.items" :key="index" class="">
              <div class="flex items-center justify-between">
                <h4 class="font-medium">
                  {{ item.product_name }}
                  <span class="text-primary-700">(x{{ item.quantity }})</span>
                </h4>
                <span class="font-medium">
                  {{ formatCurrency(Number(item.unit_price) * item.quantity) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- order summary -->
        <div
          :class="[
            'bg-primary-50 flex flex-col gap-6 bg-no-repeat px-6 py-10',
            'bg-[url(@/assets/images/wavy.svg),url(@/assets/images/wavy-reverse.svg)] bg-[position:top_left,bottom_left]',
          ]"
        >
          <h4 class="text-xl font-semibold text-gray-900">Order Summary</h4>
          <div class="space-y-3">
            <div
              v-for="[key, value] in Object.entries(orderSummary)"
              :key="key"
              class="flex items-center justify-between gap-4"
            >
              <div
                v-if="key.includes('divider')"
                class="border-core-300 w-full border border-dashed"
              />
              <template v-else>
                <span
                  class="font-medium"
                  :class="key.includes('Amount') ? 'text-core-800' : 'text-core-600'"
                >
                  {{ key }}
                </span>
                <span class="font-medium">{{ value }}</span>
              </template>
            </div>
          </div>

          <AppButton
            :label="`Pay Now (${formatCurrency(28500)})`"
            class="mt-auto w-full"
            :loading="false"
            size="lg"
          />
        </div>
      </section>
    </main>

    <footer class="mx-auto max-w-7xl px-4 lg:px-12">
      <div
        class="flex flex-col items-center gap-2 rounded-lg bg-[#282021] bg-[url(@/assets/images/background-glow.svg)] bg-center bg-no-repeat px-4 py-6 lg:px-10 lg:py-8"
      >
        <p class="text-core-50 text-sm lg:text-base">
          Create your own links and collect payments for free with
        </p>
        <img src="/images/logos/leyyow-logo-2.svg?url" alt="bg-image" class="mb-2 h-6" />

        <a
          href="https://suite.leyyow.com/signup"
          class="text-sm text-white underline underline-offset-4 lg:text-base"
          target="_blank"
          rel="noopener noreferrer"
          >Start Now</a
        >
      </div>
    </footer>
  </div>
</template>

<style scoped>
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-outfit) !important;
}
</style>
