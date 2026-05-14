<template>
  <Modal
    :open="open"
    max-width="500px"
    :show-header="false"
    :handle-padding="false"
    @close="emit('close')"
  >
    <div class="relative overflow-hidden p-6 text-center">
      <img
        :src="confetti"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div class="relative">
        <button
          type="button"
          class="absolute -top-2 -right-2 cursor-pointer text-gray-500"
          aria-label="Close"
          @click="emit('close')"
        >
          <Icon name="close-circle" size="22" />
        </button>
        <div class="text-5xl">🎁</div>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">Your domain is live</h2>
        <p class="mt-2 text-sm text-gray-600">
          Customers can now reach your store directly. SSL encryption is active and your www address
          redirects automatically.
        </p>
        <a
          :href="fullUrl"
          target="_blank"
          rel="noopener"
          class="bg-primary-50 text-primary-700 mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
        >
          {{ fullUrl }}
          <Icon name="arrow-up-square" size="16" />
        </a>
        <div class="mt-6 flex items-center justify-center gap-3">
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

const props = defineProps<{ open: boolean; domain: string }>()
const emit = defineEmits<{ close: []; "go-to-store": [] }>()

const fullUrl = computed(() => `https://${props.domain.replace(/^https?:\/\//, "")}`)
</script>
