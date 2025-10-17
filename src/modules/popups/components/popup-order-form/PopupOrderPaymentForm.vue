<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import Icon from "@components/Icon.vue"
import { computed } from "vue"

interface PaymentInfo {
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_amount: number
  payment_mode?: string
  coupon_code: string | null
  discount_amount: number
}

const props = defineProps<{
  paymentInfo: PaymentInfo
  productsTotal: number
  deliveryFee: number
  totalAmount: number
  itemsCount: number
}>()

const emit = defineEmits<{
  next: []
  prev: []
  "update:paymentInfo": [info: PaymentInfo]
}>()

const PAYMENT_STATUS_OPTIONS = [
  { label: "Fully Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Partial Payment", value: "partially_paid" },
]

const PAYMENT_MODE = [
  { label: "Cash", value: "cash" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Mobile Money", value: "mobile_money" },
]

const updateField = (field: keyof PaymentInfo, value: unknown) => {
  let updatedInfo = { ...props.paymentInfo, [field]: value }
  // If payment status is changed to "paid", prepopulate amount with total amount
  if (field === "payment_status" && value === "paid") {
    updatedInfo.payment_amount = props.totalAmount
  }
  emit("update:paymentInfo", updatedInfo)
}

const canProceed = computed(() => {
  if (props.paymentInfo.payment_status === "partially_paid") {
    return (
      props.paymentInfo.payment_amount > 0 && props.paymentInfo.payment_amount < props.totalAmount
    )
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
      <Icon name="money-add" size="28" />
    </div>
    <p class="mb-4 text-sm">Record full, partial, or unpaid amounts.</p>

    <div class="space-y-4">
      <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
        <p class="flex justify-between">
          <span class="text-core-600">Total items count</span>
          <span class="font-medium">{{ itemsCount }}</span>
        </p>
        <p class="flex justify-between">
          <span class="text-core-600">Total Products Amount</span>
          <span class="font-medium">{{ formatCurrency(productsTotal) }}</span>
        </p>
        <p class="flex justify-between">
          <span class="text-core-600">Delivery Fee</span>
          <span class="font-medium">{{ deliveryFee ? formatCurrency(deliveryFee) : "-" }}</span>
        </p>
        <div class="border-core-200 my-2 border-t border-dashed"></div>
        <p class="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span class="text-primary-600">{{ formatCurrency(totalAmount) }}</span>
        </p>
      </div>

      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Payment Status</h3>
        <RadioInputField
          :options="PAYMENT_STATUS_OPTIONS"
          :modelValue="paymentInfo.payment_status"
          @update:modelValue="updateField('payment_status', $event)"
        />
      </div>

      <div v-if="paymentInfo.payment_status !== 'unpaid'" class="space-y-6 rounded-xl bg-white p-4">
        <FormField
          type="select"
          :options="PAYMENT_MODE"
          name="payment_mode"
          label="Payment Mode"
          :modelValue="paymentInfo.payment_mode"
          @update:modelValue="updateField('payment_mode', $event)"
          required
        />

        <FormField
          type="number"
          name="payment_amount"
          label="Amount Paid"
          placeholder="0.00"
          :modelValue="paymentInfo.payment_amount"
          @update:modelValue="updateField('payment_amount', Number($event))"
          :min="0"
          :max="totalAmount"
          step="0.01"
          :disabled="paymentInfo.payment_status === 'paid'"
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
