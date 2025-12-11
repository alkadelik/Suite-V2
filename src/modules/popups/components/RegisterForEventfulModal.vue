<script setup lang="ts">
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import { formatCurrency } from "@/utils/format-currency"
import TextField from "@components/form/TextField.vue"
import OrganizerPopupCard from "./OrganizerPopupCard.vue"
import { EventfulPopup } from "../types"
import { computed, ref } from "vue"
import { useRegisterForEventful, useValidateEventfulDiscountCode } from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

const props = defineProps<{ open: boolean; event: EventfulPopup }>()

const emit = defineEmits<{ (e: "close"): void }>()

const discountCode = ref("")
const discountValue = ref(0)

const totalAmount = computed(() => {
  const fee = Number(props.event?.participant_fee) || 0
  return fee - discountValue.value
})

const { mutate: validateDiscount, isPending: isValidating } = useValidateEventfulDiscountCode()
const { mutate: registerForEventful, isPending } = useRegisterForEventful()

const handleValidate = () => {
  validateDiscount(
    { event_uid: props.event?.uid || "", code: discountCode.value },
    {
      onSuccess: (res) => {
        toast.success("Discount code applied successfully.")
        const discount = res.data.data
        discountValue.value = discount.discount_amount
      },
      onError: displayError,
    },
  )
}

const handleRegister = () => {
  registerForEventful(
    {
      event: props.event?.uid || "",
      ...(discountCode.value ? { discount_code: discountCode.value } : {}),
    },
    {
      onSuccess: (res) => {
        console.log("Registration Response:", res)
        const paymentLink = res.data?.data?.payment?.payment_link
        // open link in  res.data.payment.payment_link in new tab if exists
        if (paymentLink) {
          window.open(String(paymentLink), "_blank")
          emit("close")
        } else {
          toast.error("Event payment link not found. Please contact support.")
        }
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <Modal variant="bottom-nav" title="Register for Popup" :open="open" @close="emit('close')">
    <OrganizerPopupCard :event="event" />

    <template #footer>
      <div>
        <form @submit.prevent="handleValidate" class="mb-4 flex gap-2">
          <TextField placeholder="Enter coupon code" class="w-full" v-model="discountCode" />
          <AppButton
            label="Apply Code"
            :loading="isValidating"
            variant="outlined"
            class="flex-shrink-0"
            type="submit"
          />
        </form>

        <p class="flex justify-between text-sm">
          <span>1x Registration</span>
          <span class="font-medium">
            {{ formatCurrency(Number(event?.participant_fee), { kobo: true }) }}
          </span>
        </p>
        <p class="my-3 flex justify-between text-sm">
          <span>Discount</span>
          <span class="font-medium">{{ formatCurrency(discountValue, { kobo: true }) }}</span>
        </p>

        <p
          class="border-core-300 mb-6 flex justify-between border-t border-dashed pt-3 font-medium"
        >
          <span>Total</span>
          <span>{{ formatCurrency(totalAmount, { kobo: true }) }}</span>
        </p>

        <AppButton
          :label="`Pay ${formatCurrency(totalAmount, { kobo: true })}`"
          class="w-full"
          :loading="isPending"
          @click="handleRegister"
        />
      </div>
    </template>
  </Modal>
</template>
