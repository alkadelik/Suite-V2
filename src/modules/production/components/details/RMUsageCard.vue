<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { formatDate } from "@/utils/formatDate"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { TMovement, TRawMaterial } from "@modules/production/types"
import { HTMLAttributes } from "vue"

const props = defineProps<{
  item: TMovement
  material?: TRawMaterial
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div :class="['cursor-pointer bg-transparent py-2.5', props.class]">
    <div>
      <div class="flex items-center gap-3">
        <span class="bg-core-200 relative flex size-12 items-center justify-center rounded-xl">
          <Icon name="box-filled" :size="24" />
        </span>

        <div class="flex flex-1 flex-col gap-2 truncate">
          <div class="flex justify-between">
            <h4 class="truncate text-left text-sm font-semibold capitalize">
              {{ item.performed_by || "Store Owner" }}
            </h4>

            <div class="flex items-center justify-end gap-2">
              <span
                :class="item.movement_type === 'add' ? 'text-success-600' : 'text-error-600'"
                class="text-success-600 text-sm font-semibold"
              >
                {{ formatCurrency(Number(item.unit_cost)) }}
                ({{ Number(item.quantity).toLocaleString() + " " + props.material?.unit }})
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <!-- status -->
            <Chip :label="item.reason" color="blue" />

            <!-- date -->
            <p class="ml-auto pl-4 text-xs font-medium">
              {{ formatDate(item.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
