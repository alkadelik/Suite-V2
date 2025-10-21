<template>
  <div class="mt-6 mb-6">
    <!-- Mobile Layout -->
    <div class="md:hidden">
      <!-- Primary Image - Full Width -->
      <div
        v-if="allImages[0]"
        class="relative mb-3 h-30 w-full overflow-hidden rounded-lg border border-gray-200"
      >
        <img
          v-if="!isPlaceholder(allImages[0])"
          :src="(allImages[0] as any).image"
          :alt="(allImages[0] as any).alt_text || productName"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="bg-primary-50 text-primary-500 flex h-full w-full cursor-pointer flex-col items-center justify-center"
          @click="emit('open-images-edit')"
        >
          <Icon name="gallery-add" size="32" class="mb-2" />
          <p class="text-xs font-medium">Add Primary Image</p>
        </div>
        <AppButton
          v-if="!isPlaceholder(allImages[0])"
          icon="edit"
          variant="outlined"
          color="alt"
          size="sm"
          class="!absolute top-2 left-2 !h-8 !w-8 bg-white !p-0"
          @click="emit('open-images-edit')"
        />
        <div
          v-if="!isPlaceholder(allImages[0])"
          class="absolute top-2 right-2 flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700"
        >
          <Icon name="heart-rounded" class="h-3 w-3" />
          <span>Primary</span>
        </div>
      </div>
      <!-- Other Images - Grid (max 4) -->
      <div class="grid grid-cols-4 gap-2">
        <div
          v-for="(image, index) in allImages.slice(1, 5)"
          :key="index"
          class="aspect-square overflow-hidden rounded-lg border border-gray-200"
          :class="{ 'cursor-pointer': isPlaceholder(image) }"
          @click="isPlaceholder(image) ? emit('open-images-edit') : null"
        >
          <img
            v-if="!isPlaceholder(image)"
            :src="(image as any).image"
            :alt="(image as any).alt_text || productName"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400"
          >
            <Icon name="gallery-add" size="20" />
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Layout - Full Width Grid -->
    <div class="hidden w-full grid-cols-6 gap-3 md:grid" style="grid-auto-rows: 1fr">
      <!-- Primary Image (2x width = 2 columns, same height as others) -->
      <div
        class="relative col-span-2 overflow-hidden rounded-lg border border-gray-200"
        :class="{ 'cursor-pointer': isPlaceholder(allImages[0]) }"
        @click="isPlaceholder(allImages[0]) ? emit('open-images-edit') : null"
        style="aspect-ratio: 2/1"
      >
        <img
          v-if="!isPlaceholder(allImages[0])"
          :src="(allImages[0] as any).image"
          :alt="(allImages[0] as any).alt_text || productName"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="border-primary-300 bg-primary-50 text-primary-500 flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed text-center"
        >
          <div class="border-primary-400 rounded-xl border p-2">
            <Icon name="gallery-add" size="24" />
          </div>
          <span class="text-primary-600 text-sm font-medium">Upload Primary Image</span>
          <span class="text-primary-400 text-xs">Supports: JPG, PNG, HEIC</span>
        </div>
        <div
          v-if="!isPlaceholder(allImages[0])"
          class="absolute top-3 right-3 flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700"
        >
          <Icon name="heart-rounded" class="h-3 w-3" />
          <span>Primary</span>
        </div>
      </div>

      <!-- Additional Images (1x width = 1 column each, square aspect ratio) -->
      <div
        v-for="(image, index) in allImages.slice(1, 5)"
        :key="index"
        class="relative col-span-1 aspect-square overflow-hidden rounded-lg border border-gray-200"
        :class="{ 'cursor-pointer': isPlaceholder(image) }"
        @click="isPlaceholder(image) ? emit('open-images-edit') : null"
      >
        <img
          v-if="!isPlaceholder(image)"
          :src="(image as any).image"
          :alt="(image as any).alt_text || productName"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="hover:border-primary-400 hover:bg-primary-50 hover:text-primary-500 flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-gray-50 text-center text-gray-400 transition-colors"
        >
          <div class="rounded-xl border border-gray-400 p-2">
            <Icon name="gallery-add" size="20" />
          </div>
          <span class="text-xs">Image {{ index + 2 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import type { IProductImage } from "../types"

interface Props {
  /** Product images sorted by primary and sort order */
  images: Array<IProductImage & { sort_order: number; created_at: string; updated_at: string }>
  /** Product name for alt text */
  productName?: string
}

interface Emits {
  /** Emitted when user clicks to edit images */
  "open-images-edit": []
}

const props = withDefaults(defineProps<Props>(), {
  productName: "",
})

const emit = defineEmits<Emits>()

/**
 * Returns all 5 image slots, filling missing slots with placeholders
 */
const allImages = computed(() => {
  const images = props.images
  const slots = []

  // Fill first 5 slots with actual images or placeholders
  for (let i = 0; i < 5; i++) {
    if (images[i]) {
      slots.push(images[i])
    } else {
      slots.push({ placeholder: true, index: i })
    }
  }

  return slots
})

/**
 * Check if an image slot is a placeholder
 */
const isPlaceholder = (
  image:
    | (IProductImage & { sort_order: number; created_at: string; updated_at: string })
    | { placeholder: boolean; index: number },
) => {
  return "placeholder" in image && image.placeholder === true
}
</script>
