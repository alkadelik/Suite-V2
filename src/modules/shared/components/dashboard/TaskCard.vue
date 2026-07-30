<template>
  <TaskCardAggregate
    v-if="task.variant === 'aggregate'"
    :task="task"
    :expanded="expanded"
    :loading-ids="loadingIds"
    @toggle="$emit('toggle')"
    @resolve="$emit('resolve', $event)"
  />
  <TaskCardFlat v-else :task="task" :loading-ids="loadingIds" @resolve="$emit('resolve', $event)" />
</template>

<script setup lang="ts">
import TaskCardAggregate from "./TaskCardAggregate.vue"
import TaskCardFlat from "./TaskCardFlat.vue"
import type { ITask, ITaskResolveEvent } from "./types"

withDefaults(defineProps<{ task: ITask; expanded?: boolean; loadingIds?: string[] }>(), {
  expanded: true,
  loadingIds: () => [],
})

defineEmits<{
  (e: "toggle"): void
  (e: "resolve", payload: ITaskResolveEvent): void
}>()
</script>
