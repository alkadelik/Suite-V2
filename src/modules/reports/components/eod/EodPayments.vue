<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { IEODReport } from "@modules/reports/types"
import { computed } from "vue"
import { startCase } from "@/utils/format-strings"

const props = defineProps<{ data: IEODReport | null }>()

const paymentMethods = computed(() => {
  return (props.data?.payments ?? []).map((payment) => ({
    name: startCase(payment.method),
    amount: payment.amount,
    orders: payment.order_count,
    percent: payment.percent ?? 0,
  }))
})

const getColorClass = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("card") || lowerName.includes("online")) return "bg-success-400"
  if (lowerName.includes("transfer") || lowerName.includes("bank")) return "bg-blue-400"
  return "bg-warning-400"
}

const totalRevenue = computed(() => props.data?.summary?.gross_revenue ?? 0)

const cashData = computed(() => ({
  digitalPayments: props.data?.cash_digital_reconciliation?.digital_payments_total ?? 0,
  cashCollected: props.data?.cash_digital_reconciliation?.cash_collected ?? 0,
  refundsProcessed: props.data?.cash_digital_reconciliation?.refunds_processed ?? 0,
  pendingPayments: props.data?.cash_digital_reconciliation?.pending_payments ?? 0,
  confirmedRevenue: props.data?.cash_digital_reconciliation?.confirmed_revenue ?? 0,
}))
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
    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Payment Method Breakdown</h3>
          <p class="text-xs">Revenue and order count by channel</p>
        </div>
        <div class="px-4 py-6">
          <div class="space-y-6 border-b border-gray-200 pb-4">
            <div
              v-for="payment in paymentMethods"
              :key="payment.name"
              class="grid grid-cols-4 items-center gap-6"
            >
              <p class="text-right text-sm">{{ payment.name }}</p>
              <!-- percentage line -->
              <div class="col-span-2">
                <div class="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    class="absolute top-0 left-0 h-2 rounded-full"
                    :class="getColorClass(payment.name)"
                    :style="{
                      width: `${totalRevenue > 0 ? (payment.amount / totalRevenue) * 100 : 0}%`,
                    }"
                  />
                </div>
              </div>
              <!--  -->
              <p class="text-sm font-semibold break-keep">
                {{ formatCurrency(payment.amount, { kobo: true }) }}
                <span class="ml-2 text-xs font-normal text-gray-600"
                  >{{ payment.orders }} order{{ payment.orders !== 1 ? "s" : "" }}</span
                >
              </p>
            </div>
          </div>
          <p
            v-if="data?.narratives?.payment_reconciliation_insight"
            class="text-core-600 mt-4 text-sm italic"
          >
            {{ data?.narratives?.payment_reconciliation_insight }}
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
            <div class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-medium">Digital Payments</p>
              <p class="text-sm font-medium">
                {{ formatCurrency(cashData.digitalPayments, { kobo: true }) }}
              </p>
            </div>
            <!--  -->
            <div class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-medium">Cash Collected</p>
              <p class="text-sm font-medium">
                {{ formatCurrency(cashData.cashCollected, { kobo: true }) }}
              </p>
            </div>
            <!--  -->
            <div class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-medium">Refunds Processed</p>
              <p class="text-error-600 text-sm font-medium">
                {{ formatCurrency(cashData.refundsProcessed, { kobo: true }) }}
              </p>
            </div>
            <!--  -->
            <div class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-medium">Pending Payments</p>
              <p class="text-warning-600 text-sm font-medium">
                {{ formatCurrency(cashData.pendingPayments, { kobo: true }) }}
              </p>
            </div>
            <!--  -->
            <div class="flex items-center justify-between gap-4 px-4 py-5">
              <p class="text-sm font-semibold">Confirmed Revenue</p>
              <p class="text-success-600 text-sm font-semibold">
                {{ formatCurrency(cashData.confirmedRevenue, { kobo: true }) }}
              </p>
            </div>
          </div>

          <p class="text-core-600 mt-4 text-sm italic">
            {{ data?.narratives?.payment_reconciliation_insight || "N/A" }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
