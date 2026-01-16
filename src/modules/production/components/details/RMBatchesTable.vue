<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import { BATCHES_COLUMN, MOCK_BATCHES } from "@modules/production/constants"
import { TBatch } from "@modules/production/types"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import RMTableCard from "./RMTableCard.vue"

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)

const openDetails = ref(false)
const selectedBatch = ref<TBatch | null>(null)

const onRowClick = (batch: TBatch) => {
  selectedBatch.value = batch
  openDetails.value = true
}
</script>

<template>
  <div>
    <div class="space-y-4 overflow-hidden rounded-xl border-gray-200 md:border md:bg-white">
      <DataTable
        :data="MOCK_BATCHES ?? []"
        :columns="BATCHES_COLUMN"
        :loading="false"
        :enable-row-selection="false"
        :empty-state="{
          title: `No Batches Available`,
          description: `Start tracking your batches by adding them to the system.`,
        }"
        :show-pagination="false"
        @row-click="onRowClick"
      >
        <template #cell:source="{ item }">
          <Chip :label="item.source" color="blue" />
        </template>
        <template #mobile="{ item }">
          <RMTableCard :title="formatDate(new Date())" class="my-3">
            <template #append>
              <Chip :label="item.source" color="blue" />
            </template>
            <template #body>
              <div>
                <p class="text-sm font-medium">35</p>
                <p class="text-core-600 text-xs">Qty. Added</p>
              </div>
              <div>
                <p class="text-sm font-medium">{{ formatCurrency(4800) }} / kg</p>
                <p class="text-core-600 text-xs">Remaining</p>
              </div>
              <div>
                <p class="text-sm font-medium">{{ formatCurrency(4800) }} / kg</p>
                <p class="text-core-600 text-xs">Unit Cost</p>
              </div>
            </template>
          </RMTableCard>
        </template>
      </DataTable>
    </div>

    <!-- Details -->
    <component
      :is="isMobile ? Modal : Drawer"
      :open="openDetails"
      title="Batch Details"
      max-width="2xl"
      variant="fullscreen"
      @close="openDetails = false"
    >
      <div class="space-y-6">
        <div class="flex flex-col items-center justify-center gap-2">
          <h4 class="text-3xl font-bold md:text-4xl">50 kg</h4>
          <p class="text-sm font-medium md:text-base">{{ formatDate(new Date()) }}</p>
        </div>

        <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Batch ID</span>
            <span class="font-medium">SB-ADJ-02</span>
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Source</span>
            <Chip label="Manual Adjustment" color="blue" />
          </p>
        </div>

        <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Quantity Added</span>
            <span class="font-medium capitalize">50 kg</span>
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Quantity Left</span>
            <span class="font-medium capitalize">32 kg</span>
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Unit Cost</span>
            <span class="font-medium">{{ formatCurrency(4800) }} / kg</span>
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Total Cost</span>
            <span class="font-medium">{{ formatCurrency(4800 * 50) }}</span>
          </p>
        </div>

        <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
          <p class="flex flex-col text-sm">
            <span class="text-core-600">Notes</span>
            <span class="font-medium">
              This area contains a sample note which I have added as merchant that has made bastard
              money on Leyyow
            </span>
          </p>
        </div>
      </div>
    </component>
  </div>
</template>
