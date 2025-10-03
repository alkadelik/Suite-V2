<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Modal from "@components/Modal.vue"
import CustomerCard from "@modules/customers/components/CustomerCard.vue"
import { anonymousCustomer } from "../constants"
import { formatCurrency } from "@/utils/format-currency"
import Icon from "@components/Icon.vue"
import { TOrder } from "../types"
import { computed } from "vue"
import { toast } from "@/composables/useToast"
import { useShareOrderInvoice, useShareOrderReceipt } from "../api"
import { displayError } from "@/utils/error-handler"

const props = defineProps<{ open: boolean; order: TOrder }>()

const emit = defineEmits<{ close: [] }>()

const { mutate: shareInvoice, isPending: isLoadingInvoice } = useShareOrderInvoice()
const { mutate: shareReceipt, isPending: isLoadingReceipt } = useShareOrderReceipt()

const orderPayLink = computed(() => {
  const isLocal = window.location.hostname === "localhost"
  return isLocal
    ? `http://localhost:8080/pay/${props.order?.order_number}`
    : `https://suite-v2.vercel.app/pay/${props.order?.order_number}`
})

const handleInvoice = () => {
  shareInvoice(props.order.uid, {
    onSuccess: () => {
      toast.success("Invoice shared successfully!")
      //   emit("close")
    },
    onError: displayError,
  })
}

const handleReceipt = () => {
  shareReceipt(props.order.uid, {
    onSuccess: () => {
      toast.success("Receipt shared successfully!")
      //   emit("close")
    },
    onError: displayError,
  })
}

const handleCopyLink = () => {
  navigator.clipboard
    .writeText(orderPayLink.value)
    .then(() => toast.info("Invoice link copied to clipboard!"))
    .catch(() => {
      toast.error("Failed to copy the link. Please try manually.")
    })
}
</script>

<template>
  <Modal title="Share Receipt" :open="open" @close="emit('close')">
    <div class="space-y-4">
      <CustomerCard :customer="anonymousCustomer" />

      <div class="border-core-300 mt-5 rounded-lg border bg-[#fbfbfb] p-3">
        <div class="text-sm">
          <div class="flex justify-between py-3">
            <span>Order number:</span>
            <span class="font-semibold"> {{ `#${order.order_number}` }} </span>
          </div>
          <div class="flex justify-between py-3">
            <span>Date:</span>
            <span class="font-semibold">{{
              new Date(order.created_at).toLocaleString("en-CA")
            }}</span>
          </div>
          <div class="flex justify-between py-3">
            <span>Products:</span>
            <span class="font-semibold">{{ order.items.length }} items</span>
          </div>
          <div class="border-b border-dashed border-[#c4dbd5]"></div>
          <div class="flex justify-between pt-3 text-base">
            <span class="font-semibold">Total Amount:</span>
            <span class="font-bold">{{ formatCurrency(order.total_amount) }}</span>
          </div>
        </div>
      </div>

      <button class="my-4 inline-flex gap-2 text-sm" type="button" @click="handleCopyLink">
        <Icon name="copy" /> copy invoice link
      </button>
    </div>
    <template #footer>
      <div class="grid grid-cols-2 gap-2">
        <AppButton
          variant="outlined"
          label="Share Invoice"
          :loading="isLoadingInvoice"
          @click="handleInvoice"
        />
        <AppButton label="Share Receipt" :loading="isLoadingReceipt" @click="handleReceipt" />
      </div>
    </template>
  </Modal>
</template>
