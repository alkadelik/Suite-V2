<template>
  <div>
    <!-- Title row: product name + action buttons (mirrors the header) -->
    <div class="flex flex-col justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="h-7 w-40 animate-pulse rounded-md bg-gray-200 md:w-56"></div>
        <div class="flex-1"></div>
        <div class="flex items-center gap-1">
          <div class="hidden h-10 w-32 animate-pulse rounded-lg bg-gray-200 lg:block"></div>
          <div class="hidden h-10 w-40 animate-pulse rounded-lg bg-gray-200 lg:block"></div>
          <div class="h-10 w-10 animate-pulse rounded-lg bg-gray-200 lg:hidden"></div>
        </div>
      </div>

      <!-- Chips row -->
      <div class="inline-flex flex-wrap gap-2">
        <div class="h-6 w-24 animate-pulse rounded-full bg-gray-200"></div>
        <div class="h-6 w-28 animate-pulse rounded-full bg-gray-200"></div>
        <div class="h-6 w-20 animate-pulse rounded-full bg-gray-200"></div>
      </div>
    </div>

    <!-- Image gallery — mobile: primary image + 4 thumbnails -->
    <div class="mt-6 mb-6 md:hidden">
      <div class="mb-3 h-30 w-full animate-pulse rounded-lg bg-gray-200"></div>
      <div class="grid grid-cols-4 gap-2">
        <div
          v-for="i in 4"
          :key="i"
          class="aspect-square animate-pulse rounded-lg bg-gray-200"
        ></div>
      </div>
    </div>

    <!-- Image gallery — desktop: 2/1 primary (col-span-2) + square thumbnails -->
    <div class="mt-6 mb-6 hidden w-full grid-cols-6 gap-3 md:grid" style="grid-auto-rows: 1fr">
      <div
        class="col-span-2 animate-pulse rounded-lg bg-gray-200"
        style="aspect-ratio: 2 / 1"
      ></div>
      <div
        v-for="i in 4"
        :key="i"
        class="col-span-1 aspect-square animate-pulse rounded-lg bg-gray-200"
      ></div>
    </div>

    <!-- Tabs -->
    <div class="mt-5 mb-4 flex gap-6 border-b border-gray-200 pb-3 md:mt-8">
      <div class="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
      <div class="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
      <div class="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
      <div class="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
    </div>

    <!-- Overview: summary cards -->
    <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-200 bg-white p-4">
        <div class="mb-3 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        <div class="h-7 w-16 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>

    <!-- Overview: details (7/12) + attributes (5/12) cards -->
    <div class="mt-8 flex flex-col gap-3 md:flex-row">
      <div class="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:w-7/12">
        <div class="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200"></div>
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between">
            <div class="h-4 w-28 animate-pulse rounded bg-gray-200"></div>
            <div class="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      <div class="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:w-5/12">
        <div class="mb-4 h-5 w-28 animate-pulse rounded bg-gray-200"></div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i">
            <div class="mb-2 h-3 w-16 animate-pulse rounded bg-gray-200"></div>
            <div class="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
