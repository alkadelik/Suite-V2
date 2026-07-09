<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import { computed, ref } from "vue"
import type { TChipColor } from "@modules/shared/types"
import { SHIPMENT_STATUS_OPTIONS } from "../../constants"

defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  apply: [filters: Record<string, string>]
}>()

const STATUS_COLORS: Record<string, TChipColor> = {
  awaiting_shipment: "warning",
  awaiting_pickup: "warning",
  picked_up: "blue",
  in_transit: "blue",
  delivered: "success",
  cancelled: "error",
}

const selectedStatus = ref<string | null>(null)

const toggleStatus = (value: string) => {
  selectedStatus.value = selectedStatus.value === value ? null : value
}

const activeFilterCount = computed(() => (selectedStatus.value ? 1 : 0))

const applyFilters = () => {
  const filters: Record<string, string> = {}
  if (selectedStatus.value) filters.status = selectedStatus.value
  emit("apply", filters)
  emit("close")
}

const clearFilters = () => {
  selectedStatus.value = null
  emit("apply", {})
  emit("close")
}
</script>

<template>
  <Drawer :open="open" title="Filter Shipments" max-width="lg" @close="emit('close')">
    <div class="space-y-6">
      <!-- Shipment Status -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Shipment Status</h3>
        <RadioInputField
          :model-value="selectedStatus ?? ''"
          :options="SHIPMENT_STATUS_OPTIONS"
          options-container-class="grid! grid-cols-2!"
          @update:model-value="(v) => toggleStatus(v as string)"
        >
          <template #content="{ option }">
            <Chip
              :label="option.label"
              :color="STATUS_COLORS[option.value as string] ?? 'primary'"
              :variant="selectedStatus === option.value ? 'filled' : 'outlined'"
              size="sm"
              class="pointer-events-none w-full justify-center"
            />
          </template>
        </RadioInputField>
      </div>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-4">
        <AppButton color="alt" label="Clear All" @click="clearFilters" />
        <AppButton
          :label="activeFilterCount ? `Apply (${activeFilterCount})` : 'Apply Filters'"
          @click="applyFilters"
        />
      </div>
    </template>
  </Drawer>
</template>
