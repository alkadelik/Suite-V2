<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useSettingsStore } from "@modules/settings/store"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import Icon from "@components/Icon.vue"
import EodFinancialSummary from "../components/eod/EodFinancialSummary.vue"
import EodExpenses from "../components/eod/EodExpenses.vue"
import EodPayments from "../components/eod/EodPayments.vue"
import EodCustomers from "../components/eod/EodCustomers.vue"
import EodSalesByOrigin from "../components/eod/EodSalesByOrigin.vue"
import EodSalesByHour from "../components/eod/EodSalesByHour.vue"
import EodFulfilment from "../components/eod/EodFulfilment.vue"
import EodInventoryMovement from "../components/eod/EodInventoryMovement.vue"
import EodAbandoned from "../components/eod/EodAbandoned.vue"
import EodUnresolvedIssues from "../components/eod/EodUnresolvedIssues.vue"
import EodProductsSold from "../components/eod/EodProductsSold.vue"
import EodOrders from "../components/eod/EodOrders.vue"

const activeDate = ref(new Date().toISOString().slice(0, 10))

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
const storeName = computed(() => useSettingsStore().storeDetails?.name || "Store")
const activeLocation = computed(() => useSettingsStore().activeLocation?.name || "Location")
const fullDate = computed(() =>
  new Date(activeDate.value).toLocaleDateString("en-US", { dateStyle: "full" }),
)

const subtitle = computed(() => {
  if (isMobile.value) return fullDate.value
  return `${storeName.value} (${activeLocation.value}) - ${fullDate.value}`
})
</script>

<template>
  <div class="p-4">
    <PageHeader v-if="isMobile" title="End of Day Report" />
    <SectionHeader v-else title="End of Day Report" :subtitle="subtitle">
      <template #action>
        <TextField
          type="date"
          size="sm"
          v-model="activeDate"
          :max="new Date().toISOString().slice(0, 10)"
        />
      </template>
    </SectionHeader>

    <EmptyState
      v-if="false"
      :title="`${fullDate.split(', ')[1]},  End of Day Report`"
      :description="`Get a complete breakdown of your revenue, customers, products and profit — with actionable recommendations.`"
      action-label="Generate End of Day Report"
      action-icon="add"
      class="mt-4"
    >
      <template #image>
        <img src="@/assets/images/empty-report.svg?url" class="mx-auto mb-4" />
      </template>
    </EmptyState>

    <!-- Report content goes here -->
    <section v-else class="mt-6 space-y-6">
      <nav class="flex flex-wrap gap-2">
        <a
          href="#eod-summary"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Summary</a
        >
        <a
          href="#eod-expenses"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Expenses</a
        >
        <a
          href="#eod-payments"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Payments</a
        >
        <a
          href="#eod-customers"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Customers</a
        >
        <a
          href="#eod-origin"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Origin</a
        >
        <a
          href="#eod-hourly"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Hourly</a
        >
        <a
          href="#eod-fulfillment"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Fulfillment</a
        >
        <a
          href="#eod-inventory"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Inventory</a
        >
        <a
          href="#eod-abandoned"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Abandoned</a
        >
        <a
          href="#eod-issues"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Issues</a
        >
        <a
          href="#eod-orders"
          class="hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 transition-colors"
          >Orders</a
        >
      </nav>

      <div
        id="eod-summary"
        class="border-l-primary-600 border-primary-200 bg-primary-50 rounded-r-lg border border-l-4 p-4"
      >
        <h4 class="mb-3 flex items-center gap-2 text-xs font-medium uppercase">
          <Icon name="trend-up" size="16" /> Daily Summary
        </h4>
        <p class="text-sm">
          Solid Saturday. <b>₦218,400</b> in gross revenue across <b>17 orders</b>, your second-best
          Saturday this month. Net revenue landed at <b>₦189,650</b> after one refund (<b>₦8,500</b>
          — wrong size, Ankara Wrap Dress again) and <b>₦6,250</b> in discounts. Digital payments
          dominated at <b>76%</b>, with cash-on-delivery accounting for <b>₦52,400</b> — all
          collected. All <b>12 fulfilled orders</b> shipped via GIG Logistics today with a
          <b>100% on-time handoff</b>. You have <b>5 pending orders</b> carrying into Monday —
          <b>3 awaiting payment confirmation</b> and <b>2 awaiting stock</b> (Adire Bucket Hat is
          now at just <b>2 units</b>). Reorder the bucket hat tonight — at current velocity, you'll
          stock out by <b>Tuesday</b>.
        </p>
      </div>

      <!-- Financial Summary -->
      <EodFinancialSummary />
      <EodPayments id="eod-payments" />
      <EodExpenses id="eod-expenses" />
      <EodCustomers id="eod-customers" />
      <EodSalesByOrigin id="eod-origin" />
      <EodSalesByHour id="eod-hourly" />
      <EodFulfilment id="eod-fulfillment" />
      <EodInventoryMovement id="eod-inventory" />
      <EodAbandoned id="eod-abandoned" />
      <EodUnresolvedIssues id="eod-issues" />
      <EodProductsSold />
      <EodOrders id="eod-orders" />
    </section>
  </div>
</template>
