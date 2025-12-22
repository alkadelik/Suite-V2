<script setup lang="ts">
import { computed } from "vue"
import Chip from "@/components/Chip.vue"
import { formatCurrency } from "@/utils/format-currency"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import type { TExpense } from "../types"

const props = withDefaults(
  defineProps<{
    expense: TExpense
    showActions?: boolean
    customActions?: Array<{
      label?: string
      icon?: string
      action?: () => void
      class?: string
      iconClass?: string
      divider?: boolean
    }>
  }>(),
  {
    expense: () => ({}) as TExpense,
    showActions: true,
  },
)

const emit = defineEmits(["click", "edit", "delete"])

const menuItems = computed(() => {
  return props.customActions?.length
    ? props.customActions
    : [
        { label: "Edit expense", icon: "edit", action: () => emit("edit") },
        { divider: true },
        {
          label: "Delete expense",
          icon: "trash",
          class: "text-red-600 hover:bg-red-50",
          iconClass: "text-red-600",
          action: () => emit("delete"),
        },
      ]
})
</script>

<template>
  <div
    class="bg-core-25 border-core-300 mb-3 cursor-pointer rounded-xl border p-3"
    @click="emit('click')"
  >
    <div>
      <div class="flex items-start gap-3">
        <div class="flex flex-1 items-start gap-2 truncate text-sm">
          <span class="bg-core-200 flex size-12 items-center justify-center rounded-xl">
            <Icon name="truck-fast" :size="24" />
          </span>

          <div class="flex-1 truncate">
            <h4 class="truncate text-left text-sm font-semibold capitalize">
              GIG Logistics - Dispatch fee
            </h4>
            <div class="mt-1 flex items-center">
              <Icon name="calendar" size="16" />
              <span class="text-sm">{{ new Date().toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-error-600 text-sm font-semibold">{{ formatCurrency(72400) }}</span>
          <div>
            <DropdownMenu v-if="showActions" :items="menuItems" />
          </div>
        </div>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <!-- type -->
        <Chip icon="tag" color="pink" label="Packaging" />
        <!-- status -->
        <Chip show-dot color="success" label="Completed" />
      </div>
    </div>
  </div>
</template>
