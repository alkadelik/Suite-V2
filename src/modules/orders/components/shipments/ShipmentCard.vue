<script setup lang="ts">
import { useFormatCurrency } from "@/composables/useFormatCurrency"
import DropdownMenu from "@components/DropdownMenu.vue"
import { TShipment } from "@modules/orders/types"
import { computed } from "vue"

const props = defineProps<{ item: TShipment; class?: string }>()
const emit = defineEmits(["click", "fulfil", "toggle"])

const { format } = useFormatCurrency()

const actionMenus = computed(() => [
  {
    label: `View details`,
    icon: "edit",
    action: () => emit("click"),
  },
  {
    label: "Fulfill order (shipment)",
    icon: "box",
    action: () => emit("fulfil"),
  },
])
</script>

<template>
  <div
    @click="emit('click')"
    :class="['border-leyyow-100 cursor-pointer rounded-xl border', props.class]"
  >
    <div class="bg-leyyow-50 flex items-start gap-2.5 rounded-t-xl p-2">
      <span class="bg-leyyow-100 flex size-10 items-center justify-center rounded-xl">
        <Icon name="truck-fast-outline" :size="24" class="text-primary-700" />
      </span>
      <div class="min-w-0">
        <h3 class="!font-outfit truncate font-medium">Adanna Okafor</h3>
        <button class="text-core-600 text-xs underline">View Details</button>
      </div>

      <span class="ml-auto" />
      <span class="ml-4 flex-1 text-right text-base font-semibold">
        {{ format(18000, { kobo: true }) }}
      </span>
      <DropdownMenu :items="actionMenus" @toggle="emit('toggle')" />
    </div>
    <div class="grid grid-cols-2 gap-3 overflow-hidden p-3 pt-3"></div>
  </div>
</template>
