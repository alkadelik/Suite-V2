<template>
  <div
    class="flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4"
    @click="emit('click')"
  >
    <!-- top row: name + value, status chip, actions -->
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-gray-900">{{ coupon.name }}</p>
        <p class="mt-0.5 font-mono text-xs text-gray-500">{{ coupon.code }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-1.5">
        <span class="text-sm font-semibold text-gray-900">{{ valueLabel }}</span>
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

    <!-- scope + status chips -->
    <div class="flex flex-wrap items-center gap-2">
      <Chip :label="scopeMeta.label" :color="scopeMeta.color" size="sm" />
      <Chip :label="statusMeta.label" :color="statusMeta.color" size="sm" showDot />
    </div>

    <!-- usage -->
    <CouponUsageBar :used="0" :limit="coupon.max_usage" />

    <!-- expiry -->
    <div class="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
      <span class="text-gray-500">Expiry Date</span>
      <span class="font-medium text-gray-700">{{ formatCouponDate(coupon.valid_until) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import CouponUsageBar from "./CouponUsageBar.vue"
import { formatCouponDate, couponValueLabel } from "../../utils"
import { COUPON_STATUS_META, COUPON_SCOPE_META } from "../../constants"
import type { TCouponRow } from "../../types"
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

const props = defineProps<{ coupon: TCouponRow; actionItems: DropdownItem[] }>()
const emit = defineEmits<{ click: [] }>()

const { format } = useFormatCurrency()

const scopeMeta = computed(() => COUPON_SCOPE_META[props.coupon.scope])
const statusMeta = computed(() => COUPON_STATUS_META[props.coupon.status])

const valueLabel = computed(() => couponValueLabel(props.coupon, format))
</script>
