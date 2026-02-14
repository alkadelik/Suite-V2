<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import { BATCHES_COLUMN } from "@modules/production/constants"
import { TBatch, TRawMaterial } from "@modules/production/types"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { startCase } from "@/utils/format-strings"
import RMBatchCard from "./RMBatchCard.vue"

const props = defineProps<{ batches: TBatch[]; material: TRawMaterial }>()

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
        :data="props.batches ?? []"
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
        <template #cell:quantity_added="{ item }">
          {{ Number(item.quantity).toLocaleString() }} {{ props.material?.unit }}
        </template>
        <template #cell:quantity_left="{ item }">
          {{ Number(item.remaining_quantity).toLocaleString() }} {{ props.material?.unit }}
        </template>
        <template #cell:unit_cost="{ item }">
          {{ formatCurrency(Number(item.unit_cost)) }} / {{ props.material?.unit }}
        </template>
        <template #cell:source="{ item }">
          <Chip v-if="item.source_type" :label="startCase(item.source_type)" color="blue" />
          <span v-else>N/A</span>
        </template>
        <template #mobile="{ item }">
          <RMBatchCard class="border-b border-gray-200 py-4!" :item="item" :material="material" />
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
      <div v-if="selectedBatch" class="space-y-6">
        <div class="flex flex-col items-center justify-center gap-2">
          <h4 class="text-3xl font-bold md:text-4xl">
            {{ Number(selectedBatch.quantity).toLocaleString() }} {{ props.material?.unit }}
          </h4>
          <p class="text-sm font-medium md:text-base">
            {{ formatDate(new Date(selectedBatch.date_added)) }}
          </p>
        </div>

        <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Batch ID</span>
            <span class="font-medium">N/A</span>
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Source</span>
            <Chip
              v-if="selectedBatch.source_type"
              :label="startCase(selectedBatch.source_type)"
              color="blue"
            />
            <span v-else class="font-medium">N/A</span>
          </p>
        </div>

        <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Quantity Added</span>
            <span class="font-medium capitalize"
              >{{ Number(selectedBatch.quantity).toLocaleString() }}
              {{ props.material?.unit }}</span
            >
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Quantity Left</span>
            <span class="font-medium capitalize"
              >{{ Number(selectedBatch.remaining_quantity).toLocaleString() }}
              {{ props.material?.unit }}</span
            >
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Unit Cost</span>
            <span class="font-medium"
              >{{ formatCurrency(Number(selectedBatch.unit_cost)) }} /
              {{ props.material?.unit }}</span
            >
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Total Cost</span>
            <span class="font-medium">{{
              formatCurrency(Number(selectedBatch.unit_cost) * Number(selectedBatch.quantity))
            }}</span>
          </p>
        </div>

        <div
          v-if="selectedBatch.notes"
          class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4"
        >
          <p class="flex flex-col text-sm">
            <span class="text-core-600">Notes</span>
            <span class="font-medium">
              {{ selectedBatch.notes }}
            </span>
          </p>
        </div>
      </div>
    </component>
  </div>
</template>
