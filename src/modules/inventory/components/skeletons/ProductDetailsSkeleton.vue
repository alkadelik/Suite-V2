<template>
  <div>
    <div class="flex flex-col justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="h-7 w-48 animate-pulse rounded bg-gray-200"></div>
        <div class="flex-1"></div>
        <div class="flex items-center gap-1">
          <div class="hidden h-10 w-28 animate-pulse rounded-lg bg-gray-200 lg:block"></div>
          <div class="hidden h-10 w-36 animate-pulse rounded-lg bg-gray-200 lg:block"></div>
          <div class="h-10 w-10 animate-pulse rounded-lg bg-gray-200 lg:hidden"></div>
        </div>
      </div>
      <div class="inline-flex flex-wrap gap-2">
        <div class="h-6 w-20 animate-pulse rounded-full bg-gray-200"></div>
        <div class="h-6 w-24 animate-pulse rounded-full bg-gray-200"></div>
        <div class="h-6 w-20 animate-pulse rounded-full bg-gray-200"></div>
      </div>
    </div>

    <div class="mt-6 flex gap-4">
      <div class="h-64 w-64 flex-shrink-0 animate-pulse rounded-xl bg-gray-200"></div>
      <div class="hidden flex-1 gap-2 md:flex">
        <div class="h-20 w-20 animate-pulse rounded-lg bg-gray-200"></div>
        <div class="h-20 w-20 animate-pulse rounded-lg bg-gray-200"></div>
        <div class="h-20 w-20 animate-pulse rounded-lg bg-gray-200"></div>
      </div>
    </div>

    <div class="mt-5 mb-4 flex gap-4 md:mt-8">
      <div class="h-10 w-24 animate-pulse rounded-lg bg-gray-200"></div>
      <div class="h-10 w-20 animate-pulse rounded-lg bg-gray-200"></div>
      <div class="h-10 w-16 animate-pulse rounded-lg bg-gray-200"></div>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-200 bg-white p-4">
        <div class="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        <div class="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>

    <div class="mt-6 rounded-xl border border-gray-200 bg-white p-4">
      <div class="mb-4 flex items-center justify-between">
        <div class="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
        <div class="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div class="space-y-4">
        <div v-for="i in 4" :key="i" class="flex justify-between">
          <div class="h-4 w-28 animate-pulse rounded bg-gray-200"></div>
          <div class="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
