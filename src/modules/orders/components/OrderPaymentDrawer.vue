<script setup lang="ts">
import Drawer from "@components/Drawer.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { ref } from "vue"
import { useGetOrderPaymentHistory } from "../api"
import { TOrder } from "../types"
import AddPaymentModal from "./AddPaymentModal.vue"
import { formatCurrency } from "@/utils/format-currency"

// Props & Emits
const props = defineProps<{ open: boolean; order: TOrder }>()

const emit = defineEmits<{
  close: []
}>()

// State
const openAdd = ref(false)

// Methods
const openCreatePaymentModal = () => {
  openAdd.value = true
  emit("close")
}

const { data: paymentHistory, refetch } = useGetOrderPaymentHistory(props.order.uid)
</script>

<template>
  <div>
    <!-- Drawer -->
    <Drawer :open="open" title="Add Payment" max-width="2xl" @close="emit('close')">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
            <Icon name="note" size="28" />
          </div>
          <p class="text-sm text-gray-600">Add/update the payment status of this order</p>
        </div>
      </div>

      <!-- Memos List -->
      <div class="space-y-4">
        <div class="grid grid-cols-3 gap-4 rounded-lg border-gray-200 bg-white p-4">
          <div>
            <h3 class="text-core-900 text-sm font-medium">Order Total</h3>
            <p class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(paymentHistory?.total_amount || 0) }}
            </p>
          </div>
          <div>
            <h3 class="text-core-900 text-sm font-medium">Total Paid</h3>
            <p class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(paymentHistory?.total_paid || 0) }}
            </p>
          </div>
          <div>
            <h3 class="text-core-900 text-sm font-medium">Total Outstanding</h3>
            <p class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(paymentHistory?.outstanding_balance || 0) }}
            </p>
          </div>
        </div>

        <div class="my-6 flex items-center justify-between">
          <h3 class="flex items-center gap-1 text-lg font-semibold">
            Payment History <Chip :label="paymentHistory?.payments?.length || 0" />
          </h3>

          <AppButton icon="add" class="flex-shrink-0" label="Add" @click="openAdd = true" />
        </div>

        <div
          v-for="payment in paymentHistory?.payments"
          :key="payment.uid"
          class="border-core-200 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="flex justify-between gap-2">
            <h3 class="text-core-900 text-sm font-medium">
              {{ formatCurrency(payment.amount) }}
            </h3>
            <span class="capitalize">{{ payment.source }}</span>
          </div>

          <p>
            {{ new Date(payment.created_at).toLocaleDateString("en-US", { dateStyle: "medium" }) }}
          </p>
        </div>

        <div
          v-if="paymentHistory?.payments?.length === 0"
          class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12"
        >
          <Icon name="note" size="48" class="mb-3 text-gray-400" />
          <p class="mb-2 text-sm font-medium text-gray-900">No payment history yet</p>
          <p class="mb-4 text-sm text-gray-500">Create your first payment to get started</p>
          <AppButton
            label="Add Payment"
            icon="add"
            size="sm"
            color="primary"
            @click="openCreatePaymentModal"
          />
        </div>
      </div>
    </Drawer>

    <!-- Create Payment Modal -->
    <AddPaymentModal
      :open="openAdd"
      :order="props.order"
      @close="openAdd = false"
      @refresh="refetch"
    />
  </div>
</template>
