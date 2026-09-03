<template>
  <div class="space-y-6">
    <!-- Section header -->
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1 space-y-2">
        <div class="h-5 w-24 animate-pulse rounded bg-gray-200" />
        <div class="h-3 w-72 max-w-full animate-pulse rounded bg-gray-200" />
      </div>
      <div class="hidden h-9 w-44 shrink-0 animate-pulse rounded-lg bg-gray-200 md:block" />
    </div>

    <!-- Key panel -->
    <div class="space-y-5 rounded-2xl bg-gray-50 p-4 md:p-8">
      <div class="h-5 w-32 animate-pulse rounded bg-gray-200" />
      <div class="space-y-2">
        <div class="h-3 w-full animate-pulse rounded bg-gray-200" />
        <div class="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>
      <div class="flex items-start gap-3">
        <div class="h-12 flex-1 animate-pulse rounded-xl bg-gray-200" />
        <div class="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-gray-200" />
      </div>
      <div class="h-11 w-full animate-pulse rounded-lg bg-gray-200 md:w-48" />
    </div>

    <!-- Warning strip -->
    <div class="flex gap-3 rounded-lg border border-gray-200 p-4">
      <div class="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div class="flex-1 space-y-2">
        <div class="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div class="h-3 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
