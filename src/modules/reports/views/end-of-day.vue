<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useSettingsStore } from "@modules/settings/store"
import { useMediaQuery } from "@vueuse/core"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
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
import ReportInsightCard from "../components/ReportInsightCard.vue"
import { useGenerateEODReport, useGetLatestEODReport } from "../api"
import { useReportsStore } from "../store"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"

const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
const activeDate = ref(yesterday.toISOString().slice(0, 10))
const activeSection = ref(EOD_REPORT_SECTIONS[0].key)
const isScrolling = ref(false)

const reportsStore = useReportsStore()
const settingsStore = useSettingsStore()

const storeCreatedDate = computed(() => {
  if (!settingsStore.storeDetails?.created_at) return undefined
  return new Date(settingsStore.storeDetails.created_at).toISOString().slice(0, 10)
})

const { mutate: generateEODReport, isPending: isGenerating } = useGenerateEODReport()

const {
  data: latestEODReport,
  isPending,
  isFetching,
  refetch: refetchEODReport,
} = useGetLatestEODReport(activeDate)

// Check if current day's report is generating
const isCurrentDayGenerating = computed(() => {
  return reportsStore.isEODReportGenerating(activeDate.value)
})

watch(
  () => latestEODReport.value,
  (newReport) => {
    if (newReport?.period?.date) {
      const date = newReport.period.date
      if (reportsStore.isEODReportGenerating(date)) {
        reportsStore.removeGeneratingEODReport(date)
      }
    }
  },
  { immediate: true },
)

const reportData = computed(() => {
  if (!latestEODReport.value) return null
  // Check if response is an error detail message
  if (typeof latestEODReport.value === "object" && "detail" in latestEODReport.value) return null
  return latestEODReport.value
})

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

const handleGenerateReport = () => {
  generateEODReport(
    { date: activeDate.value },
    {
      onSuccess: (res) => {
        const responseData = res.data.data
        console.log("Generate EOD Report response:", responseData)
        // Check if report is still generating
        if (responseData.status === "generating") {
          reportsStore.setGeneratingEODReport({
            uid: responseData.uid,
            date: responseData.report_date,
            status: "generating",
            generatedAt: null,
          })
        } else if (responseData.status === "completed") {
          // If completed immediately, refetch the latest report
          refetchEODReport()
        }
      },
    },
  )
}

const STEPS = computed(() => [
  { label: "Reviewing daily transactions...", icon: "trend-up" },
  { label: "Analyzing Payment Methods...", icon: "wallet" },
  { label: "Evaluating Order Fulfillment...", icon: "box-filled" },
  { label: "Checking Inventory Movement...", icon: "box" },
  { label: "Generating Daily Insights...", icon: "bulb" },
])
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
          :max="yesterday.toISOString().slice(0, 10)"
          :min="storeCreatedDate"
        />
      </template>
    </SectionHeader>

    <EmptyState
      v-if="!reportData || isCurrentDayGenerating || isPending || isFetching"
      :title="`${fullDate.split(', ')[1]} Report`"
      :description="
        isCurrentDayGenerating
          ? `Your ${fullDate.split(', ')[1]} report is being prepared...`
          : `Get a complete breakdown of your revenue, customers, products and profit — with actionable recommendations.`
      "
      class="mt-4"
      :loading="isPending || isFetching"
    >
      <template #image>
        <img src="@/assets/images/empty-report.svg?url" class="mx-auto mb-4" />
      </template>

      <template #action>
        <div v-if="isCurrentDayGenerating">
          <div
            class="w-full divide-y divide-gray-200 rounded-xl border border-gray-100 bg-gray-50 px-4"
          >
            <p
              v-for="step in STEPS"
              :key="step.label"
              class="text-core-600 flex items-center gap-4 py-3 text-sm"
            >
              <Icon :name="step.icon" size="16" />
              <span>{{ step.label }}</span>
              <span class="ml-auto">
                <Icon
                  v-if="step.icon == 'trend-up'"
                  name="check-circle"
                  size="18"
                  class="text-primary-600"
                />
                <Icon v-else name="loader" size="16" class="text-core-600 animate-spin" />
              </span>
            </p>
          </div>

          <p class="text-core-600 mt-6 text-center text-sm">
            You can leave this page. We'll notify you when it's ready.
          </p>
        </div>

        <AppButton
          v-else
          variant="outlined"
          :label="`Generate ${fullDate.split(', ')[1]} Report`"
          icon="add"
          :loading="isGenerating"
          @click="handleGenerateReport"
        />
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

      <!-- Financial Summary -->
      <EodFinancialSummary id="summary" :data="reportData" />
      <EodPayments id="payments" :data="reportData" />
      <EodExpenses id="expenses" :data="reportData" />
      <EodCustomers id="customers" :data="reportData" />
      <EodSalesByOrigin id="origin" :data="reportData" />
      <EodFulfilment id="fulfillment" :data="reportData" />
      <EodInventoryMovement id="inventory" :data="reportData" />
      <EodAbandoned id="abandoned" :data="reportData" />
      <EodUnresolvedIssues id="issues" :data="reportData" />
      <EodProductsSold id="products" :data="reportData" />
      <EodOrders id="orders" :data="reportData" />

      <ReportInsightCard title="Daily Summary & Closing Note">
        <p class="text-sm">
          {{ reportData?.narratives.daily_summary || "N/A" }}
        </p>
        <br />
        <p v-if="reportData?.narratives.tomorrow_priorities" class="text-sm">
          {{ reportData?.narratives.tomorrow_priorities || "N/A" }}
        </p>
      </ReportInsightCard>
    </section>
  </div>
</template>

<style scoped>
#report-content > * {
  scroll-margin-top: 4.5rem;
}
</style>
