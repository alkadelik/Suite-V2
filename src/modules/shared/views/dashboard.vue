<template>
  <div>
    <!-- Mobile page header (reuses the app-wide PageHeader like Inventory et al.) -->
    <PageHeader title="Home" />

    <div class="p-4 pt-5 md:pt-4">
      <div class="space-y-6">
        <!-- Full-width top section -->
        <DashboardGreeting
          :first-name="worklist?.firstName"
          :count="worklist?.count ?? 0"
          :loading="worklistQuery.isPending.value"
        />

        <!-- Quick Overview now opens in a modal -->
        <div class="flex justify-center">
          <button
            type="button"
            class="bg-primary-50 border-primary-200 text-primary-700 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
            @click="showOverview = true"
          >
            View Quick Overview
            <Icon name="arrow-right" size="16" />
          </button>
        </div>

        <HealthVitalsStrip
          :vitals="health?.vitals ?? []"
          :loading="healthQuery.isPending.value"
          :error="healthQuery.isError.value"
        />

        <hr class="border-gray-200" />

        <QuickActionRow />

        <!-- Two-column split: worklist + rail -->
        <div class="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div class="min-w-0 flex-1 space-y-6">
            <Worklist
              :tasks="worklist?.tasks ?? []"
              :count="worklist?.count ?? 0"
              :loading="worklistQuery.isPending.value"
              :error="worklistQuery.isError.value"
            />
            <!-- Awareness rail renders BELOW the worklist on mobile (DASH-25) -->
            <AwarenessRail class="xl:hidden" />
          </div>

          <!-- Desktop rail: ~30% width, sticky so it stays in view while the worklist scrolls -->
          <AwarenessRail
            class="hidden shrink-0 xl:sticky xl:top-4 xl:block xl:max-h-[calc(100vh-6rem)] xl:w-[32%] xl:overflow-y-auto"
          />
        </div>
      </div>
    </div>

    <QuickOverviewModal
      :open="showOverview"
      :line="worklist?.summaryLine"
      @close="showOverview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import PageHeader from "@components/PageHeader.vue"
import Icon from "@components/Icon.vue"
import { useGetDashboardHealth, useGetWorklist } from "../components/dashboard/api"
import DashboardGreeting from "../components/dashboard/DashboardGreeting.vue"
import QuickOverviewModal from "../components/dashboard/QuickOverviewModal.vue"
import HealthVitalsStrip from "../components/dashboard/HealthVitalsStrip.vue"
import QuickActionRow from "../components/dashboard/QuickActionRow.vue"
import Worklist from "../components/dashboard/Worklist.vue"
import AwarenessRail from "../components/dashboard/AwarenessRail.vue"

// Independent fetches: a slow worklist never blocks the health strip (DASH-19).
const healthQuery = useGetDashboardHealth()
const worklistQuery = useGetWorklist()
const health = computed(() => healthQuery.data.value)
const worklist = computed(() => worklistQuery.data.value)

const showOverview = ref(false)
</script>
