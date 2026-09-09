<template>
  <div
    class="border-warning-300 bg-warning-25 flex w-full flex-col items-start gap-3 rounded-lg border p-4 md:flex-row"
  >
    <!-- The rings pin an explicit square (size-6) and centre the icon with flex,
         matching DeleteConfirmationModal/ConfirmationModal. Sizing them from the
         icon's intrinsic box instead lets fractional zoom round width and height
         differently, which renders the "circles" as ovals. -->
    <div
      class="border-warning-600/25 flex size-8 shrink-0 items-center justify-center rounded-full border-2"
    >
      <div
        class="border-warning-600/50 flex size-6 items-center justify-center rounded-full border-2"
      >
        <Icon name="filled-info-circle" size="16" class="text-warning-600" />
      </div>
    </div>

    <div class="text-warning-700 flex-1 text-xs md:text-sm">
      <p class="font-semibold">{{ header }}</p>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from "./Icon.vue"

/**
 * Props interface for the WarningBox component
 */
interface Props {
  /** Header text for the warning box */
  header: string
}

// Define props
defineProps<Props>()
</script>
