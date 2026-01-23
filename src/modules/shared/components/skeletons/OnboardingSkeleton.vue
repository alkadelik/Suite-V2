<template>
  <div class="text-center md:w-3xl">
    <div class="mb-4 flex flex-col gap-2 p-3">
      <div class="mx-auto h-8 w-64 animate-pulse rounded bg-gray-200"></div>
      <div class="mx-auto h-4 w-80 animate-pulse rounded bg-gray-200"></div>
    </div>

    <div class="w-full bg-white md:rounded-2xl md:shadow-[0px_16px_32px_-12px_#585C5F1A]">
      <header
        class="bg-base-background flex items-center justify-between border-b border-gray-100 p-5 md:bg-transparent md:p-6"
      >
        <div class="flex items-center gap-2">
          <div class="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
          <div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div class="h-8 w-32 animate-pulse rounded-full bg-gray-200"></div>
      </header>

      <div class="px-3 pb-4 md:px-6">
        <div v-for="i in 7" :key="i" class="my-3 flex items-center gap-3 py-3">
          <div class="h-10 w-10 animate-pulse rounded-xl bg-gray-200"></div>
          <div class="flex-1">
            <div class="mb-2 h-4 w-40 animate-pulse rounded bg-gray-200"></div>
            <div class="h-3 w-64 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div class="h-10 w-28 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
