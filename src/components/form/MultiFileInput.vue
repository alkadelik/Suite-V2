<template>
  <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${numberOfImages}, 1fr)` }">
    <div
      v-for="(image, index) in images"
      :key="index"
      class="group relative aspect-square rounded-xl border-2 border-dashed transition-colors duration-200"
      :class="{
        'border-primary-500 bg-primary-50': image,
        'hover:border-primary-400 cursor-pointer border-gray-300 hover:bg-gray-50':
          !image && !isSlotDisabled(index),
        'cursor-not-allowed border-gray-200 bg-gray-50': !image && isSlotDisabled(index),
      }"
      @click="!isSlotDisabled(index) && triggerFileInput(index)"
    >
      <!-- File input (hidden) -->
      <input
        :ref="(el) => setFileInputRef(el as HTMLInputElement | null, index)"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFileSelect($event, index)"
      />

      <!-- Image preview or placeholder -->
      <div class="absolute inset-0 flex flex-col items-center justify-center p-2">
        <div v-if="image" class="relative h-full w-full">
          <!-- Image preview -->
          <img
            :src="getImageUrl(image)"
            :alt="`Image ${index + 1}`"
            class="h-full w-full rounded-lg object-cover"
          />

          <!-- Make Primary button - only in product mode when enabled -->
          <button
            v-if="props.productImageMode && props.showMakePrimaryButton"
            type="button"
            class="absolute -top-5 right-3 flex h-6 w-6 items-center justify-center rounded-full"
            @click.stop="makePrimary(index)"
          >
            <Icon name="heart-rounded" size="24" class="text-primary-800 fill-primary-100" />
          </button>
          <!-- Remove button -->
          <button
            type="button"
            class="absolute -top-5 -right-3 flex h-6 w-6 items-center justify-center rounded-full"
            @click.stop="removeImage(index)"
          >
            <Icon name="close-circle-filled" size="24" class="text-primary-800 fill-white" />
          </button>
        </div>

        <!-- Placeholder content -->
        <div
          v-else
          class="flex flex-col items-center justify-center transition-colors duration-200"
          :class="
            isSlotDisabled(index) ? 'text-gray-400' : 'group-hover:text-primary-500 text-gray-500'
          "
        >
          <!-- Bloom chip for disabled slots in product mode -->
          <div v-if="isSlotDisabled(index)" class="flex items-center justify-center px-1">
            <Chip icon="star" label="Bloom" color="purple" size="sm" class="scale-75" />
          </div>

          <!-- Image icon for enabled slots -->
          <Icon v-else name="gallery-add" size="24" class="text-core-800 mb-1" />
        </div>
      </div>

      <!-- Image label -->
      <div
        v-if="!props.hideImageLabel"
        class="bg-opacity-90 absolute bottom-1 left-1 hidden rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs font-medium text-gray-700 md:block"
      >
        Image {{ index + 1 }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onUnmounted, ref, computed } from "vue"
import { toast } from "@/composables/useToast"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import { useImageConverter } from "@/composables/useImageConverter"

export interface MultiImageUploadProps {
  /**
   * The number of image input fields to display
   * @example 5
   */
  numberOfImages: number

  /**
   * The array of image files or URLs bound via v-model
   */
  modelValue: (File | string | null)[]

  /**
   * Additional CSS classes to apply to the container
   */
  class?: string | string[] | Record<string, boolean>

  /**
   * Maximum file size in bytes (default: 5MB)
   */
  maxFileSize?: number

  /**
   * Allowed image types (default: common image formats)
   */
  allowedTypes?: string[]

  /**
   * Product image mode - enables product-specific UI (Bloom chip for disabled slots)
   */
  productImageMode?: boolean

  /**
   * Number of enabled slots (remaining slots show Bloom chip in product mode)
   */
  enabledSlots?: number

  /**
   * Show "Make Primary" button (heart icon) on image previews in product mode
   */
  showMakePrimaryButton?: boolean

  /**
   * Hide the "Image X" label at the bottom of each slot
   */
  hideImageLabel?: boolean
}

const props = withDefaults(defineProps<MultiImageUploadProps>(), {
  numberOfImages: 1,
  modelValue: () => [],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: () => [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif",
  ],
  productImageMode: false,
  enabledSlots: undefined,
  showMakePrimaryButton: false,
  hideImageLabel: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: (File | string | null)[]]
  "make-primary": [index: number]
}>()

// Reactive state
const images = reactive<(File | string | null)[]>(
  Array.from({ length: props.numberOfImages }, (_, i) => props.modelValue[i] || null),
)

// Refs for file inputs
const fileInputRefs = ref<(HTMLInputElement | null)[]>([])

// Image converter composable
const { convertAndCompressImage } = useImageConverter()

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    for (let i = 0; i < props.numberOfImages; i++) {
      images[i] = newValue[i] || null
    }
  },
  { deep: true },
)

// Watch for changes to images array and emit to parent
watch(
  images,
  () => {
    emit("update:modelValue", [...images])
  },
  { deep: true },
)

/**
 * Determines if a slot is disabled based on productImageMode and enabledSlots.
 * Disabled slots show Bloom chip instead of upload placeholder.
 */
const isSlotDisabled = computed(() => {
  if (!props.productImageMode) return () => false

  const enabled = props.enabledSlots ?? props.numberOfImages
  return (index: number) => index >= enabled
})

const setFileInputRef = (el: HTMLInputElement | null, index: number) => {
  if (el) {
    fileInputRefs.value[index] = el
  }
}

const triggerFileInput = (index: number) => {
  const fileInput = fileInputRefs.value[index]
  if (fileInput) {
    fileInput.click()
  }
}

const validateFile = (file: File): string | null => {
  // Check file type
  if (!props.allowedTypes.includes(file.type)) {
    return `File type ${file.type} is not allowed. Please select a valid image file.`
  }

  // Check file size
  if (file.size > props.maxFileSize) {
    const maxSizeMB = (props.maxFileSize / (1024 * 1024)).toFixed(1)
    return `File size exceeds ${maxSizeMB}MB limit. Please select a smaller image.`
  }

  return null
}

const handleFileSelect = async (event: Event, startIndex: number) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  // Calculate how many slots are available from the clicked position
  const availableSlots = props.numberOfImages - startIndex

  // Show error if too many files were uploaded
  if (files.length > availableSlots) {
    const excess = files.length - availableSlots
    toast.info(`Too many files selected. ${excess} file${excess > 1 ? "s" : ""} will be ignored.`)
  }

  const filesToProcess = files.slice(0, availableSlots)

  // Validate and update images array starting from the clicked index
  for (let fileIndex = 0; fileIndex < filesToProcess.length; fileIndex++) {
    const file = filesToProcess[fileIndex]
    const targetIndex = startIndex + fileIndex

    if (targetIndex < props.numberOfImages) {
      const validationError = validateFile(file)

      if (validationError) {
        toast.error(validationError)
      } else {
        let processedFile = file

        // Convert and compress in product image mode
        if (props.productImageMode) {
          try {
            processedFile = await convertAndCompressImage(file)
          } catch (error) {
            console.error("Failed to process image:", error)
            const errorMessage = error instanceof Error ? error.message : "Failed to process image"
            toast.error(errorMessage)
            // Skip this file on error
            continue
          }
        }

        images[targetIndex] = processedFile
      }
    }
  }

  // Clear the file input
  target.value = ""
}

/**
 * Makes the clicked image the primary image by emitting event to parent.
 * Parent (ProductImagesForm) handles the swap logic between primary and additional images.
 */
const makePrimary = (index: number) => {
  emit("make-primary", index)
}

const removeImage = (index: number) => {
  const currentImage = images[index]
  if (currentImage && currentImage instanceof File) {
    // Only revoke object URLs for File objects
    URL.revokeObjectURL(getImageUrl(currentImage))
  }
  images[index] = null
}

const getImageUrl = (file: File | string): string => {
  // If it's a string (URL), return it directly
  if (typeof file === "string") {
    return file
  }
  // If it's a File object, create an object URL
  return URL.createObjectURL(file)
}

// Cleanup object URLs when component is unmounted
const cleanup = () => {
  images.forEach((image) => {
    if (image && image instanceof File) {
      // Only revoke object URLs for File objects
      URL.revokeObjectURL(getImageUrl(image))
    }
  })
}

// Clean up on unmount
onUnmounted(cleanup)
</script>
