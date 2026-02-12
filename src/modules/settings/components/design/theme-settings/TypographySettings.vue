<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Typography</h4>
    </div>
    <div class="p-0 md:p-6">
      <p class="text-core-700 mb-4 text-sm">Select a font pairing to use</p>

      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="font in fontPairings"
          :key="font.id"
          type="button"
          :class="[
            'flex flex-col items-center gap-3 rounded-lg border p-4 transition-colors md:px-4 md:py-6',
            {
              'border-primary-700 bg-primary-50': selectedFont === font.id,
              'border-gray-200 hover:border-gray-300': selectedFont !== font.id,
            },
          ]"
          @click="selectedFont = font.id"
        >
          <span
            class="text-sm font-medium text-gray-900"
            :style="{ fontFamily: font.headerFontFamily }"
            >{{ font.name }}</span
          >
          <p class="text-center text-xs text-gray-600" :style="{ fontFamily: font.bodyFontFamily }">
            The quick brown fox jumps over the lazy dog
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

interface FontPairing {
  id: string
  name: string
  headerFontFamily: string
  bodyFontFamily: string
}

const fontPairings: FontPairing[] = [
  {
    id: "modern",
    name: "Modern",
    headerFontFamily: "Poppins, sans-serif",
    bodyFontFamily: "Inter, sans-serif",
  },
  {
    id: "bold",
    name: "Bold",
    headerFontFamily: "Oswald, sans-serif",
    bodyFontFamily: "Open Sans, sans-serif",
  },
  {
    id: "classic",
    name: "Classic",
    headerFontFamily: "Merriweather, serif",
    bodyFontFamily: "Lato, sans-serif",
  },
  {
    id: "elegant",
    name: "Elegant",
    headerFontFamily: "Playfair Display, serif",
    bodyFontFamily: "Source Sans 3, sans-serif",
  },
  {
    id: "playful",
    name: "Playful",
    headerFontFamily: "Raleway, sans-serif",
    bodyFontFamily: "Nunito, sans-serif",
  },
  {
    id: "traditional",
    name: "Traditional",
    headerFontFamily: "Quattrocento, serif",
    bodyFontFamily: "Quattrocento Sans, sans-serif",
  },
  {
    id: "creative",
    name: "Creative",
    headerFontFamily: "Yeseva One, serif",
    bodyFontFamily: "Josefin Sans, sans-serif",
  },
  {
    id: "friendly",
    name: "Friendly",
    headerFontFamily: "Quicksand, sans-serif",
    bodyFontFamily: "Quicksand, sans-serif",
  },
]

const props = defineProps<{
  font: string
}>()

const emit = defineEmits<{
  "update:font": [value: string]
}>()

const selectedFont = computed({
  get: () => props.font,
  set: (value) => emit("update:font", value),
})
</script>
