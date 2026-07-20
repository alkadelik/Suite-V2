<script setup lang="ts">
import { computed, ref } from "vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatDate, checkIfDateIsPast } from "@/utils/formatDate"
import { clipboardCopy } from "@/utils/others"
import { displayError } from "@/utils/error-handler"
import { useCreateShipbubbleShipment } from "../../api"
import { TShipmentRow } from "../../types"

const props = defineProps<{
  open: boolean
  item: TShipmentRow
}>()
const emit = defineEmits<{
  close: []
  refresh: []
}>()

const { format } = useFormatCurrency()

const shipment = computed(() => props.item.shipment)
const order = computed(() => props.item.order)

// Order items summary — first item leads, the rest collapse into a "+N items" chip
const firstItem = computed(() => order.value.items?.[0])
const firstItemImage = computed(() => firstItem.value?.product_images?.split(",")[0] || "")
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

// Book the ShipBubble quote
const { mutate: createShipment, isPending: isCreating } = useCreateShipbubbleShipment()

const showSuccess = ref(false)
const createdTrackingNumber = ref("")

const handleCreateShipment = () => {
  if (!shipment.value) return
  createShipment(shipment.value.uid, {
    onSuccess: (response) => {
      createdTrackingNumber.value = response.data?.data?.tracking_number || ""
      showSuccess.value = true
    },
    onError: displayError,
  })
}

const successRows = computed(() => [
  { label: "Order ID", value: `#${order.value.order_number}` },
  { label: "Shipment ID", value: shipment.value?.shipbubble_order_id || "-" },
  { label: "Courier", value: shipment.value?.courier?.name || "-" },
  {
    label: "Shipping Fee",
    value: format(Number(shipment.value?.total_shipping_cost), { kobo: true }),
  },
  {
    label: "Expected Delivery Date",
    value: shipment.value?.delivery_estimate ? formatDate(shipment.value.delivery_estimate) : "-",
  },
])

const handleSuccessDone = () => {
  showSuccess.value = false
  emit("refresh")
  emit("close")
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
        <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
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
        </div>

        <!-- Courier quote -->
        <div
          v-if="shipment"
          class="border-core-300 flex items-center gap-3 rounded-xl border bg-white p-4"
        >
          <span
            class="bg-core-200 flex size-10 flex-shrink-0 items-center justify-center rounded-lg"
          >
            <Icon name="truck-fast" size="20" class="text-core-600" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ shipment.courier?.name || "-" }}</p>
            <p class="text-core-500 mt-0.5 flex items-center gap-1.5 text-xs">
              <Chip v-if="quoteChip" :label="quoteChip.label" :color="quoteChip.color" size="sm" />
              <span>Created: {{ formatDate(shipment.created_at) }}</span>
            </p>
          </div>
          <p class="flex-shrink-0 text-sm font-semibold">
            {{ format(Number(shipment.total_shipping_cost), { kobo: true }) }}
          </p>
        </div>
      </div>

      <template #footer>
        <AppButton
          label="Create Shipment"
          class="w-full"
          :loading="isCreating"
          :disabled="isQuoteExpired"
          @click="handleCreateShipment"
        />
      </template>
    </Drawer>

    <!-- Shipment created success dialog -->
    <Modal :open="showSuccess" :show-header="false" max-width="sm" @close="handleSuccessDone">
      <div class="space-y-4 py-4 text-center">
        <p class="text-5xl">🎉</p>
        <h3 class="text-lg font-semibold">Shipment Created Successfully</h3>
        <p class="text-core-600 text-sm">
          Pickup has been booked with {{ shipment?.courier?.name || "your courier" }}. Tracking
          details have been generated and sent to the customer.
        </p>

        <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
          <p v-for="row in successRows" :key="row.label" class="flex justify-between text-sm">
            <span class="text-core-600">{{ row.label }}</span>
            <span class="font-medium">{{ row.value }}</span>
          </p>
        </div>

        <div
          v-if="createdTrackingNumber"
          class="border-warning-200 bg-warning-25 rounded-xl border px-4 py-3"
        >
          <p class="text-core-500 text-xs">Tracking Number</p>
          <p class="flex items-center justify-center gap-1 text-sm font-semibold">
            {{ createdTrackingNumber }}
            <Icon
              name="copy"
              size="14"
              class="text-primary-600 cursor-pointer"
              @click="clipboardCopy(createdTrackingNumber)"
            />
          </p>
        </div>

        <AppButton label="Done" class="w-full" @click="handleSuccessDone" />
      </div>
    </Modal>
  </div>
</template>
