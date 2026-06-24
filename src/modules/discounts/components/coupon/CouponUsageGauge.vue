<template>
  <!-- outer light-grey frame (mobile), no frame on desktop -->
  <div class="h-full rounded-[20px] bg-gray-100 p-1.5 md:rounded-2xl md:bg-transparent md:p-0">
    <div
      class="flex h-full flex-col items-center justify-center rounded-2xl bg-white md:border md:border-gray-200"
    >
      <div class="flex flex-col items-center justify-center px-6 py-8 text-center">
        <!-- Illustration: bag over a subtle grid background -->
        <div
          class="flex min-h-44 w-full max-w-xs items-center justify-center rounded-xl bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${emptyGrid})`, backgroundSize: 'cover' }"
        >
          <img :src="emptyState" alt="Coupon" class="h-28 w-auto" />
        </div>

        <!-- Description: amount + human date range (matches the mock) -->
        <div class="mt-5 max-w-xs text-center">
          <p class="text-primary-600 text-xl font-bold">{{ valueLabel }}</p>
          <p class="text-core-500 mt-1 text-sm">
            Discount Off All Orders {{ coupon.valid_until ? "between" : "from" }}
          </p>
          <p class="text-primary-600 mt-1 text-sm font-semibold">{{ startLabel }}</p>
          <template v-if="coupon.valid_until">
            <p class="text-core-500 text-sm">and</p>
            <p class="text-primary-600 text-sm font-semibold">{{ endLabel }}</p>
          </template>
        </div>

        <!-- Usage progress -->
        <div class="mt-5 w-full max-w-xs">
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div class="bg-primary-600 h-full rounded-full" :style="{ width: `${percent}%` }" />
          </div>
          <p class="mt-2 text-xs font-medium text-gray-600">{{ used }}/{{ limitLabel }} Used</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatNumericDate, formatTimeOfDay } from "../../utils"
import emptyState from "@/assets/images/empty-state.png"
import emptyGrid from "@/assets/images/empty-grid.png"
import type { TCoupon, TCouponUsageStats } from "../../types"

const props = defineProps<{
  coupon: TCoupon
  usage: TCouponUsageStats | null | undefined
}>()

const { format } = useFormatCurrency()

const used = computed(() => props.usage?.total_usage ?? 0)
const limit = computed(() => props.coupon.max_usage)
const limitLabel = computed(() => (limit.value != null ? String(limit.value) : "∞"))

const percent = computed(() => {
  if (limit.value == null || limit.value <= 0) return 0
  return Math.min(100, Math.round((used.value / limit.value) * 100))
})

// --- Labels ---
const valueLabel = computed(() => {
  const c = props.coupon
  if (c.discount_type === "percentage" || c.discount_type === "combined") {
    return `${c.percentage_discount ?? 0}%`
  }
  return format(Number(c.flat_discount ?? 0))
})

const startLabel = computed(
  () =>
    `${formatNumericDate(props.coupon.valid_from)} - ${formatTimeOfDay(props.coupon.valid_from)}`,
)
const endLabel = computed(
  () =>
    `${formatNumericDate(props.coupon.valid_until)} ${formatTimeOfDay(props.coupon.valid_until)}`,
)
</script>
