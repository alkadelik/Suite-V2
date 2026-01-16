<script setup lang="ts">
import { displayError } from "@/utils/error-handler"
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import { useGetPublicOrderById, useInitializeOrderPayment } from "@modules/orders/api"
import { anonymousCustomer } from "@modules/orders/constants"
import { TOrder } from "@modules/orders/types"
import { computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const { data: orderData, isPending } = useGetPublicOrderById(route.params.id as string)

// Initialize payment
const { mutate: initializePayment, isPending: isInitializing } = useInitializeOrderPayment()

const handlePayNow = () => {
  if (!orderData.value?.uid) return

  initializePayment(orderData.value.uid, {
    onSuccess: (response) => {
      const paymentLink = response.data.data.payment_link
      if (paymentLink) {
        window.location.href = paymentLink
      }
    },
    onError: displayError,
  })
}

const order = computed(() => orderData.value || ({} as TOrder))

const orderSummary = computed(() => {
  if (!order.value?.items) return {}

  const subtotal = order.value.items.reduce((acc, item) => {
    return acc + Number(item.unit_price) * item.quantity
  }, 0)

  return {
    "Total Items": order.value.items.length,
    Subtotal: formatCurrency(subtotal, { kobo: true }),
    // Discount: formatCurrency(Number(order.value.discount_amount)),
    Shipping: +order.value.delivery_fee
      ? formatCurrency(Number(order.value.delivery_fee), { kobo: true })
      : "-",
    divider1: true,
    "Total Amount": formatCurrency(Number(order.value.total_amount), { kobo: true }),
    "Last Payment": formatCurrency(Number(order.value.total_paid), { kobo: true }),
    ...(Number(order.value.outstanding_balance) > 0
      ? {
          divider2: true,
          "Amount Due": formatCurrency(Number(order.value.outstanding_balance), { kobo: true }),
        }
      : {}),
  }
})

const isEmpty = computed(() => !orderData.value?.uid || isPending.value)
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
      :description="`If you're trying to pay for an order, please check the link or contact the merchant if you think this is a mistake.`"
      :loading="isPending"
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
            <img
              v-if="order.store_logo"
              :src="order.store_logo"
              class="h-12 rounded-lg object-contain"
            />
            <h1 v-else class="font-oswald! text-2xl font-bold uppercase">{{ order.store_name }}</h1>
          </div>
          <!-- store contact -->
          <div
            class="bg-warning-25 text-warning-700 border-warning-300 rounded-lg border p-4 text-sm"
            :class="{ 'hidden lg:block': true }"
          >
            <span class="font-semibold">Need help?</span> Contact
            <span class="font-semibold capitalize">{{ order.store_name }}</span>
            <span v-if="order.store_phone"> at </span>
            <a v-if="order.store_phone" :href="`tel:${order.store_phone}`" class="font-semibold">
              {{ order.store_phone }}
            </a>
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
            <h2 class="mt-4 text-sm font-semibold text-gray-900 capitalize lg:text-xl">
              {{ order.store_name }}
            </h2>
            <a
              v-if="order.store_email"
              :href="`mailto:${order.store_email}`"
              class="my-1 block truncate"
            >
              {{ order.store_email }}
            </a>
            <a v-if="order.store_phone" :href="`tel:${order.store_phone}`" class="block">
              {{ order.store_phone }}
            </a>
          </div>
          <!-- customer details -->
          <div class="pt-7 text-right text-xs lg:text-base">
            <span>Sold to:</span>
            <h2 class="text-sm font-semibold text-gray-900 capitalize lg:text-base">
              {{ order.customer_name || anonymousCustomer.full_name }}
            </h2>
            <a
              v-if="order.customer_email"
              :href="`mailto:${order.customer_email}`"
              class="my-1 block truncate"
            >
              {{ order.customer_email }}
            </a>
            <a v-if="order.customer_phone" :href="`tel:${order.customer_phone}`" class="block">
              {{ order.customer_phone }}
            </a>
          </div>
        </div>
      </section>

      <h3 class="my-8 text-lg font-bold text-gray-900 lg:text-xl">
        Thank you for shopping at {{ startCase(order.store_name) }}!
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
              <p class="font-medium">{{ formatDate(order.order_date || order.created_at) }}</p>
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
          <div
            v-if="order.fulfilment_method === 'delivery'"
            class="mt-6 grid grid-cols-2 gap-6 border-t border-gray-200 pt-6 lg:grid-cols-3"
          >
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
              <p class="font-medium">{{ order.courier_name || "Unknown Courier" }}</p>
              <Chip
                v-if="order.delivery_method === 'automatic'"
                color="blue"
                show-dot
                class="mt-1 py-4! text-xs"
              >
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
                <td class="px-4 py-6">{{ formatCurrency(item.unit_price, { kobo: true }) }}</td>
                <td class="px-4 py-6">{{ item.quantity }}</td>
                <td class="px-4 py-6">
                  {{ formatCurrency(Number(item.unit_price) * item.quantity, { kobo: true }) }}
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
                  {{ formatCurrency(Number(item.unit_price) * item.quantity, { kobo: true }) }}
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
                  :class="
                    key.includes('Amount')
                      ? 'text-core-800 font-semibold'
                      : 'text-core-600 font-medium'
                  "
                >
                  {{ key }}
                </span>
                <span :class="key.includes('Amount') ? 'font-semibold' : 'font-medium'">
                  {{ value }}
                </span>
              </template>
            </div>
          </div>
          <AppButton
            v-if="order?.payment_status !== 'paid'"
            :label="`Pay Now (${formatCurrency(order?.outstanding_balance, { kobo: true })})`"
            class="mt-auto w-full"
            :loading="isInitializing"
            size="lg"
            @click="handlePayNow"
          />
          <div
            v-else
            class="bg-success-50 text-success-700 border-success-300 mt-auto flex items-center justify-center rounded-lg border px-4 py-3 text-center"
          >
            <span class="font-semibold">Payment Complete</span>
          </div>
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
