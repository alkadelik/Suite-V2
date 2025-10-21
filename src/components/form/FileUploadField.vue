<template>
  <div class="h-full">
    <label v-if="label" class="text-core-800 mb-1 block text-sm font-medium">
      {{ props.label }}
    </label>
    <div
      class="text-core-800 relative flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-dashed text-sm transition-colors duration-200"
      :class="[
        props.productImageMode ? 'h-full' : 'px-4 py-4',
        fileName && isImage && filePreview
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 bg-transparent hover:bg-gray-50',
      ]"
      @dragover="preventDefaults"
      @drop="handleDrop"
    >
      <!-- Product Image Preview Mode -->
      <div
        v-if="fileName && isImage && filePreview && props.productImageMode"
        class="relative h-full w-full p-2"
      >
        <img :src="filePreview" :alt="fileName" class="h-full w-full rounded-lg object-cover" />

        <!-- Primary Label (only shown when showPrimaryLabel prop is true) -->
        <div
          v-if="props.showPrimaryLabel"
          class="absolute top-3 left-3 flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700"
        >
          <Icon name="heart-rounded" class="h-3 w-3" />
          <span>Primary</span>
        </div>

        <!-- Replace button - shows in edit mode (started with existing image URL) -->
        <button
          v-if="isEditMode"
          type="button"
          class="absolute -top-4.5 right-12 flex h-6 w-6 items-center justify-center rounded-full"
          @click.stop="replaceFile"
        >
          <Chip icon="refresh-cw-01" label="Replace" class="border-primary-700 bg-primary-100" />
        </button>
        <!-- Remove button - only shows in create mode (never started with existing image) -->
        <button
          v-else
          type="button"
          class="absolute -top-4.5 right-12 flex h-6 w-6 items-center justify-center rounded-full"
          @click.stop="removeFile"
        >
          <Chip icon="x-close" label="Remove" class="border-primary-700 bg-primary-100" />
        </button>
      </div>

      <!-- Default Preview Mode -->
      <div v-else-if="fileName" class="flex w-full items-center gap-2">
        <img
          v-if="isImage && filePreview"
          :src="filePreview"
          :alt="fileName"
          class="h-15 w-30 rounded object-cover"
        />
        <Icon v-else name="document-upload" />
        <p class="text-core-800 flex-1 truncate">
          {{ fileName }}
        </p>
        <button type="button" class="text-lg" @click.stop="removeFile">
          <Icon name="trash" size="20" class="text-red-500" />
        </button>
      </div>

      <!-- Placeholder -->
      <slot v-else name="placeholder">
        <div
          class="flex w-full flex-col items-center justify-center gap-2 text-center"
          :class="props.productImageMode ? 'py-4' : ''"
        >
          <div class="border-core-400 rounded-xl border p-2"><Icon name="document-upload" /></div>
          <span class="text-core-800 text-sm">{{ props.label }}</span>
          <span class="text-core-600 text-xs"
            >Supports: JPG, PNG, HEIC{{ props.productImageMode ? "" : ", PDF" }}</span
          >
        </div>
      </slot>

      <!-- Hidden file input - always rendered for programmatic access via ref -->
      <input
        ref="fileInputRef"
        type="file"
        :class="[
          'absolute inset-0 h-full w-full cursor-pointer opacity-0',
          fileName && isImage && filePreview && props.productImageMode ? 'pointer-events-none' : '',
        ]"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import { useImageConverter } from "@/composables/useImageConverter"
import { toast } from "@/composables/useToast"

interface Props {
  label?: string
  /** Product image mode - enables fullscreen preview with product-specific UI (primary badge, replace button) */
  productImageMode?: boolean
  modelValue?: File | string | null
  showPrimaryLabel?: boolean
}

const emit = defineEmits(["update:modelValue"])
const props = withDefaults(defineProps<Props>(), {
  label: "Upload File",
  productImageMode: false,
  modelValue: null,
  showPrimaryLabel: false,
})

const fileName = ref("")
const filePreview = ref("")
const fileInputRef = ref<HTMLInputElement | null>(null)

/**
 * Tracks whether we're in edit mode (started with an existing image URL).
 * Once true, stays true even after replacing with a new File.
 * This ensures Remove button never shows in edit context.
 */
const isEditMode = ref(false)

// Image converter composable
const { convertAndCompressImage } = useImageConverter()

// Watch for modelValue changes to handle existing images (URLs) and File objects
watch(
  () => props.modelValue,
  (newValue) => {
    if (typeof newValue === "string" && newValue) {
      // It's a URL string from existing image - we're in edit mode
      fileName.value = newValue.split("/").pop() || "image"
      filePreview.value = newValue
      isEditMode.value = true
    } else if (newValue === null) {
      // Reset when null
      fileName.value = ""
      filePreview.value = ""
      // Reset edit mode when value is cleared
      isEditMode.value = false
    } else if (newValue instanceof File) {
      // It's a File object passed programmatically (e.g., from image swap)
      // Create preview manually since handleFileChange won't be triggered
      fileName.value = newValue.name

      if (newValue.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          filePreview.value = e.target?.result as string
        }
        reader.readAsDataURL(newValue)
      } else {
        filePreview.value = ""
      }
    }
  },
  { immediate: true },
)

const isImage = computed(() => {
  if (!fileName.value && !filePreview.value) return false
  // Check if we have a preview URL (either from File or existing URL)
  if (filePreview.value) return true
  // Fallback to extension check
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"]
  return imageExtensions.some((ext) => fileName.value.toLowerCase().endsWith(ext))
})

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files && target.files[0]
  if (file) {
    let processedFile = file

    // Convert and compress in product image mode
    if (props.productImageMode) {
      try {
        processedFile = await convertAndCompressImage(file)
        fileName.value = processedFile.name
      } catch (error) {
        console.error("Failed to process image:", error)
        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : "Failed to process image"
        toast.error(errorMessage)
        // Reset file input
        if (fileInputRef.value) {
          fileInputRef.value.value = ""
        }
        return
      }
    } else {
      fileName.value = file.name
    }

    // Create preview for images
    if (processedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(processedFile)
    } else {
      filePreview.value = ""
    }

    emit("update:modelValue", processedFile)
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file) {
    let processedFile = file

    // Convert and compress in product image mode
    if (props.productImageMode) {
      try {
        processedFile = await convertAndCompressImage(file)
        fileName.value = processedFile.name
      } catch (error) {
        console.error("Failed to process image:", error)
        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : "Failed to process image"
        toast.error(errorMessage)
        return
      }
    } else {
      fileName.value = file.name
    }

    // Create preview for images
    if (processedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(processedFile)
    } else {
      filePreview.value = ""
    }

    emit("update:modelValue", processedFile)
  }
}

const preventDefaults = (event: Event) => {
  event.preventDefault()
}

/**
 * Replaces the existing image by triggering the file picker directly.
 * Used in edit mode when viewing existing images (URL strings).
 * Keeps current image visible until user selects a new file.
 */
const replaceFile = (event: MouseEvent) => {
  event.stopPropagation()

  if (fileInputRef.value) {
    // Trigger file picker without clearing current image
    // If user cancels, the existing image remains
    // If user selects a file, handleFileChange will update it
    fileInputRef.value.click()
  }
}

/**
 * Removes the newly uploaded file.
 * Used in create mode when user has just uploaded a File object.
 */
const removeFile = (event: MouseEvent) => {
  event.stopPropagation()
  fileName.value = ""
  filePreview.value = ""

  // Reset the input field value using ref
  if (fileInputRef.value) {
    fileInputRef.value.value = ""
  }

  emit("update:modelValue", null)
}
</script>
