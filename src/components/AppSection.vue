<template>
  <section :class="[props.background, 'w-full']">
    <div :class="['container mx-auto px-4 sm:px-6 lg:px-8', 'max-w-[1440px]', props.class]">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
export interface AppSectionProps {
  /**
   * Background class for the section e.g. bg-white, bg-gray-100
   */
  background?: string

  /**
   * Additional custom classes
   */
  class?: string
}

const props = withDefaults(defineProps<AppSectionProps>(), {
  background: "bg-transparent",
  maxWidth: "7xl",
})
</script>
