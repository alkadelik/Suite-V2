<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import AppButton from "./app-button.vue";

// Props
const props = defineProps({
  open: Boolean,
  title: String,
  size: { type: String, default: "md" }, // sm, md, lg
  persistent: { type: Boolean, default: false }, // Prevent closing on overlay click
  centered: Boolean,
  fullscreen: Boolean,
  back: { type: Function, default: null }, // Show back button
  contentClass: { type: String, default: "" }, // Additional classes for content area
});

const emit = defineEmits(["update:open"]);

// Close handler (respects persistent prop)
const closeModal = () => {
  if (!props.persistent) emit("update:open", false);
};
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <!-- Overlay -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal" />
      </TransitionChild>

      <!-- Modal Wrapper -->
      <div
        class="fixed inset-0 flex md:items-center justify-center md:p-4"
        :class="centered ? 'items-center p-2' : 'items-end'"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300 transform"
          enter-from="translate-y-full opacity-0"
          enter-to="translate-y-0 opacity-100"
          leave="ease-in duration-200 transform"
          leave-from="translate-y-0 opacity-100"
          leave-to="translate-y-full opacity-0"
        >
          <DialogPanel
            :class="{
              'w-full max-w-sm': size === 'sm',
              'w-full max-w-md': size === 'md',
              'w-full max-w-lg': size === 'lg',
            }"
            class="transform overflow-hidden transition-all"
          >
            <!-- Close Button -->
            <div v-if="!fullscreen" class="flex justify-end p-2">
              <AppButton
                variant="outlined"
                icon="solar:close-circle-bold-duotone"
                icon-class="h-8 w-8"
                small
                @click="emit('update:open', false)"
              />
            </div>

            <!-- Modal Content -->
            <div
              class="overflow-y-auto bg-brand-100"
              :class="[
                { 'rounded-b-2xl': centered },
                fullscreen ? 'h-screen' : 'max-h-[calc(90vh-64px)] rounded-t-2xl md:rounded-b-2xl',
              ]"
            >
              <!-- Modal Header -->
              <DialogTitle
                v-if="title"
                as="div"
                class="flex gap-2 py-2 px-4 border-b border-brand-200 bg-brand-100 sticky top-0 z-20"
              >
                <div class="flex gap-3 items-center">
                  <AppButton
                    v-if="props.back"
                    variant="text"
                    :icon="'solar:square-arrow-left-bold-duotone'"
                    small
                    icon-class="!h-7 !w-7 !text-brand-400"
                    @click="props.back"
                  />
                  <slot name="title">
                    <h2 class="text-lg font-semibold flex-1">{{ title }}</h2>
                  </slot>
                </div>
                <AppButton
                  v-if="fullscreen"
                  variant="text"
                  icon="solar:close-circle-bold-duotone"
                  icon-class="h-8 w-8"
                  small
                  @click="emit('update:open', false)"
                />
              </DialogTitle>

              <!-- Slot for Dynamic Content -->
              <div class="p-4" :class="contentClass">
                <slot />
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
