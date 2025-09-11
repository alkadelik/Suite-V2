<template>
  <div class="mb-3 space-y-4">
    <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
      <Icon :name="iconName" :size="iconSize" />
    </div>

    <div class="space-y-2">
      <h4 v-if="title" class="text-xl font-semibold md:text-2xl">{{ title }}</h4>
      <p v-if="subtext" class="text-xs md:text-sm">
        {{ subtext }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from "./Icon.vue"

interface Props {
  /** Name of the icon to display */
  iconName: string
  /** Size of the icon */
  iconSize?: string | number
  /** Descriptive text below the icon */
  subtext?: string
  /** Title text */
  title?: string
}

withDefaults(defineProps<Props>(), {
  iconSize: "20",
})
</script>
