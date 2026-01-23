<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div class="size-12 animate-pulse rounded-full bg-gray-200"></div>
      <div class="flex-1">
        <div class="mb-2 h-5 w-32 animate-pulse rounded bg-gray-200"></div>
        <div class="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-200 bg-white p-3">
        <div class="mb-2 h-3 w-16 animate-pulse rounded bg-gray-200"></div>
        <div class="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>

    <div class="flex gap-4 border-b border-gray-200 pb-2">
      <div class="h-8 w-28 animate-pulse rounded bg-gray-200"></div>
      <div class="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
      <div class="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
    </div>

    <div class="space-y-4">
      <div v-for="i in 3" :key="i" class="rounded-xl border border-gray-200 bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          <div class="h-5 w-16 animate-pulse rounded-full bg-gray-200"></div>
        </div>
        <div class="flex items-center justify-between">
          <div class="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
          <div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
