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
import AppButton from "@components/AppButton.vue"
import ReportGeneratingSteps from "../components/ReportGeneratingSteps.vue"
import { useReportProgress } from "../composables/useReportProgress"
// import { toast } from "@/composables/useToast"

/** Safety net for a missed websocket notification while a report is generating. */
const POLL_INTERVAL = 15_000

const STEPS = [
  { label: "Reviewing daily transactions...", icon: "trend-up" },
  { label: "Analyzing Payment Methods...", icon: "wallet-money" },
  { label: "Evaluating Order Fulfillment...", icon: "box-filled" },
  { label: "Checking Inventory Movement...", icon: "box" },
  { label: "Generating Daily Insights...", icon: "flash" },
]

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

// Check if current day's report is generating
const isCurrentDayGenerating = computed(() => {
  return reportsStore.isEODReportGenerating(activeDate.value)
})

const {
  data: latestEODReport,
  isPending,
  isFetching,
  refetch: refetchEODReport,
} = useGetLatestEODReport(activeDate, {
  // Poll while generating so the report still appears if the websocket message is missed.
  refetchInterval: computed(() => (isCurrentDayGenerating.value ? POLL_INTERVAL : false)),
})

const reportData = computed(() => {
  if (!latestEODReport.value) return null
  // Check if response is an error detail message
  if (typeof latestEODReport.value === "object" && "detail" in latestEODReport.value) return null
  return latestEODReport.value
})

const isReportReady = computed(() => Boolean(reportData.value) && !isCurrentDayGenerating.value)

const { stepStates, progress, isOverdue, finish } = useReportProgress(
  STEPS,
  isCurrentDayGenerating,
  { startedAt: () => reportsStore.getGeneratingEODReport(activeDate.value)?.startedAt },
)

// The report can land from a poll or from the websocket invalidating this query. Either
// way: tick the checklist to complete, then swap the view in — no manual reload.
watch(
  () => reportData.value,
  async (newReport) => {
    if (!newReport || !isCurrentDayGenerating.value) return
    await finish()
    // The query is keyed by `activeDate`, so that is the flag this report resolves —
    // clearing by the report's own date too, in case the API formats it differently.
    reportsStore.removeGeneratingEODReport(activeDate.value)
    if (newReport.period?.date) reportsStore.removeGeneratingEODReport(newReport.period.date)
  },
  { immediate: true },
)

const isMobile = useMediaQuery("(max-width: 1024px)")
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

// The sections only exist once the report is on screen — re-observe whenever it is
// revealed (first load, a date change, or a generation finishing while we watch).
watch(isReportReady, (ready) => {
  if (ready) nextTick(setupSectionObserver)
  else sectionObserver?.disconnect()
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
})

const handleGenerateReport = () => {
  // const createdAt = settingsStore.storeDetails?.created_at
  // if (createdAt) {
  //   const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  //   if (hoursSinceCreation < 36) {
  //     toast.error(
  //       "Your store needs at least 36 hours of activity before generating an End of Day report.",
  //       { title: "Not Enough Data" },
  //     )
  //     return
  //   }
  // }

  generateEODReport(
    { date: activeDate.value },
    {
      onSuccess: (res) => {
        const responseData = res.data.data
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

    <div v-if="isMobile" class="flex justify-end pt-4">
      <TextField
        type="date"
        size="sm"
        v-model="activeDate"
        :max="yesterday.toISOString().slice(0, 10)"
        :min="storeCreatedDate"
      />
    </div>

    <EmptyState
      v-if="!isReportReady"
      :title="`${fullDate.split(', ')[1]} Report`"
      :description="
        isCurrentDayGenerating
          ? `Your ${fullDate.split(', ')[1]} report is being prepared...`
          : `Get a complete breakdown of your revenue, customers, products and profit — with actionable recommendations.`
      "
      class="mt-4"
      :loading="isPending && !isCurrentDayGenerating"
    >
      <template #image>
        <img src="@/assets/images/empty-report.svg?url" class="mx-auto mb-4" />
      </template>

      <template #action>
        <ReportGeneratingSteps
          v-if="isCurrentDayGenerating"
          :steps="STEPS"
          :states="stepStates"
          :progress="progress"
          :is-overdue="isOverdue"
          :is-refreshing="isFetching"
          @refresh="refetchEODReport()"
        />

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
