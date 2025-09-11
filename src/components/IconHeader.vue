<template>
  <div class="space-y-4">
    <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
      <Icon :name="iconName" :size="iconSize" />
    </div>

    <p class="text-xs md:text-sm">
      {{ subtext }}
    </p>
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
  subtext: string
}

withDefaults(defineProps<Props>(), {
  iconSize: "20",
})
</script>
