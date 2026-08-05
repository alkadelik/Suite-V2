<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import Drawer from "@components/Drawer.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatDate, checkIfDateIsPast } from "@/utils/formatDate"
import { displayError } from "@/utils/error-handler"
import { useCreateShipbubbleShipment } from "../../api"
import { handlePayStackPayment, loadPaystackScript } from "../../utilities"
import { TShipmentRow } from "../../types"
import { useWalkthroughStore } from "@modules/announcements/store"

const props = defineProps<{
  open: boolean
  item: TShipmentRow
  tourMode?: boolean
}>()
const emit = defineEmits<{
  close: []
  refresh: []
  /** Booking succeeded — the page closes this drawer and shows the success modal. */
  created: [trackingNumber: string]
}>()

const walkthrough = useWalkthroughStore()

const { format } = useFormatCurrency()

const shipment = computed(() => props.item.shipment)
const order = computed(() => props.item.order)

// Order items summary — first item leads, the rest collapse into a "+N items" chip
const firstItem = computed(() => order.value.items?.[0])
const firstItemImage = computed(() => firstItem.value?.product_images?.[0]?.image || "")
const extraItemsCount = computed(() => {
  const total = (order.value.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
  return total - (firstItem.value?.quantity ?? 0)
})

const isQuoteExpired = computed(() => {
  if (!shipment.value) return false
  if (shipment.value.quote_status === "expired") return true
  return !!shipment.value.quote_expires_at && checkIfDateIsPast(shipment.value.quote_expires_at)
})

const quoteChip = computed(() => {
  if (!shipment.value) return null
  if (isQuoteExpired.value) return { label: "Quote expired", color: "error" as const }
  const remaining = shipment.value.quote_hours_remaining
  return {
    label: remaining ? `Expires in ${remaining}` : "Quote active",
    color: "warning" as const,
  }
})

const receiverRows = computed(() => [
  { label: "Receiver's Name", value: order.value.customer_name || "Unknown Anonymous" },
  { label: "Receiver's Phone", value: order.value.customer_phone || "-" },
  { label: "Receiver's Address", value: order.value.customer_address || "-" },
])

const pickupRows = computed(() => [
  { label: "Pickup Address", value: order.value.location_name || "-" },
  {
    label: "Pickup Time",
    value: shipment.value?.pickup_date
      ? formatDate(shipment.value.pickup_date)
      : "Earliest Available",
  },
])

// Book the ShipBubble quote. A paid order already collected the shipping fee at
// checkout, so it books straight away with an empty payment reference; anything
// else (manual orders, part payments) has to settle the fee through Paystack first.
const { mutate: createShipment, isPending: isCreating } = useCreateShipbubbleShipment()

const showPaymentConfirm = ref(false)

const isShippingPrepaid = computed(() => order.value.payment_status === "paid")

const shippingFeeLabel = computed(() =>
  format(Number(shipment.value?.total_shipping_cost) || Number(order.value.delivery_fee), {
    kobo: true,
  }),
)

onMounted(() => {
  loadPaystackScript()
})

/** Book the quote with ShipBubble. `reference` is empty when nothing was charged. */
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
      // The page owns the success modal, so hand it the tracking number and let
      // it swap this drawer out.
      onSuccess: (response) => emit("created", response.data?.data?.tracking_number || ""),
      onError: displayError,
    },
  )
}

/** Collect the shipping fee through Paystack, then book once it succeeds. */
const payThenBook = () => {
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
    (payResponse) => bookShipment(payResponse.reference),
  )
}

const handleCreateShipment = () => {
  // During the walkthrough, "create" only advances the tour — no charge, no booking.
  if (props.tourMode) {
    walkthrough.report("shipment-created")
    return
  }
  if (!shipment.value) return

  // Paid orders settled the shipping fee at checkout — book with no reference.
  if (isShippingPrepaid.value) {
    bookShipment("")
    return
  }

  // Otherwise warn before handing the merchant off to Paystack.
  showPaymentConfirm.value = true
}

const handleConfirmPayment = () => {
  showPaymentConfirm.value = false
  payThenBook()
}
</script>

<template>
  <div>
    <Drawer :open="open" title="Create Shipment" max-width="xl" @close="emit('close')">
      <div class="space-y-4">
        <!-- Order items summary -->
        <div
          v-if="firstItem"
          class="border-primary-200 bg-primary-25 flex items-center gap-3 rounded-xl border p-3"
        >
          <img
            v-if="firstItemImage"
            :src="firstItemImage"
            :alt="firstItem.product_name"
            class="size-10 flex-shrink-0 rounded-lg object-cover"
          />
          <span
            v-else
            class="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-white"
          >
            <Icon name="box" size="20" class="text-gray-400" />
          </span>
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <p class="truncate text-sm font-medium">{{ firstItem.product_name }}</p>
            <Chip v-if="extraItemsCount > 0" :label="`+${extraItemsCount} items`" size="sm" />
          </div>
          <p class="flex-shrink-0 text-sm font-semibold">
            {{ format(Number(order.total_amount), { kobo: true }) }}
          </p>
        </div>

        <!-- Order & receiver details -->
        <div
          class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4"
          data-walkthrough="shipment-review"
        >
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Order ID</span>
            <span class="font-medium">#{{ order.order_number }}</span>
          </p>
          <p
            v-for="row in receiverRows"
            :key="row.label"
            class="flex justify-between gap-6 text-sm"
          >
            <span class="text-core-600 shrink-0">{{ row.label }}</span>
            <span class="text-right font-medium">{{ row.value }}</span>
          </p>
        </div>

        <!-- Pickup details -->
        <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
          <p v-for="row in pickupRows" :key="row.label" class="flex justify-between gap-6 text-sm">
            <span class="text-core-600 shrink-0">{{ row.label }}</span>
            <span class="text-right font-medium">{{ row.value }}</span>
          </p>

          <!-- Courier quote -->
          <div
            v-if="shipment"
            class="border-core-100 flex items-center gap-3 rounded-xl border bg-white p-4"
          >
            <span
              class="bg-core-200 flex size-10 flex-shrink-0 items-center justify-center rounded-lg"
            >
              <Icon name="truck-fast" size="20" class="text-core-600" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                {{ shipment.courier?.courier_name || "-" }}
              </p>
              <p class="text-core-500 mt-0.5 flex items-center gap-1.5 text-xs">
                <Chip
                  v-if="quoteChip"
                  :label="quoteChip.label"
                  :color="quoteChip.color"
                  size="sm"
                />
              </p>
            </div>
            <div class="flex-shrink-0 text-right">
              <p class="text-sm font-semibold">
                {{
                  format(Number(shipment.total_shipping_cost) || +order.delivery_fee, {
                    kobo: true,
                  })
                }}
              </p>
              <span class="text-xs">Created: {{ formatDate(shipment.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <AppButton
          label="Create Shipment"
          class="w-full"
          data-walkthrough="shipment-submit-btn"
          :loading="isCreating"
          :disabled="!tourMode && isQuoteExpired"
          @click="handleCreateShipment"
        />
      </template>
    </Drawer>

    <!-- Shipping payment confirmation — only for orders that never collected it -->
    <ConfirmationModal
      v-model="showPaymentConfirm"
      max-width="md"
      z-class="z-[1200]"
      header-icon="wallet-money"
      :header="`Pay ${shippingFeeLabel} Shipping Fee`"
      paragraph="This order was created manually, so no shipping fee was collected. You'll be redirected to securely pay for shipping before shipment creation."
      :info-message="`Shipping fee: ${shippingFeeLabel}`"
      action-label="Continue to Payment"
      @confirm="handleConfirmPayment"
    />
  </div>
</template>
