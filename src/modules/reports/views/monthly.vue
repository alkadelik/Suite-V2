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
import { useGenerateMonthlyReport, useGetLatestMonthlyReport } from "../api"
import { useReportsStore } from "../store"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { useSettingsStore } from "@modules/settings/store"

const now = new Date()
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`
const activeDate = ref(lastMonthStr)

const reportsStore = useReportsStore()
const settingsStore = useSettingsStore()

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

const {
  data: latestMonthlyReport,
  isPending,
  isFetching,
  refetch: refetchSpecificReport,
} = useGetLatestMonthlyReport(activeDateParts)

// Check if current month's report is generating
const isCurrentMonthGenerating = computed(() => {
  const { year, month } = activeDateParts.value
  return reportsStore.isReportGenerating(year, month)
})

watch(
  () => latestMonthlyReport.value,
  (newReport) => {
    if (newReport?.period) {
      const { year, month } = newReport.period
      if (reportsStore.isReportGenerating(year, month)) {
        reportsStore.removeGeneratingReport(year, month)
      }
    }
  },
  { immediate: true },
)

const reportData = computed(() => {
  if (!latestMonthlyReport.value) return null
  if (latestMonthlyReport.value.detail) return null
  return latestMonthlyReport.value
})

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

const activeSection = ref("summary")

const handleGenerate = () => {
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

const STEPS = computed(() => [
  { label: "Reviewing revenue trends...", icon: "trend-up" },
  { label: "Analyzing Product Performance...", icon: "box-filled" },
  { label: "Evaluating Customer Activity...", icon: "user-octagon" },
  { label: "Identifying Growth Opportunities...", icon: "box-filled" },
  { label: "Generating Insights...", icon: "box-filled" },
])
</script>

<template>
  <div class="p-4">
    <PageHeader v-if="isMobile" :title="`${fullMonth} Sales Report`" />
    <SectionHeader v-else :title="`${fullMonth} Sales Report`" :subtitle="dateRange">
      <template #action>
        <TextField
          type="month"
          size="sm"
          v-model="activeDate"
          :max="lastMonthStr"
          :min="storeCreatedDate"
        />
      </template>
    </SectionHeader>

    <EmptyState
      v-if="!reportData || isCurrentMonthGenerating || isPending || isFetching"
      :title="`${fullMonth} Sales Report`"
      :description="
        isCurrentMonthGenerating
          ? `Your ${fullMonth} report is being prepared...`
          : `Get a complete breakdown of your revenue, customers, products and profit — with actionable recommendations.`
      "
      class="mt-4"
      :loading="isPending || isFetching"
    >
      <template #image>
        <img src="@/assets/images/empty-report.svg?url" class="mx-auto mb-4" />
      </template>

      <template #action>
        <div v-if="isCurrentMonthGenerating">
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
