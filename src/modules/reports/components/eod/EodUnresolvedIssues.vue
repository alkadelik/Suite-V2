<script setup lang="ts">
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import { IEODReport } from "@modules/reports/types"

defineProps<{ data: IEODReport | null }>()
</script>

<template>
  <section v-bind="$attrs">
    <!-- heading -->
    <header class="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-5 pt-4 pb-3">
      <span class="text-sm text-gray-600 italic">09</span>
      <h3 class="text-base font-semibold text-gray-900">Unresolved Issues</h3>
      <span class="ml-auto text-xs font-medium text-gray-600 uppercase">Needs Attention</span>
    </header>
    <!-- content -->
    <div class="py-4">
      <div class="rounded-xl bg-white p-6 shadow">
        <div
          v-if="data?.unresolved_issues?.length"
          class="divide-y divide-gray-300 rounded-xl bg-gray-200 p-4"
        >
          <!--  -->
          <div
            v-for="(issue, v) in data?.unresolved_issues ?? []"
            :key="v"
            class="flex items-center gap-4 py-3"
          >
            <span
              class="flex size-10 items-center justify-center rounded-lg"
              :class="v > 0 ? 'bg-core-200' : 'bg-primary-100'"
            >
              <Icon
                :name="v > 0 ? 'box-filled' : 'flash'"
                size="24"
                :class="v > 0 ? 'text-core-700' : 'text-primary-700'"
              />
            </span>
            <div class="flex-1">
              <h3 class="text-core-800 text-sm font-semibold">
                {{ issue.type }}
              </h3>
              <p class="text-core-700 text-xs">
                {{ issue.details }}
              </p>
            </div>
            <span class="text-xs text-gray-600">{{ issue.count }}</span>
            <!-- TODO: should be time not issue.count -->
          </div>
        </div>
        <EmptyState
          v-else
          title="No unresolved issues"
          description="No reported issues that need your attention. Great work!"
          class="!min-h-[25vh] py-4! shadow-none!"
        />
      </div>
    </div>
  </section>
</template>
