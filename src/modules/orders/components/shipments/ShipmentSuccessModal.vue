<script setup lang="ts">
import { computed } from "vue"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatDate } from "@/utils/formatDate"
import { clipboardCopy } from "@/utils/others"
import { TShipmentRow } from "../../types"

const props = defineProps<{
  open: boolean
  item: TShipmentRow
  /** ShipBubble order id from the booking response */
  trackingNumber?: string
  /** Delivery estimate from the booking response */
  expectedDelivery?: string
}>()

const emit = defineEmits<{ done: [] }>()

const { format } = useFormatCurrency()

const shipment = computed(() => props.item.shipment)
const order = computed(() => props.item.order)

// `item` is the quote row the booking was made from, so anything the booking
// itself produced comes in as a prop and only falls back to the row.
const shipmentId = computed(() => props.trackingNumber || shipment.value?.shipbubble_order_id || "")

const deliveryEstimate = computed(
  () => props.expectedDelivery || shipment.value?.delivery_estimate || "",
)

const successRows = computed(() => [
  { label: "Order ID", value: `#${order.value.order_number}` },
  { label: "Shipment ID", value: shipmentId.value || "-" },
  { label: "Courier", value: shipment.value?.courier?.courier_name || "-" },
  {
    label: "Shipping Fee",
    value: format(
      Number(shipment.value?.total_shipping_cost) || Number(order.value?.delivery_fee),
      {
        kobo: true,
      },
    ),
  },
  {
    label: "Expected Delivery Date",
    value: deliveryEstimate.value ? formatDate(deliveryEstimate.value) : "-",
  },
])
</script>

<template>
  <Modal :open="open" max-width="xl" @close="emit('done')">
    <div class="space-y-4 py-4 text-center">
      <p class="text-5xl">🎉</p>
      <h3 class="text-lg font-semibold">Shipment Created Successfully</h3>
      <p class="text-core-600 text-sm">
        Pickup has been booked with {{ shipment?.courier?.courier_name || "your courier" }}.
        Tracking details have been generated and sent to the customer.
      </p>

      <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
        <p v-for="row in successRows" :key="row.label" class="flex justify-between text-sm">
          <span class="text-core-600">{{ row.label }}</span>
          <span class="font-medium">{{ row.value }}</span>
        </p>
      </div>

      <div class="border-primary-200 bg-primary-25 rounded-xl border px-4 py-3">
        <p class="text-core-500 text-xs">Tracking Number</p>
        <p class="flex items-center justify-center gap-1 text-sm font-semibold">
          {{ shipmentId || "--" }}
          <Icon
            name="copy"
            size="14"
            class="text-primary-600 cursor-pointer"
            @click="clipboardCopy(shipmentId)"
          />
        </p>
      </div>

      <AppButton
        label="Done"
        class="w-full"
        data-walkthrough="shipment-success-done"
        @click="emit('done')"
      />
    </div>
  </Modal>
</template>
