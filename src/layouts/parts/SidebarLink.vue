<template>
  <router-link
    :to="to"
    :class="[
      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-base transition-colors duration-200',
      isActive
        ? 'text-primary-700 bg-primary-50 font-semibold'
        : 'text-core-800 hover:bg-primary-50 font-medium',
    ]"
  >
    <Icon :name="props.icon" size="24" />
    <span class="truncate">{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
import Icon from "@components/common/icon.vue"
import { computed } from "vue"
import { useRoute } from "vue-router"

interface Props {
  icon: string
  label: string
  to: string
}

const props = defineProps<Props>()
const route = useRoute()

const isActive = computed(() => route.path === props.to)
</script>
