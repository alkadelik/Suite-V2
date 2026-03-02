<script setup lang="ts">
import { computed } from "vue"
import Chip from "./Chip.vue"
import Icon from "./Icon.vue"
import { TChipColor } from "@modules/shared/types"

interface Stat {
  icon: string
  iconClass?: string
  label: string
  value?: string | number
  valueText?: string
  chip?: string
  chipColor?: string
  percentage?: number
}

interface Props {
  /** Stat data to display */
  stat: Stat
  /** Variant of the card display */
  variant?: "main" | "alt"
  /** Whether the stat is in loading state */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), { variant: "main" })
const chipColor = computed(() => (props.stat.chipColor as TChipColor) || "blue")
</script>

<template>
  <div
    :class="[
      'rounded-xl border lg:shadow',
      variant === 'alt'
        ? 'border-primary-200 bg-primary-25 p-4'
        : 'border-primary-200 bg-primary-25 p-3 pb-2 lg:border-0 lg:bg-white lg:p-5 lg:pb-3',
    ]"
  >
    <!-- Loading skeleton -->
    <div v-if="loading" class="animate-pulse">
      <div :class="['flex gap-2', 'flex-row items-center']">
        <div :class="{ 'flex items-center justify-between': true }">
          <!-- Icon skeleton -->
          <div
            :class="[
              'size-10 items-center justify-center rounded-xl',
              variant === 'alt' ? 'bg-core-200 flex' : 'hidden bg-gray-100 lg:flex',
            ]"
          >
            <div class="h-6 w-6 rounded bg-gray-200" />
          </div>
          <span
            :class="variant === 'alt' ? 'hidden' : 'inline lg:hidden'"
            class="border-primary-600 w-8 rounded-full border-t-2"
          />
        </div>
        <!-- Label skeleton -->
        <div class="h-4 w-24 rounded bg-gray-200 md:h-5 md:w-32" />
      </div>
      <!-- Value skeleton -->
      <div
        class="flex items-center justify-between gap-6"
        :class="variant === 'alt' ? 'mt-2' : 'mt-4'"
      >
        <div class="h-6 w-20 rounded bg-gray-200 md:h-7 md:w-24" />
      </div>
    </div>

    <template v-else>
      <!-- title -->
      <div :class="['flex gap-2', 'flex-col md:flex-row md:items-center']">
        <div :class="{ 'flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4': true }">
          <div
            :class="[
              'size-10 items-center justify-center rounded-xl',
              variant === 'alt' ? 'bg-core-200 flex' : 'hidden bg-gray-100 lg:flex',
              stat.iconClass,
            ]"
          >
            <Icon :name="stat.icon" size="24" />
          </div>
          <span
            :class="variant === 'alt' ? 'hidden' : 'inline lg:hidden'"
            class="border-primary-600 w-8 rounded-full border-t-2"
          />

          <!-- percentage -->
          <h3 class="!font-outfit text-core-600 line-clamp-1 flex-1 text-sm md:text-base">
            {{ stat.label }}
          </h3>

          <div
            v-if="stat.percentage && variant !== 'alt'"
            class="hidden items-center gap-1 lg:inline-flex"
            :class="stat.percentage > 0 ? 'text-success-600' : 'text-error-600'"
          >
            <Icon
              name="arrow-up-square"
              size="20"
              :class="stat.percentage > 0 ? 'rotate-0' : 'rotate-180'"
            />
            <span class="text-xs font-medium">{{ stat.percentage }}%</span>
          </div>
        </div>
      </div>
      <!-- value -->
      <div
        class="flex items-center justify-between gap-6"
        :class="variant === 'alt' ? 'mt-2' : 'mt-4'"
      >
        <p v-if="stat.value !== undefined" class="text-core-800">
          <span class="text-lg font-semibold md:text-xl">{{ stat.value }}</span>
          <span v-if="stat.valueText" class="text-sm">{{ " " + stat.valueText }}</span>
        </p>
        <Chip v-if="stat.chip" :label="stat.chip" :color="chipColor" class="truncate" />
      </div>
    </template>
  </div>
</template>
