<script setup lang="ts">
import Icon from "@components/Icon.vue"
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
        <div class="divide-y divide-gray-300 rounded-xl bg-gray-200 p-4">
          <!--  -->
          <div v-for="v in 3" :key="v" class="flex items-center gap-4 py-3">
            <span
              class="flex size-10 items-center justify-center rounded-lg"
              :class="v > 1 ? 'bg-core-200' : 'bg-primary-100'"
            >
              <Icon
                :name="v > 1 ? 'box-filled' : 'flash'"
                size="24"
                :class="v > 1 ? 'text-core-700' : 'text-primary-700'"
              />
            </span>
            <div class="flex-1">
              <h3 class="text-core-800 text-sm font-semibold">
                Size exchange request - Order #12345
              </h3>
              <p class="text-core-700 text-xs">
                Customer Amara wants to swap Ankara Wrap Dress from L to M. Awaiting your
                confirmation.
              </p>
            </div>
            <span class="text-xs text-gray-600">2:30pm</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
