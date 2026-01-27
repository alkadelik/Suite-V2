<template>
  <div>
    <!-- Parent Item -->
    <button
      @click="toggleExpanded"
      :class="[
        'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-base transition-colors duration-200',
        isExpanded || hasActiveChild
          ? 'text-core-800 bg-gray-100 font-semibold'
          : 'text-core-800 font-medium hover:bg-gray-50',
      ]"
    >
      <div class="flex items-center gap-3">
        <Icon :name="icon" :size="24" />
        <span>{{ label }}</span>
      </div>
      <Icon
        name="chevron-down"
        :size="20"
        :class="['transition-transform duration-200', isExpanded ? 'rotate-180' : '']"
      />
    </button>

    <!-- Children Items -->
    <div
      v-if="children && children.length > 0"
      :class="[
        'overflow-hidden transition-all duration-200 ease-in-out',
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
      ]"
    >
      <div class="mt-1 ml-6 space-y-1 border-l-2 border-gray-200 pl-3">
        <SidebarLink v-for="child in children" :key="child.label" v-bind="child" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import Icon from "@components/Icon.vue"
import SidebarLink from "./SidebarLink.vue"

interface ChildItem {
  icon: string
  label: string
  to: string
}

interface Props {
  icon: string
  label: string
  children?: ChildItem[]
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpanded: false,
})

const route = useRoute()
const isExpanded = ref(props.defaultExpanded)

const hasActiveChild = computed(() => {
  if (!props.children) return false
  return props.children.some((child) => route.path === child.to)
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Auto-expand if a child is active
if (hasActiveChild.value) {
  isExpanded.value = true
}
</script>
