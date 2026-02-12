<template>
  <Modal
    :open="open"
    title="Received Request"
    variant="bottom-nav"
    max-width="xl"
    @close="handleClose"
  >
    <!-- Modal Body -->
    <template #default>
      <div v-if="request" class="space-y-4">
        <!-- Request Info Card -->
        <div class="border-primary-700 bg-primary-25 text-core-700 rounded-xl border p-4">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between">
            <div class="space-y-2">
              <p class="text-xs md:text-sm">
                <span class="font-bold">Requested by:</span> {{ request.from_location_name }}
              </p>
              <p class="mt-2 text-xs md:text-sm">
                <span class="font-bold">Created by:</span> {{ request.created_by_name }}
              </p>
            </div>
            <p class="mt-2 text-xs md:text-sm">
              <span class="font-bold">Date Created:</span> {{ formattedCreatedDate }}
            </p>
          </div>
        </div>

        <!-- Section Header -->
        <h3 class="text-core-700 text-sm font-semibold">Requested Item</h3>

        <!-- Product Display Card -->
        <div class="flex items-center justify-between rounded-lg bg-white p-4">
          <!-- Product Info with Avatar -->
          <div class="w-4/5">
            <ProductAvatar :name="request.variant_name" :url="undefined" />
          </div>

          <!-- Quantity Chip -->
          <Chip :label="String(request.quantity)" color="primary" size="md" />
        </div>

        <!-- Warning Info Box -->
        <InfoBox
          variant="warning"
          message="Note: Products used in fulfilling requests will be removed from your inventory."
        />
      </div>

      <!-- Empty State (Defensive Programming) -->
      <div v-else class="py-8 text-center">
        <p class="text-core-500 text-sm">No request data available</p>
      </div>
    </template>

    <!-- Modal Footer -->
    <template v-if="request?.status === 'pending'" #footer>
      <div class="flex w-full items-center gap-3">
        <!-- Reject Button (Error Color) -->
        <AppButton
          label="Reject Request"
          color="error"
          :loading="isRejecting"
          :disabled="isProcessing"
          class="flex-1"
          @click="handleReject"
        />

        <!-- Fulfill Button (Primary Color) -->
        <AppButton
          label="Fulfill Request"
          color="primary"
          :loading="isFulfilling"
          :disabled="isProcessing"
          class="flex-1"
          @click="handleFulfill"
        />
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import InfoBox from "@components/InfoBox.vue"
import ProductAvatar from "@components/ProductAvatar.vue"
import type { IInventoryTransferRequest, IApproveRejectRequestPayload } from "../types"
import { useApproveRejectRequest } from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

// Props Interface - Strictly typed modal props
interface Props {
  // Whether modal is open/visible
  open: boolean
  // Transfer request data to display
  request: IInventoryTransferRequest | null
}

// Emits Interface - Type-safe event emissions
interface Emits {
  // Emitted when modal should close
  close: []
  // Emitted when request is successfully fulfilled
  fulfill: [request: IInventoryTransferRequest]
  // Emitted when request is successfully rejected
  reject: [request: IInventoryTransferRequest]
  // Emitted when any action succeeds (for refetching list)
  success: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// API Integration
const { mutate: approveRejectRequest, isPending: isApiProcessing } = useApproveRejectRequest()

// Reactive State
const isFulfilling = ref(false)
const isRejecting = ref(false)

// Combined processing state - Disables both buttons during any operation
const isProcessing = computed(
  () => isApiProcessing.value || isFulfilling.value || isRejecting.value,
)

const formattedCreatedDate = computed<string>(() => {
  if (!props.request?.created_at) return ""

  try {
    const date = new Date(props.request.created_at)

    // Format date: "14 Sept 2025"
    const dateStr = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

    // Format time: "3:20 PM"
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    return `${dateStr}, ${timeStr}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return props.request.created_at
  }
})

// Event Handlers
const handleClose = (): void => {
  isFulfilling.value = false
  isRejecting.value = false
  emit("close")
}

const handleFulfill = (): void => {
  if (!props.request) {
    console.warn("Attempted to fulfill request without valid request data")
    return
  }

  isFulfilling.value = true

  const payload: IApproveRejectRequestPayload = {
    request_ids: [props.request.uid],
    action: "approve",
    note: "Request fulfilled from HQ",
  }

  approveRejectRequest(payload, {
    onSuccess: () => {
      toast.success("Request fulfilled successfully")
      emit("fulfill", props.request!)
      emit("success")
      handleClose()
    },
    onError: (error) => {
      displayError(error)
      isFulfilling.value = false
    },
  })
}

const handleReject = (): void => {
  if (!props.request) {
    console.warn("Attempted to reject request without valid request data")
    return
  }

  isRejecting.value = true

  const payload: IApproveRejectRequestPayload = {
    request_ids: [props.request.uid],
    action: "reject",
    note: "Request rejected from HQ",
  }

  approveRejectRequest(payload, {
    onSuccess: () => {
      toast.success("Request rejected successfully")
      emit("reject", props.request!)
      emit("success")
      handleClose()
    },
    onError: (error) => {
      displayError(error)
      isRejecting.value = false
    },
  })
}
</script>
