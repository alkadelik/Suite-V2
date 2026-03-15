<script setup lang="ts">
import Icon from "@components/Icon.vue"

interface IReportInsight {
  /** The title of the insight */
  title: string
  /** The icon name to visually represent the insight */
  icon?: string
  /** The variant of the insight card */
  variant?: "primary" | "alt"
  /** The content of the insight */
  content?: string
}

withDefaults(defineProps<IReportInsight>(), {
  variant: "alt",
  icon: "box-filled",
})
</script>

<template>
  <div
    class="rounded-r-lg border border-l-4 p-4"
    :class="[
      { 'border-gray-200 border-l-gray-600 bg-white': variant === 'alt' },
      { 'border-l-primary-600 border-primary-200 bg-primary-50': variant === 'primary' },
    ]"
  >
    <h4 class="mb-3 flex items-center gap-2 text-xs font-medium uppercase">
      <Icon
        :name="icon"
        size="16"
        :class="variant === 'primary' ? 'text-core-600' : 'text-warning-400'"
      />
      {{ title }}
    </h4>
    <div class="text-sm" :class="{ 'rounded-lg bg-gray-100 p-3': variant === 'alt' }">
      <slot>
        <p>{{ content }}</p>
      </slot>
    </div>
  </div>
</template>
