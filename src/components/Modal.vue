<template>
  <!-- Overlay -->
  <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
    <!-- Modal Card -->
    <div class="relative w-full max-w-lg rounded-lg bg-white shadow-lg">
      <!-- Header -->
      <slot name="header">
        <div class="flex items-center justify-between px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ title }}
          </h2>
          <button @click="close" class="text-gray-400 transition hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </slot>

      <!-- Body -->
      <div class="bg-core-50 max-h-[70vh] overflow-y-auto px-6 py-4">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="px-6 py-4">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
}>()

const emit = defineEmits(["close"])

const close = () => emit("close")
</script>
