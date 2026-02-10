<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import { USAGE_HISTORY_COLUMN } from "@modules/production/constants"
import { TMovement, TRawMaterial } from "@modules/production/types"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import RMTableCard from "./RMTableCard.vue"

const props = defineProps<{ usage: TMovement[]; material: TRawMaterial }>()

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)

const openDetails = ref(false)
const selectedHistory = ref<TMovement | null>(null)

const onRowClick = (batch: TMovement) => {
  selectedHistory.value = batch
  openDetails.value = true
}
</script>

<template>
  <div>
    <div class="space-y-4 overflow-hidden rounded-xl border-gray-200 md:border md:bg-white">
      <DataTable
        :data="props.usage ?? []"
        :columns="USAGE_HISTORY_COLUMN"
        :loading="false"
        :enable-row-selection="false"
        :empty-state="{
          title: `No Usage History Available`,
          description: `Start tracking your usage history by adding them to the system.`,
        }"
        :show-pagination="false"
        @row-click="onRowClick"
      >
        <template #cell:quantity="{ item }">
          {{ Number(item.quantity).toLocaleString() }} {{ props.material?.unit }}
        </template>
        <template #cell:reason="{ item }">
          <Chip :label="item.reason" color="blue" />
        </template>
        <template #cell:movement_type="{ item }">
          <Chip
            :label="item.movement_type"
            :color="item.movement_type === 'add' ? 'success' : 'error'"
            radius="md"
            class="capitalize"
            :icon="item.movement_type === 'add' ? 'arrow-up' : 'arrow-down'"
          />
        </template>

        <template #mobile="{ item }">
          <RMTableCard :title="formatDate(new Date())">
            <template #append>
              <Chip
                :label="item.movement_type"
                :color="item.movement_type === 'add' ? 'success' : 'error'"
                radius="md"
                class="capitalize"
                :icon="item.movement_type === 'add' ? 'arrow-up' : 'arrow-down'"
              />
            </template>
            <template #body>
              <div>
                <p class="text-sm font-medium">
                  {{ Number(item.quantity).toLocaleString() }} {{ props.material?.unit }}
                </p>
                <p class="text-core-600 text-xs">Quantity</p>
              </div>
              <div>
                <p class="text-sm font-medium">
                  {{ formatCurrency(Number(item.unit_cost)) }} / {{ props.material?.unit }}
                </p>
                <p class="text-core-600 text-xs">Cost</p>
              </div>
              <div>
                <p class="text-sm font-medium">{{ "--" }}</p>
                <p class="text-core-600 text-xs">Performed BY</p>
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
      title="Usage History Details"
      max-width="2xl"
      variant="fullscreen"
      @close="openDetails = false"
    >
      <div class="space-y-6">
        <div class="flex flex-col items-center justify-center gap-2">
          <Chip label="IN" icon="arrow-up" color="success" radius="md" />
          <h4 class="text-3xl font-bold md:text-4xl">50 kg</h4>
          <p class="text-sm font-medium md:text-base">{{ formatDate(new Date()) }}</p>
        </div>

        <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Reason</span>
            <Chip label="Purchase Order" color="blue" />
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Quantity</span>
            <span class="font-medium capitalize">50 kg</span>
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Cost</span>
            <span class="font-medium">{{ formatCurrency(4800 * 50) }}</span>
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Performed By</span>
            <span class="font-medium capitalize">Adanna O.</span>
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
