<template>
  <div
    class="cursor-pointer space-y-2 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
    @click="handleClick"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex flex-1 flex-col items-start gap-2">
        <div class="w-5/6"><ProductAvatar :name="request.variant_name" /></div>

        <div class="text-core-600 relative bottom-2 ms-10 flex flex-1 flex-col gap-2">
          <div class="flex items-center gap-3">
            <Icon name="box-outline" />
            <p class="text-xs">{{ request.quantity }}</p>
          </div>
          <div class="flex items-center gap-3">
            <Icon name="calendar" />
            <p class="text-xs">{{ formatDate(request.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-2 flex flex-wrap gap-1">
      <Chip :label="request.from_location_name" size="sm" />
      <Chip
        :label="getStatusLabel(request.status)"
        :color="getStatusColor(request.status)"
        :show-dot="true"
        size="sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Chip from "@components/Chip.vue"
import ProductAvatar from "@components/ProductAvatar.vue"
import type { IInventoryTransferRequest, TTransferRequestStatus } from "../types"
import Icon from "@components/Icon.vue"

interface Props {
  request: IInventoryTransferRequest
  formatDate: (dateString: string) => string
  getStatusLabel: (status: TTransferRequestStatus) => string
  getStatusColor: (status: TTransferRequestStatus) => "warning" | "error" | "success" | "primary"
}

interface Emits {
  /** Emitted when the card is clicked */
  click: [request: IInventoryTransferRequest]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle card click and emit the click event
 */
const handleClick = () => {
  emit("click", props.request)
}
</script>
