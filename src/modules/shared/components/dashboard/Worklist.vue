<template>
  <section class="md:rounded-2xl md:border md:border-gray-200 md:bg-white md:p-5">
    <div class="mb-4 flex items-center gap-2">
      <h2 class="text-core-800 font-sato text-base font-semibold">Today's Worklist</h2>
      <Chip
        v-if="!loading"
        :label="`${count} ${count === 1 ? 'Task' : 'Tasks'}`"
        color="alt"
        size="sm"
      />
    </div>

    <!-- loading -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="n in 3"
        :key="`wl-skeleton-${n}`"
        class="h-28 animate-pulse rounded-2xl bg-gray-100"
      />
    </div>

    <!-- error -->
    <div
      v-else-if="error"
      class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500"
    >
      We couldn't load your worklist. Please try again.
    </div>

    <!-- empty -->
    <EmptyState
      v-else-if="!tasks.length"
      title="Nothing needs you right now"
      description="When orders, stock or popups need action, they'll show up here."
    />

    <!-- tasks in server rank order (no client sorting) -->
    <div v-else class="space-y-4">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :expanded="isExpanded(task.id)"
        :loading-ids="loadingIds"
        @toggle="toggle(task.id)"
        @resolve="resolve"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import TaskCard from "./TaskCard.vue"
import { useTaskActions } from "./useTaskActions"
import type { ITask } from "./types"

withDefaults(
  defineProps<{ tasks?: ITask[]; count?: number; loading?: boolean; error?: boolean }>(),
  {
    tasks: () => [],
    count: 0,
    loading: false,
    error: false,
  },
)

const { loadingIds, resolve } = useTaskActions()

// Aggregate cards default to collapsed (first 3 rows); we track the EXPANDED set
// so the state survives a background refetch (DASH-23).
const expandedSet = reactive(new Set<string>())
const isExpanded = (id: string) => expandedSet.has(id)
function toggle(id: string) {
  if (expandedSet.has(id)) expandedSet.delete(id)
  else expandedSet.add(id)
}
</script>
