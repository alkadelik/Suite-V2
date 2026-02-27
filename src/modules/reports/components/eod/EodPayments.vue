<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">02</span>
      <h3 class="text-base font-semibold text-gray-900">Payments & Cash Reconciliation</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Money In</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-2 gap-8 py-4">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Payment Method Breakdown</h3>
          <p class="text-xs">Revenue and order count by channel</p>
        </div>
        <div class="px-4 py-6">
          <div class="space-y-6 border-b border-gray-200 pb-4">
            <div
              v-for="x in ['Card', 'Bank Transfer', 'Pay on Delivery']"
              :key="x"
              class="grid grid-cols-4 items-center gap-6"
            >
              <p class="text-right text-sm">{{ x }}</p>
              <!-- percentage line -->
              <div class="col-span-2">
                <div class="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    class="absolute top-0 left-0 h-2 rounded-full"
                    :class="
                      x === 'Card'
                        ? 'bg-success-400'
                        : x === 'Bank Transfer'
                          ? 'bg-blue-400'
                          : 'bg-warning-400'
                    "
                    :style="{
                      width: x === 'Card' ? '80%' : x === 'Bank Transfer' ? '28%' : '10%',
                    }"
                  />
                </div>
              </div>
              <!--  -->
              <p class="text-sm font-semibold">
                {{ formatCurrency(x === "Card" ? 108000 : x === "Bank Transfer" ? 38200 : 4500) }}
                <span class="ml-2 text-xs font-normal text-gray-600">4 orders</span>
              </p>
            </div>
          </div>
          <p class="text-core-600 mt-4 text-sm italic">
            All 5 POD orders collected successfully. No failed payments today.
          </p>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Cash vs Digital Reconciliation</h3>
          <p class="text-xs">End-of-day register balance check</p>
        </div>
        <div class="px-4 py-6">
          <div class="w-full divide-y divide-gray-200 rounded-xl bg-gray-100">
            <!--  -->
            <div v-for="v in 4" :key="v" class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-medium">Digital Payments (Card)</p>
              <p
                :class="[
                  'text-sm font-medium',
                  { 'text-error-600': v === 3 },
                  { 'text-warning-600': v === 4 },
                ]"
              >
                {{ formatCurrency(v == 3 ? -8500 : 10800) }}
              </p>
            </div>
            <!--  -->
            <div class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-semibold">Total Shipping Today</p>
              <p class="text-success-600 text-sm font-semibold">
                {{ formatCurrency(10800 * 4) }}
              </p>
            </div>
          </div>

          <p class="text-core-600 mt-4 text-sm italic">
            {{ formatCurrency(38200) }} in 3 orders awaiting confirmation — follow up Monday AM.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
