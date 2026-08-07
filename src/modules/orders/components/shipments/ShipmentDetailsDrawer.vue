<script setup lang="ts">
import { computed } from "vue"
import Drawer from "@components/Drawer.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import InfoBox from "@components/InfoBox.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatDate, checkIfDateIsPast } from "@/utils/formatDate"
import { startCase } from "@/utils/format-strings"
import { clipboardCopy } from "@/utils/others"
import { displayError } from "@/utils/error-handler"
import { useGetWaybillDocument } from "../../api"
import { SHIPMENT_STATUS_COLORS } from "../../constants"
import { TShipmentRow } from "../../types"
import { toast } from "@/composables/useToast"

const props = defineProps<{
  open: boolean
  item: TShipmentRow
}>()
const emit = defineEmits<{
  close: []
  refresh: []
  fulfil: []
  "view-order": []
  "create-shipment": []
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

const shipbubbleAction = computed<"create" | "waybill" | "track" | null>(() => {
  if (mode.value !== "shipbubble" || !shipment.value) return null
  if (canCreateShipment.value) return "create"
  if (shipment.value.status === "delivered" || shipment.value.status === "cancelled")
    return "waybill"
  return "track"
})

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
  const isCancelled = shipment.value.status === "cancelled"

  return [
    {
      label: "Shipped",
      detail: statusIndex >= 1 || isCancelled ? formatDate(shipment.value.created_at) : "",
      done: statusIndex >= 1 || isCancelled,
      chip: quoteChip.value,
    },
    {
      label: "Pickup",
      detail: shipment.value.pickup_date ? formatDate(shipment.value.pickup_date) : "",
      done: statusIndex >= 2,
      cancelled: isCancelled,
    },
    {
      label: "In-transit",
      detail: "",
      done: statusIndex >= 3,
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
      { label: "Shipment ID", value: shipment.value.shipbubble_order_id || "N/A" },
      { label: "Courier", value: shipment.value.courier?.name || order.value.courier_name || "-" },
      {
        label: "Pickup Date",
        value: shipment.value.pickup_date ? formatDate(shipment.value.pickup_date) : "--",
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
        value: order.value.manual_delivery_type || order.value.delivery_method || "-",
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
    { label: "Order Total", value: format(Number(order.value.total_amount), { kobo: true }) },
    { label: "Order Date", value: formatDate(order.value.order_date || order.value.created_at) },
  ]
})

const handleTrackOrder = () => {
  if (!shipment.value?.tracking_url) {
    displayError("Tracking link not available yet.")
    return
  }
  window.open(shipment.value.tracking_url, "_blank")
}

const { mutate: getWaybillDoc, isPending: isGettingWaybillDoc } = useGetWaybillDocument()

const handleGetWaybillDoc = () => {
  if (!shipment.value) return
  if (shipment.value.waybill_document_url) {
    window.open(shipment.value.waybill_document_url, "_blank")
    return
  }
  getWaybillDoc(shipment.value.uid, {
    onSuccess: (response) => {
      const url: string = response.data?.data?.waybill_document_url || ""
      if (url) {
        window.open(url, "_blank")
      } else {
        toast.info("Waybill document not yet available.")
      }
    },
    onError: displayError,
  })
}
</script>

<template>
  <div>
    <Drawer :open="open" max-width="xl" @close="emit('close')">
      <template #header>
        <div class="px-6 py-4">
          <div class="flex items-center gap-2">
            <h2 class="text-core-800 text-lg font-semibold">{{ drawerTitle }}</h2>
            <Chip
              icon="truck-fast-outline"
              :label="startCase(item.status)"
              :color="statusColor"
              data-walkthrough="shipment-status"
            />

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
          <div class="text-xs font-medium md:text-sm">
            <p>
              For help with your delivery, please reach out to ShipBubble at
              <a href="mailto:hello@shipbubble.com" class="underline">hello@shipbubble.com</a>.
            </p>
            <p>Leyyow does not handle delivery directly.</p>
          </div>
        </InfoBox>

        <!-- Order & shipment details -->
        <div
          class="border-core-300 bg-core-25 space-y-3 rounded-xl border p-4"
          data-walkthrough="shipment-details"
        >
          <p class="flex justify-between text-sm">
            <span class="text-core-600">Order ID</span>
            <span class="font-medium">
              #{{ order.order_number }}
              <button
                type="button"
                class="text-primary-700 ml-1 text-xs underline"
                @click="clipboardCopy(order.order_number)"
              >
                Copy
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
              {{
                format(+shipment.total_shipping_cost || +order?.delivery_fee, {
                  kobo: true,
                })
              }}
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
              {{ order.customer_address || order.delivery_address || "-" }}
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
                  'flex size-5 shrink-0 items-center justify-center rounded-full border-2 bg-white',
                  step.cancelled
                    ? 'border-error-600'
                    : step.done
                      ? 'border-primary-600'
                      : 'border-core-300',
                ]"
              >
                <span
                  :class="[
                    'size-2 rounded-full',
                    step.cancelled ? 'bg-error-600' : step.done ? 'bg-primary-600' : 'bg-core-300',
                  ]"
                />
              </span>
              <span
                v-if="idx < timelineSteps.length - 1"
                class="border-core-300 min-h-6 flex-1 border-l-2 border-dashed"
              />
            </div>
            <div class="flex flex-1 items-start justify-between gap-2 pb-5">
              <p class="text-sm font-medium">{{ step.label }}</p>
              <p class="text-core-500 flex items-center gap-1.5 text-xs">
                <Chip
                  v-if="step.chip"
                  :label="step.chip.label"
                  :color="step.chip.color"
                  size="sm"
                />
                <template v-if="step.cancelled">
                  <span class="text-error-600 font-medium">Cancelled</span>
                  <span v-if="step.detail">•</span>
                </template>
                {{ step.detail || "" }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <template v-if="canFulfil || shipbubbleAction" #footer>
        <AppButton
          v-if="canFulfil"
          label="Fulfill Shipment"
          class="w-full"
          @click="emit('fulfil')"
        />

        <AppButton
          v-else-if="shipbubbleAction === 'create'"
          label="Create Shipment"
          class="w-full"
          data-walkthrough="shipment-create-btn"
          @click="emit('create-shipment')"
        />

        <AppButton
          v-else-if="shipbubbleAction === 'waybill'"
          label="Get Waybill Doc"
          class="w-full"
          :loading="isGettingWaybillDoc"
          @click="handleGetWaybillDoc"
        />

        <div v-else-if="shipbubbleAction === 'track'" class="flex w-full gap-4">
          <AppButton
            label="Get Waybill Doc"
            class="w-full"
            variant="outlined"
            :loading="isGettingWaybillDoc"
            @click="handleGetWaybillDoc"
          />
          <AppButton label="Track Order" class="w-full" @click="handleTrackOrder" />
        </div>
      </template>
    </Drawer>
  </div>
</template>
