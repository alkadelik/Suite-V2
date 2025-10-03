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
  coupon_code: string | null
  discount_amount: number
}

const props = defineProps<{
  paymentInfo: PaymentInfo
  productsTotal: number
  deliveryFee: number
  totalAmount: number
}>()

const emit = defineEmits<{
  next: []
  prev: []
  "update:paymentInfo": [info: PaymentInfo]
}>()

const PAYMENT_STATUS_OPTIONS = [
  { label: "Unpaid", value: "unpaid" },
  { label: "Paid", value: "paid" },
  { label: "Partial Payment", value: "partially_paid" },
]

const updateField = (field: keyof PaymentInfo, value: unknown) => {
  emit("update:paymentInfo", {
    ...props.paymentInfo,
    [field]: value,
  })
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
      <Icon name="dollar" size="28" />
    </div>
    <p class="mb-4 text-sm">Record full, partial, or unpaid amounts.</p>

    <div class="space-y-4">
      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Discount</h3>
        <div class="space-y-4">
          <FormField
            type="text"
            name="coupon_code"
            label="Coupon Code"
            placeholder="e.g. LLY-QRTXY"
            :modelValue="paymentInfo.coupon_code"
            @update:modelValue="updateField('coupon_code', $event)"
          />

          <div class="flex justify-end">
            <AppButton size="sm" label="Apply Code" class="w-full md:w-auto" />
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Order Summary</h3>
        <div class="space-y-2">
          <p class="flex justify-between">
            <span class="text-gray-600">Products Total</span>
            <span class="font-medium">{{ formatCurrency(productsTotal) }}</span>
          </p>
          <p class="flex justify-between">
            <span class="text-gray-600">Delivery Fee</span>
            <span class="font-medium">{{ formatCurrency(deliveryFee) }}</span>
          </p>
          <p v-if="paymentInfo.discount_amount > 0" class="flex justify-between text-red-600">
            <span>Discount</span>
            <span class="font-medium">-{{ formatCurrency(paymentInfo.discount_amount) }}</span>
          </p>
          <div class="border-core-200 my-2 border-t"></div>
          <p class="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span class="text-primary-600">{{ formatCurrency(totalAmount) }}</span>
          </p>
        </div>
      </div>

      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Payment Status</h3>
        <RadioInputField
          :options="PAYMENT_STATUS_OPTIONS"
          :modelValue="paymentInfo.payment_status"
          @update:modelValue="updateField('payment_status', $event)"
        />
      </div>

      <div v-if="paymentInfo.payment_status === 'partially_paid'" class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Amount Paid</h3>
        <FormField
          type="number"
          name="payment_amount"
          label="Partial Payment Amount"
          placeholder="0.00"
          :modelValue="paymentInfo.payment_amount"
          @update:modelValue="updateField('payment_amount', Number($event))"
          :min="0"
          :max="totalAmount"
          step="0.01"
        />
      </div>
    </div>

    <div class="h-24" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-6">
      <AppButton
        label="Back"
        color="alt"
        variant="outlined"
        class="w-1/3"
        icon="arrow-left"
        @click="emit('prev')"
      />
      <AppButton label="Next" class="w-2/3" :disabled="!canProceed" @click="handleNext" />
    </div>
  </div>
</template>
