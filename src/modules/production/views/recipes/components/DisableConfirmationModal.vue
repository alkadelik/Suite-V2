<!-- DisableConfirmationModal.vue -->
<script setup lang="ts">
import Icon from "@components/Icon.vue"

defineProps<{
  modelValue: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void
  (e: "confirm"): void
}>()

const close = () => emit("update:modelValue", false)
const confirm = () => emit("confirm")
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop -->
      <button
        type="button"
        class="absolute inset-0 bg-black/40"
        @click="close"
        aria-label="Close"
      />

      <!-- Card -->
      <div class="relative w-[560px] max-w-[calc(100vw-32px)] rounded-2xl bg-white shadow-2xl">
        <!-- Close (top-right) -->
        <button
          type="button"
          class="text-core-500 hover:text-core-700 absolute top-5 right-5 rounded-lg p-2 hover:bg-gray-50"
          @click="close"
          aria-label="Close"
        >
          <Icon name="x" size="18" />
        </button>

        <div class="p-6">
          <!-- Header icon -->
          <div class="mb-4 flex flex-col gap-3">
            <div class="flex w-full justify-between">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <!-- swap icon name if yours differs -->
                <Icon name="trash" size="18" class="text-red-600" />
              </div>
              <div class="flex h-10 w-10 items-center justify-center rounded-full" @click="close">
                <Icon name="x-close" size="18" class="text-gray-600" />
              </div>
            </div>

            <div>
              <h3 class="text-core-900 text-base font-semibold">Disable recipe</h3>
              <p class="text-core-500 mt-1 text-sm">Are you sure you want to disable this recipe</p>
            </div>
          </div>

          <!-- Footer buttons -->
          <div class="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              class="text-core-700 h-11 w-full rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
              :disabled="!!loading"
              @click="close"
            >
              Cancel
            </button>

            <button
              type="button"
              class="h-11 w-full rounded-xl bg-[#B45309] px-5 text-sm font-semibold text-white hover:bg-[#9A3412] disabled:opacity-60"
              :disabled="!!loading"
              @click="confirm"
            >
              {{ loading ? "Disabling..." : "Disable" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
