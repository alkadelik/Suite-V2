<script setup lang="ts">
import { computed, onMounted } from "vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { checkIfDateIsPast } from "@/utils/formatDate"
import { displayError } from "@/utils/error-handler"
import { useCreateShipbubbleShipment } from "../../api"
import { handlePayStackPayment, loadPaystackScript } from "../../utilities"
import { TShipmentCreatedDetails, TShipmentRow } from "../../types"
import { useWalkthroughStore } from "@modules/announcements/store"

const props = defineProps<{
  open: boolean
  item: TShipmentRow
  tourMode?: boolean
}>()
const emit = defineEmits<{
  close: []
  /** Booking succeeded — the page closes this modal and shows the success modal. */
  created: [details: TShipmentCreatedDetails]
}>()

const walkthrough = useWalkthroughStore()

const { format } = useFormatCurrency()

const shipment = computed(() => props.item.shipment)
const order = computed(() => props.item.order)

const isQuoteExpired = computed(() => {
  if (!shipment.value) return false
  if (shipment.value.quote_status === "expired") return true
  return !!shipment.value.quote_expires_at && checkIfDateIsPast(shipment.value.quote_expires_at)
})

const shippingFeeLabel = computed(() =>
  format(Number(shipment.value?.total_shipping_cost) || Number(order.value.delivery_fee), {
    kobo: true,
  }),
)

// Book the ShipBubble quote. Every shipment settles its shipping fee through
// Paystack first — including orders marked paid, whose checkout total doesn't
// cover this booking — so booking always carries a payment reference.
const { mutate: createShipment, isPending: isCreating } = useCreateShipbubbleShipment()

onMounted(() => {
  loadPaystackScript()
})

/** Book the quote with ShipBubble using the reference of the settled payment. */
const bookShipment = (reference: string) => {
  const currentOrder = order.value
  createShipment(
    {
      order: currentOrder.uid,
      rate: currentOrder.rate,
      courier: currentOrder.courier as string,
      payment_reference: reference,
    },
    {
      onSuccess: (response) => {
        const booked = response.data?.data
        emit("created", {
          trackingNumber: booked?.shipbubble_order_id || "",
          expectedDelivery: booked?.delivery_estimate || "",
        })
      },
      onError: displayError,
    },
  )
}

/** Collect the shipping fee through Paystack, then book once it succeeds. */
const handleConfirm = () => {
  // During the walkthrough, confirming only advances the tour — no charge, no booking.
  if (props.tourMode) {
    walkthrough.report("shipment-created")
    return
  }

  const currentShipment = shipment.value
  const currentOrder = order.value
  if (!currentShipment) return

  handlePayStackPayment(
    {
      // Paystack expects the amount in kobo
      shipping_price: (
        (Number(currentShipment.total_shipping_cost) || Number(currentOrder.delivery_fee)) * 100
      ).toFixed(2),
      customer_name: currentOrder.customer_name || "Customer",
      customer_email: currentOrder.customer_email || "",
      shipping_address: currentOrder.customer_address || "",
    },
    // The modal stays open behind Paystack so it can show the booking in flight.
    (payResponse) => bookShipment(payResponse.reference),
  )
}
</script>

<template>
  <!-- Shipping payment confirmation — every shipment settles its fee on creation -->
  <ConfirmationModal
    :model-value="open"
    max-width="md"
    z-class="z-[1200]"
    header-icon="wallet-money"
    :header="`Pay ${shippingFeeLabel} Shipping Fee`"
    :paragraph="
      isQuoteExpired && !tourMode
        ? `This shipping quote has expired, so it can no longer be booked. Create a new order quote to ship this order.`
        : `Shipping fees are settled when the shipment is created. You'll be redirected to securely pay for shipping before your shipment is booked.`
    "
    :info-message="`Shipping fee: ${shippingFeeLabel}`"
    action-label="Continue to Payment"
    :loading="isCreating"
    :action-disabled="!tourMode && isQuoteExpired"
    :action-attrs="{ 'data-walkthrough': 'shipment-submit-btn' }"
    @update:model-value="emit('close')"
    @confirm="handleConfirm"
  />
</template>
