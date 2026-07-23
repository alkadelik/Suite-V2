<script setup lang="ts">
defineProps<{ title: string }>()
defineEmits<{ retry: []; exit: [] }>()
</script>

<template>
  <div
    class="fixed inset-0 z-[3010] flex items-center justify-center bg-[var(--walkthrough-overlay)] p-4"
  >
    <section
      class="w-full max-w-sm rounded-[var(--walkthrough-radius)] bg-[var(--walkthrough-surface)] shadow-[var(--walkthrough-shadow)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-anchor-title"
    >
      <div class="border-b border-[var(--walkthrough-divider)] px-4 py-3">
        <h2 id="missing-anchor-title" class="text-base font-semibold text-white">{{ title }}</h2>
      </div>
      <div class="p-4">
        <p class="text-sm leading-6 text-[var(--walkthrough-body)]">
          This part of the page is still loading or is no longer available.
        </p>
        <div class="mt-5 flex justify-end gap-3">
          <button
            class="px-3 py-2 text-sm font-semibold text-[var(--walkthrough-back)]"
            @click="$emit('exit')"
          >
            Exit
          </button>
          <button
            class="rounded-xl bg-[var(--walkthrough-action)] px-4 py-2 text-sm font-semibold text-white"
            @click="$emit('retry')"
          >
            Retry
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
