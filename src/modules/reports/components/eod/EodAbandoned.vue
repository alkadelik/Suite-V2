<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import DataTable from "@components/DataTable.vue"
import { EOD_ABANDONED_COLUMNS } from "@modules/reports/constants"
import { IEODReport } from "@modules/reports/types"
import { useMediaQuery } from "@vueuse/core"

const isMobile = useMediaQuery("(max-width: 768px)")
defineProps<{ data: IEODReport | null }>()
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">08</span>
      <h3 class="text-base font-semibold text-gray-900">Failed & Abandoned Transactions</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Lost Revenue</span>
    </header>
    <!-- content -->
    <div class="grid grid-cols-1 gap-8 py-4 md:grid-cols-2">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Failed Payments</h3>
          <p class="text-xs">
            {{ data?.failed_payments?.count ?? 0 }} failed today
            <span v-if="!data?.failed_payments?.count">- clean day!</span>
          </p>
        </div>
        <div class="flex min-h-[280px] items-center justify-center">
          <div class="text-center">
            <img src="@/assets/images/empty-store.svg?url" class="mx-auto mb-1 h-[120px]" />
            <h4
              class="mb-1 text-base font-semibold"
              :class="data?.failed_payments?.count ? 'text-error-600' : 'text-success-600'"
            >
              {{ data?.failed_payments?.count || "No" }} failed payment today
            </h4>
            <p class="text-sm">
              Yesterday had {{ data?.previous_day_failed_payments?.count || "no" }} failures
              <span v-if="data?.previous_day_failed_payments?.count"
                >worth
                {{ formatCurrency(data?.previous_day_failed_payments?.total_failed_amount ?? 0) }}
              </span>
            </p>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Abandoned Carts</h3>
          <p class="text-xs">
            {{ data?.abandoned_carts?.count ?? 0 }} carts abandoned &bull;
            {{ formatCurrency(data?.abandoned_carts?.total_potential_revenue ?? 0) }} potential
            revenue
          </p>
        </div>
        <div>
          <div
            v-if="!data?.abandoned_carts?.count"
            class="flex min-h-[280px] items-center justify-center"
          >
            <div class="text-center">
              <img src="@/assets/images/empty-store.svg?url" class="mx-auto mb-1 h-[120px]" />
              <h4 class="mb-1 text-base font-semibold">No abandoned carts today</h4>
              <p class="text-sm">There is no abandoned cart today. Great work!</p>
            </div>
          </div>
          <DataTable
            v-else
            :columns="EOD_ABANDONED_COLUMNS"
            :data="data?.abandoned_carts?.orders ?? []"
            :show-pagination="false"
            :show-mobile-view="false"
            :fix-first-column="isMobile"
          />
        </div>
        <div class="p-4 text-sm italic">
          {{ data?.narratives?.abandoned_carts_insight }}
        </div>
      </div>
    </div>
  </section>
</template>
