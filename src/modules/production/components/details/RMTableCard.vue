<script setup lang="ts">
import Icon from "@components/Icon.vue"
const props = defineProps<{
  title: string
  class?: string
  icon?: string
}>()
</script>

<template>
  <div :class="['border-warning-200 cursor-pointer rounded-xl border', props.class]">
    <div class="bg-warning-50 flex items-center gap-2.5 rounded-t-xl p-2">
      <span class="bg-warning-100 flex size-10 items-center justify-center rounded-xl">
        <Icon :name="props.icon || 'calendar2'" :size="24" class="text-primary-700" />
      </span>
      <h3 class="!font-outfit truncate font-medium">{{ title }}</h3>
      <span class="ml-auto" />
      <slot name="append" />
    </div>
    <div class="flex items-center justify-between p-5 pb-3">
      <slot name="body">
        <!-- <div>
          <p class="text-sm font-medium">35</p>
          <p class="text-core-600 text-xs">Stock</p>
        </div>
        <div>
          <p class="text-sm font-medium">{{ formatCurrency(4800) }} / kg</p>
          <p class="text-core-600 text-xs">Last Cost</p>
        </div>
        <div>
          <p class="text-sm font-medium">{{ formatCurrency(4800) }} / kg</p>
          <p class="text-core-600 text-xs">Avg Cost</p>
        </div> -->
      </slot>
    </div>
  </div>
</template>
