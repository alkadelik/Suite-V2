<template>
  <section>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <div class="flex-1">
        <div class="mb-2 h-6 w-20 animate-pulse rounded bg-gray-200"></div>
        <div class="h-4 w-80 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div class="h-9 w-9 animate-pulse rounded-lg bg-gray-200"></div>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 5" :key="i" class="rounded-xl border border-gray-200">
        <div class="h-60 w-full animate-pulse rounded-t-xl bg-gray-200"></div>
        <div class="p-4">
          <div class="mb-1 h-6 w-24 animate-pulse rounded bg-gray-200"></div>
          <div class="mb-4 h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div class="flex justify-end gap-3">
            <div class="h-10 w-20 animate-pulse rounded-lg bg-gray-200"></div>
            <div class="h-10 w-16 animate-pulse rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
