<template>
  <button
    @click="to ? $router.push(to) : $router.back()"
    :class="[
      'text-primary-700 flex items-center gap-2 text-sm font-medium hover:underline',
      props.class,
    ]"
  >
    <Icon :name="icon || 'chevron-left'" size="20" />
    {{ label || "Back to Dashboard" }}
  </button>
</template>

<script setup lang="ts">
import Icon from "./Icon.vue"

interface Props {
  /** Optional route to navigate to instead of going back in history */
  to?: string
  /** Custom label text for the button (defaults to "Back to Dashboard") */
  label?: string
  /** Optional icon name instead of the default "chevron-left" */
  icon?: string
  /** Additional CSS classes to apply to the button */
  class?: string
}

const props = defineProps<Props>()
</script>
