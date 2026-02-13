<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { formatDate } from "@modules/customers/utils/dateFormatter"
import { TBatch, TRawMaterial } from "@modules/production/types"
import { HTMLAttributes } from "vue"

const props = defineProps<{
  item: TBatch
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
              Batch-{{ item.uid.slice(0, 8) }}
            </h4>

            <div class="flex items-center justify-end gap-2">
              <span class="text-success-600 text-sm font-semibold">
                {{ Number(item.quantity).toLocaleString() + props.material?.unit }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <!-- status -->
            <Chip v-if="item.source_type" :label="startCase(item.source_type)" color="blue" />

            <!-- date -->
            <p class="ml-auto pl-4 text-xs font-medium">
              {{ formatDate(new Date(item.date_added)) }}
            </p>
            <span class="text-lg">&bull;</span>
            <p class="text-xs font-medium">
              {{ formatCurrency(Number(item.unit_cost)) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
