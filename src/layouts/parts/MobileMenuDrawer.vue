<script setup lang="ts">
import { clipboardCopy } from "@/utils/others"
import AppButton from "@components/AppButton.vue"
import Avatar from "@components/Avatar.vue"
import Chip from "@components/Chip.vue"
import Drawer from "@components/Drawer.vue"
import Icon from "@components/Icon.vue"
import { computed } from "vue"

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const storefrontUrl = computed(() => {
  return `shop.leyyow.com/smiles-socks-headquarters`
})

const quickActions = [
  { label: "Popups", icon: "calendar-tick", to: "/popups" },
  { label: "Expenses", icon: "receipt-text", to: "/expenses" },
  { label: "Reports", icon: "pie-chart", to: "/reports" },
  { label: "Discounts", icon: "tag", to: "#" },
  { label: "Support", icon: "life-buoy", to: "#" },
  { label: "Settings", icon: "setting", to: "/settings" },
]
</script>

<template>
  <Drawer
    :open="open"
    @close="emit('close')"
    max-width="full"
    body-class="bg-white"
    :show-header="false"
  >
    <div class="flex justify-end">
      <Icon name="close-circle" size="20" @click="emit('close')" />
    </div>
    <div class="flex items-center gap-4">
      <Avatar name="Smiles HQ" backgroundColor="var(--color-core-950)" class="shrink-0" />
      <div class="min-w-0 flex-1">
        <div class="mt-2 flex items-end gap-2">
          <p class="truncate font-medium">Smiles Socks...</p>
          <Chip label="HQ" class="shrink-0" />
        </div>
        <div class="flex min-w-0 items-center gap-2 text-sm text-gray-600">
          <p class="truncate">{{ storefrontUrl }}</p>
          <Icon
            name="copy"
            size="24"
            class="text-primary-600 shrink-0 cursor-pointer"
            @click="clipboardCopy('https://' + storefrontUrl)"
          />
        </div>
      </div>
    </div>

    <div class="bg-primary-25 mt-6 mb-10 rounded-2xl p-3">
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="action in quickActions"
          :key="action.label"
          class="border-primary-200 text-primary-700 cursor-pointer rounded-xl border bg-white px-2 py-3 text-center"
        >
          <div class="mb-1 flex items-center">
            <div
              class="border-core-200 bg-bloom-50 mx-auto flex size-10 items-center justify-center rounded-xl border p-2 md:mx-0"
            >
              <Icon :name="action.icon" size="28" />
            </div>
          </div>
          <span class="text-xs font-medium md:text-base">{{ action.label }}</span>
        </div>
      </div>
    </div>

    <div
      :class="['relative flex flex-col gap-2 rounded-3xl p-6 text-white']"
      style="background: linear-gradient(136.41deg, #1a2a6c -3.7%, #b21f1f 53.98%, #fdbb2d 99.39%)"
    >
      <div class="w-full max-w-3/4">
        <h3 class="mb-1 text-base font-semibold">Do more with Premium!</h3>
        <p class="mb-4 text-sm">Get advanced tools to mange every aspect of your business..</p>
      </div>
      <AppButton color="alt" label="Upgrade" class="w-full flex-row-reverse" icon="star" />
      <img
        src="@/assets/images/gift.png"
        class="absolute top-4 right-6 h-16 w-auto object-contain"
      />
    </div>
  </Drawer>
</template>
