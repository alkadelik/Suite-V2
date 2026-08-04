<template>
  <Modal
    :open="open"
    max-width="3xl"
    :show-header="false"
    :handle-padding="false"
    body-class="overflow-hidden rounded-2xl"
    @close="emit('close')"
  >
    <div class="relative">
      <!-- Confetti background -->
      <img
        :src="confetti"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />

      <!-- Close -->
      <button
        type="button"
        class="absolute top-5 right-5 z-10 cursor-pointer text-gray-500 hover:text-gray-700"
        aria-label="Close"
        @click="emit('close')"
      >
        <Icon name="x-close" size="22" />
      </button>

      <!-- Content -->
      <div
        class="relative z-[1] flex flex-col items-center px-6 py-14 text-center md:px-10 md:py-16"
      >
        <img :src="giftImg" alt="" class="h-28 w-28 object-contain" />

        <h2 class="mt-6 text-2xl font-bold text-gray-900 md:text-3xl">Your domain is live</h2>

        <p class="mt-3 max-w-md text-sm text-gray-600">
          Customers can now reach your store directly. SSL encryption is active and your www address
          redirects automatically.
        </p>

        <a
          :href="fullUrl"
          target="_blank"
          rel="noopener"
          class="mt-5 inline-flex max-w-full items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700"
        >
          <span class="truncate">{{ fullUrl }}</span>
          <Icon name="arrow-narrow-up-right" size="16" class="shrink-0" />
        </a>

        <div class="mt-10 flex items-center justify-center gap-3">
          <AppButton label="Done" variant="outlined" color="alt" @click="emit('close')" />
          <AppButton
            label="Go To My Store"
            icon="arrow-right"
            icon-placement="right"
            @click="emit('go-to-store')"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Modal from "@components/Modal.vue"
import AppButton from "@components/AppButton.vue"
import Icon from "@components/Icon.vue"
import confetti from "@/assets/images/celebration.png"
import giftImg from "@/assets/images/gift-1.png"

const props = defineProps<{ open: boolean; domain: string }>()
const emit = defineEmits<{ close: []; "go-to-store": [] }>()

const fullUrl = computed(() => `https://${props.domain.replace(/^https?:\/\//, "")}`)
</script>
