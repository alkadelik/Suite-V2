<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import Icon from "@components/Icon.vue"
import { ORDER_PAYMENT_METHODS, ORDER_PAYMENT_STATUS } from "@modules/orders/constants"
import { computed, watch } from "vue"

interface PaymentInfo {
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_amount: number
  payment_source?: { label: string; value: string }
  coupon_code: string | null
  discount_amount: number
}

const props = defineProps<{
  productsTotal: number
  deliveryFee: number
  totalAmount: number
  itemsCount: number
}>()

const emit = defineEmits<{
  next: []
  prev: []
}>()

// Use defineModel for two-way binding - cleaner than manual v-model implementation
const paymentInfo = defineModel<PaymentInfo>("paymentInfo", { required: true })

// Watch for payment status changes and auto-fill amount accordingly
watch(
  () => paymentInfo.value.payment_status,
  (newStatus) => {
    if (newStatus === "paid") {
      // Auto-fill with total amount for paid status
      paymentInfo.value = {
        ...paymentInfo.value,
        payment_amount: props.totalAmount,
      }
    } else if (newStatus === "partially_paid" || newStatus === "unpaid") {
      // Reset to 0 for partial payment or unpaid
      paymentInfo.value = {
        ...paymentInfo.value,
        payment_amount: 0,
      }
    }
  },
)

// Also update amount when totalAmount changes and status is "paid"
watch(
  () => props.totalAmount,
  (newTotal) => {
    if (paymentInfo.value.payment_status === "paid") {
      paymentInfo.value = {
        ...paymentInfo.value,
        payment_amount: newTotal,
      }
    }
  },
)

const canProceed = computed(() => {
  if (paymentInfo.value.payment_status === "partially_paid") {
    return (
      paymentInfo.value.payment_amount > 0 &&
      paymentInfo.value.payment_amount < props.totalAmount &&
      !!paymentInfo.value.payment_source
    )
  }
  if (paymentInfo.value.payment_status === "paid") {
    return !!paymentInfo.value.payment_source
  }
  return true
})

const handleNext = () => {
  if (canProceed.value) {
    emit("next")
  }
}
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="dollar-circle" size="28" />
    </div>
    <p class="mb-4 text-sm">Record full, partial, or unpaid amounts.</p>

    <div class="space-y-4">
      <div v-if="false" class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Discount</h3>
        <div class="space-y-4">
          <FormField
            type="text"
            name="coupon_code"
            label="Coupon Code"
            placeholder="e.g. LLY-QRTXY"
            v-model="paymentInfo.coupon_code"
          />

          <div class="flex justify-end">
            <AppButton size="sm" variant="outlined" label="Apply Code" class="w-full md:w-auto" />
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
        <h4 class="text-sm font-medium">Order Summary</h4>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Total items count</span>
          <span class="font-medium">{{ itemsCount }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Total products amount</span>
          <span class="font-medium">{{ formatCurrency(productsTotal) }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Delivery Fee</span>
          <span class="font-medium">{{ deliveryFee > 0 ? formatCurrency(deliveryFee) : "-" }}</span>
        </p>
        <p
          v-if="paymentInfo.discount_amount > 0"
          class="flex justify-between text-sm text-green-600"
        >
          <span>Discount</span>
          <span class="font-medium">-{{ formatCurrency(paymentInfo.discount_amount) }}</span>
        </p>
        <div class="border-core-200 my-2 border-t border-dashed"></div>
        <p class="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span class="text-primary-600">{{ formatCurrency(totalAmount) }}</span>
        </p>
      </div>

      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Payment Status</h3>
        <hr class="mb-4 border-gray-300" />
        <div class="space-y-4">
          <RadioInputField :options="ORDER_PAYMENT_STATUS" v-model="paymentInfo.payment_status" />
        </div>
      </div>

      <div v-if="paymentInfo.payment_status !== 'unpaid'" class="space-y-6 rounded-xl bg-white p-4">
        <FormField
          type="select"
          :options="ORDER_PAYMENT_METHODS"
          name="payment_source"
          label="Payment Mode"
          v-model="paymentInfo.payment_source"
          required
        />

        <FormField
          type="number"
          name="payment_amount"
          label="Amount Paid"
          placeholder="0.00"
          v-model.number="paymentInfo.payment_amount"
          :min="0"
          :max="totalAmount"
          step="0.01"
          required
        />
      </div>
    </div>

    <div class="h-24" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-6">
      <AppButton label="Back" color="alt" class="w-1/3" icon="arrow-left" @click="emit('prev')" />
      <AppButton label="Next" class="w-2/3" :disabled="!canProceed" @click="handleNext" />
    </div>
  </div>
</template>
