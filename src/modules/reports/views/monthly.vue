<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"

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
  </div>
</template>
