<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { ref } from "vue"

const THEMES = [
  {
    name: "Dawn",
    description: "A clean, modern theme with plenty of white space and focus on your products.",
    image: "dawn-theme.png",
  },
  {
    name: "Ember",
    description: "A bold, high-contrast theme designed to make your brand unforgettable.",
    image: "ember-theme.png",
  },
  {
    name: "Heritage",
    description: "A timeless, structured theme with a familiar layout customers trust.",
    image: "heritage-theme.png",
  },
  {
    name: "Grace",
    description: "A refined, elegant theme with soft typography and subtle detailing.",
    image: "grace-theme.png",
  },
  {
    name: "Bloom",
    description:
      "A vibrant, colorful theme with playful layouts that bring energy to your storefront.",
    image: "bloom-theme.png",
  },
]

const defaultTheme = ref("Dawn")

const openPreview = (themeName: string) => {
  window.open(`/${themeName.toLowerCase()}`, "_blank")
}
</script>

<template>
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="theme in THEMES"
      :key="theme.name"
      class="cursor-pointer rounded-xl"
      :class="
        defaultTheme === theme.name ? 'border-primary-600 border-2' : 'border border-gray-200'
      "
    >
      <div class="relative h-60 rounded-xl">
        <img src="" class="h-full rounded-t-xl bg-gray-100" />
        <Icon
          v-if="defaultTheme === theme.name"
          name="check-filled"
          size="20"
          class="text-primary-600 absolute top-4 right-4"
        />
      </div>
      <div class="rounded-b-xl p-4" :class="defaultTheme === theme.name ? 'bg-primary-50' : ''">
        <div class="flex items-center gap-1">
          <h4 class="mb-1 text-lg font-medium">{{ theme.name }}</h4>
          <Chip
            v-if="defaultTheme === theme.name"
            show-dot
            label="Default"
            size="sm"
            variant="outlined"
          />
        </div>
        <p class="text-sm text-gray-600">
          {{ theme.description }}
        </p>

        <div class="mt-4 flex justify-end gap-3">
          <AppButton color="alt" label="Preview" @click="openPreview(theme.name)" />
          <AppButton label="Apply" @click="defaultTheme = theme.name" />
        </div>
      </div>
    </div>
  </div>
</template>
