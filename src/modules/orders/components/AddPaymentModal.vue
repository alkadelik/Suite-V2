<script setup lang="ts">
import Modal from "@components/Modal.vue"
import { ref } from "vue"
import { useAddUpdateOrderPayment } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import RadioInputField from "@components/form/RadioInputField.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import { TOrder } from "../types"
import { formatCurrency } from "@/utils/format-currency"

const props = defineProps<{ open: boolean; order: TOrder }>()

const emit = defineEmits<{ close: []; refresh: [] }>()

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Credit Card", value: "credit-card" },
  { label: "Bank Transfer", value: "bank-transfer" },
  { label: "Mobile Money", value: "mobile-money" },
]

const form = ref({
  amount_paid: "",
  date: new Date().toISOString().split("T")[0],
  method: PAYMENT_METHODS[0],
})

const { mutate: addPayment, isPending } = useAddUpdateOrderPayment()

const onSubmit = () => {
  addPayment(
    { id: props.order.uid, body: { ...form.value, method: form.value.method.value } },
    {
      onSuccess: () => {
        toast.success("Payment added successfully!")
        emit("close")
        emit("refresh")
      },
      onError: displayError,
    },
  )
}
</script>

<template>
  <Modal
    :open="open"
    title="Add/update the payment status of this order"
    max-width="lg"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <!-- Severity -->
      <RadioInputField v-model="form.method" label="Payment Mode" :options="PAYMENT_METHODS" />

      <TextField
        v-model="form.amount_paid"
        label="Amount Paid"
        placeholder="Enter amount paid"
        :hint="`Outstanding: ${formatCurrency(props.order.total_amount - props.order.total_paid)}`"
        required
      />

      <TextField v-model="form.date" label="Date" type="date" required />
    </div>

    <!-- Footer -->
    <template #footer>
      <AppButton
        label="Add Payment"
        @click="onSubmit"
        class="w-full"
        :loading="isPending"
        :disabled="!form.amount_paid || !form.date"
      />
    </template>
  </Modal>
</template>
