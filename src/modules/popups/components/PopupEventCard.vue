<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { PopupEvent } from "../types"
import DropdownMenu from "@components/DropdownMenu.vue"
import Avatar from "@components/Avatar.vue"
import { computed } from "vue"

interface EventCardProps {
  /**  Additional custom classes */
  class?: string
  /** event item */
  event: PopupEvent
  /** Whether to show action menu */
  showActions?: boolean
}

const props = defineProps<EventCardProps>()

const emit = defineEmits<{
  (e: "click"): void
  (e: "share"): void
  (e: "edit"): void
  (e: "delete"): void
}>()

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString("en-US", { dateStyle: "medium" })
}

const menuActions = computed(() => [
  { label: "View Event", icon: "eye", action: () => emit("click") },
  { label: "Edit Event", icon: "edit", action: () => emit("edit") },
  { divider: true },
  {
    label: "Delete Event",
    icon: "trash",
    class: "text-red-500",
    iconClass: "text-red-500",
    action: () => emit("delete"),
  },
])
</script>

<template>
  <div
    class="bg-core-25 border-core-300 item-start flex cursor-pointer gap-4 rounded-2xl border px-4 py-4"
    :class="props.class"
    @click="emit('click')"
  >
    <div>
      <Avatar :name="event.name" />
    </div>
    <div class="flex-1">
      <div class="mb-2 flex items-center justify-between gap-2">
        <h3 class="flex-1 truncate text-base font-semibold">
          {{ event.name }}
        </h3>

        <DropdownMenu v-if="showActions" :items="menuActions" />
      </div>
      <div class="space-y-1.5">
        <p class="flex items-center gap-2 text-sm">
          <Icon name="calendar" size="20" class="text-primary-600" />
          <span>
            {{ formatDate(event?.start_date || "") }} -
            {{ formatDate(event?.end_date || "") }}
          </span>
        </p>
        <p class="flex items-center gap-2 text-sm">
          <Icon name="dollar-circle" size="20" class="text-primary-600" />
          <span>
            {{ event.participant_fee ? formatCurrency(event.participant_fee) : "Free" }}
          </span>
        </p>
        <Chip :label="`20% Sold`" size="sm" color="blue" />
      </div>
    </div>
  </div>
</template>
