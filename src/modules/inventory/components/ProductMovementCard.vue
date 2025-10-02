<template>
  <div
    class="bg-core-25 border-core-300 cursor-pointer rounded-xl border p-3"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <Chip
          :label="movement.type === 'in' ? 'In' : 'Out'"
          :icon="movement.type === 'in' ? 'arrow-up' : 'arrow-down'"
          :color="movement.type === 'in' ? 'success' : 'error'"
          size="sm"
          class="!rounded"
        />
        <span
          class="font-bold"
          :class="movement.type === 'in' ? 'text-success-700' : 'text-error-700'"
        >
          {{ movement.type === "in" ? "+" : "-" }}{{ movement.quantity }}
          <span class="font-semibold">units</span>
        </span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="bg-core-800 size-1 rounded-full"></div>
        <span class="text-core-600 text-xs">{{ getSmartDateLabel(movement.created_at) }}</span>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between gap-2">
      <Chip label="Manual adjustment" color="blue" size="sm" />
      <div class="flex flex-wrap gap-1">
        <Chip
          v-if="variantInfo?.attributes[0]"
          :label="variantInfo.attributes[0].attribute_value"
          color="primary"
          size="sm"
        />
        <Chip
          v-if="variantInfo?.attributes[1]"
          :label="variantInfo.attributes[1].attribute_value"
          color="primary"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chip from "@components/Chip.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import type { IInventoryMovement } from "../types"

interface Props {
  movement: IInventoryMovement
  variantInfo?: {
    attributes: Array<{
      uid: string
      attribute_value: string
    }>
  }
}

interface Emits {
  (e: "click"): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
