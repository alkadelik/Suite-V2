<script setup lang="ts">
import Modal from "@components/Modal.vue"
import { computed, watch } from "vue"
import { useForm } from "vee-validate"
import { useAddUpdateOrderPayment } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import FormField from "@components/form/FormField.vue"
import AppButton from "@components/AppButton.vue"
import { TOrder } from "../types"
import { formatCurrency } from "@/utils/format-currency"
import * as yup from "yup"

const props = defineProps<{ open: boolean; order: TOrder }>()

const emit = defineEmits<{ close: []; refresh: [] }>()

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "transfer" },
]

const outstandingAmount = computed(() => props.order.total_amount - props.order.total_paid)

interface FormValues {
  amount: string
  date: string
  source: string
}

const { handleSubmit, meta, resetForm } = useForm<FormValues>({
  validationSchema: computed(() =>
    yup.object({
      amount: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("Amount must be a number")
        .required("Amount is required")
        .positive("Amount must be greater than 0")
        .max(
          outstandingAmount.value,
          `Amount cannot exceed outstanding balance of ${formatCurrency(outstandingAmount.value)}`,
        ),
      date: yup.string().required("Date is required"),
      source: yup.string().required("Payment source is required"),
    }),
  ),
  initialValues: {
    amount: "",
    date: new Date().toISOString().split("T")[0],
    source: PAYMENT_METHODS[0].value,
  },
})

const { mutate: addPayment, isPending } = useAddUpdateOrderPayment()

const onSubmit = handleSubmit((values) => {
  addPayment(
    { id: props.order.uid, body: values },
    {
      onSuccess: () => {
        toast.success("Payment added successfully!")
        resetForm()
        emit("close")
        emit("refresh")
      },
      onError: displayError,
    },
  )
})

// Reset form when modal opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  },
)
</script>

<template>
  <Modal
    :open="open"
    title="Add/update the payment status of this order"
    max-width="lg"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <FormField type="select" name="source" label="Payment Source" :options="PAYMENT_METHODS" />

      <FormField
        name="amount"
        label="Amount Paid"
        placeholder="Enter amount paid"
        :hint="`Outstanding: ${formatCurrency(outstandingAmount)}`"
        required
      />

      <FormField name="date" label="Date" type="date" required />
    </div>

    <!-- Footer -->
    <template #footer>
      <AppButton
        label="Add Payment"
        @click="onSubmit"
        class="w-full"
        :loading="isPending"
        :disabled="!meta.valid || isPending"
      />
    </template>
  </Modal>
</template>
