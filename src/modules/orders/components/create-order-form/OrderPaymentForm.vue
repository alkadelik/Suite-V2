<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import AppButton from "@components/AppButton.vue"
import FieldGroupError from "@components/form/FieldGroupError.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import SelectField from "@components/form/SelectField.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import { ORDER_PAYMENT_METHODS, ORDER_PAYMENT_STATUS } from "@modules/orders/constants"
import { useMediaQuery } from "@vueuse/core"
import { watch, onMounted, ref } from "vue"
import { scrollToAndFocusValidationTarget } from "@/utils/validations"

interface PaymentInfo {
  payment_status: "unpaid" | "paid" | "partially_paid"
  payment_amount: number | string
  payment_source?: { label: string; value: string }
  coupon_code: string | null
  discount_amount: number
}

const props = defineProps<{
  productsTotal: number
  deliveryFee: number
  vatAmount: number
  totalAmount: number
  itemsCount: number
  isFreeShipping: boolean
}>()

const emit = defineEmits<{
  next: []
  prev: []
}>()
const { format } = useFormatCurrency()

// Use defineModel for two-way binding - cleaner than manual v-model implementation
const paymentInfo = defineModel<PaymentInfo>("paymentInfo", { required: true })
const submitAttempted = ref(false)
const paymentErrors = ref({
  payment_source: "",
  payment_amount: "",
})

// Initialize payment amount on mount if status is paid
onMounted(() => {
  if (paymentInfo.value.payment_status === "paid") {
    paymentInfo.value = {
      ...paymentInfo.value,
      payment_amount: Number(props.totalAmount).toFixed(2),
    }
  }
})

// Watch for payment status changes and auto-fill amount accordingly
watch(
  () => paymentInfo.value.payment_status,
  (newStatus) => {
    if (newStatus === "paid") {
      // Auto-fill with total amount for paid status
      paymentInfo.value = {
        ...paymentInfo.value,
        payment_amount: Number(props.totalAmount).toFixed(2),
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

const validatePaymentStep = () => {
  paymentErrors.value = {
    payment_source: "",
    payment_amount: "",
  }

  if (
    paymentInfo.value.payment_status === "paid" ||
    paymentInfo.value.payment_status === "partially_paid"
  ) {
    if (!paymentInfo.value.payment_source) {
      paymentErrors.value.payment_source = "Select how the customer paid."
    }
  }

  if (paymentInfo.value.payment_status === "partially_paid") {
    const amount = Number(paymentInfo.value.payment_amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      paymentErrors.value.payment_amount = "Enter an amount greater than 0."
    } else if (amount >= props.totalAmount) {
      paymentErrors.value.payment_amount =
        "Partial payment must be less than the total order amount."
    }
  }

  return !paymentErrors.value.payment_source && !paymentErrors.value.payment_amount
}

const handleNext = () => {
  submitAttempted.value = true

  if (validatePaymentStep()) {
    emit("next")
    return
  }

  if (paymentErrors.value.payment_source) {
    scrollToAndFocusValidationTarget("order-payment-source")
    return
  }

  scrollToAndFocusValidationTarget("order-payment-amount")
}

const isMobile = useMediaQuery("(max-width: 768px)")

watch(
  () => [
    paymentInfo.value.payment_status,
    paymentInfo.value.payment_source,
    paymentInfo.value.payment_amount,
    props.totalAmount,
  ],
  () => {
    if (submitAttempted.value) {
      validatePaymentStep()
    }
  },
)
</script>

<template>
  <div>
    <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
      <Icon name="dollar-circle" size="28" />
    </div>
    <p class="mb-4 text-sm">Record full, partial, or unpaid amounts.</p>

    <div class="space-y-4">
      <!-- Order Summary -->
      <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
        <h4 class="text-sm font-medium">Order Summary</h4>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Total items count</span>
          <span class="font-medium">{{ itemsCount }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600">Total products amount</span>
          <span class="font-medium">{{ format(productsTotal, { kobo: true }) }}</span>
        </p>
        <p class="flex justify-between text-sm">
          <span class="text-core-600"
            >Delivery Fee
            <span v-if="isFreeShipping" class="text-primary-600 text-xs"
              >(Free Shipping)</span
            ></span
          >
          <span class="font-medium" :class="{ 'font-normal! line-through': isFreeShipping }">
            {{ deliveryFee > 0 ? format(deliveryFee, { kobo: true }) : "-" }}
          </span>
        </p>
        <p v-if="vatAmount > 0" class="flex justify-between text-sm">
          <span class="text-core-600">VAT (7.5%)</span>
          <span class="font-medium">{{ format(vatAmount, { kobo: true }) }}</span>
        </p>
        <p
          v-if="paymentInfo.discount_amount > 0"
          class="flex justify-between text-sm text-green-600"
        >
          <span>Discount</span>
          <span class="font-medium"
            >-{{ format(paymentInfo.discount_amount, { kobo: true }) }}</span
          >
        </p>
        <div class="border-core-200 my-2 border-t border-dashed"></div>
        <div class="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <div class="text-right">
            <span class="text-primary-600">{{ format(totalAmount, { kobo: true }) }}</span>
            <br />
            <span class="text-core-600 text-sm font-normal line-through" v-if="isFreeShipping">
              {{ format(totalAmount + deliveryFee, { kobo: true }) }}
            </span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white p-4">
        <h3 class="mb-4 text-sm font-medium">Payment Status</h3>
        <hr class="mb-4 border-gray-300" />
        <div class="space-y-4">
          <RadioInputField
            :options="ORDER_PAYMENT_STATUS"
            v-model="paymentInfo.payment_status"
            :orientation="isMobile ? 'vertical' : 'horizontal'"
          />
        </div>
      </div>

      <div v-if="paymentInfo.payment_status !== 'unpaid'" class="space-y-6 rounded-xl bg-white p-4">
        <div data-validation-target="order-payment-source">
          <SelectField
            :model-value="paymentInfo.payment_source"
            :options="ORDER_PAYMENT_METHODS"
            label="Payment Mode"
            required
            :error="submitAttempted ? paymentErrors.payment_source : ''"
            @update:model-value="
              paymentInfo.payment_source = $event as PaymentInfo['payment_source']
            "
          />
        </div>

        <div
          v-if="paymentInfo.payment_status === 'partially_paid'"
          data-validation-target="order-payment-amount"
        >
          <TextField
            :model-value="paymentInfo.payment_amount"
            name="order-payment-amount"
            type="number"
            label="Amount Paid"
            placeholder="0.00"
            :min="0"
            :max="totalAmount"
            step="0.01"
            required
            :error="submitAttempted ? paymentErrors.payment_amount : ''"
            @update:model-value="paymentInfo.payment_amount = $event"
          />
        </div>
      </div>
    </div>

    <div class="h-24" />

    <div class="border-core-200 fixed right-0 bottom-0 left-0 border-t bg-white p-4 md:p-6">
      <div class="flex flex-col gap-3">
        <FieldGroupError
          v-if="submitAttempted && (paymentErrors.payment_source || paymentErrors.payment_amount)"
          target="order-payment-source"
          :error="paymentErrors.payment_source || paymentErrors.payment_amount"
        />
        <div class="flex gap-3">
          <AppButton
            label="Back"
            color="alt"
            class="w-1/3"
            icon="arrow-left"
            @click="emit('prev')"
          />
          <AppButton label="Next" class="w-2/3" @click="handleNext" />
        </div>
      </div>
    </div>
  </div>
</template>
