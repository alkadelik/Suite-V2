<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import gridPng from "@/assets/images/empty-grid.png"
import Chip from "@components/Chip.vue"
import { PopupEvent } from "../types"
import { computed } from "vue"
import { clipboardCopy, isStaging } from "@/utils/others"
import Modal from "@components/Modal.vue"
import { watch } from "vue"
import { useSettingsStore } from "@modules/settings/store"

const props = defineProps<{ popup: PopupEvent | null; open: boolean }>()

defineEmits<{ "setup-booth": []; close: [] }>()

watch(
  () => props.popup,
  (newPopup) => {
    console.log("Popup changed:", newPopup)
    // You can add any side effects here if needed when popup changes
  },
)
const storeDetails = computed(() => useSettingsStore().storeDetails)
// const popupUrl2 = computed(() => `popup.leyyow.com/${props.popup?.slug}`)
const popupUrl = computed(
  () =>
    `${isStaging ? "www.storefronts-v2.vercel.app" : "www.buy.leyyow.com"}/${storeDetails.value?.slug}/events/${props.popup?.slug}`,
)
</script>

<template>
  <Modal
    :open="open"
    @close="$emit('close')"
    :show-header="false"
    max-width="2xl"
    body-class="!p-0 !rounded-t-xl"
  >
    <div
      class="flex h-full w-full items-center justify-center gap-6 bg-cover py-8 text-white md:py-20"
      :style="{
        background: `linear-gradient(126.58deg, #7D3D03 -18.65%, #A3530A 49.31%), url(${gridPng})`,
      }"
    >
      <div class="mx-auto flex max-w-4/5 flex-col items-center gap-4">
        <h2 class="text-center text-2xl font-bold">Your Booth is Live 🎉</h2>

        <Chip size="md" class="!bg-primary-900/30 !pr-1 !text-white">
          <span class="inline-block max-w-[240px] truncate">{{ popupUrl }}</span>
          <Chip
            size="sm"
            label="Copy"
            icon="copy"
            variant="filled"
            class="ml-2"
            @click="clipboardCopy(`https://` + popupUrl)"
          />
        </Chip>

        <p class="my-4 text-center text-sm">
          You now have a virtual storefront for this event. Customers can scan your QR code or use
          your link to shop.
        </p>

        <div
          class="border-warning-300 bg-primary-900/50 mt-8 w-full border-y border-dashed py-2 text-center text-base font-bold"
        >
          Next Steps
        </div>

        <ul class="space-y-2 text-left">
          <li class="flex gap-1">
            <img src="@/assets/images/checkbox.svg?url" class="mt-1 h-4 w-4" />
            Add products so visitors can shop
          </li>
          <li class="flex gap-1">
            <img src="@/assets/images/checkbox.svg?url" class="mt-1 h-4 w-4" />
            Share your link/QR code during the event.
          </li>
        </ul>

        <AppButton
          label="Add Products to Booth"
          color="alt"
          class="!text-primary-600 mt-8"
          @click="$router.push(`/popups/${popup?.uid}?setup=true`)"
        />
      </div>
    </div>
  </Modal>
</template>
