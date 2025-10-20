<script setup lang="ts">
import Modal from "@components/Modal.vue"
// import OrganizerPopupCard from "./OrganizerPopupCard.vue"
import AppButton from "@components/AppButton.vue"
import { formatCurrency } from "@/utils/format-currency"
import TextField from "@components/form/TextField.vue"
import { useMediaQuery } from "@vueuse/core"
import Icon from "@components/Icon.vue"

defineProps<{ open: boolean }>()

const emit = defineEmits<{ (e: "close"): void }>()

const isMobile = useMediaQuery("(max-width: 768px)")
</script>

<template>
  <Modal variant="bottom-nav" title="Register for Popup" :open="open" @close="emit('close')">
    <!-- <div class="relative z-[1] mb-6 rounded-xl">
      <img
        src="@/assets/images/eventful-noise-grid.svg?url"
        alt="Eventful"
        class="h-40 w-full rounded-xl bg-amber-600 object-cover"
      />
      <div
        class="absolute top-0 bottom-0 flex w-full items-center justify-center text-7xl font-black tracking-wider text-white"
      ></div>
    </div> -->

    <div class="bg-core-25 border-core-300 flex w-full gap-2 rounded-lg border pr-3 md:gap-4">
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
        <h3 class="font-outfit mb-4 truncate text-sm font-semibold capitalize md:text-base">
          Lagos Business Week 2025
        </h3>
        <p class="flex items-center gap-2 text-xs md:text-sm">
          <Icon name="calendar" :size="isMobile ? 16 : 20" class="text-primary-600" />
          Oct 8, 2025 - Oct 12, 2025
        </p>
        <p class="flex items-center gap-2 text-xs md:text-sm">
          <Icon name="location" :size="isMobile ? 16 : 20" class="text-primary-600" />
          Victoria Island, Lagos
        </p>
        <!-- <p class="flex items-center gap-2 text-xs md:text-sm">
        <Icon name="dollar-circle" :size="isMobile ? 16 : 20" class="text-primary-600" />
        {{ formatCurrency(10000) }}
      </p>
      <Chip label="Ongoing" color="success" /> -->
      </div>
      <!-- <AppButton v-if="!isMobile" label="Register Now" class="my-3" /> -->
    </div>

    <template #footer>
      <div>
        <form class="mb-4 flex gap-2">
          <TextField placeholder="Enter coupon code" class="w-full" />
          <AppButton label="Apply Code" variant="outlined" class="flex-shrink-0" />
        </form>

        <p class="flex justify-between text-sm">
          <span>1x Registration</span>
          <span class="font-medium">{{ formatCurrency(10000) }}</span>
        </p>
        <p class="my-3 flex justify-between text-sm">
          <span>Discount</span>
          <span class="font-medium">-</span>
        </p>

        <p
          class="border-core-300 mb-6 flex justify-between border-t border-dashed pt-3 font-medium"
        >
          <span>Total</span>
          <span>{{ formatCurrency(10000) }}</span>
        </p>

        <AppButton :label="`Pay ${formatCurrency(10000)}`" class="w-full" />
      </div>
    </template>
  </Modal>
</template>
