<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { getSmartDateLabel } from "@/utils/formatDate"
import { startCase } from "@/utils/format-strings"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Icon from "@components/Icon.vue"
import type { TChipColor } from "@modules/shared/types"
import { TShipmentRow } from "@modules/orders/types"

interface ActionItem {
  label: string
  icon?: string
  action: () => void
}

const props = defineProps<{
  item: TShipmentRow
  actions: ActionItem[]
  statusColor?: TChipColor
  class?: string
}>()
const emit = defineEmits(["toggle"])

const { format } = useFormatCurrency()
</script>

<template>
  <div :class="['border-leyyow-100 rounded-xl border', props.class]">
    <div class="bg-leyyow-50 flex items-start gap-2.5 rounded-t-xl p-2">
      <span class="bg-leyyow-100 flex size-10 items-center justify-center rounded-xl">
        <Icon name="truck-fast-outline" :size="24" class="text-primary-700" />
      </span>
      <div class="min-w-0">
        <h3 class="!font-outfit truncate font-medium">{{ item.customer_name }}</h3>
        <p class="text-core-600 text-xs">#{{ item.order_number }}</p>
      </div>

      <span class="ml-auto" />
      <span class="ml-4 flex-1 text-right text-base font-semibold">
        {{ format(Number(item.shipment ? item.fee : item.amount), { kobo: true }) }}
      </span>
      <DropdownMenu :items="actions" @toggle="emit('toggle')" />
    </div>
    <div class="grid grid-cols-2 gap-3 p-3">
      <div v-if="item.courier_name" class="min-w-0">
        <p class="text-core-500 text-xs">Courier</p>
        <p class="truncate text-sm font-medium">{{ item.courier_name }}</p>
      </div>
      <div>
        <p class="text-core-500 text-xs">
          {{ item.shipment ? "Delivery Estimate" : "Order Date" }}
        </p>
        <p class="text-sm font-medium">{{ getSmartDateLabel(item.date) }}</p>
      </div>
      <div>
        <p class="text-core-500 text-xs">Status</p>
        <Chip :label="startCase(item.status)" :color="statusColor ?? 'primary'" size="sm" />
      </div>
    </div>
  </div>
</template>
