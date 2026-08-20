<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Tabs from "@components/Tabs.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref, watch } from "vue"
import { MONTHLY_REPORT_SECTIONS } from "../constants"
import MonthlySummary from "../components/monthly/MonthlySummary.vue"
import MonthlyPerformance from "../components/monthly/MonthlyPerformance.vue"
import MonthlyCustomer from "../components/monthly/MonthlyCustomer.vue"
import MonthlyProducts from "../components/monthly/MonthlyProducts.vue"
import MonthlyOperations from "../components/monthly/MonthlyOperations.vue"
import ReportInsightCard from "../components/ReportInsightCard.vue"
import {
  useGenerateMonthlyReport,
  useGetLatestMonthlyReport,
  useGetMonthlyReportById,
} from "../api"
import { useReportsStore } from "../store"
import AppButton from "@components/AppButton.vue"
import { useSettingsStore } from "@modules/settings/store"
import ReportGeneratingSteps from "../components/ReportGeneratingSteps.vue"
import { useReportProgress } from "../composables/useReportProgress"
import { useRoute, useRouter } from "vue-router"
// import { toast } from "@/composables/useToast"

/** Safety net for a missed websocket notification while a report is generating. */
const POLL_INTERVAL = 15_000

const STEPS = [
  { label: "Reviewing revenue trends...", icon: "trend-up" },
  { label: "Analyzing Product Performance...", icon: "box-filled" },
  { label: "Evaluating Customer Activity...", icon: "user-octagon" },
  { label: "Identifying Growth Opportunities...", icon: "chart-breakout-square" },
  { label: "Generating Insights...", icon: "flash" },
]

const now = new Date()
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`
const activeDate = ref(lastMonthStr)

const reportsStore = useReportsStore()
const settingsStore = useSettingsStore()
const route = useRoute()
const router = useRouter()

// `?id=` (e.g. from a notification link) points at one specific report. Its month is
// unknown until it loads, so that report — not the month picker — drives the screen.
const reportId = computed(() => (route.query.id ? String(route.query.id) : ""))

const storeCreatedDate = computed(() => {
  if (!settingsStore.storeDetails?.created_at) return undefined
  return new Date(settingsStore.storeDetails.created_at).toISOString().slice(0, 7)
})

const { mutate: generateMonthlyReport, isPending: isGenerating } = useGenerateMonthlyReport()

// Get the specific report for the active date
const activeDateParts = computed(() => {
  const [year, month] = activeDate.value.split("-").map(Number)
  return { year, month }
})

// Check if current month's report is generating
const isCurrentMonthGenerating = computed(() => {
  const { year, month } = activeDateParts.value
  return reportsStore.isReportGenerating(year, month)
})

const {
  data: latestMonthlyReport,
  isPending: isPendingLatest,
  isFetching,
  refetch: refetchSpecificReport,
} = useGetLatestMonthlyReport(activeDateParts, {
  // Poll while generating so the report still appears if the websocket message is missed.
  refetchInterval: computed(() => (isCurrentMonthGenerating.value ? POLL_INTERVAL : false)),
  enabled: computed(() => !reportId.value),
})

const { data: monthlyReportById, isPending: isPendingById } = useGetMonthlyReportById(reportId)

const isPending = computed(() => (reportId.value ? isPendingById.value : isPendingLatest.value))

const reportData = computed(() => {
  const report = reportId.value ? monthlyReportById.value : latestMonthlyReport.value
  if (!report) return null
  if (report.detail) return null
  return report
})

// The month picker is meaningless until we know which month the report covers, so it
// stays hidden while a report fetched by id is still in flight. It comes back once the
// fetch settles — including on failure, so a bad id does not strand the user.
const isResolvingReportId = computed(() => Boolean(reportId.value) && isPendingById.value)
const showDateSelector = computed(() => !isResolvingReportId.value)

// Follow the loaded report's own month, so the header and any later month change start
// from the right period.
watch(
  () => monthlyReportById.value,
  (report) => {
    const period = report && !report.detail ? report.period : undefined
    if (period?.year && period?.month) {
      activeDate.value = `${period.year}-${String(period.month).padStart(2, "0")}`
    }
  },
)

// Picking a month drops the pinned report and goes back to the latest-for-that-month query.
const onChangeDate = (value: string) => {
  activeDate.value = value
  if (reportId.value) {
    const query = { ...route.query }
    delete query.id
    router.replace({ query })
  }
}

const isReportReady = computed(() => Boolean(reportData.value) && !isCurrentMonthGenerating.value)

const { stepStates, progress, isOverdue, finish } = useReportProgress(
  STEPS,
  isCurrentMonthGenerating,
  {
    startedAt: () => {
      const { year, month } = activeDateParts.value
      return reportsStore.getGeneratingReport(year, month)?.startedAt
    },
  },
)

// The report can land from a poll or from the websocket invalidating this query. Either
// way: tick the checklist to complete, then swap the view in — no manual reload.
watch(
  () => reportData.value,
  async (newReport) => {
    if (!newReport || !isCurrentMonthGenerating.value) return
    await finish()
    // The query is keyed by `activeDateParts`, so that is the flag this report resolves.
    reportsStore.removeGeneratingReport(activeDateParts.value.year, activeDateParts.value.month)
    if (newReport.period?.year) {
      reportsStore.removeGeneratingReport(newReport.period.year, newReport.period.month)
    }
  },
  { immediate: true },
)

const isMobile = useMediaQuery("(max-width: 1024px)")
const fullMonth = computed(() =>
  new Date(activeDate.value).toLocaleDateString("en-US", { month: "long" }),
)

const dateRange = computed(() => {
  const [year, month] = activeDate.value.split("-").map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const monthName = firstDay.toLocaleDateString("en-US", { month: "long" })
  const lastMonthName = lastDay.toLocaleDateString("en-US", { month: "long" })
  return `${monthName} 1 - ${lastMonthName} ${lastDay.getDate()}, ${year}`
})

// While `?id=` is resolving the month is not known yet — do not show a placeholder one.
const title = computed(() =>
  isResolvingReportId.value ? "Monthly Sales Report" : `${fullMonth.value} Sales Report`,
)
const subtitle = computed(() => (isResolvingReportId.value ? "" : dateRange.value))

const activeSection = ref("summary")

const handleGenerate = () => {
  // const createdAt = settingsStore.storeDetails?.created_at
  // if (createdAt) {
  //   const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  //   if (daysSinceCreation < 31) {
  //     toast.error(
  //       "Your store needs at least 31 days of activity before generating a Monthly report.",
  //       { title: "Not Enough Data" },
  //     )
  //     return
  //   }
  // }

  const [year, month] = activeDate.value.split("-").map(Number)

  generateMonthlyReport(
    { year, month },
    {
      onSuccess: (res) => {
        const responseData = res.data.data
        // Check if report is still generating
        if (responseData.status === "generating") {
          reportsStore.setGeneratingReport({
            uid: responseData.uid,
            year: responseData.year,
            month: responseData.month,
            status: "generating",
            generatedAt: null,
          })
        } else if (responseData.status === "completed") {
          // If completed immediately, refetch the latest report
          activeDate.value = `${responseData.year}-${String(responseData.month).padStart(2, "0")}`
          refetchSpecificReport()
        }
      },
    },
  )
}
</script>

<template>
  <div class="p-4">
    <PageHeader v-if="isMobile" :title="title" />
    <SectionHeader v-else :title="title" :subtitle="subtitle">
      <template #action>
        <TextField
          v-if="showDateSelector"
          type="month"
          size="sm"
          :model-value="activeDate"
          :max="lastMonthStr"
          :min="storeCreatedDate"
          @update:model-value="onChangeDate"
        />
      </template>
    </SectionHeader>

    <div v-if="isMobile && showDateSelector" class="flex justify-end pt-4">
      <TextField
        type="month"
        size="sm"
        :model-value="activeDate"
        :max="lastMonthStr"
        :min="storeCreatedDate"
        @update:model-value="onChangeDate"
      />
    </div>

    <EmptyState
      v-if="!isReportReady"
      :title="`${fullMonth} Sales Report`"
      :description="
        isCurrentMonthGenerating
          ? `Your ${fullMonth} report is being prepared...`
          : `Get a complete breakdown of your revenue, customers, products and profit — with actionable recommendations.`
      "
      class="mt-4"
      :loading="isPending && !isCurrentMonthGenerating"
    >
      <template #image>
        <img src="@/assets/images/empty-report.svg?url" class="mx-auto mb-4" />
      </template>

      <template #action>
        <ReportGeneratingSteps
          v-if="isCurrentMonthGenerating"
          :steps="STEPS"
          :states="stepStates"
          :progress="progress"
          :is-overdue="isOverdue"
          :is-refreshing="isFetching"
          @refresh="refetchSpecificReport()"
        />

        <AppButton
          v-else
          variant="outlined"
          :label="`Generate ${fullMonth} Report`"
          icon="add"
          :loading="isGenerating"
          @click="handleGenerate"
        />
      </template>
    </EmptyState>

    <!-- Show report when available -->
    <section v-else class="mt-6 space-y-6">
      <ReportInsightCard variant="primary" icon="trend-up" title="Executive Summary - AI Insights">
        <p>
          {{ reportData?.narratives.executive_summary || "N/A" }}
        </p>
      </ReportInsightCard>

      <div>
        <div class="bg-base-background sticky top-2 z-20 py-2">
          <Tabs v-model="activeSection" :tabs="MONTHLY_REPORT_SECTIONS" />
        </div>

        <div class="">
          <MonthlySummary v-if="activeSection === 'summary'" :data="reportData" />
          <MonthlyPerformance v-if="activeSection === 'performance'" :data="reportData" />
          <MonthlyCustomer v-if="activeSection === 'customers'" :data="reportData" />
          <MonthlyProducts v-if="activeSection === 'products'" :data="reportData" />
          <MonthlyOperations v-if="activeSection === 'operations'" :data="reportData" />
        </div>
      </div>
    </section>
  </div>
</template>
