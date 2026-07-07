<script setup lang="ts">
import { computed, ref } from "vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import InfoBox from "@components/InfoBox.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatDate, checkIfDateIsPast } from "@/utils/formatDate"
import { startCase } from "@/utils/format-strings"
import { clipboardCopy } from "@/utils/others"
import { displayError } from "@/utils/error-handler"
import { useCreateShipbubbleShipment } from "../../api"
import { SHIPMENT_STATUS_COLORS } from "../../constants"
import { TShipmentRow } from "../../types"

const props = defineProps<{
  open: boolean
  item: TShipmentRow
}>()
const emit = defineEmits<{
  close: []
  refresh: []
  fulfil: []
  "view-order": []
}>()

const { format } = useFormatCurrency()

const mode = computed<"shipbubble" | "manual" | "pickup">(() => {
  if (props.item.shipment) return "shipbubble"
  return props.item.order.fulfilment_method === "pickup" ? "pickup" : "manual"
})

const shipment = computed(() => props.item.shipment)
const order = computed(() => props.item.order)

const drawerTitle = computed(() =>
  mode.value === "pickup" ? "Pickup Details" : "Shipping Details",
)

const statusColor = computed(() => SHIPMENT_STATUS_COLORS[props.item.status] ?? "primary")

const isQuoteExpired = computed(() => {
  if (!shipment.value) return false
  if (shipment.value.quote_status === "expired") return true
  return !!shipment.value.quote_expires_at && checkIfDateIsPast(shipment.value.quote_expires_at)
})

const quoteChip = computed(() => {
  if (!shipment.value || shipment.value.status !== "awaiting_shipment") return null
  if (isQuoteExpired.value) return { label: "Quote expired", color: "error" as const }
  const remaining = shipment.value.quote_hours_remaining
  return {
    label: remaining ? `Expires in ${remaining}` : "Quote active",
    color: "warning" as const,
  }
})

const canCreateShipment = computed(
  () =>
    mode.value === "shipbubble" &&
    (shipment.value?.status === "awaiting_shipment" || !shipment.value?.status),
)

const canFulfil = computed(
  () =>
    mode.value !== "shipbubble" &&
    (order.value.fulfilment_status === "unfulfilled" ||
      order.value.fulfilment_status === "partially_fulfilled"),
)

// Timeline for ShipBubble shipments
const STATUS_ORDER = [
  "awaiting_shipment",
  "awaiting_pickup",
  "picked_up",
  "in_transit",
  "delivered",
]

const timelineSteps = computed(() => {
  if (!shipment.value) return []
  const statusIndex = STATUS_ORDER.indexOf(shipment.value.status)

  return [
    {
      label: "Order Created",
      detail: formatDate(order.value.created_at),
      done: true,
    },
    {
      label: "Shipment",
      detail: statusIndex >= 1 ? formatDate(shipment.value.created_at) : "",
      done: statusIndex >= 1,
      chip: quoteChip.value,
    },
    {
      label: "Pickup",
      detail: shipment.value.pickup_date
        ? formatDate(shipment.value.pickup_date)
        : "Earliest Available",
      done: statusIndex >= 2,
    },
    {
      label: "Delivered",
      detail: shipment.value.delivery_estimate ? formatDate(shipment.value.delivery_estimate) : "",
      done: shipment.value.status === "delivered",
    },
  ]
})

// Label/value rows for the details card, per mode
const detailRows = computed(() => {
  if (mode.value === "shipbubble" && shipment.value) {
    return [
      { label: "Shipment ID", value: shipment.value.shipbubble_order_id },
      { label: "Courier", value: shipment.value.courier?.name || order.value.courier_name || "-" },
      {
        label: "Pickup Date",
        value: shipment.value.pickup_date
          ? formatDate(shipment.value.pickup_date)
          : "Earliest Available",
      },
      {
        label: "Expected Delivery Date",
        value: shipment.value.delivery_estimate
          ? formatDate(shipment.value.delivery_estimate)
          : "-",
      },
    ]
  }

  if (mode.value === "manual") {
    return [
      { label: "Courier", value: order.value.courier_name || "-" },
      {
        label: "Delivery Type",
        value: order.value.manual_delivery_type ? startCase(order.value.manual_delivery_type) : "-",
      },
      {
        label: "Delivery Fee",
        value: format(Number(order.value.delivery_fee), { kobo: true }),
      },
      { label: "Order Date", value: formatDate(order.value.order_date || order.value.created_at) },
    ]
  }

  return [
    { label: "Pickup Location", value: order.value.location_name || "-" },
    { label: "Amount", value: format(Number(order.value.total_amount), { kobo: true }) },
    { label: "Order Date", value: formatDate(order.value.order_date || order.value.created_at) },
  ]
})

// Create shipment (book the ShipBubble quote)
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

const handleSuccessDone = () => {
  showSuccess.value = false
  emit("refresh")
  emit("close")
}
</script>

<template>
  <div>
    <Drawer :open="open" max-width="xl" @close="emit('close')">
      <template #header>
        <div class="px-6 py-4">
          <div class="flex items-center gap-2">
            <h2 class="text-core-800 text-lg font-semibold">{{ drawerTitle }}</h2>
            <Chip icon="truck-fast-outline" :label="startCase(item.status)" :color="statusColor" />

            <button
              type="button"
              @click="emit('close')"
              class="text-core-800 hover:text-core-600 ml-auto transition-colors"
            >
              <Icon name="close-circle" size="20" />
            </button>
          </div>
          <p v-if="mode === 'shipbubble'" class="text-core-600 mt-1 text-xs">
            Provided by <span class="text-primary-700 font-semibold">ShipBubble</span>
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <!-- ShipBubble support notice -->
        <InfoBox v-if="mode === 'shipbubble'" title="Heads up!" message="">
          <p class="text-xs font-semibold md:text-sm">
            For help with your delivery, please reach out to ShipBubble at
            <a href="mailto:hello@shipbubble.com" class="underline">hello@shipbubble.com</a>. Leyyow
            does not handle delivery directly.
          </p>
        </InfoBox>

        <!-- Order & shipment details -->
        <div class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4">
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Order ID</span>
            <span class="font-medium">
              #{{ order.order_number }}
              <button
                type="button"
                class="text-primary-700 ml-1 text-xs underline"
                @click="emit('view-order')"
              >
                View Order
              </button>
            </span>
          </p>
          <p v-for="row in detailRows" :key="row.label" class="flex justify-between text-sm">
            <span class="text-core-600">{{ row.label }}</span>
            <span class="font-medium">{{ row.value }}</span>
          </p>

          <!-- Shipping fee with quote state (ShipBubble only) -->
          <p v-if="mode === 'shipbubble' && shipment" class="flex justify-between text-sm">
            <span class="text-core-600">Delivery Fee</span>
            <span class="flex items-center gap-2 font-medium">
              {{ format(Number(shipment.total_shipping_cost), { kobo: true }) }}
              <Chip v-if="quoteChip" :label="quoteChip.label" :color="quoteChip.color" size="sm" />
            </span>
          </p>

          <!-- Receiver / customer details -->
          <div class="border-core-300 border-t border-dashed"></div>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Receiver's Name</span>
            <span class="font-medium">{{ order.customer_name || "Unknown Anonymous" }}</span>
          </p>
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Receiver's Phone</span>
            <span class="font-medium">{{ order.customer_phone || "-" }}</span>
          </p>
          <p v-if="mode !== 'pickup'" class="flex justify-between gap-6 text-sm">
            <span class="text-core-600 shrink-0">Receiver's Address</span>
            <span class="text-right font-medium">
              {{ order.customer_address || "-" }}
            </span>
          </p>
          <p v-else class="flex justify-between text-sm">
            <span class="text-core-600">Receiver's Email</span>
            <span class="font-medium">{{ order.customer_email || "-" }}</span>
          </p>

          <div
            v-if="mode === 'shipbubble' && shipment?.tracking_url"
            class="flex items-center justify-between gap-6 text-sm"
          >
            <span class="text-core-600 flex-shrink-0">Tracking Link</span>
            <div class="flex items-center gap-2 truncate">
              <a
                :href="shipment?.tracking_url"
                target="_blank"
                class="text-primary-600 max-w-sm truncate font-medium underline underline-offset-2"
              >
                {{ shipment?.tracking_url }}
              </a>
              <Icon
                name="copy"
                size="28"
                class="text-primary-600 cursor-pointer"
                @click="clipboardCopy(shipment?.tracking_url)"
              />
            </div>
          </div>
        </div>

        <!-- Timeline (ShipBubble only) -->
        <div
          v-if="mode === 'shipbubble'"
          class="border-core-300 bg-core-25 space-y-0 rounded-xl border p-4"
        >
          <div v-for="(step, idx) in timelineSteps" :key="step.label" class="flex gap-3">
            <div class="flex flex-col items-center">
              <span
                :class="[
                  'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                  step.done
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-core-300 bg-white',
                ]"
              >
                <Icon v-if="step.done" name="check" size="12" />
              </span>
              <span
                v-if="idx < timelineSteps.length - 1"
                :class="['w-0.5 flex-1', step.done ? 'bg-primary-600' : 'bg-core-200']"
              />
            </div>
            <div class="flex-1 pb-5">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">{{ step.label }}</p>
                <Chip
                  v-if="step.chip"
                  :label="step.chip.label"
                  :color="step.chip.color"
                  size="sm"
                />
              </div>
              <p v-if="step.detail" class="text-core-500 text-xs">{{ step.detail }}</p>
            </div>
          </div>
        </div>
      </div>

      <template v-if="canCreateShipment || canFulfil" #footer>
        <AppButton
          v-if="canCreateShipment"
          label="Create Shipment"
          class="w-full"
          :loading="isCreating"
          @click="handleCreateShipment"
        />
        <AppButton
          v-else
          :label="mode === 'pickup' ? 'Mark as Picked Up' : 'Mark as Delivered'"
          class="w-full"
          @click="emit('fulfil')"
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
        <div
          v-if="createdTrackingNumber"
          class="border-core-300 bg-core-25 mx-auto max-w-60 rounded-xl border px-4 py-3"
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
