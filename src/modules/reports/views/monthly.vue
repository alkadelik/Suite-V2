<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Tabs from "@components/Tabs.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { MONTHLY_REPORT_SECTIONS } from "../constants"
import Icon from "@components/Icon.vue"

const activeDate = ref(new Date().toISOString().slice(0, 7))

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
          :max="new Date().toISOString().slice(0, 7)"
        />
      </template>
    </SectionHeader>

    <EmptyState
      v-if="false"
      :title="`${fullMonth} Sales Report`"
      :description="`Get a complete breakdown of your revenue, customers, products and profit — with actionable recommendations.`"
      :action-label="`Generate ${fullMonth} Report`"
      action-icon="add"
      class="mt-4"
    >
      <template #image>
        <img src="@/assets/images/empty-report.svg?url" class="mx-auto mb-4" />
      </template>
    </EmptyState>

    <section v-else class="mt-6 space-y-6">
      <div
        class="border-l-primary-600 border-primary-200 bg-primary-50 rounded-r-lg border border-l-4 p-4"
      >
        <h4 class="mb-3 flex items-center gap-2 text-xs font-medium uppercase">
          <Icon name="trend-up" size="16" /> Executive Summary - AI Insights
        </h4>
        <p class="text-sm">
          January was a <b>strong recovery month</b> following the holiday season. Total revenue hit
          <b>₦4.87M</b>, up <b>14.2%</b> from December. Net revenue (EBITDA) settled at
          <b>₦1.52M</b>, reflecting a healthy <b>31.2% margin</b> after accounting for COGS,
          refunds, and shipping costs. The biggest driver was a
          <b>38% surge in repeat customers</b> — likely a downstream effect of your December
          promotions converting one-time buyers into returning shoppers. However,
          <b>cart abandonment climbed to 34.7%</b>, suggesting friction at checkout that's leaving
          roughly <b>₦580K in unrealized revenue</b> on the table. Your best-selling category (<b
            >Ankara dresses</b
          >) accounts for <b>41% of total revenue</b> — a <b>concentration risk</b> worth watching.
          Consider diversifying promotional focus to your <b>accessories line</b>, which showed a
          quiet but promising <b>22% growth</b> this month.
        </p>
      </div>

      <Tabs v-model="activeSection" :tabs="MONTHLY_REPORT_SECTIONS" />
    </section>
  </div>
</template>
