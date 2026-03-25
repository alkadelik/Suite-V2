<script setup lang="ts">
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Chip from "@components/Chip.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref, watch } from "vue"
import { SO_SUMMARY_CARDS, SO_SUMMARY_CARDS_EMPTY } from "../constants"
import { useGetHighlights } from "../api"

import SoEbitda from "../components/store-overview/SoEbitda.vue"
import SoGrossProfit from "../components/store-overview/SoGrossProfit.vue"
import SoRepeatCustomer from "../components/store-overview/SoRepeatCustomer.vue"
import SoCustomerGrowth from "../components/store-overview/SoCustomerGrowth.vue"
import SoTopProducts from "../components/store-overview/SoTopProducts.vue"

// --- DEV TOGGLE: flip to false for empty state ---
const useDummyData = ref(true)

const { data: highlights } = useGetHighlights()
watch(highlights, (val) => {
  console.log("highlights response:", val)
})

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)

const dateRange = "February 1 - February 28 2026"

const summaryCards = computed(() =>
  useDummyData.value ? SO_SUMMARY_CARDS : SO_SUMMARY_CARDS_EMPTY,
)
</script>

<template>
  <div class="p-4">
    <PageHeader v-if="isMobile" title="Store Overview" />
    <SectionHeader v-else title="Store Overview" :subtitle="dateRange">
      <template #action>
        <Chip label="Past 30 days" color="warning" />
      </template>
    </SectionHeader>

    <div v-if="isMobile" class="mt-1 flex items-center gap-2">
      <span class="text-core-600 text-sm">{{ dateRange }}</span>
      <Chip label="Past 30 days" color="warning" size="sm" />
    </div>

    <section class="mt-6 space-y-6">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="rounded-xl border border-gray-200 bg-white px-4 py-6"
        >
          <span class="border-primary-600 mb-2 block w-8 border-t-2" />
          <p class="text-core-600 text-sm">{{ card.label }}</p>
          <p class="text-core-800 mt-1 text-xl font-bold">{{ card.value }}</p>
        </div>
      </div>

      <SoEbitda :use-dummy-data="useDummyData" />
      <SoGrossProfit :use-dummy-data="useDummyData" />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SoRepeatCustomer :use-dummy-data="useDummyData" />
        <SoCustomerGrowth :use-dummy-data="useDummyData" />
      </div>

      <SoTopProducts :use-dummy-data="useDummyData" />
    </section>

    <button
      @click="useDummyData = !useDummyData"
      class="fixed bottom-6 left-6 z-50 rounded-full bg-gray-800 px-4 py-2 text-xs font-medium text-white shadow-lg transition hover:bg-gray-700"
    >
      {{ useDummyData ? "Show Empty State" : "Show Populated State" }}
    </button>
  </div>
</template>
