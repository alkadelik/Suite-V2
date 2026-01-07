<script setup lang="ts">
import { computed } from "vue"
import Chip from "./Chip.vue"
import Icon from "./Icon.vue"
import { TChipColor } from "@modules/shared/types"

interface Props {
  /** Stat data to display */
  stat: {
    icon: string
    iconClass?: string
    label: string
    value?: string | number
    valueText?: string
    chip?: string
    chipColor?: string
  }
  /** Whether the card is displayed in the same view across breakpoints */
  sameView?: boolean
}

const props = defineProps<Props>()
const chipColor = computed(() => (props.stat.chipColor as TChipColor) || "blue")
</script>

<template>
  <div
    class="border-primary-200 bg-primary-25 rounded-xl border p-3 pb-2 lg:border-0 lg:bg-white lg:p-6 lg:shadow-xs"
  >
    <!-- title -->
    <div
      :class="[
        'flex gap-2',
        props.sameView ? 'flex-row items-center' : 'flex-col lg:flex-row lg:items-center',
      ]"
    >
      <div
        :class="[
          'bg-core-200 mb-2 size-10 items-center justify-center rounded-xl p-2',
          stat.iconClass,
          props?.sameView ? 'flex' : 'hidden lg:flex',
        ]"
      >
        <Icon :name="stat.icon" size="28" />
      </div>
      <span
        :class="props.sameView ? 'hidden' : 'inline lg:hidden'"
        class="border-primary-600 w-8 rounded-full border-t-2"
      />
      <h3 class="!font-outfit text-core-600 line-clamp-1 text-sm md:text-base">{{ stat.label }}</h3>
    </div>
    <!-- value -->
    <div class="mt-2 flex items-center justify-between">
      <p v-if="stat.value !== undefined" class="text-core-800">
        <span class="text-xl font-semibold">{{ stat.value }}</span>
        <span v-if="stat.valueText" class="text-sm">{{ " " + stat.valueText }}</span>
      </p>
      <Chip v-if="stat.chip" :label="stat.chip" :color="chipColor" />
    </div>
  </div>
</template>
