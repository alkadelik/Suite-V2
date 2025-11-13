<template>
  <component
    :is="props.to ? 'router-link' : 'button'"
    @click="emit('click')"
    :to="props.to"
    :class="[
      'group flex items-center rounded-xl transition-colors duration-200',
      isActive
        ? 'text-primary-700 bg-primary-50 font-medium lg:font-semibold'
        : 'text-core-800 hover:bg-primary-50 lg:font-medium',
      isMobile ? 'flex-col gap-1 p-2 text-xs' : 'flex-row gap-3 px-3 py-2.5 text-base',
      isActive && isMobile && '!bg-transparent',
      props.class || '',
    ]"
  >
    <Icon :name="props.icon" :size="isMobile ? 18 : 24" />
    <span class="truncate">{{ label }}</span>
  </component>
</template>

<script setup lang="ts">
import Icon from "@components/Icon.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"
import { useRoute } from "vue-router"

interface Props {
  icon: string
  label: string
  to?: string
  class?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: "click"): void }>()
const route = useRoute()
const isMobile = useMediaQuery("(max-width: 1024px)")

const isActive = computed(() => route.path === props.to)
</script>
