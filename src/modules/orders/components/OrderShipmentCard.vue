<!-- OrderShipmentCard.vue -->
<script setup lang="ts">
import { computed } from "vue"
import TruckFast from "@/assets/icons/truck-fast-outline.svg"
type StepKey = "pickup" | "in_transit" | "arrived" | "delivered"

export interface OrderShipmentCardData {
  customer_name: string
  amount: number | string
  currency?: string // default NGN

  courier_name?: string
  courier_logo_url?: string
  courier_rating?: number | string
  courier_reviews_count?: number | string
  courier_quality_label?: string // e.g. "Good"

  current_step?: StepKey

  pickup_date?: string
  in_transit_date?: string
  arrived_date?: string
  delivered_date?: string
}

const props = defineProps<{ item: OrderShipmentCardData }>()

const emit = defineEmits<{
  (e: "view-details", item: OrderShipmentCardData): void
}>()

const stepOrder: StepKey[] = ["pickup", "in_transit", "arrived", "delivered"]

const steps = computed(() => [
  { key: "pickup" as const, label: "Pickup", date: props.item.pickup_date || "-" },
  { key: "in_transit" as const, label: "In transit", date: props.item.in_transit_date || "-" },
  { key: "arrived" as const, label: "Arrived", date: props.item.arrived_date || "-" },
  { key: "delivered" as const, label: "Delivered", date: props.item.delivered_date || "-" },
])

const activeIndex = computed(() => {
  const k = props.item.current_step || "pickup"
  const idx = stepOrder.indexOf(k)
  return idx === -1 ? 0 : idx
})

const isDone = (idx: number) => idx < activeIndex.value
const isActive = (idx: number) => idx === activeIndex.value

const formatMoney = (value: number | string, currency = "NGN") => {
  if (value === null || value === undefined || value === "") return "--"

  if (typeof value === "string") {
    const s = value.trim()
    if (!s) return "--"

    const upper = s.toUpperCase()
    if (s.includes("₦") || upper.includes("NGN")) return s

    // parse plain numeric string safely
    const cleaned = s.replace(/[₦,\s]/g, "")
    const n = Number(cleaned)
    if (!Number.isFinite(n)) return "--"

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(n)
    } catch {
      return `${currency} ${n.toLocaleString()}`
    }
  }

  // number path
  if (!Number.isFinite(value)) return "--"

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

const amountText = computed(() => formatMoney(props.item.amount, props.item.currency || "NGN"))
const ratingText = computed(() => {
  const r = props.item.courier_rating
  if (r === undefined || r === null || r === "") return "-"
  return String(r)
})
const reviewsText = computed(() => {
  const c = props.item.courier_reviews_count
  if (c === undefined || c === null || c === "") return ""
  return `(${c} reviews)`
})
</script>

<template>
  <div class="w-full overflow-hidden rounded-2xl border border-[#F2D6A6] bg-white">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 bg-[#FBF2E6] p-2 pt-4">
      <div class="flex items-center gap-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F6E8CB] p-2">
          <TruckFast class="h-6 w-6" />
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-[#2E2A28]">
            {{ item.customer_name }}
          </p>

          <button
            type="button"
            class="text-sm text-[#8B7B73] underline underline-offset-4"
            @click.stop="emit('view-details', item)"
          >
            View Details
          </button>
        </div>
      </div>

      <p class="shrink-0 text-base font-semibold text-[#2E2A28]">
        {{ amountText }}
      </p>
    </div>

    <!-- Header divider (missing in your version) -->
    <div class="h-px w-full bg-[#F2D6A6]/60"></div>

    <!-- Body -->
    <div class="px-2 py-2">
      <!-- Courier block -->
      <div class="rounded-2xl border border-gray-200 p-2">
        <div class="flex items-center gap-5">
          <div
            class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <img
              v-if="item.courier_logo_url"
              :src="item.courier_logo_url"
              :alt="item.courier_name || 'Courier logo'"
              class="h-full w-full object-contain"
            />
            <div v-else class="text-xs font-medium text-gray-400">Logo</div>
          </div>

          <div class="min-w-0">
            <p class="truncate text-xs font-semibold text-[#2E2A28]">
              {{ item.courier_name || "Courier" }}
            </p>

            <div class="mt-3 flex items-center gap-4 text-xs text-gray-600">
              <!-- rating -->
              <div class="flex items-center gap-1">
                <img src="../../../assets/icons/star-outline.svg" alt="" />
                <span class="font-normal text-gray-600">{{ ratingText || "4.3" }}</span>
                <span class="text-gray-600">{{ reviewsText || "(243 reviews)" }}</span>
              </div>

              <!-- quality -->
              <div class="flex items-center gap-2">
                <img src="../../../assets/icons/bike.svg" />
                <span class="text-xs font-normal text-gray-600">
                  {{ item.courier_quality_label || "Good" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="my-4 h-px w-full bg-gray-200"></div>

      <!-- Timeline -->
      <div class="relative">
        <!-- dotted line across -->
        <div
          class="absolute top-[13px] right-0 left-0 border-t border-dashed border-gray-300"
        ></div>

        <div class="grid grid-cols-4 gap-3">
          <div v-for="(s, idx) in steps" :key="s.key" class="relative flex flex-col items-center">
            <!-- circle -->
            <div
              class="relative z-10 flex h-[24px] w-[24px] items-center justify-center bg-white"
              :class="[isDone(idx) || isActive(idx) ? 'border-gray-300' : 'border-gray-200']"
            >
              <!-- icons (slightly smaller + lighter like screenshot) -->
              <template v-if="s.key === 'pickup'">
                <img src="../../../assets/icons/gray-picked-up.svg" />
              </template>

              <template v-else-if="s.key === 'in_transit'">
                <img src="../../../assets/icons/transit-gray.svg" />
              </template>

              <template v-else-if="s.key === 'arrived'">
                <img src="../../../assets/icons/transit-gray.svg" />
              </template>

              <template v-else>
                <img src="../../../assets/icons/arrived-gray.svg" />
              </template>
            </div>

            <p class="mt-2 text-xs font-medium text-gray-900">{{ s.label }}</p>
            <p class="mt-1 text-[10px] text-gray-400">{{ s.date }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
