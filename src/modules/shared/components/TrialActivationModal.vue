<template>
  <Modal
    :open="open"
    @close="emit('close')"
    :show-header="false"
    body-class="!rounded-2xl bg-white relative overflow-hidden"
    max-width="2xl"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[url('@/assets/images/celebration.png')] bg-cover opacity-30"
    ></div>

    <div class="relative flex justify-end">
      <Icon name="close-circle" size="20" class="cursor-pointer" @click="emit('close')" />
    </div>

    <div
      class="text-core-700 relative flex max-w-screen-md flex-col items-center gap-4 py-8 text-center"
    >
      <img src="@/assets/images/gift.png" class="h-20 w-auto object-contain md:h-[120px]" />

      <h2 class="text-core-800 text-3xl font-bold md:text-4xl">A little something for you</h2>
      <p class="text-lg md:text-xl">
        We've gifted you 15 days of Leyyow Bloom - full access, totally free.
      </p>
      <p class="text-lg md:text-xl">
        Start exploring premium features built to help your business shine.
      </p>

      <hr class="border-core-200 my-6 w-full" />

      <p class="mb-6 text-xl">
        Trial ends on:
        <strong>{{ new Date().toLocaleString("en-US", { dateStyle: "long" }) }}</strong>
      </p>

      <AppButton label="Start Exploring Now" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>
