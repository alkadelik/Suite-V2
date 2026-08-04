<template>
  <section class="overflow-hidden rounded-lg border border-gray-200 bg-white">
    <header class="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800">
      How it works
    </header>
    <div class="p-4">
      <ol class="relative flex flex-col gap-6 md:flex-row md:gap-4">
        <!-- Mobile: vertical dotted line through the circle column -->
        <div
          aria-hidden="true"
          class="border-primary-300 absolute top-0 bottom-0 left-3.5 border-l border-dashed md:hidden"
        />
        <!-- Desktop: horizontal dotted line through the circle row -->
        <div
          aria-hidden="true"
          class="border-primary-300 absolute top-3.5 right-0 left-0 hidden border-t border-dashed md:block"
        />
        <li
          v-for="item in steps"
          :key="item.step"
          class="relative z-10 flex flex-1 gap-3 md:flex-col md:items-center md:text-center"
        >
          <span
            class="border-primary-500 text-primary-600 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white text-sm font-semibold"
          >
            {{ item.step }}
          </span>
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ item.title }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ item.description }}</p>
            <Chip :label="item.duration" size="sm" color="blue" variant="outlined" class="mt-2" />
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script lang="ts" setup>
import Chip from "@components/Chip.vue"
import { HOW_IT_WORKS_STEPS } from "../../constants"

const steps = HOW_IT_WORKS_STEPS
</script>
