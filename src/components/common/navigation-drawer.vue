<script setup>
import { defineProps, defineEmits } from "vue";
import AppButton from "./app-button.vue";

// Props
const props = defineProps({
  open: Boolean,
  title: String,
  position: { type: String, default: "right" }, // left or right
  persistent: { type: Boolean, default: false }, // Prevent closing on overlay click
});

const emit = defineEmits(["update:open"]);

// Close handler
const closeDrawer = () => {
  if (!props.persistent) {
    emit("update:open", false);
  }
};
</script>

<template>
  <div>
    <!-- Overlay -->
    <transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        @click="closeDrawer"
      ></div>
    </transition>

    <!-- Drawer -->
    <transition :name="position === 'left' ? 'slide-left' : 'slide-right'">
      <div
        v-if="open"
        class="fixed inset-y-0 bg-white shadow-xl z-50 flex flex-col transition-all w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
        :class="{
          'left-0': position === 'left',
          'right-0': position === 'right',
        }"
      >
        <!-- Header -->
        <div
          class="py-3 px-4 border-b border-gray-200 dark:border-brand-800 bg-white dark:bg-brand-800 sticky top-0 z-20 flex items-center gap-8 truncate"
        >
          <div class="flex-1 truncate">
            <h2 v-if="title" class="text-lg font-semibold dark:text-white truncate">
              {{ title }}
            </h2>
            <p v-if="subtitle" class="text-sm text-gray-600 dark:text-gray-300 truncate">
              {{ subtitle }}
            </p>
          </div>
          <AppButton
            variant="outlined"
            icon="mdi:close"
            class="!h-8 !w-8"
            @click="emit('update:open', false)"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Animations */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
