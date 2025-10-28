<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Button</h4>
    </div>
    <div class="p-0 md:p-6">
      <p class="text-core-700 mb-4 text-sm">Select a button style to use or edit</p>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <button
          v-for="style in buttonStyles"
          :key="style.id"
          type="button"
          :class="[
            'flex flex-col overflow-hidden rounded-lg border transition-colors',
            {
              'border-primary-700 bg-primary-50': selectedStyle === style.id,
              'border-gray-200 hover:border-gray-300': selectedStyle !== style.id,
            },
          ]"
          @click="selectedStyle = style.id"
        >
          <div class="flex items-center justify-center p-6 md:p-8">
            <AppButton :label="style.label" :class="style.buttonClass" />
          </div>
          <div
            :class="[
              'border-t px-4 py-3',
              {
                'border-primary-700': selectedStyle === style.id,
                'border-gray-200': selectedStyle !== style.id,
              },
            ]"
          >
            <span class="text-sm font-medium text-gray-900">{{ style.name }}</span>
          </div>
        </button>
      </div>

      <InfoBox message="Button color depends on the primary color." variant="warning" class="mt-4">
        <button
          type="button"
          class="mt-2 flex items-center gap-1 text-xs font-semibold underline hover:no-underline md:text-sm"
          @click="$emit('changeSection', 'color')"
        >
          <span>Change colors</span>
          <Icon name="arrow-right" size="16" />
        </button>
      </InfoBox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import AppButton from "@components/AppButton.vue"
import InfoBox from "@components/InfoBox.vue"
import Icon from "@components/Icon.vue"

defineEmits<{
  changeSection: [section: string]
}>()

interface ButtonStyle {
  id: string
  name: string
  label: string
  buttonClass: string
}

const buttonStyles: ButtonStyle[] = [
  { id: "round", name: "Round", label: "Button", buttonClass: "" },
  { id: "square", name: "Square", label: "Button", buttonClass: "!rounded-none" },
  { id: "pill", name: "Pill", label: "Button", buttonClass: "!rounded-full" },
]

const selectedStyle = ref<string>("round")

// Expose method to get values
const getValues = () => {
  return {
    style: selectedStyle.value,
  }
}

defineExpose({
  getValues,
})
</script>
