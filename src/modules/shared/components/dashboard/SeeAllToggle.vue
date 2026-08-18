<template>
  <button
    type="button"
    class="text-core-600 flex shrink-0 items-center gap-1 text-sm font-medium"
    :aria-expanded="expanded"
    @click="$emit('toggle')"
  >
    {{ expanded ? "See less" : "See all" }}
    <Icon
      name="chevron-down"
      size="16"
      class="transition-transform duration-200"
      :class="{ 'rotate-180': expanded }"
    />
  </button>
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"

defineProps<{ expanded: boolean }>()
defineEmits<{ (e: "toggle"): void }>()
</script>
