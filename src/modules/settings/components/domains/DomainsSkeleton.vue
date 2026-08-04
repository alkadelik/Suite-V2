<template>
  <div class="space-y-6">
    <!-- Section header -->
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1 space-y-2">
        <div class="h-5 w-24 animate-pulse rounded bg-gray-200" />
        <div class="h-3 w-56 animate-pulse rounded bg-gray-200" />
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <div class="hidden h-9 w-36 animate-pulse rounded-lg bg-gray-200 md:block" />
        <div class="hidden h-9 w-32 animate-pulse rounded-lg bg-gray-200 md:block" />
        <div class="h-8 w-8 animate-pulse rounded-lg bg-gray-200 md:hidden" />
      </div>
    </div>

    <!-- Built-in domain card -->
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div class="border-b border-gray-200 px-4 py-3">
        <div class="h-4 w-28 animate-pulse rounded bg-gray-200" />
      </div>
      <div class="flex items-center justify-between gap-4 px-4 py-6">
        <div class="min-w-0 flex-1 space-y-2">
          <div class="h-4 w-56 max-w-full animate-pulse rounded bg-gray-200" />
          <div class="h-5 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div class="h-5 w-5 shrink-0 animate-pulse rounded bg-gray-200" />
      </div>
    </div>

    <!-- Education panel placeholder -->
    <div class="overflow-hidden rounded-xl bg-gray-50">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:gap-10">
        <div class="space-y-4 p-6 md:flex-1 md:p-8">
          <div class="h-7 w-3/4 animate-pulse rounded bg-gray-200" />
          <div class="space-y-2">
            <div class="h-3 w-full animate-pulse rounded bg-gray-200" />
            <div class="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
            <div class="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
          <div class="space-y-2">
            <div v-for="i in 4" :key="i" class="flex items-center gap-2">
              <div class="h-4 w-4 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div class="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div class="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div class="md:shrink-0 md:self-end">
          <div class="h-48 w-full animate-pulse bg-gray-200 md:h-36 md:w-72 lg:h-44 lg:w-96" />
        </div>
      </div>
    </div>

    <!-- How it works panel placeholder -->
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div class="border-b border-gray-200 px-4 py-3">
        <div class="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div class="p-4">
        <ol class="flex flex-col gap-6 md:flex-row md:gap-4">
          <li
            v-for="i in 4"
            :key="i"
            class="flex flex-1 gap-3 md:flex-col md:items-center md:text-center"
          >
            <div class="h-7 w-7 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div class="flex-1 space-y-2 md:flex-none">
              <div class="h-4 w-32 animate-pulse rounded bg-gray-200 md:mx-auto" />
              <div class="h-3 w-full animate-pulse rounded bg-gray-200 md:mx-auto md:w-40" />
              <div class="h-5 w-16 animate-pulse rounded-full bg-gray-200 md:mx-auto" />
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
