<template>
  <div
    class="border-warning-300 bg-warning-25 flex w-full flex-col items-start gap-3 rounded-lg border p-4 md:flex-row"
  >
    <div class="border-warning-600/25 rounded-full border-2 p-0.5">
      <div class="border-warning-600/50 rounded-full border-2 p-0.5">
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
