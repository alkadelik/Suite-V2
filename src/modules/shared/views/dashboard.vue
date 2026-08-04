<template>
  <div>
    <!-- Mobile page header (reuses the app-wide PageHeader like Inventory et al.) -->
    <PageHeader title="Health Center" />

    <div class="p-4 pt-5 md:pt-4">
      <div class="space-y-6">
        <!-- <div class="px-4 py-5 md:p-6">
      <div class="mx-auto w-full max-w-[1240px] space-y-6"> -->
        <!-- Full-width top section -->
        <DashboardGreeting
          :first-name="worklist?.firstName"
          :count="worklist?.count ?? 0"
          :loading="worklistQuery.isPending.value"
        />
        <QuickOverviewCard
          :line="worklist?.summaryLine"
          :secondary="worklist?.summaryLineSecondary ?? null"
          :loading="worklistQuery.isPending.value"
        />
        <HealthVitalsStrip
          :vitals="health?.vitals ?? []"
          :loading="healthQuery.isPending.value"
          :error="healthQuery.isError.value"
        />

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
          <AwarenessRail class="hidden shrink-0 xl:sticky xl:top-4 xl:block xl:w-[32%]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import PageHeader from "@components/PageHeader.vue"
import { useGetDashboardHealth, useGetWorklist } from "../components/dashboard/api"
import DashboardGreeting from "../components/dashboard/DashboardGreeting.vue"
import QuickOverviewCard from "../components/dashboard/QuickOverviewCard.vue"
import HealthVitalsStrip from "../components/dashboard/HealthVitalsStrip.vue"
import Worklist from "../components/dashboard/Worklist.vue"
import AwarenessRail from "../components/dashboard/AwarenessRail.vue"

// Independent fetches: a slow worklist never blocks the health strip (DASH-19).
const healthQuery = useGetDashboardHealth()
const worklistQuery = useGetWorklist()
const health = computed(() => healthQuery.data.value)
const worklist = computed(() => worklistQuery.data.value)
</script>
