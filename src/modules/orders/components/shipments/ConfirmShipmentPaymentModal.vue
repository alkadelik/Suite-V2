<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import RadioInputField from "@components/form/RadioInputField.vue"
import Icon from "@components/Icon.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { checkIfDateIsPast } from "@/utils/formatDate"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { useCreateShipbubbleShipment, useGetSuiteOrderQuote } from "../../api"
import { handlePayStackPayment, loadPaystackScript } from "../../utilities"
import { TShipmentCreatedDetails, TShipmentRow } from "../../types"
import type { IShippingCourier } from "@modules/shared/types"
import { useWalkthroughStore } from "@modules/announcements/store"

const props = defineProps<{
  open: boolean
  item: TShipmentRow
  tourMode?: boolean
}>()
const emit = defineEmits<{
  close: []
  /** A fresh quote replaced the expired one — the row behind the modal is now stale. */
  refresh: []
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

// --- Re-quoting an expired quote ---
// An expired quote can't be booked, but ShipBubble will price the same order again.
// Prices and couriers both move, so the merchant picks from the fresh list the same
// way they did when the order was created — the chosen courier and the new request
// token then replace the rate/courier stored on the order.
const { mutate: fetchQuote, isPending: isFetchingQuote } = useGetSuiteOrderQuote()

const quoteToken = ref("")
const quoteCouriers = ref<IShippingCourier[]>([])
const selectedCourierId = ref("")
/** A re-quote has come back — used to tell "not asked yet" from "no courier available". */
const requoted = ref(false)

const resetQuote = () => {
  quoteToken.value = ""
  quoteCouriers.value = []
  selectedCourierId.value = ""
  requoted.value = false
}

// Each time the modal opens (or is handed a different shipment) it starts from the
// stored quote again, so a stale courier list is never carried over.
watch([() => props.open, () => props.item.uid], resetQuote)

const selectedCourier = computed(
  () => quoteCouriers.value.find((c) => c.courier_id === selectedCourierId.value) || null,
)

const courierAmount = (courier: IShippingCourier) =>
  Number(courier.total_amount ?? courier.total ?? 0)

/** Show the re-quoted price once a courier is picked, otherwise the fee on the record. */
const shippingFee = computed(() => {
  if (selectedCourier.value) return courierAmount(selectedCourier.value)
  return Number(shipment.value?.total_shipping_cost) || Number(order.value.delivery_fee)
})

const shippingFeeLabel = computed(() => format(shippingFee.value, { kobo: true }))

const isExpired = computed(() => isQuoteExpired.value && !props.tourMode)
/** The expired quote hasn't been replaced yet — there is nothing to pay for. */
const needsRequote = computed(() => isExpired.value && quoteCouriers.value.length === 0)
/** Fresh couriers are on screen, waiting to be picked. */
const awaitingCourier = computed(
  () => isExpired.value && quoteCouriers.value.length > 0 && !selectedCourier.value,
)

const courierOptions = computed(() =>
  quoteCouriers.value.map((courier) => ({
    label: courier.courier_name,
    value: courier.courier_id,
    image: courier.courier_image || "",
    courier,
  })),
)

const handleRequote = () => {
  const currentShipment = shipment.value
  if (!currentShipment) return
  fetchQuote(currentShipment.uid, {
    onSuccess: (response) => {
      const quote = response.data?.data?.quotes
      const couriers = quote?.couriers ?? []
      requoted.value = true
      quoteToken.value = quote?.request_token || ""
      quoteCouriers.value = couriers
      selectedCourierId.value = ""
      if (couriers.length) {
        // The shipment now carries a new quote server-side, so the row behind is stale.
        emit("refresh")
      } else {
        toast.info("No courier is available for this order right now. Please try again later.")
      }
    },
    onError: displayError,
  })
}

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
      // A re-quote supersedes the rate/courier stored on the order.
      rate: quoteToken.value || currentOrder.rate,
      courier: selectedCourierId.value || (currentOrder.courier as string),
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

  // An expired quote is re-priced first; payment happens once a courier is picked.
  if (needsRequote.value) {
    handleRequote()
    return
  }
  if (awaitingCourier.value) {
    toast.error("Select a courier to continue.")
    return
  }

  handlePayStackPayment(
    {
      // Paystack expects the amount in kobo
      shipping_price: (shippingFee.value * 100).toFixed(2),
      customer_name: currentOrder.customer_name || "Customer",
      customer_email: currentOrder.customer_email || "",
      shipping_address: currentOrder.customer_address || "",
    },
    // The modal stays open behind Paystack so it can show the booking in flight.
    (payResponse) => bookShipment(payResponse.reference),
  )
}

const modalHeader = computed(() => {
  if (needsRequote.value) return "Shipping Quote Expired"
  if (awaitingCourier.value) return "Choose a New Courier"
  return `Pay ${shippingFeeLabel.value} Shipping Fee`
})

const modalParagraph = computed(() => {
  if (needsRequote.value) {
    return requoted.value
      ? "No courier came back for this order. Try again in a moment, or reach out to ShipBubble if it keeps happening."
      : "This shipping quote has expired and can no longer be booked. Get a new quote to see what couriers charge for this order today."
  }
  if (awaitingCourier.value) {
    return "These are today's prices for this order. Pick a courier to continue — you'll pay its shipping fee before the shipment is booked."
  }
  if (selectedCourier.value) {
    return "This is the new price for your shipment. You'll be redirected to securely pay for shipping before your shipment is booked."
  }
  return "Shipping fees are settled when the shipment is created. You'll be redirected to securely pay for shipping before your shipment is booked."
})

const actionLabel = computed(() => {
  if (!needsRequote.value) return "Continue to Payment"
  return requoted.value ? "Try Again" : "Get New Quote"
})
</script>

<template>
  <!-- Shipping payment confirmation — every shipment settles its fee on creation -->
  <ConfirmationModal
    :model-value="open"
    max-width="md"
    z-class="z-[1200]"
    header-icon="wallet-money"
    :header="modalHeader"
    :info-message="needsRequote || awaitingCourier ? '' : `Shipping fee: ${shippingFeeLabel}`"
    :action-label="actionLabel"
    :loading="isCreating || isFetchingQuote"
    :action-disabled="awaitingCourier"
    :action-attrs="{ 'data-walkthrough': 'shipment-submit-btn' }"
    @update:model-value="emit('close')"
    @confirm="handleConfirm"
  >
    <template #paragraph>
      <div class="mt-2 w-full text-left">
        <p class="text-xs md:text-sm">{{ modalParagraph }}</p>

        <!-- Couriers from the fresh quote — the pick sets the fee that gets paid -->
        <div v-if="courierOptions.length" class="mt-4">
          <p class="text-core-600 mb-2 text-xs">Select your preferred courier</p>
          <RadioInputField
            name="requote-courier-selection"
            :options="courierOptions"
            :model-value="selectedCourierId"
            orientation="vertical"
            variant="white"
            options-container-class="max-h-64 overflow-y-auto"
            @update:model-value="($event) => (selectedCourierId = $event as string)"
          >
            <template #content="{ option }">
              <div class="flex flex-1 items-center gap-3">
                <img
                  v-if="option.image && typeof option.image === 'string'"
                  :src="option.image"
                  :alt="option.label"
                  class="border-core-200 size-9 rounded-lg border bg-white object-contain"
                />
                <span
                  v-else
                  class="border-core-200 flex size-9 items-center justify-center rounded-lg border"
                >
                  <Icon name="box" size="16" />
                </span>

                <div class="flex flex-1 flex-col gap-1 text-gray-700">
                  <span class="text-sm font-semibold text-gray-900">{{ option.label }}</span>
                  <div class="flex flex-wrap items-center gap-2 text-xs">
                    <div class="flex items-center gap-1">
                      <Icon
                        name="star"
                        :type="
                          (option.courier as IShippingCourier).ratings === 5
                            ? 'bold'
                            : (option.courier as IShippingCourier).ratings > 2
                              ? 'bulk'
                              : 'linear'
                        "
                        size="12"
                        class="text-primary-500"
                      />
                      <span class="text-gray-600">
                        {{ (option.courier as IShippingCourier).ratings }}
                      </span>
                    </div>
                    <div class="size-1 rounded-full bg-gray-300" />
                    <div class="flex items-center gap-1">
                      <Icon name="clock" size="12" class="text-gray-600" />
                      <span class="text-gray-600">
                        {{
                          (option.courier as IShippingCourier).delivery_eta ||
                          (option.courier as IShippingCourier).estimated_days ||
                          "--"
                        }}
                      </span>
                    </div>
                  </div>
                </div>

                <span class="ml-auto text-sm font-semibold text-gray-900">
                  {{ format(courierAmount(option.courier as IShippingCourier), { kobo: true }) }}
                </span>
              </div>
            </template>
          </RadioInputField>
        </div>
      </div>
    </template>
  </ConfirmationModal>
</template>
