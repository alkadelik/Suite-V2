<script setup lang="ts">
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"
import { startCase } from "@/utils/format-strings"
import { toast } from "@/composables/useToast"
import TickCheck from "@/assets/icons/tick-circle.svg?component"
import CloseIcon from "@/assets/icons/x-close.svg?component"
import { useTrackShipment, useGetWaybill } from "../shipments.api"

type StepKey = "picked_up" | "in_transit" | "arrived" | "delivered"
type StepState = "done" | "active" | "todo" | "failed"

type UnknownRecord = Record<string, unknown>
type Shipment = UnknownRecord | null

type UrlResponse = {
  data?: {
    data?: { url?: string }
    url?: string
  }
}

const extractUrl = (res: UrlResponse): string | undefined => res?.data?.data?.url || res?.data?.url

const props = defineProps<{
  open: boolean
  shipment: Shipment
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const isMobile = useMediaQuery("(max-width: 1028px)")
const close = () => emit("close")

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v)

const isPrimitive = (v: unknown): v is string | number | boolean | bigint =>
  ["string", "number", "boolean", "bigint"].includes(typeof v)

const nonEmptyText = (v: unknown): string | undefined => {
  if (!isPrimitive(v)) return undefined
  const s = String(v).trim()
  return s.length ? s : undefined
}

// Avoid eslint(@typescript-eslint/no-base-to-string) by not stringifying objects/arrays
const toText = (v: unknown, fallback = "--") => {
  if (v === null || v === undefined) return fallback
  if (typeof v === "string") {
    const s = v.trim()
    return s.length ? s : fallback
  }
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") return String(v)
  if (v instanceof Date) return v.toISOString()
  return fallback
}

const safe = (v: unknown, fallback = "--") => toText(v, fallback)

const pickFirst = (obj: UnknownRecord, keys: string[]): unknown => {
  for (const k of keys) {
    const v = obj[k]
    // Only treat primitives as “present” values
    if (nonEmptyText(v) !== undefined) return v
  }
  return undefined
}

const formatMoney = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v)
  if (Number.isNaN(n)) return safe(v)
  return `₦${n.toLocaleString()}`
}

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    toast.info("Copied to clipboard")
  } catch {
    toast.info("Copy failed")
  }
}

const openUrl = (url?: string) => {
  const u = (url || "").trim()
  if (!u) return
  window.open(u, "_blank", "noopener,noreferrer")
}

const shipmentUid = computed(() => {
  const x: UnknownRecord = props.shipment ?? {}
  const uid = x["uid"] ?? x["id"]
  // Only stringify primitives; objects become ""
  return nonEmptyText(uid) ?? ""
})

const { mutate: trackShipment, isPending: isTracking } = useTrackShipment()
const { mutate: getWaybill, isPending: isGettingWaybill } = useGetWaybill()

const handleTrack = () => {
  if (!shipmentUid.value) return
  trackShipment(shipmentUid.value, {
    onSuccess: (res: UrlResponse) => {
      const url = extractUrl(res)
      if (url) openUrl(url)
    },
  })
}

const handleWaybill = () => {
  if (!shipmentUid.value) return
  getWaybill(shipmentUid.value, {
    onSuccess: (res: UrlResponse) => {
      const url = extractUrl(res)
      if (url) openUrl(url)
    },
  })
}

const s = computed(() => {
  const x: UnknownRecord = props.shipment ?? {}

  const courier = isRecord(x["courier"]) ? x["courier"] : undefined
  const receiver = isRecord(x["receiver"]) ? x["receiver"] : undefined
  const tracking = isRecord(x["tracking"]) ? x["tracking"] : undefined
  const waybill = isRecord(x["waybill"]) ? x["waybill"] : undefined

  const orderId = pickFirst(x, ["order_id", "orderId", "order_number", "orderNumber"])
  const shipmentId = pickFirst(x, ["shipment_id", "shipmentId", "id", "uid"])

  const courierName = pickFirst({ ...x, ...(courier ?? {}) }, [
    "name",
    "courier_name",
    "courierName",
  ])
  const expectedDate = pickFirst(x, [
    "expected_delivery_date",
    "expectedDeliveryDate",
    "delivery_date",
  ])
  const deliveryFee = pickFirst(x, ["delivery_fee", "deliveryFee", "fee"])

  const receiverName = pickFirst({ ...x, ...(receiver ?? {}) }, [
    "receiver_name",
    "receiverName",
    "customer_name",
    "customerName",
    "name",
  ])
  const receiverPhone = pickFirst({ ...x, ...(receiver ?? {}) }, [
    "receiver_phone",
    "receiverPhone",
    "customer_phone",
    "customerPhone",
    "phone",
  ])
  const receiverAddress = pickFirst({ ...x, ...(receiver ?? {}) }, [
    "receiver_address",
    "receiverAddress",
    "shipping_address",
    "shippingAddress",
    "address",
  ])

  const trackingUrl = pickFirst({ ...x, ...(tracking ?? {}) }, [
    "tracking_url",
    "trackingUrl",
    "tracking_link",
    "trackingLink",
    "url",
  ])
  const trackingId = pickFirst(x, [
    "tracking_id",
    "trackingId",
    "tracking_number",
    "trackingNumber",
  ])

  const orderUrl = pickFirst(x, ["order_url", "orderUrl"])
  const waybillUrl = pickFirst({ ...x, ...(waybill ?? {}) }, ["waybill_url", "waybillUrl", "url"])

  const rawStatus = pickFirst(x, ["status", "state", "fulfilment_status"])
  const status = toText(rawStatus, "").toLowerCase().trim()

  return {
    orderId,
    shipmentId,
    courierName,
    expectedDate,
    deliveryFee,
    receiverName,
    receiverPhone,
    receiverAddress,
    trackingUrl,
    trackingId,
    orderUrl,
    waybillUrl,
    status,
    raw: x,
  }
})

const statusLabel = computed(() => (s.value.status ? startCase(s.value.status) : "Shipment"))

const statusColor = computed(() => {
  const st = s.value.status
  if (st === "delivered") return "success"
  if (st === "in_transit" || st === "in transit") return "warning"
  if (["cancelled", "canceled", "failed", "error"].includes(st)) return "error"
  return "alt"
})

const STEP_ORDER: StepKey[] = ["picked_up", "in_transit", "arrived", "delivered"]

const isFailedShipment = computed(() => {
  const v = s.value.status
  return ["cancelled", "canceled", "failed", "error"].includes(v)
})

const normalizeStatusToStep = (raw: unknown): StepKey => {
  const v = toText(raw, "").toLowerCase().trim()

  if (["delivered", "completed"].includes(v)) return "delivered"
  if (
    [
      "arrived",
      "at_destination",
      "arrived_at_hub",
      "out_for_delivery",
      "ready_for_delivery",
    ].includes(v)
  )
    return "arrived"
  if (["in_transit", "in transit", "shipped", "shipping", "processing"].includes(v))
    return "in_transit"
  if (["picked_up", "picked up", "pickup", "collected"].includes(v)) return "picked_up"
  if (["cancelled", "canceled", "failed", "error"].includes(v)) return "in_transit"

  return "picked_up"
}

const currentStepKey = computed<StepKey>(() => normalizeStatusToStep(s.value.status))
const currentIndex = computed(() => STEP_ORDER.indexOf(currentStepKey.value))

const steps = computed(() => {
  const x: UnknownRecord = s.value.raw ?? {}
  const idx = currentIndex.value

  const dates: Partial<Record<StepKey, string>> = {
    picked_up: toText(pickFirst(x, ["picked_up_date", "pickup_date", "pickedUpDate"]), ""),
    in_transit: toText(pickFirst(x, ["in_transit_date", "inTransitDate"]), ""),
    arrived: toText(pickFirst(x, ["arrived_date", "arrivedDate"]), ""),
    delivered: toText(pickFirst(x, ["delivered_date", "deliveredDate"]), ""),
  }

  const base = [
    { key: "picked_up" as const, label: "Picked up", date: dates.picked_up || "" },
    { key: "in_transit" as const, label: "In transit", date: dates.in_transit || "" },
    { key: "arrived" as const, label: "Arrived", date: dates.arrived || "" },
    { key: "delivered" as const, label: "Delivered", date: dates.delivered || "" },
  ]

  return base.map((st, i) => {
    if (isFailedShipment.value) {
      if (i < idx) return { ...st, state: "done" as StepState }
      if (i === idx) return { ...st, state: "failed" as StepState }
      return { ...st, state: "todo" as StepState }
    }

    const state: StepState = i < idx ? "done" : i === idx ? "active" : "todo"
    return { ...st, state }
  })
})

const iconForStep = (key: StepKey) => (key === "delivered" ? "box" : "truck-fast")

const canTrack = computed(() => Boolean(shipmentUid.value))
const canWaybill = computed(() => Boolean(shipmentUid.value))

void [
  Chip,
  Drawer,
  Icon,
  Modal,
  TickCheck,
  CloseIcon,
  isMobile,
  close,
  safe,
  formatMoney,
  copyText,
  openUrl,
  s,
  statusLabel,
  statusColor,
  steps,
  iconForStep,
  canTrack,
  canWaybill,
  isTracking,
  isGettingWaybill,
  handleWaybill,
  handleTrack,
]
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    max-width="2xl"
    variant="fullscreen"
    @close="close"
  >
    <template #header>
      <div class="flex items-center gap-2 px-4 py-4 md:px-6">
        <h2 class="text-core-800 text-lg font-semibold">Shipping Details</h2>

        <Chip icon="truck-fast" :label="statusLabel" :color="statusColor" />

        <button type="button" @click="close" class="text-core-800 hover:text-core-600 ml-auto">
          <Icon name="close-circle" size="20" />
        </button>
      </div>
    </template>

    <div class="bg-core-25 pb-6 md:px-6">
      <!-- Heads up banner -->
      <div class="border-primary-200 bg-primary-25 rounded-xl border p-4">
        <div class="flex gap-3">
          <span
            class="border-primary-200 flex size-4 items-center justify-center rounded-full border bg-white md:size-7"
          >
            <Icon name="info-circle" size="16" class="text-primary-600" />
          </span>

          <div class="text-[14px]">
            <p class="text-primary-700 font-semibold">Heads up!</p>
            <p class="text-primary-700 mt-1">
              For help with your delivery, please reach out to Shipbubble at
              <span class="font-medium underline">email@shipbubble.com</span>.
            </p>
            <p class="text-primary-700 mt-1">Leyyow does not handle delivery directly.</p>
          </div>
        </div>
      </div>

      <!-- Details card -->
      <div class="mt-4 rounded-xl border border-gray-200 bg-white">
        <div class="p-5">
          <div class="space-y-4 text-sm">
            <div class="flex items-center justify-between gap-4">
              <p class="text-core-500">Order ID</p>
              <div class="flex items-center gap-3">
                <p class="text-core-800 font-medium">{{ safe(s.orderId) }}</p>
                <button
                  v-if="s.orderUrl"
                  type="button"
                  class="text-xs font-medium text-[#B87B00] hover:text-[#B87B00]"
                  @click="openUrl(String(s.orderUrl))"
                >
                  View Order
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between gap-4">
              <p class="text-core-500">Shipment ID</p>
              <div class="flex items-center gap-2">
                <p class="text-core-800 font-medium">{{ safe(s.shipmentId) }}</p>
                <button
                  v-if="s.shipmentId && String(s.shipmentId) !== '--'"
                  type="button"
                  class="text-core-500 hover:text-core-700"
                  @click="copyText(String(s.shipmentId))"
                >
                  <Icon name="copy" size="16" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between gap-4">
              <p class="text-core-500">Courier</p>
              <p class="text-core-800 font-medium">{{ safe(s.courierName) }}</p>
            </div>

            <div class="flex items-center justify-between gap-4">
              <p class="text-core-500">Expected Delivery Date</p>
              <p class="text-core-800 font-medium">{{ safe(s.expectedDate) }}</p>
            </div>

            <div class="flex items-center justify-between gap-4">
              <p class="text-core-500">Delivery Fee</p>
              <p class="text-core-800 font-medium">{{ formatMoney(s.deliveryFee) }}</p>
            </div>

            <div class="border-t border-dashed border-gray-200 pt-4"></div>

            <div class="flex items-center justify-between gap-4">
              <p class="text-core-500">Receiver’s Name</p>
              <p class="text-core-800 font-medium">{{ safe(s.receiverName) }}</p>
            </div>

            <div class="flex items-center justify-between gap-4">
              <p class="text-core-500">Receiver’s Phone</p>
              <p class="text-core-800 font-medium">{{ safe(s.receiverPhone) }}</p>
            </div>

            <div class="flex items-start justify-between gap-4">
              <p class="text-core-500">Receiver’s Address</p>
              <p class="text-core-800 max-w-[60%] text-right font-medium">
                {{ safe(s.receiverAddress) }}
              </p>
            </div>

            <div class="border-t border-dashed border-gray-200 pt-4"></div>

            <div class="flex items-center justify-between gap-4">
              <p class="text-core-500">Tracking ID</p>
              <div class="flex items-center gap-2">
                <p class="text-core-800 max-w-[260px] truncate font-medium">
                  {{ safe(s.trackingUrl || s.trackingId) }}
                </p>

                <button
                  v-if="s.trackingUrl || s.trackingId"
                  type="button"
                  class="text-core-500 hover:text-core-700"
                  @click="copyText(String(s.trackingUrl || s.trackingId))"
                >
                  <Icon name="copy" size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline card -->
      <div class="mt-4 rounded-xl border border-gray-200 bg-white">
        <div class="p-5">
          <div class="space-y-12">
            <div v-for="(step, idx) in steps" :key="step.key" class="relative flex gap-6">
              <!-- Left rail -->
              <div class="relative flex w-14 justify-center">
                <!-- Top connector -->
                <div
                  v-if="idx !== 0"
                  class="absolute -top-12 h-12 w-px border-l-2 border-dashed"
                  :class="
                    step.state === 'failed'
                      ? 'border-red-600'
                      : step.state === 'done' || step.state === 'active'
                        ? 'border-[#B87B00]'
                        : 'border-gray-200'
                  "
                />

                <!-- Node -->
                <div
                  class="mt-1 flex size-12 items-center justify-center rounded-full border-2 bg-white"
                  :class="
                    step.state === 'done'
                      ? 'border-[#B87B00]'
                      : step.state === 'failed'
                        ? 'border-red-600'
                        : 'border-gray-200'
                  "
                >
                  <!-- DONE -->
                  <div
                    v-if="step.state === 'done'"
                    class="flex size-7 items-center justify-center rounded-full bg-[#B87B00]"
                  >
                    <TickCheck class="text-white" />
                  </div>

                  <!-- FAILED -->
                  <div
                    v-else-if="step.state === 'failed'"
                    class="flex size-7 items-center justify-center rounded-full bg-red-600"
                  >
                    <CloseIcon class="text-white" />
                  </div>

                  <!-- ACTIVE -->
                  <Icon
                    v-else-if="step.state === 'active'"
                    :name="iconForStep(step.key)"
                    width="24"
                    height="24"
                    class="text-[#B87B00]"
                  />

                  <!-- TODO -->
                  <Icon
                    v-else
                    :name="iconForStep(step.key)"
                    width="24"
                    height="24"
                    class="text-gray-300"
                  />
                </div>

                <!-- Bottom connector -->
                <div
                  v-if="idx !== steps.length - 1"
                  class="absolute top-14 h-20 w-px border-l-2 border-dashed"
                  :class="step.state === 'done' ? 'border-[#B87B00]' : 'border-gray-200'"
                />
              </div>

              <!-- Content -->
              <div class="flex w-full items-center justify-between">
                <p
                  class="text-xs font-medium"
                  :class="step.state === 'todo' ? 'text-gray-300' : 'text-core-900'"
                >
                  {{ step.label }}
                </p>

                <!-- Right side: Cancelled • date OR just date -->
                <div class="flex items-center gap-4">
                  <div v-if="step.state === 'failed'" class="flex items-center gap-3">
                    <p class="text-xs font-medium text-red-600">Cancelled</p>
                    <span class="size-2 rounded-full bg-gray-300"></span>
                  </div>

                  <p class="text-core-500 text-xs font-medium">
                    {{ step.date ? step.date : "-" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="bg-core-25 bottom-0 mt-6 pt-2 pb-2">
        <div class="flex gap-3">
          <button
            type="button"
            class="text-core-800 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
            :disabled="!canWaybill || isGettingWaybill"
            @click="handleWaybill"
          >
            Get Waybill Doc
          </button>

          <button
            type="button"
            class="bg-primary-600 hover:bg-primary-600/90 flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="!canTrack || isTracking"
            @click="handleTrack"
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  </component>
</template>
