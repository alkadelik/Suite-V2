<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import TextField from "@components/form/TextField.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import type { TChipColor } from "@modules/shared/types"

defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  apply: [filters: Record<string, string>]
}>()

const isMobile = computed(() => useMediaQuery("(max-width: 1028px)").value)

// const PAYMENT_STATUS_OPTIONS: { value: string; label: string; color: TChipColor }[] = [
//   { value: "paid", label: "Paid", color: "success" },
//   { value: "unpaid", label: "Unpaid", color: "error" },
//   { value: "partially_paid", label: "Partially Paid", color: "primary" },
// ]

const SOURCE_OPTIONS: { value: string; label: string; color: TChipColor }[] = [
  { value: "internal", label: "Internal", color: "blue" },
  { value: "storefront", label: "Storefront", color: "purple" },
  { value: "popup_storefront", label: "Popup Storefront", color: "pink" },
  { value: "popup_internal", label: "Popup Internal", color: "indigo" },
]

const FULFILMENT_METHOD_OPTIONS: { value: string; label: string; color: TChipColor }[] = [
  { value: "pickup", label: "Pickup", color: "warning" },
  { value: "delivery", label: "Delivery", color: "primary" },
]

const selectedPaymentStatus = ref<string | null>(null)
const selectedSource = ref<string | null>(null)
const selectedFulfilmentMethod = ref<string | null>(null)
const minAmount = ref("")
const maxAmount = ref("")

// const togglePaymentStatus = (value: string) => {
//   selectedPaymentStatus.value = selectedPaymentStatus.value === value ? null : value
// }
const toggleSource = (value: string) => {
  selectedSource.value = selectedSource.value === value ? null : value
}
const toggleFulfilmentMethod = (value: string) => {
  selectedFulfilmentMethod.value = selectedFulfilmentMethod.value === value ? null : value
}

const activeFilterCount = computed(() => {
  let count = 0
  if (selectedPaymentStatus.value) count++
  if (selectedSource.value) count++
  if (selectedFulfilmentMethod.value) count++
  if (minAmount.value) count++
  if (maxAmount.value) count++
  return count
})

const applyFilters = () => {
  const filters: Record<string, string> = {}
  if (selectedPaymentStatus.value) filters.payment_status = selectedPaymentStatus.value
  if (selectedSource.value) filters.source = selectedSource.value
  if (selectedFulfilmentMethod.value) filters.fulfilment_method = selectedFulfilmentMethod.value
  if (minAmount.value) filters.min_amount = minAmount.value
  if (maxAmount.value) filters.max_amount = maxAmount.value
  emit("apply", filters)
  emit("close")
}

const clearFilters = () => {
  selectedPaymentStatus.value = null
  selectedSource.value = null
  selectedFulfilmentMethod.value = null
  minAmount.value = ""
  maxAmount.value = ""
  emit("apply", {})
  emit("close")
}
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    title="Filter Orders"
    max-width="lg"
    variant="fullscreen"
    @close="emit('close')"
  >
    <div class="space-y-6">
      <!-- Payment Status -->
      <!-- <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Payment Status</h3>
        <RadioInputField
          :model-value="selectedPaymentStatus ?? ''"
          :options="PAYMENT_STATUS_OPTIONS"
          @update:model-value="(v) => togglePaymentStatus(v as string)"
        >
          <template #content="{ option }">
            <Chip
              :label="option.label"
              :color="option.color as TChipColor"
              :variant="selectedPaymentStatus === option.value ? 'filled' : 'outlined'"
              show-dot
              size="sm"
              class="pointer-events-none w-full justify-center"
            />
          </template>
        </RadioInputField>
      </div> -->

      <div class="border-b border-gray-100" />

      <!-- Source -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Order Source</h3>
        <RadioInputField
          :model-value="selectedSource ?? ''"
          :options="SOURCE_OPTIONS"
          options-container-class="grid! grid-cols-2!"
          @update:model-value="(v) => toggleSource(v as string)"
        >
          <template #content="{ option }">
            <Chip
              :label="option.label"
              :color="option.color as TChipColor"
              :variant="selectedSource === option.value ? 'filled' : 'outlined'"
              size="sm"
              class="pointer-events-none w-full justify-center"
            />
          </template>
        </RadioInputField>
      </div>

      <div class="border-b border-gray-100" />

      <!-- Fulfilment Method -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Fulfilment Method</h3>
        <RadioInputField
          :model-value="selectedFulfilmentMethod ?? ''"
          :options="FULFILMENT_METHOD_OPTIONS"
          options-container-class="grid! grid-cols-2!"
          @update:model-value="(v) => toggleFulfilmentMethod(v as string)"
        >
          <template #content="{ option }">
            <Chip
              :label="option.label"
              :color="option.color as TChipColor"
              :variant="selectedFulfilmentMethod === option.value ? 'filled' : 'outlined'"
              size="sm"
              class="pointer-events-none w-full justify-center"
            />
          </template>
        </RadioInputField>
      </div>

      <div class="border-b border-gray-100" />

      <!-- Amount Range -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Amount Range</h3>
        <div class="grid grid-cols-2 gap-3">
          <TextField
            v-model="minAmount"
            label="Min Amount"
            placeholder="e.g. 500"
            type="number"
            left-icon="wallet-money"
          />
          <TextField
            v-model="maxAmount"
            label="Max Amount"
            placeholder="e.g. 50,000"
            type="number"
            left-icon="wallet-money"
          />
        </div>
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
  </component>
</template>
