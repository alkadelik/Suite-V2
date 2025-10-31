<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Color</h4>
    </div>
    <div class="p-0 md:p-6">
      <p class="text-core-700 mb-4 text-sm">
        Choose a preset color palette, or select Custom to personalize your colors.
      </p>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="palette in colorPalettes"
          :key="palette.id"
          type="button"
          :class="[
            'flex flex-col items-center gap-3 rounded-lg border p-4 md:px-4 md:py-6',
            {
              'border-primary-700 bg-primary-50': selectedPalette === palette.id,
              'border-gray-200 hover:border-gray-300': selectedPalette !== palette.id,
            },
          ]"
          @click="selectedPalette = palette.id"
        >
          <span class="text-sm font-medium text-gray-900">{{ palette.name }}</span>
          <div class="flex gap-1 md:gap-1.5">
            <div
              v-for="(color, index) in palette.colors"
              :key="index"
              class="h-2 w-5 rounded-full md:w-8"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </button>
      </div>

      <!-- Custom Color Fields -->
      <div v-if="selectedPalette === 'custom'" class="mt-6 space-y-4">
        <ColorPickerField
          :model-value="customColorsModel.primary"
          label="Primary Color"
          name="primary_color"
          @update:model-value="
            (val) => emit('update:customColors', { ...customColorsModel, primary: val })
          "
        />
        <ColorPickerField
          :model-value="customColorsModel.secondary"
          label="Secondary Color"
          name="secondary_color"
          @update:model-value="
            (val) => emit('update:customColors', { ...customColorsModel, secondary: val })
          "
        />
        <ColorPickerField
          :model-value="customColorsModel.tertiary"
          label="Tertiary Color"
          name="tertiary_color"
          @update:model-value="
            (val) => emit('update:customColors', { ...customColorsModel, tertiary: val })
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import ColorPickerField from "@components/form/ColorPickerField.vue"

interface ColorPalette {
  id: string
  name: string
  colors: string[]
}

const colorPalettes: ColorPalette[] = [
  { id: "modern", name: "Modern", colors: ["#1A2A3A", "#4A6072", "#F7F3EE"] },
  { id: "minimal", name: "Minimal", colors: ["#D94600", "#B03A00", "#8C5A3A"] },
  { id: "bold", name: "Bold", colors: ["#3E2F24", "#85684E", "#FAF7F2"] },
  { id: "nature", name: "Nature", colors: ["#2F3A56", "#7B5F4C", "#FAF8F7"] },
  { id: "rainbow", name: "Rainbow", colors: ["#D7266A", "#D86A00", "#FFFFFF"] },
  { id: "custom", name: "Custom", colors: ["#98A2B3", "#D0D5DD", "#EAECF0"] },
]

const props = defineProps<{
  palette: string
  customColors: {
    primary: string
    secondary: string
    tertiary: string
  }
}>()

const emit = defineEmits<{
  "update:palette": [value: string]
  "update:customColors": [
    value: {
      primary: string
      secondary: string
      tertiary: string
    },
  ]
}>()

const selectedPalette = computed({
  get: () => props.palette,
  set: (value) => emit("update:palette", value),
})

const customColorsModel = computed({
  get: () => props.customColors,
  set: (value) => emit("update:customColors", value),
})
</script>
