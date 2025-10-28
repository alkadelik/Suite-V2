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
            :style="{ fontFamily: font.fontFamily }"
            >{{ font.name }}</span
          >
          <p class="text-center text-xs text-gray-600" :style="{ fontFamily: font.fontFamily }">
            The quick brown fox jumps over the lazy dog
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

interface FontPairing {
  id: string
  name: string
  fontFamily: string
}

const fontPairings: FontPairing[] = [
  { id: "modern", name: "Modern", fontFamily: "Poppins, sans-serif" },
  { id: "bold", name: "Bold", fontFamily: "Oswald, sans-serif" },
  { id: "classic", name: "Classic", fontFamily: "Merriweather, serif" },
  { id: "elegant", name: "Elegant", fontFamily: "Playfair Display, serif" },
  { id: "playful", name: "Playful", fontFamily: "Raleway, sans-serif" },
  { id: "traditional", name: "Traditional", fontFamily: "Quattrocento, serif" },
  { id: "creative", name: "Creative", fontFamily: "Yeseva One, serif" },
  { id: "friendly", name: "Friendly", fontFamily: "Quicksand, sans-serif" },
]

const selectedFont = ref<string>("modern")

// Expose method to get values
const getValues = () => {
  return {
    font: selectedFont.value,
  }
}

defineExpose({
  getValues,
})
</script>
