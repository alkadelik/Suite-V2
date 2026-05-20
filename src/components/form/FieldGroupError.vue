<template>
  <div :data-validation-target="target" :class="wrapperClass">
    <slot />

    <div v-if="error" class="mt-1 flex items-center text-sm text-red-600">
      <Icon name="info-circle" size="16" class="mr-1 shrink-0" />
      <span>{{ capitalizeFirstChar(error) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { capitalizeFirstChar } from "@/utils/format-strings"
import Icon from "@components/Icon.vue"
import { computed, type HTMLAttributes } from "vue"

interface Props {
  error?: string
  target: string
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()

const wrapperClass = computed(() => ["space-y-3", props.class])
</script>
