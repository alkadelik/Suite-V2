<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatDate } from "@/utils/formatDate"
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import Drawer from "@components/Drawer.vue"
import { TMovement, TRawMaterial } from "@modules/production/types"
import { ref } from "vue"
import RMUsageCard from "./RMUsageCard.vue"
import { USAGE_HISTORY_COLUMN } from "@modules/production/constant"
import { convertNumToPurchaseUnit, getPurchaseUnit } from "@modules/production/utils"

const props = defineProps<{ material: TRawMaterial }>()
const { format } = useFormatCurrency()

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
        :data="material?.movements ?? []"
        :columns="USAGE_HISTORY_COLUMN"
        :loading="false"
        :enable-row-selection="false"
        :empty-state="{
          title: `No Logs Available`,
          description: `Start tracking your logs by adding them to the system.`,
        }"
        :show-pagination="false"
        @row-click="onRowClick"
      >
        <template #cell:quantity="{ item }">
          {{ convertNumToPurchaseUnit(+item.quantity, props.material).toLocaleString() }}
          {{ getPurchaseUnit(props.material) }}
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
          <RMUsageCard
            :item="item"
            class="border-b border-gray-200 pb-4!"
            :material="props.material"
          />
        </template>
      </DataTable>
    </div>

    <!-- Details -->
    <Drawer
      :open="openDetails"
      title="Log Details"
      max-width="2xl"
      variant="fullscreen"
      @close="openDetails = false"
    >
      <div v-if="selectedHistory" class="space-y-6">
        <div class="flex flex-col items-center justify-center gap-2">
          <Chip
            :label="selectedHistory.movement_type"
            class="capitalize"
            :icon="selectedHistory.movement_type === 'add' ? 'arrow-up' : 'arrow-down'"
            :color="selectedHistory.movement_type === 'add' ? 'success' : 'error'"
            radius="md"
          />
          <h4 class="text-3xl font-bold md:text-4xl">
            {{
              convertNumToPurchaseUnit(+selectedHistory.quantity, props.material).toLocaleString()
            }}
            {{ getPurchaseUnit(props.material) }}
          </h4>
          <p class="text-sm font-medium md:text-base">
            {{ formatDate(new Date(selectedHistory.created_at)) }}
          </p>
        </div>

        <div class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4">
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Reason</span>
            <Chip :label="selectedHistory.reason" color="blue" />
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Quantity</span>
            <span class="font-medium capitalize"
              >{{
                Number(
                  convertNumToPurchaseUnit(+selectedHistory.quantity, props.material),
                ).toLocaleString()
              }}
              {{ getPurchaseUnit(props.material) }}</span
            >
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Cost</span>
            <span class="font-medium">{{ format(Number(selectedHistory.total_cost)) }}</span>
          </p>
          <p v-if="selectedHistory.performed_by" class="flex justify-between text-sm">
            <span class="text-core-600">Performed By</span>
            <span class="font-medium capitalize">{{ selectedHistory.performed_by }}</span>
          </p>
        </div>

        <div
          v-if="selectedHistory.notes"
          class="border-core-300 bg-core-25 my-6 space-y-3 rounded-xl border p-4"
        >
          <p class="flex flex-col text-sm">
            <span class="text-core-600">Notes</span>
            <span class="font-medium">
              {{ selectedHistory.notes }}
            </span>
          </p>
        </div>
      </div>
    </Drawer>
  </div>
</template>
