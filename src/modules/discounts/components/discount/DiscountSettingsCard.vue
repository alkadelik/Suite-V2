<template>
  <!-- mobile: grey card, header on grey + a white content panel; desktop: white card + border -->
  <div class="h-full rounded-2xl bg-gray-100 p-2.5 md:border md:border-gray-200 md:bg-white md:p-0">
    <!-- Header -->
    <div class="flex items-center gap-2.5 px-1.5 py-2 md:px-5 md:py-3.5">
      <span
        class="bg-primary-50 text-primary-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      >
        <Icon name="setting" size="18" />
      </span>
      <h3 class="m-0 text-sm font-semibold text-gray-800 md:text-base">Discount Settings</h3>
    </div>

    <!-- White content panel -->
    <dl class="rounded-xl bg-white px-4 py-1.5 md:rounded-none md:bg-transparent md:px-5 md:py-0">
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
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import { formatNumericDate, formatTimeOfDay, discountValueLabel } from "../../utils"
import type { TDiscount } from "../../types"

const props = defineProps<{ discount: TDiscount }>()

const { format } = useFormatCurrency()

const discountTypeLabel = computed(() =>
  props.discount.discount_type === "percentage" ? "Percentage" : "Fixed Amount",
)

const discountValue = computed(() => discountValueLabel(props.discount, format))

const groups = computed<{ label: string; value: string }[][]>(() => {
  const c = props.discount

  const group1: { label: string; value: string }[] = [
    { label: "Discount Type", value: discountTypeLabel.value },
    { label: "Discount Value", value: discountValue.value },
  ]
  if (c.max_discount_amount) {
    group1.push({
      label: "Maximum Discount Amt.",
      value: format(Number(c.max_discount_amount)),
    })
  }

  const group2: { label: string; value: string }[] = [
    { label: "Start Date", value: formatNumericDate(c.start_at) },
    { label: "Start Time", value: formatTimeOfDay(c.start_at) },
  ]

  const group3: { label: string; value: string }[] = [
    { label: "End Date", value: formatNumericDate(c.end_at) },
    { label: "End Time", value: formatTimeOfDay(c.end_at) },
  ]

  return [group1, group2, group3]
})
</script>
