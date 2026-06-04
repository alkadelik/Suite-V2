<template>
  <!-- outer light-grey frame (mobile), no frame on desktop -->
  <div class="h-full rounded-[20px] bg-gray-100 p-1.5 md:rounded-2xl md:bg-transparent md:p-0">
    <div class="h-full rounded-2xl bg-white md:border md:border-gray-200">
      <!-- Header -->
      <div class="flex items-center gap-2.5 px-4 py-3.5 md:px-5">
        <span
          class="bg-primary-50 text-primary-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        >
          <Icon name="setting" size="18" />
        </span>
        <h3 class="m-0 text-sm font-semibold text-gray-800 md:text-base">Coupon Settings</h3>
      </div>

      <!-- Grouped rows -->
      <dl class="px-4 md:px-5">
        <div
          v-for="(group, gi) in groups"
          :key="gi"
          class="py-2"
          :class="gi > 0 ? 'border-t border-dashed border-gray-200' : ''"
        >
          <div
            v-for="row in group"
            :key="row.label"
            class="flex items-center justify-between gap-4 py-2.5"
          >
            <dt class="text-xs text-gray-500 md:text-sm">{{ row.label }}</dt>
            <dd class="m-0 text-right text-xs font-semibold text-gray-800 md:text-sm">
              {{ row.value }}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatNumericDate, formatTimeOfDay } from "../../utils"
import type { TCoupon } from "../../types"

const props = defineProps<{ coupon: TCoupon }>()

const { format } = useFormatCurrency()

const discountTypeLabel = computed(() => {
  switch (props.coupon.discount_type) {
    case "percentage":
      return "Percentage"
    case "combined":
      return "Percentage + Cap"
    default:
      return "Fixed Amount"
  }
})

const discountValue = computed(() => {
  const c = props.coupon
  if (c.discount_type === "percentage" || c.discount_type === "combined") {
    return `${c.percentage_discount ?? 0}%`
  }
  return format(Number(c.flat_discount ?? 0))
})

const groups = computed<{ label: string; value: string }[][]>(() => {
  const c = props.coupon

  // Group 1: identity + discount
  const group1: { label: string; value: string }[] = [
    { label: "Coupon Name", value: c.name },
    { label: "Discount Type", value: discountTypeLabel.value },
    { label: "Discount Value", value: discountValue.value },
  ]
  if (c.discount_type === "combined") {
    group1.push({
      label: "Maximum Discount Amt.",
      value: c.flat_discount != null ? format(Number(c.flat_discount)) : "--",
    })
  }

  // Group 2: usage limits
  const group2: { label: string; value: string }[] = [
    { label: "Max. Coupon Use", value: c.max_usage != null ? String(c.max_usage) : "Unlimited" },
    { label: "Use Per Customer", value: String(c.max_usage_per_customer ?? 0) },
  ]

  // Group 3: cart conditions
  const group3: { label: string; value: string }[] = [
    {
      label: "Min. Cart Cost Value",
      value: c.min_order_amount != null ? format(Number(c.min_order_amount)) : "--",
    },
    { label: "Min. Cart Items", value: c.min_cart_items != null ? String(c.min_cart_items) : "--" },
  ]

  // Group 4: start
  const group4: { label: string; value: string }[] = [
    { label: "Start Date", value: formatNumericDate(c.valid_from) },
    { label: "Start Time", value: formatTimeOfDay(c.valid_from) },
  ]

  // Group 5: end
  const group5: { label: string; value: string }[] = [
    { label: "End Date", value: formatNumericDate(c.valid_until) },
    { label: "End Time", value: formatTimeOfDay(c.valid_until) },
  ]

  return [group1, group2, group3, group4, group5]
})
</script>
