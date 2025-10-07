<template>
  <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${numberOfImages}, 1fr)` }">
    <div
      v-for="(image, index) in images"
      :key="index"
      class="hover:border-primary-400 group relative aspect-square cursor-pointer rounded-xl border-2 border-dashed border-gray-300 transition-colors duration-200"
      :class="{
        'border-primary-500 bg-primary-50': image,
        'hover:bg-gray-50': !image,
      }"
      @click="triggerFileInput(index)"
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

          <!-- Remove button -->
          <button
            type="button"
            class="absolute -top-5 -right-5 flex h-6 w-6 items-center justify-center rounded-full"
            @click.stop="removeImage(index)"
          >
            <Icon name="close-circle-filled" size="24" class="text-primary-800" />
          </button>
        </div>

        <!-- Placeholder content -->
        <div
          v-else
          class="group-hover:text-primary-500 flex flex-col items-center justify-center text-gray-500 transition-colors duration-200"
        >
          <!-- Image icon -->
          <Icon name="gallery-add" size="24" class="text-core-800 mb-1" />
        </div>
      </div>

      <!-- Image label -->
      <div
        class="bg-opacity-90 absolute bottom-1 left-1 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs font-medium text-gray-700"
      >
        Image {{ index + 1 }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onUnmounted, ref } from "vue"
import { toast } from "@/composables/useToast"
import Icon from "@components/Icon.vue"

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
}

const props = withDefaults(defineProps<MultiImageUploadProps>(), {
  numberOfImages: 1,
  modelValue: () => [],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: () => ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
})

const emit = defineEmits<{
  "update:modelValue": [value: (File | string | null)[]]
}>()

// Reactive state
const images = reactive<(File | string | null)[]>(
  Array.from({ length: props.numberOfImages }, (_, i) => props.modelValue[i] || null),
)

// Refs for file inputs
const fileInputRefs = ref<(HTMLInputElement | null)[]>([])

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

const handleFileSelect = (event: Event, startIndex: number) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  // Calculate how many slots are available from the clicked position
  const availableSlots = props.numberOfImages - startIndex

  // Show error if too many files were uploaded
  if (files.length > availableSlots) {
    const excess = files.length - availableSlots
    toast.error(`Too many files selected. ${excess} file${excess > 1 ? "s" : ""} will be ignored.`)
  }

  const filesToProcess = files.slice(0, availableSlots)

  // Validate and update images array starting from the clicked index
  filesToProcess.forEach((file, fileIndex) => {
    const targetIndex = startIndex + fileIndex

    if (targetIndex < props.numberOfImages) {
      const validationError = validateFile(file)

      if (validationError) {
        toast.error(validationError)
      } else {
        images[targetIndex] = file
      }
    }
  })

  // Clear the file input
  target.value = ""
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
