<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import EmptyState from "@components/EmptyState.vue"
import { formatDate } from "@modules/customers/utils/dateFormatter"
import { useGetPublicOrderById, useInitializeOrderPayment } from "@modules/orders/api"
import { useRoute } from "vue-router"
import { displayError } from "@/utils/error-handler"

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
</script>

<template>
  <div class="text-core-700 min-h-[100dvh] pb-12">
    <header class="border-core-200 sticky top-0 z-50 border-b bg-white p-4">
      <nav class="mx-auto flex max-w-screen-lg items-center justify-between">
        <RouterLink to="/">
          <img src="/LYW.svg" alt="Leyyow Logo" class="h-6" />
        </RouterLink>
        <RouterLink to="/signup" class="text-primary-600 text-sm font-semibold underline">
          Create payment links
        </RouterLink>
      </nav>
    </header>

    <div class="p-4 lg:p-0">
      <div class="mx-auto my-6 max-w-screen-lg">
        <h2 class="font-serif text-xl font-semibold md:text-2xl">Order Details</h2>
        <p class="text-sm md:text-base">
          Take a quick look at your order, then hit 'Pay' when you're ready.
        </p>
      </div>

      <EmptyState
        v-if="!orderData?.uid || isPending"
        title="No Matching Order Found"
        :loading="isPending"
      />

      <div v-else class="font-outfit mx-auto grid max-w-screen-lg gap-16 pb-8 md:grid-cols-2">
        <section>
          <!-- Order Summary -->
          <div class="border-core-300 rounded-lg border bg-[#fbfbfb] p-3">
            <div class="border-b border-dashed border-[#c4dbd5] text-sm">
              <div class="flex justify-between py-3">
                <span>Order channel:</span>
                <span class="font-semibold"> #{{ orderData?.order_number }}</span>
              </div>
              <div class="flex justify-between py-3">
                <span>Order date:</span>
                <span class="font-semibold">{{ formatDate(orderData?.created_at) }}</span>
              </div>
            </div>

            <!-- Product Items -->
            <div class="mt-4 space-y-3">
              <!-- Product 1 -->
              <div v-for="item in orderData?.items" :key="item.uid" class="flex gap-2.5">
                <img
                  src="https://res.cloudinary.com/dwwxvzind/image/upload/v1757112704/Icon_Box_keqfxr.png"
                  alt="Product 1"
                  class="h-[52px] w-[52px] rounded"
                />
                <div class="flex-1 text-[13px]">
                  <p class="m-0">
                    {{ item.product_name }}
                    <span class="text-primary-700">(x{{ item.quantity }})</span>
                  </p>
                  <p class="text-core-600 m-0">{{ item.variant_name }}</p>
                </div>
                <div class="text-right text-[13px]">
                  <!-- <span class="text-core-400 mr-1 line-through">₦15,750</span>  -->
                  {{ formatCurrency(Number(item.total_price)) }}
                </div>
              </div>
            </div>
          </div>

          <div class="border-core-300 mt-5 rounded-lg border bg-[#fbfbfb] p-3">
            <div class="text-sm">
              <div class="flex justify-between py-3">
                <span>Subtotal ({{ orderData?.items.length }} items):</span>
                <span class="font-semibold">
                  <span v-if="orderData?.discount_amount" class="text-core-400 mr-1 line-through">
                    {{ formatCurrency(Number(orderData?.discount_amount)) }}
                  </span>
                  {{ formatCurrency(Number(orderData?.total_amount)) }}
                </span>
              </div>
              <div class="flex justify-between py-3">
                <span>Shipping:</span>
                <span class="font-semibold">
                  {{ formatCurrency(Number(orderData?.delivery_fee), { kobo: true }) }}</span
                >
              </div>
              <div class="border-b border-dashed border-[#c4dbd5]"></div>
              <div class="flex justify-between pt-3 text-base">
                <span class="font-semibold">Total:</span>
                <span class="font-semibold">
                  {{
                    formatCurrency(
                      Number(orderData?.total_amount) + Number(orderData?.delivery_fee),
                      { kobo: true },
                    )
                  }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-core-300 mt-5 rounded-lg border bg-[#fbfbfb] p-3">
            <div class="mb-3 text-base font-semibold">Merchant details</div>
            <div class="text-sm">
              <div class="flex justify-between py-3">
                <span>{{ orderData?.store_name }}</span>
              </div>
              <!-- <div class="flex justify-between py-3 text-sm">
              <a href="mailto:merchant@fashionhub.com">merchant@fashionhub.com</a>
              <a href="tel:+1234567890">+1234567890</a>
            </div> -->
            </div>
            <div class="border-b border-dashed border-[#c4dbd5]"></div>
            <div class="mt-3 mb-3 text-base font-semibold">Customer details</div>
            <div class="text-sm">
              <div class="flex justify-between py-3">
                <span>{{ orderData?.customer_name }}</span>
              </div>
              <div
                v-if="orderData?.customer_email || orderData?.customer_phone"
                class="flex justify-between py-3 text-sm"
              >
                <a v-if="orderData?.customer_email" :href="`mailto:${orderData?.customer_email}`">
                  {{ orderData?.customer_email }}
                </a>
                <a v-if="orderData?.customer_phone" :href="`tel:${orderData?.customer_phone}`">
                  {{ orderData?.customer_phone }}
                </a>
              </div>
            </div>
          </div>

          <!-- Shipping Summary -->
          <div v-if="false" class="border-core-300 my-5 rounded-lg border bg-[#fbfbfb] p-3">
            <div class="mb-3 text-base font-semibold">Shipping Summary</div>
            <div class="flex justify-between py-1.5 text-sm">
              <span>Company:</span>
              <span class="font-medium">GOKADA</span>
            </div>
            <div class="flex justify-between py-1.5 text-sm">
              <span>Tracking Link:</span>
              <span class="font-medium">
                <a href="/#" class="text-warning-700">(Click here →)</a>
              </span>
            </div>
            <div
              class="bg-warning-50 border-warning-200 mt-2 border-t border-b py-2 text-center text-[13px]"
            >
              Shipping is provided by
              <img
                src="https://res.cloudinary.com/do2uxmtsx/image/upload/v1752203568/shipbubble_vgrkbu.png"
                alt="Shipbubble"
                class="inline h-5 align-middle"
              />
            </div>
            <div class="pt-3 text-xs">
              For help with your delivery, please reach out to Shipbubble at
              <a href="mailto:email@shipbubble.com" class="text-warning-700">email@shipbubble.com</a
              >. Leyyow does not handle delivery directly.
            </div>
          </div>
        </section>

        <section>
          <!-- Payment Details -->
          <div class="border-core-300 rounded-lg border bg-[#fbfbfb] p-3">
            <div class="mb-3 text-base font-semibold">Payment Details</div>
            <div class="text-sm">
              <div class="flex justify-between py-3">
                <span>Payment Status:</span>
                <span
                  class="rounded-3xl border px-2.5 py-1.5 text-sm capitalize"
                  :class="[
                    {
                      'text-success-700 border-success-200 bg-success-50':
                        orderData?.payment_status === 'paid',
                    },
                    {
                      'text-error-700 border-error-200 bg-error-50':
                        orderData?.payment_status === 'unpaid',
                    },
                  ]"
                >
                  {{ orderData?.payment_status }}
                </span>
              </div>
              <div class="flex justify-between py-3">
                <span>Amount Paid:</span>
                <span class="font-semibold">
                  {{ formatCurrency(Number(orderData?.total_paid), { kobo: true }) }}
                </span>
              </div>
              <div class="flex justify-between py-3">
                <span>Balance due:</span>
                <span class="font-semibold">
                  {{ formatCurrency(Number(orderData?.outstanding_balance), { kobo: true }) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="orderData?.payment_status !== 'paid'">
            <p class="mt-4 mb-2 text-sm">To complete your order, click below</p>
            <AppButton
              :label="`Pay Now (${formatCurrency(orderData?.outstanding_balance, { kobo: true })})`"
              :loading="isInitializing"
              class="w-full"
              @click="handlePayNow"
            />
          </div>

          <div class="bg-warning-50 border-primary-300 text-primary-600 mt-4 rounded-xl border p-4">
            <span class="text-sm font-medium">Note:</span>
            <p class="text-sm">
              Need help with anything merchant-related? Feel free to reach out at
              <a href="tel:+2348082826122" class="font-medium">+234 8082826122</a>.
            </p>
          </div>
        </section>
      </div>

      <footer
        class="mx-auto flex max-w-screen-lg flex-col items-center gap-2 rounded-lg bg-black px-10 py-8"
      >
        <p class="text-white">Create your own links and collect payments for free with</p>
        <img src="/images/logos/leyyow-logo-2.svg?url" alt="bg-image" class="h-6" />

        <a href="https://leyyow.com" class="text-white underline">Start Now</a>
      </footer>
    </div>
  </div>
</template>
