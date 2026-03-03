<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import DataTable from "@components/DataTable.vue"
import { EOD_ABANDONED, EOD_ABANDONED_COLUMNS } from "@modules/reports/constants"
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
    <div class="grid grid-cols-2 gap-8 py-4">
      <!--  -->
      <div class="rounded-xl bg-white shadow">
        <div class="border-b border-gray-200 px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Failed Payments</h3>
          <p class="text-xs">0 failed today - clean day!</p>
        </div>
        <div class="flex min-h-[280px] items-center justify-center">
          <div class="text-center">
            <img src="@/assets/images/empty-store.svg?url" class="mx-auto mb-1 h-[120px]" />
            <h4 class="text-success-600 mb-1 text-base font-semibold">No failed payment today</h4>
            <p class="text-sm">Yesterday had 2 failures worth ₦18,600</p>
          </div>
        </div>
      </div>
      <!--  -->
      <div class="divide-y divide-gray-200 rounded-xl bg-white shadow">
        <div class="px-4 py-3">
          <h3 class="mb-1 text-sm font-semibold">Abandoned Carts</h3>
          <p class="text-xs">
            3 carts abandoned &bull; {{ formatCurrency(4500) }} potential revenue
          </p>
        </div>
        <div>
          <DataTable
            :columns="EOD_ABANDONED_COLUMNS"
            :data="EOD_ABANDONED ?? []"
            :show-pagination="false"
          />
        </div>
        <div class="p-4 text-sm italic">
          2 of 3 dropped off at payment — consistent with the checkout friction pattern identified
          in the monthly report.
        </div>
      </div>
    </div>
  </section>
</template>
