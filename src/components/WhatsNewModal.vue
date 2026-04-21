<script setup lang="ts">
import AppButton from "./AppButton.vue"
import Modal from "./Modal.vue"

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// const NEW_FEATURES = [
//   { title: "", description: "", image: "/whatsnew/star.png" },
//   { title: "", description: "", image: "/whatsnew/star.png" },
// ]
</script>

<template>
  <Modal
    :open="open"
    :show-header="false"
    @close="emit('close')"
    body-class="!bg-[#1A1919] !rounded-t-2xl"
  >
    <div class="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center text-white">
      <div class="relative mx-auto flex h-[220px] w-[320px] items-center justify-center">
        <!-- Blurred radial gradient background -->
        <div
          class="absolute top-1/2 left-1/2 z-0 h-48 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style="
            background: radial-gradient(circle, #cb532452 60%, transparent 100%);
            filter: blur(32px);
          "
        ></div>
        <!-- Star image in the center, above the blur -->
        <img src="/whatsnew/stars.png" class="relative z-10 w-80 object-contain" />
      </div>

      <h3 class="font-sato mt-12 text-xl font-semibold">What's New on Leyyow</h3>
      <p class="mb-3 text-sm">
        We've rolled out powerful upgrades to help you track better, ship smarter, and understand
        your numbers with clarity.
      </p>

      <AppButton size="sm" label="Next" color="alt" icon="arrow-right" class="!flex-row-reverse" />
    </div>
  </Modal>
</template>
