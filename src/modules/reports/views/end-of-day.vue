<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useSettingsStore } from "@modules/settings/store"
import { useMediaQuery } from "@vueuse/core"
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import Icon from "@components/Icon.vue"
import EodFinancialSummary from "../components/eod/EodFinancialSummary.vue"
import EodExpenses from "../components/eod/EodExpenses.vue"
import EodPayments from "../components/eod/EodPayments.vue"
import EodCustomers from "../components/eod/EodCustomers.vue"
import EodSalesByOrigin from "../components/eod/EodSalesByOrigin.vue"
import EodFulfilment from "../components/eod/EodFulfilment.vue"
import EodInventoryMovement from "../components/eod/EodInventoryMovement.vue"
import EodAbandoned from "../components/eod/EodAbandoned.vue"
import EodUnresolvedIssues from "../components/eod/EodUnresolvedIssues.vue"
import EodProductsSold from "../components/eod/EodProductsSold.vue"
import EodOrders from "../components/eod/EodOrders.vue"
import { EOD_REPORT_SECTIONS } from "../constants"
import Tabs from "@components/Tabs.vue"

const activeDate = ref(new Date().toISOString().slice(0, 10))
const activeSection = ref(EOD_REPORT_SECTIONS[0].key)
const isScrolling = ref(false)

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

// Track which section is in view using IntersectionObserver
let sectionObserver: IntersectionObserver | null = null

function setupSectionObserver() {
  if (sectionObserver) sectionObserver.disconnect()

  sectionObserver = new IntersectionObserver(
    (entries) => {
      if (isScrolling.value) return

      // Pick the entry whose top is nearest the 25% threshold line
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length) {
        activeSection.value = visible[0].target.id
      }
    },
    // trigger line - 25% from the top;
    { rootMargin: "-25% 0px -70% 0px", threshold: 0 },
  )

  EOD_REPORT_SECTIONS.forEach(({ key }) => {
    const el = document.getElementById(key)
    if (el) sectionObserver!.observe(el)
  })
}

const onChangeTab = (key: string) => {
  isScrolling.value = true
  document.getElementById(key)?.scrollIntoView({ behavior: "smooth" })
  setTimeout(() => (isScrolling.value = false), 800)
}

onMounted(() => {
  nextTick(setupSectionObserver)
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
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
    <section id="report-content" v-else class="mt-6 space-y-6">
      <div class="bg-base-background sticky top-2 z-20 py-2">
        <Tabs
          v-model="activeSection"
          :tabs="EOD_REPORT_SECTIONS"
          @update:model-value="onChangeTab"
        />
      </div>

      <div
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
      <EodFinancialSummary id="summary" />
      <EodPayments id="payments" />
      <EodExpenses id="expenses" />
      <EodCustomers id="customers" />
      <EodSalesByOrigin id="origin" />
      <EodFulfilment id="fulfillment" />
      <EodInventoryMovement id="inventory" />
      <EodAbandoned id="abandoned" />
      <EodUnresolvedIssues id="issues" />
      <EodProductsSold id="products" />
      <EodOrders id="orders" />
    </section>
  </div>
</template>

<style scoped>
#report-content > * {
  scroll-margin-top: 4.5rem;
}
</style>
