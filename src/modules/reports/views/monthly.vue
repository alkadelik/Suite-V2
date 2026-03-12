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

const lastMonth = new Date()
lastMonth.setMonth(lastMonth.getMonth() - 1)
const activeDate = ref(lastMonth.toISOString().slice(0, 7))

const { mutate: generateMonthlyReport, isPending: isGenerating } = useGenerateMonthlyReport()

const { data: latestMonthlyReport } = useGetLatestMonthlyReport()

watch(
  () => latestMonthlyReport.value,
  (newReport) => {
    if (newReport) {
      const { year, month } = newReport.period
      activeDate.value = `${year}-${String(month).padStart(2, "0")}`
    }
  },
  { immediate: true },
)

const reportData = computed(() => latestMonthlyReport.value)

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)
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
        console.log("Report generated successfully:", res)
      },
    },
  )
}
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
          :max="lastMonth.toISOString().slice(0, 7)"
        />
      </template>
    </SectionHeader>

    <EmptyState
      v-if="!reportData"
      :title="`${fullMonth} Sales Report`"
      :description="`Get a complete breakdown of your revenue, customers, products and profit — with actionable recommendations.`"
      :action-label="`Generate ${fullMonth} Report`"
      action-icon="add"
      class="mt-4"
      :loading="isGenerating"
      @action="handleGenerate"
    >
      <template #image>
        <img src="@/assets/images/empty-report.svg?url" class="mx-auto mb-4" />
      </template>
    </EmptyState>

    <section v-else class="mt-6 space-y-6">
      <ReportInsightCard variant="primary" icon="trend-up" title="Executive Summary - AI Insights">
        <p>
          {{ reportData?.narratives.executive_summary }}
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
