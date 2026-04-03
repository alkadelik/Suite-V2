<script setup lang="ts">
import Modal from "@components/Modal.vue"
import Icon from "@components/Icon.vue"
import { useSharedStore } from "@modules/shared/store"
import { clipboardCopy } from "@/utils/others"

const sharedStore = useSharedStore()

const supportEmail = "hello@leyyow.com"
const supportPhone = "+2349049653326"
const whatsappNumber = "2349049653326"

const openWhatsApp = () => {
  const pretext = encodeURIComponent("Hi, I need help with my Leyyow account.")
  window.open(`https://wa.me/${whatsappNumber}?text=${pretext}`, "_blank")
}

const openPhoneDialer = () => {
  window.location.href = `tel:${supportPhone}`
}

const openEmail = () => {
  window.location.href = `mailto:${supportEmail}`
}
</script>

<template>
  <Modal
    :open="sharedStore.isSupportModalOpen"
    title="We're here to help"
    max-width="lg"
    variant="bottom-nav"
    @close="sharedStore.closeSupportModal"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <p class="mt-1 text-sm text-gray-600">
          Get in touch with our support team through any of the channels below.
        </p>
      </div>

      <!-- Contact Methods -->
      <div class="space-y-3">
        <!-- Email -->
        <div
          class="group hover:border-core-300 hover:bg-core-50/50 cursor-pointer rounded-lg border border-gray-200 p-4 transition-all"
          @click="openEmail"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div
                class="bg-core-100 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg"
              >
                <Icon name="sms" size="20" class="text-core-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Email</p>
                <p class="mt-1 text-sm text-gray-600">{{ supportEmail }}</p>
              </div>
            </div>

            <button
              @click.stop="clipboardCopy(supportEmail)"
              class="flex size-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
              title="Copy email"
            >
              <Icon name="copy" size="16" />
            </button>
          </div>
        </div>

        <!-- Phone -->
        <div
          class="group hover:border-core-300 hover:bg-core-50/50 cursor-pointer rounded-lg border border-gray-200 p-4 transition-all"
          @click="openPhoneDialer"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div
                class="bg-core-100 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg"
              >
                <Icon name="call" size="20" class="text-core-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Phone</p>
                <p class="mt-1 text-sm text-gray-600">{{ supportPhone }}</p>
              </div>
            </div>

            <button
              @click.stop="clipboardCopy(supportPhone)"
              class="flex size-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
              title="Copy phone"
            >
              <Icon name="copy" size="16" />
            </button>
          </div>
        </div>

        <!-- WhatsApp -->
        <div
          class="group cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-green-300 hover:bg-green-50/50"
          @click="openWhatsApp"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100"
              >
                <Icon name="message-chat-circle" size="20" class="text-green-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">WhatsApp</p>
                <p class="mt-1 text-sm text-gray-600">{{ supportPhone }}</p>
              </div>
            </div>

            <button
              @click="clipboardCopy(supportPhone)"
              class="flex size-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
              title="Copy number"
            >
              <Icon name="copy" size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="rounded-lg bg-gray-50 p-4">
        <div class="flex gap-3">
          <Icon name="info" size="20" class="shrink-0 text-gray-400" />
          <p class="text-xs text-gray-600">
            Our support team typically responds within 1 hour during business days. For urgent
            matters, please call us directly.
          </p>
        </div>
      </div>
    </div>
  </Modal>
</template>
