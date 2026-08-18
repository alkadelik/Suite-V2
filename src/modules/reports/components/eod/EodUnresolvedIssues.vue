<script setup lang="ts">
import Chip from "@components/Chip.vue"
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
              <div class="flex items-center gap-2">
                <h3 class="text-core-800 text-sm font-semibold capitalize">
                  {{ issue.title }}
                </h3>
                <Chip
                  :label="issue.priority"
                  :color="
                    issue.priority === 'high'
                      ? 'error'
                      : issue.priority === 'medium'
                        ? 'warning'
                        : 'blue'
                  "
                  class="!capitalize"
                />
              </div>
              <p class="text-core-700 text-xs">
                {{ issue.description }}
              </p>
            </div>
            <span class="text-xs text-gray-600">
              {{
                new Date(issue.timestamp).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              }}
            </span>
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
