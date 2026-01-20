<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import Icon from "@components/Icon.vue"
import { PopupEvent } from "../types"
import DropdownMenu from "@components/DropdownMenu.vue"
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
  ...(props.event.status !== "past"
    ? [{ label: "Edit Event", icon: "edit", action: () => emit("edit") }]
    : []),
  ...(!props.event.total_orders ? [{ divider: true }] : []),
  ...(!props.event.total_orders
    ? [
        {
          label: "Delete Event",
          icon: "trash",
          class: "text-red-500",
          iconClass: "text-red-500",
          action: () => emit("delete"),
        },
      ]
    : []),
])
</script>

<template>
  <div
    :class="['border-warning-200 cursor-pointer rounded-xl border', props.class]"
    @click="emit('click')"
  >
    <div class="bg-warning-50 flex items-center gap-2.5 rounded-t-xl p-2">
      <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
        <Icon name="calendar" :size="24" class="text-primary-700" />
      </span>
      <h3 class="!font-outfit truncate font-medium">
        {{ event.organizer_event_name || event.name }}
      </h3>
      <span class="ml-auto" />
      <span class="text-base font-semibold">
        {{
          Number(event.participation_fee) ? formatCurrency(event.participation_fee || 0) : "Free"
        }}
      </span>
      <DropdownMenu :items="menuActions" />
    </div>
    <div class="flex items-center justify-between p-5 pb-3">
      <slot name="body">
        <div>
          <p class="text-sm font-medium">{{ formatDate(event.start_date) }}</p>
          <p class="text-core-600 text-xs">Start Date</p>
        </div>
        <div>
          <p class="text-sm font-medium">{{ formatDate(event.end_date) }}</p>
          <p class="text-core-600 text-xs">End Date</p>
        </div>
        <div>
          <div class="h-2 w-24 rounded-full bg-gray-200">
            <div
              class="bg-primary-600 h-1.5 rounded-full"
              :style="`width: ${((event?.items_sold_count || 0) / (event?.products_count || 1)) * 100}%`"
            ></div>
          </div>
          <p class="text-core-600 mt-1.5 text-xs">
            {{ event?.items_sold_count || 0 }} / {{ event?.products_count || 0 }} items sold
          </p>
        </div>
      </slot>
    </div>
  </div>
  <!-- <div
    class="bg-core-25 border-core-300 item-start flex cursor-pointer gap-4 rounded-2xl border px-4 py-4"
    :class="props.class"
    @click="emit('click')"
  >
    <div>
      <Avatar :name="event.name" />
    </div>
    <div class="flex-1">
      <div class="mb-2 flex items-center justify-between gap-2">
        <div class="flex flex-1 items-center gap-1.5">
          <h3 class="max-w-xs truncate text-base font-semibold">
            {{ event.organizer_event_name || event.name }}
          </h3>
          <Chip v-if="event.organizer_event_name" label="Eventful" class="flex-shrink-0" />
        </div>

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
            {{
              Number(event.participation_fee)
                ? formatCurrency(event.participation_fee || 0)
                : "Free"
            }}
          </span>
        </p>
        <Chip
          :label="event.status"
          size="sm"
          class="capitalize"
          show-dot
          :color="
            event.status === 'upcoming' ? 'primary' : event.status === 'active' ? 'success' : 'alt'
          "
        />
      </div>
    </div>
  </div> -->
</template>
