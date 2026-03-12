<script setup lang="ts">
import Icon from "@components/Icon.vue"

export interface IReportStat {
  /** The label for the statistic */
  label: string
  /** The main value to display for the statistic */
  value: number | string
  /** The percentage change for the statistic */
  percentage?: number | string
  /** The text to display for the percentage change */
  percentageText?: string
  /** The caption for the statistic */
  caption?: string
  /** Optional note or insight related to the statistic */
  note?: string
}

defineProps<{
  /** The statistic data to display in the card */
  stat: IReportStat
}>()
</script>

<template>
  <div
    :class="[
      'flex flex-col gap-1.5 rounded-lg border p-4',
      'bg-primary-25 border-primary-200 sm:border-gray-100 sm:bg-white',
    ]"
  >
    <span class="border-primary-600 w-12 rounded-full border-t-3" />
    <p class="text-core-700 text-sm">{{ stat.label }}</p>
    <p class="text-xl font-semibold">{{ stat.value }}</p>
    <div
      v-if="stat.percentage"
      class="mt-1 flex items-center gap-1"
      :class="Number(stat.percentage) > 0 ? 'text-success-600' : 'text-error-600'"
    >
      <Icon name="arrow-up-square" size="20" :class="'rotate-180'" />
      <span
        class="text-sm font-medium"
        :class="Number(stat.percentage) > 0 ? 'text-success-600' : 'text-error-600'"
        >{{ stat.percentage }}% {{ stat.percentageText }}</span
      >
    </div>
    <p v-if="stat.caption" class="text-core-600 text-xs">{{ stat.caption }}</p>
    <p v-if="stat.note" class="text-core-600 border-primary-200 mt-1 border-t pt-2 text-xs italic">
      {{ stat.note }}
    </p>
  </div>
</template>
