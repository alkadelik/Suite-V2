<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Button</h4>
    </div>
    <div class="p-0 md:p-6">
      <InfoBox message="Button color depends on the primary color." variant="warning" class="mb-6">
        <button
          type="button"
          class="mt-2 flex items-center gap-1 text-xs font-semibold underline hover:no-underline md:text-sm"
          @click="$emit('changeSection', 'color')"
        >
          <span>Change colors</span>
          <Icon name="arrow-right" size="16" />
        </button>
      </InfoBox>

      <p class="text-core-700 mb-4 text-sm">Select a button style to use or edit</p>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <button
          v-for="style in buttonStyles"
          :key="style.id"
          type="button"
          :class="[
            'flex flex-col overflow-hidden rounded-lg border transition-colors',
            selectedStyle === style.id
              ? 'border-primary-700 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300',
            {
              'border-primary-700 bg-primary-50': selectedStyle === style.id,
              'border-gray-300 bg-gray-200 hover:border-gray-300': selectedStyle !== style.id,
            },
          ]"
          @click="selectedStyle = style.id"
        >
          <div class="flex items-center justify-center p-6 md:p-8">
            <AppButton
              :label="style.label"
              :class="[
                style.buttonClass,
                {
                  [`outline-2 ${darkTextContrast ? 'outline-gray-900' : 'outline-white'}`]:
                    showButtonOutline,
                },
              ]"
              :style="{
                backgroundColor: themeColors.primary || 'var(--primary-600)',
                color: button_text_color === 'dark' ? '#111' : '#fff',
              }"
            />
          </div>
          <div
            :class="[
              'border-t px-4 py-3',
              {
                'border-primary-700': selectedStyle === style.id,
                'border-gray-300': selectedStyle !== style.id,
              },
            ]"
          >
            <span class="text-sm font-medium text-gray-900">{{ style.name }}</span>
          </div>
        </button>
      </div>

      <div class="mt-6 space-y-5 border-t border-gray-200 px-4 pt-5">
        <div class="flex items-center gap-3">
          <Icon name="brush" size="20" class="text-gray-700" />
          <span class="text-sm font-medium text-gray-900">Dark text for better contrast</span>
          <Switch class="ml-auto" v-model="darkTextContrast" />
        </div>
        <!--  -->
        <div class="flex items-center gap-3">
          <Icon name="brush" size="20" class="text-gray-700" />
          <span class="text-sm font-medium text-gray-900">Show button outline</span>
          <Switch class="ml-auto" v-model="showButtonOutline" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import AppButton from "@components/AppButton.vue"
import InfoBox from "@components/InfoBox.vue"
import Icon from "@components/Icon.vue"
import Switch from "@components/form/Switch.vue"

interface ButtonStyle {
  id: string
  name: string
  label: string
  buttonClass: string
}

const buttonStyles: ButtonStyle[] = [
  { id: "rounded", name: "Rounded", label: "Button", buttonClass: "" },
  { id: "square", name: "Square", label: "Button", buttonClass: "!rounded-none" },
  { id: "pill", name: "Pill", label: "Button", buttonClass: "!rounded-full" },
]

const props = defineProps<{
  style: string
  themeColors: Record<string, string>
  button_text_color: string
  show_button_outline: boolean
}>()

const emit = defineEmits<{
  "update:style": [value: string]
  changeSection: [section: string]
  "update:button_text_color": [value: string]
  "update:show_button_outline": [value: boolean]
}>()

const selectedStyle = computed({
  get: () => props.style,
  set: (value) => emit("update:style", value),
})

const darkTextContrast = computed({
  get: () => props.button_text_color === "dark",
  set: (value) => emit("update:button_text_color", value ? "dark" : "light"),
})

const showButtonOutline = computed({
  get: () => props.show_button_outline,
  set: (value) => emit("update:show_button_outline", value),
})
</script>
