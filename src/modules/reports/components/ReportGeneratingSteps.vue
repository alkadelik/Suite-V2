<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import type { TReportStep, TReportStepState } from "../composables/useReportProgress"

defineProps<{
  steps: TReportStep[]
  states: TReportStepState[]
  progress: number
  isOverdue?: boolean
  isRefreshing?: boolean
}>()

defineEmits<{ (e: "refresh"): void }>()
</script>

<template>
  <div>
    <div class="w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
      <div class="h-1 w-full bg-gray-200">
        <div
          class="bg-primary-600 h-full transition-[width] duration-500 ease-linear"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <div class="divide-y divide-gray-200 px-4">
        <p
          v-for="(step, index) in steps"
          :key="step.label"
          class="flex items-center gap-4 py-3 text-sm transition-colors"
          :class="states[index] === 'pending' ? 'text-core-400' : 'text-core-600'"
        >
          <Icon :name="step.icon" size="16" />
          <span>{{ step.label }}</span>
          <span class="ml-auto">
            <Icon
              v-if="states[index] === 'done'"
              name="check-circle"
              size="18"
              class="text-primary-600"
            />
            <Icon
              v-else-if="states[index] === 'active'"
              name="loader"
              size="16"
              class="text-core-600 animate-spin"
            />
            <span v-else class="block size-3.5 rounded-full border border-gray-300" />
          </span>
        </p>
      </div>
    </div>

    <div v-if="isOverdue" class="mt-6 text-center">
      <p class="text-core-600 text-sm">
        This is taking longer than usual. It's still running — you can wait or check again.
      </p>
      <AppButton
        variant="outlined"
        size="sm"
        label="Check again"
        icon="refresh-2"
        class="mx-auto mt-3"
        :loading="isRefreshing"
        @click="$emit('refresh')"
      />
    </div>

    <p v-else class="text-core-600 mt-6 text-center text-sm">
      You can leave this page. We'll notify you when it's ready.
    </p>
  </div>
</template>
