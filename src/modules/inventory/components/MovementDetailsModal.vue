<template>
  <Modal :open="open" title="Movement Details" variant="bottom-nav" @close="$emit('close')">
    <div class="space-y-4">
      <!-- SKU Chips -->
      <div v-if="showSku" class="flex flex-wrap gap-1">
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

      <!-- Movement Details Card -->
      <div class="bg-core-25 border-core-300 space-y-4 rounded-xl border p-4">
        <!-- Type and Reason -->
        <div class="flex items-center justify-between">
          <Chip
            :label="movement.type === 'in' ? 'In' : 'Out'"
            :icon="movement.type === 'in' ? 'arrow-up' : 'arrow-down'"
            :color="movement.type === 'in' ? 'success' : 'error'"
            size="sm"
            class="!rounded"
          />
          <Chip label="Manual adjustment" color="blue" size="sm" />
        </div>

        <!-- Divider -->
        <div class="border-core-300 border-t"></div>

        <!-- Quantity -->
        <div class="space-y-1">
          <p class="text-core-600 text-sm">Quantity</p>
          <p class="text-core-800 text-base font-semibold">
            {{ movement.quantity }}
          </p>
        </div>

        <!-- Notes -->
        <div class="space-y-1">
          <p class="text-core-600 text-sm">Notes</p>
          <p class="text-core-800 text-base font-semibold">{{ movement.note || "-" }}</p>
        </div>

        <!-- Divider -->
        <div class="border-core-300 border-t"></div>

        <!-- Grid Details -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Unit Cost -->
          <div class="space-y-1">
            <p class="text-core-600 text-sm">Unit Cost</p>
            <p class="text-core-800 text-base font-semibold">
              {{ formatCurrency(Number(movement.variant_price)) }}
            </p>
          </div>

          <!-- Reference -->
          <div class="space-y-1">
            <p class="text-core-600 text-sm">Reference</p>
            <div class="flex items-center gap-2">
              <p class="text-core-800 text-base font-semibold">{{ movement.reference }}</p>
              <button
                @click="copyToClipboard(movement.reference)"
                class="text-core-600 hover:text-core-800 transition-colors"
              >
                <Icon name="copy" size="16" />
              </button>
            </div>
          </div>

          <!-- Date Created -->
          <div class="space-y-1">
            <p class="text-core-600 text-sm">Date Created</p>
            <p class="text-core-800 text-base font-semibold">
              {{ formatDate(movement.created_at) }}
            </p>
          </div>

          <!-- Created By -->
          <div class="space-y-1">
            <p class="text-core-600 text-sm">Created By</p>
            <p class="text-core-800 text-base font-semibold">{{ movement.created_by_name }}</p>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "@components/Modal.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { formatCurrency } from "@/utils/format-currency"
import { toast } from "@/composables/useToast"
import type { IInventoryMovement } from "../types"

interface Props {
  open: boolean
  movement: IInventoryMovement
  showSku?: boolean
  variantInfo?: {
    attributes: Array<{
      uid: string
      attribute_value: string
    }>
  }
}

defineProps<Props>()

interface Emits {
  (e: "close"): void
}

defineEmits<Emits>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Reference copied to clipboard")
  } catch {
    toast.error("Failed to copy reference")
  }
}
</script>
