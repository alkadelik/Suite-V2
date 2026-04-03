<template>
  <section>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <div class="flex-1">
        <div class="mb-2 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
        <div class="h-4 w-52 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div class="h-9 w-9 animate-pulse rounded-lg bg-gray-200"></div>
      <div class="hidden h-10 w-32 animate-pulse rounded-lg bg-gray-200 md:block"></div>
    </div>

    <div class="mt-6 flex flex-col gap-6 md:flex-row">
      <aside class="hidden w-2/5 flex-shrink-0 md:block">
        <div class="space-y-2">
          <div
            v-for="i in 6"
            :key="i"
            class="h-14 w-full animate-pulse rounded-lg bg-gray-200"
          ></div>
        </div>
      </aside>

      <div class="flex flex-col gap-2 md:hidden">
        <div v-for="i in 6" :key="i" class="h-14 w-full animate-pulse rounded-lg bg-gray-200"></div>
      </div>

      <div class="hidden flex-1 md:block">
        <div class="space-y-6">
          <div>
            <div class="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div class="h-32 w-full animate-pulse rounded-lg bg-gray-200"></div>
          </div>
          <div>
            <div class="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div class="h-32 w-full animate-pulse rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
