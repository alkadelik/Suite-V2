<template>
  <div class="overflow-hidden rounded-2xl border bg-white" :class="borderClass">
    <!-- tone header (with a colored bottom divider into the rows) -->
    <div
      class="flex items-start justify-between gap-3 border-b px-4 py-4 md:px-5"
      :class="headerBgClass"
    >
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-core-900 font-sato text-base font-bold md:text-lg">{{ task.title }}</h3>
          <Chip
            v-for="tag in task.tags"
            :key="tag.label"
            :label="tag.label"
            :color="tag.color as TChipColor"
            :show-dot="tag.dot"
            size="sm"
          />
        </div>
        <p v-if="task.subtitle" class="text-core-600 mt-1 text-sm">{{ task.subtitle }}</p>
      </div>

      <button
        type="button"
        class="text-core-700 flex shrink-0 items-center gap-1 text-sm font-medium"
        :aria-expanded="expanded"
        :aria-controls="bodyId"
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
    </div>

    <!-- rows -->
    <div v-show="expanded" :id="bodyId" class="space-y-3 bg-white p-3 md:p-4">
      <TaskRow
        v-for="row in task.rows"
        :key="row.id"
        :row="row"
        :loading="loadingIds.includes(row.id)"
        @action="onRowAction"
      />

      <div v-if="task.bulkActionLabel" class="pt-1">
        <AppButton
          :label="task.bulkActionLabel"
          variant="filled"
          size="sm"
          :loading="loadingIds.includes(task.id)"
          @click="onBulk"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import TaskRow from "./TaskRow.vue"
import type { ITask, ITaskRow, ITaskResolveEvent } from "./types"
import type { TChipColor } from "@modules/shared/types"

const props = withDefaults(
  defineProps<{ task: ITask; expanded?: boolean; loadingIds?: string[] }>(),
  { expanded: true, loadingIds: () => [] },
)

const emit = defineEmits<{
  (e: "toggle"): void
  (e: "resolve", payload: ITaskResolveEvent): void
}>()

const bodyId = computed(() => `worklist-body-${props.task.id}`)

const borderClass = computed(() =>
  props.task.tone === "danger" ? "border-error-200" : "border-warning-300",
)
const headerBgClass = computed(() =>
  props.task.tone === "danger"
    ? "bg-error-50 border-error-200"
    : "bg-warning-50 border-warning-300",
)

function onRowAction(row: ITaskRow) {
  emit("resolve", { action: row.action, targetId: row.id })
}

function onBulk() {
  const rows = props.task.rows ?? []
  emit("resolve", {
    action: rows[0]?.action ?? "mark_sent",
    targetId: props.task.id,
    rowIds: rows.map((r) => r.id),
  })
}
</script>
