<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-center gap-2">
          <div class="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
          <div class="h-5 w-5 shrink-0 animate-pulse rounded bg-gray-200" />
        </div>
        <div class="flex flex-wrap gap-1.5">
          <div class="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
          <div class="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
          <div class="h-5 w-28 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
      <div v-if="!builtIn" class="hidden shrink-0 items-center gap-2 md:flex">
        <div class="h-9 w-32 animate-pulse rounded-lg bg-gray-200" />
        <div class="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
      </div>
      <div
        v-if="!builtIn"
        class="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-200 md:hidden"
      />
    </div>

    <!-- Domain Details card -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div class="border-b border-gray-200 px-4 py-4">
        <div class="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div class="space-y-3 p-4">
        <div class="divide-y divide-gray-200 rounded-xl bg-gray-50">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-3 px-4 py-4">
            <div class="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div class="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>

    <template v-if="!builtIn">
      <!-- DNS Records card -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div class="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div class="h-7 w-28 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div class="space-y-3 p-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3">
            <div class="h-5 w-10 shrink-0 animate-pulse rounded bg-gray-200" />
            <div class="h-5 w-16 shrink-0 animate-pulse rounded bg-gray-200" />
            <div class="h-5 flex-1 animate-pulse rounded bg-gray-200" />
            <div class="h-5 w-24 shrink-0 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>

      <!-- Redirect & Routing card -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="border-b border-gray-200 px-4 py-3">
          <div class="h-4 w-36 animate-pulse rounded bg-gray-200" />
        </div>
        <div class="flex items-center justify-between gap-3 px-4 py-4">
          <div class="min-w-0 flex-1 space-y-1">
            <div class="h-3 w-10 animate-pulse rounded bg-gray-200" />
            <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
          <div class="h-4 w-4 shrink-0 animate-pulse rounded bg-gray-200" />
          <div class="min-w-0 flex-1 space-y-1">
            <div class="ml-auto h-3 w-10 animate-pulse rounded bg-gray-200" />
            <div class="ml-auto h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>

      <!-- Actions card -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="border-b border-gray-200 px-4 py-3">
          <div class="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        <div class="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div class="space-y-2">
            <div class="h-4 w-40 animate-pulse rounded bg-gray-200" />
            <div class="h-3 w-64 max-w-full animate-pulse rounded bg-gray-200" />
          </div>
          <div class="h-10 w-44 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ builtIn?: boolean }>()
</script>
