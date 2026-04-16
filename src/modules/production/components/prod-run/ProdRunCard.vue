<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { TProdRun } from "../../types"
import { computed } from "vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import { useFormatCurrency } from "@/composables/useFormatCurrency"

const props = defineProps<{ item: TProdRun; class?: string }>()
const emit = defineEmits(["click", "toggle", "edit", "delete", "finalise", "duplicate"])
const { format } = useFormatCurrency()

const actionMenus = computed(() => [
  {
    label: `View run`,
    icon: "eye",
    action: () => emit("click"),
  },
  {
    label: `Duplicate run`,
    icon: "copy",
    action: () => emit("duplicate"),
  },
  ...(props.item?.status === "draft"
    ? [
        {
          label: `Edit run`,
          icon: "edit",
          action: () => emit("edit"),
        },
        {
          label: `Finalise run`,
          icon: "circle-check",
          action: () => emit("finalise"),
        },
      ]
    : []),
])
</script>

<template>
  <div
    @click="emit('click')"
    :class="['border-warning-200 cursor-pointer rounded-xl border', props.class]"
  >
    <div class="bg-warning-50 flex items-center gap-2.5 rounded-t-xl p-2">
      <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
        <Icon name="box" :size="24" class="text-primary-700" />
      </span>
      <div class="flex flex-1 justify-between">
        <div>
          <h3 class="!font-outfit truncate font-medium">{{ item.uid }}</h3>
          <p>
            <span> {{ item.output_item_name }} </span>
            <span class="mx-2">&bull;</span>
            <span class="text-error-600">
              {{ item.damaged_quantity }}
              <Icon name="information" class="ml-1" />
            </span>
          </p>
        </div>
        <span>{{ format(item.cost_per_unit || 0) }}</span>
      </div>
      <span class="ml-auto" />
      <DropdownMenu :items="actionMenus" @toggle="emit('toggle')" />
    </div>
    <div class="flex justify-between p-5 pb-3">
      <div>
        <p class="text-sm font-medium">
          {{ parseInt(item.quantity_to_produce).toLocaleString() }}
        </p>
        <p class="text-core-600 text-xs">Output Quantity</p>
      </div>
      <!--  -->
      <div>
        <p class="text-sm font-medium">{{ item.usable_quantity }}</p>
        <p class="text-core-600 text-xs">Usable Quantity</p>
      </div>
      <!--  -->
      <div>
        <Chip :label="item.status" :color="item.status === 'finalized' ? 'success' : 'warning'" />
      </div>
    </div>
  </div>
</template>
