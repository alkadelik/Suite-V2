<template>
  <div
    class="cursor-pointer overflow-hidden rounded-2xl border border-purple-100 bg-white"
    @click="emit('click')"
  >
    <!-- Top: tinted header (icon + name/type/target + value + actions) -->
    <div class="flex items-start gap-3 bg-purple-50/50 px-3.5 py-3">
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600"
      >
        <Icon name="tag-2" size="22" />
      </span>

      <div class="min-w-0 flex-1">
        <p class="truncate text-base font-semibold text-gray-900">{{ discount.name }}</p>
        <div class="mt-1 flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-500">{{ typeLabel }}</span>
          <Chip :label="scopeMeta.label" :color="scopeMeta.color" size="sm" />
        </div>
      </div>

      <div class="flex shrink-0 items-start gap-1">
        <span class="text-base font-bold text-gray-900">{{ valueLabel }}</span>
        <DropdownMenu
          :items="actionItems"
          placement="bottom-end"
          :show-chevron="false"
          size="sm"
          trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
          @click.stop
        >
          <template #trigger>
            <Icon name="dots-vertical" size="18" />
          </template>
        </DropdownMenu>
      </div>
    </div>

    <!-- Bottom: white (expiry + status) -->
    <div class="flex items-center justify-between gap-2 border-t border-gray-100 px-3.5 py-3">
      <div class="min-w-0">
        <p class="text-sm font-medium text-gray-900">
          {{ discount.end_at ? formatCouponDate(discount.end_at) : "-" }}
        </p>
        <p class="mt-0.5 text-xs text-gray-500">Expiry Date</p>
      </div>
      <Chip :label="statusMeta.label" :color="statusMeta.color" size="sm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { formatCouponDate, discountValueLabel } from "../../utils"
import { DISCOUNT_STATUS_META, DISCOUNT_SCOPE_META } from "../../constants"
import type { TDiscountRow } from "../../types"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

interface DropdownItem {
  id?: string | number
  label?: string
  icon?: string
  class?: string
  iconClass?: string
  divider?: boolean
  action?: () => unknown
}

const props = defineProps<{ discount: TDiscountRow; actionItems: DropdownItem[] }>()
const emit = defineEmits<{ click: [] }>()

const { format } = useFormatCurrency()

const scopeMeta = computed(() => DISCOUNT_SCOPE_META[props.discount.scope])
const statusMeta = computed(
  () =>
    DISCOUNT_STATUS_META[props.discount.status] ?? {
      label: props.discount.status || "—",
      color: "alt" as const,
    },
)
const valueLabel = computed(() => discountValueLabel(props.discount, format))
const typeLabel = computed(() =>
  props.discount.discount_type === "fixed_amount" ? "Fixed Amount" : "Percentage Off",
)
</script>
