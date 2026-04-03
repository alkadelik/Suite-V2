<template>
  <Teleport to="body">
    <div class="fixed top-5 right-5 z-[9999] max-w-md space-y-2">
      <TransitionGroup name="toast" tag="div" class="space-y-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex w-full gap-3 rounded-xl border px-4 py-3 shadow-lg',
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
            <p class="text-core-800 mt-1 text-sm">{{ toast.message }}</p>
          </div>

          <!-- Close button -->
          <button
            type="button"
            @click="removeToast(toast.id)"
            class="ml-2 flex-shrink-0 rounded-lg transition-colors focus:ring-2 focus:outline-none"
            :aria-label="`Close ${toast.type} notification`"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
import Icon from "@components/Icon.vue"

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

// Icons as render functions for better performance
const toastIcons = {
  success: () => h(Icon, { name: "check-circle", size: "20", class: iconClasses.success }),
  error: () => h(Icon, { name: "info-circle", size: "20", class: iconClasses.error }),
  info: () => h(Icon, { name: "info-circle", size: "20", class: `${iconClasses.info} rotate-180` }),
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
