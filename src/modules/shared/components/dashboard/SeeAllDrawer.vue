<template>
  <Drawer :open="open" :title="title" position="right" @close="$emit('close')">
    <div class="flex h-full flex-col gap-4">
      <TextField v-model="query" left-icon="search-lg" placeholder="Search" />
      <div class="flex-1 space-y-3 overflow-y-auto">
        <div v-for="(item, i) in filtered" :key="i">
          <slot name="item" :item="item" />
        </div>
        <p v-if="!filtered.length" class="py-8 text-center text-sm text-gray-500">
          No results found
        </p>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts" generic="T">
import { computed, ref } from "vue"
import Drawer from "@components/Drawer.vue"
import TextField from "@components/form/TextField.vue"

const props = defineProps<{
  open: boolean
  title: string
  items: T[]
  /** Text to match the (client-side) search query against, per item. */
  searchText: (item: T) => string
}>()
defineEmits<{ (e: "close"): void }>()

const query = ref("")
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.items.filter((i) => props.searchText(i).toLowerCase().includes(q)) : props.items
})
</script>
