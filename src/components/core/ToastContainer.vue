<template>
  <Teleport to="body">
    <div class="fixed top-5 right-5 z-[9999] max-w-md space-y-2">
      <TransitionGroup name="toast" tag="div" class="space-y-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex w-full gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg',
            toastTypeClasses[toast.type],
          ]"
          role="alert"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <!-- Icon -->
          <div :class="iconClasses[toast.type]" class="flex-shrink-0">
            <component :is="toastIcons[toast.type]" class="h-5 w-5" />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
            <p v-if="toast.message" :class="messageClasses[toast.type]">{{ toast.message }}</p>
          </div>

          <!-- Close button -->
          <button
            type="button"
            @click="removeToast(toast.id)"
            class="ml-2 flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:outline-none"
            :aria-label="`Close ${toast.type} notification`"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              class="text-gray-400 hover:text-gray-600"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-miterlimit="10"
                stroke-width="1.5"
                d="m7.757 16.243l8.486-8.486m0 8.486L7.757 7.757"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { h } from "vue"
import { useToast } from "@/composables/useToast"

const { toasts, removeToast } = useToast()

// Toast type styling
const toastTypeClasses = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  info: "border-blue-200 bg-blue-50",
}

const iconClasses = {
  success: "text-green-600",
  error: "text-red-600",
  info: "text-blue-600",
}

const messageClasses = {
  success: "text-green-700 text-sm mt-1",
  error: "text-red-700 text-sm mt-1",
  info: "text-blue-700 text-sm mt-1",
}

// Icons as render functions for better performance
const toastIcons = {
  success: () =>
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        class: "h-5 w-5",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M5 13l4 4L19 7",
        }),
      ],
    ),

  error: () =>
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        class: "h-5 w-5",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M6 18L18 6M6 6l12 12",
        }),
      ],
    ),

  info: () =>
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        class: "h-5 w-5",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        }),
      ],
    ),
}
</script>

<style scoped>
/* Toast animations */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
