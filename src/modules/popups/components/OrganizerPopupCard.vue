<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { useMediaQuery } from "@vueuse/core"

const isMobile = useMediaQuery("(max-width: 768px)")

const props = defineProps<{ class?: string }>()
</script>

<template>
  <div
    class="bg-core-25 border-core-300 flex w-full gap-2 rounded-lg border pr-3 md:gap-4"
    :class="props.class"
  >
    <div class="relative z-[1] w-1/3 flex-shrink-0 rounded-l-lg">
      <img
        src="@/assets/images/eventful-noise-grid.svg?url"
        class="h-full w-full rounded-l-lg bg-amber-600 object-cover"
      />

      <div
        class="absolute top-0 bottom-0 flex w-full items-center justify-center text-4xl font-black text-white"
      >
        {{ "LBW" }}
      </div>
    </div>
    <div class="flex-1 space-y-1 p-2 md:space-y-2 md:p-3">
      <h3 class="truncate text-sm font-semibold capitalize md:text-base">
        Lagos Business Week 2025
      </h3>
      <p class="flex items-center gap-2 text-xs md:text-sm">
        <Icon name="calendar" :size="isMobile ? 16 : 20" class="text-primary-600" />
        22-03-2025
      </p>
      <p class="flex items-center gap-2 text-xs md:text-sm">
        <Icon name="location" :size="isMobile ? 16 : 20" class="text-primary-600" />
        Victoria Island, Lagos
      </p>
      <p class="flex items-center gap-2 text-xs md:text-sm">
        <Icon name="dollar-circle" :size="isMobile ? 16 : 20" class="text-primary-600" />
        {{ formatCurrency(10000) }}
      </p>
      <Chip label="Ongoing" color="success" />
    </div>
    <AppButton v-if="!isMobile" label="Register Now" class="my-3" />
  </div>
</template>
