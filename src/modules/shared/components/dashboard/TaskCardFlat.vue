<template>
  <div
    class="flex items-center justify-between gap-3 rounded-2xl border p-4 md:gap-4 md:p-5"
    :class="toneClass"
  >
    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="text-core-900 font-sato text-base font-bold md:text-lg">{{ task.title }}</h3>
        <Chip
          v-if="task.amountLabel"
          :label="task.amountLabel"
          :color="amountChipColor"
          variant="outlined"
          size="sm"
        />
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

    <AppButton
      v-if="task.actionLabel"
      :label="task.actionLabel"
      variant="filled"
      size="sm"
      :loading="loadingIds.includes(task.id)"
      class="shrink-0"
      @click="onAction"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Chip from "@components/Chip.vue"
import AppButton from "@components/AppButton.vue"
import type { ITask, ITaskResolveEvent } from "./types"
import type { TChipColor } from "@modules/shared/types"

const props = withDefaults(defineProps<{ task: ITask; loadingIds?: string[] }>(), {
  loadingIds: () => [],
})

const emit = defineEmits<{ (e: "resolve", payload: ITaskResolveEvent): void }>()

const toneClass = computed(() => {
  switch (props.task.tone) {
    case "danger":
      return "bg-error-50 border-error-200"
    case "warning":
      return "bg-warning-50 border-warning-300"
    default:
      return "border-gray-200 bg-white"
  }
})

const amountChipColor = computed<TChipColor>(() =>
  props.task.tone === "warning" ? "warning" : "error",
)

function onAction() {
  if (!props.task.action) return
  emit("resolve", { action: props.task.action, targetId: props.task.id })
}
</script>
