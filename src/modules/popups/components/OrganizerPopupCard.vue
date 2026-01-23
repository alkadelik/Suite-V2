<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import Icon from "@components/Icon.vue"
import { EventfulPopup } from "../types"
import { formatDate } from "@/utils/formatDate"
import fallbackImg from "@/assets/images/eventful-noise-grid.svg?url"

const props = withDefaults(
  defineProps<{
    class?: string
    showImage?: boolean
    showPrice?: boolean
    event: EventfulPopup
  }>(),
  { showImage: true, showPrice: true },
)
</script>

<template>
  <div
    class="bg-core-25 border-core-300 flex w-full items-center gap-2 rounded-3xl border p-2 pr-3 md:gap-4"
    :class="props.class"
    @click="$router.push(`/popups/eventful/${event.uid}`)"
  >
    <div v-if="showImage" class="relative z-[1] w-1/3 flex-shrink-0 rounded-l-lg">
      <img
        :src="event.image || fallbackImg"
        class="h-28 w-full rounded-xl bg-amber-600 object-cover"
      />

      <div class="absolute top-2 left-0 rounded-r bg-white px-2 py-1 text-sm font-semibold shadow">
        {{ Number(event.participant_fee) ? formatCurrency(Number(event.participant_fee)) : "Free" }}
      </div>

      <img src="/images/logos/leyyow-icon.svg?url" class="absolute right-1 bottom-1 h-8 w-8" />
    </div>
    <div class="min-w-0 flex-1 space-y-1 p-2 md:space-y-2 md:p-3">
      <h3 class="mb-4 truncate text-sm font-semibold capitalize md:text-base">
        {{ event.name }}
      </h3>
      <p class="flex items-center gap-2 text-xs md:text-sm">
        <Icon name="calendar" class="text-primary-600 !h-4 !w-4 flex-shrink-0 md:!h-5 md:!w-5" />
        {{ formatDate(event.start_date) }} - {{ formatDate(event.end_date) }}
      </p>
      <p class="flex min-w-0 items-center gap-2 text-xs md:text-sm">
        <Icon name="location" class="text-primary-600 !h-4 !w-4 flex-shrink-0 md:!h-5 md:!w-5" />
        <span class="truncate">
          {{ event.location }}
        </span>
      </p>
    </div>
  </div>
</template>
