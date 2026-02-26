<template>
  <div class="h-full">
    <label v-if="label" class="text-core-800 mb-1 block text-sm font-medium">
      {{ label }}
    </label>
    <div
      class="text-core-800 relative flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200"
      :class="[
        isProcessing ? 'cursor-wait' : 'cursor-pointer',
        fileName && filePreview
          ? 'border-primary-500 bg-primary-50'
          : isProcessing
            ? 'border-primary-300 bg-primary-50'
            : 'border-gray-300 bg-transparent hover:bg-gray-50',
      ]"
      @dragover="preventDefaults"
      @drop="handleDrop"
    >
      <!-- Image / Video Preview -->
      <div v-if="fileName && filePreview" class="relative h-full w-full p-2">
        <img
          v-if="isImage"
          :src="filePreview"
          :alt="fileName"
          class="h-full w-full rounded-lg object-cover"
        />
        <video
          v-else-if="isVideo"
          :src="filePreview"
          autoplay
          muted
          loop
          playsinline
          class="h-full w-full rounded-lg object-cover"
        />

        <!-- Primary badge -->
        <div
          v-if="showPrimaryLabel"
          class="absolute top-3 left-3 flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700"
        >
          <Icon name="heart-rounded" class="h-3 w-3" />
          <span>Primary</span>
        </div>

        <!-- Replace (edit mode) -->
        <button
          v-if="isEditMode"
          type="button"
          class="absolute -top-4.5 right-12 flex items-center justify-center rounded-full"
          @click.stop="replaceFile"
        >
          <Chip icon="refresh-cw-01" label="Replace" class="border-primary-700 bg-primary-100" />
        </button>
        <!-- Remove (create mode) -->
        <button
          v-else
          type="button"
          class="absolute -top-4.5 right-12 flex items-center justify-center rounded-full"
          @click.stop="removeFile"
        >
          <Chip icon="x-close" label="Remove" class="border-primary-700 bg-primary-100" />
        </button>
      </div>

      <!-- Placeholder -->
      <slot v-else name="placeholder">
        <div class="flex w-full flex-col items-center justify-center gap-2 py-4 text-center">
          <div class="border-core-400 rounded-xl border p-2">
            <Icon name="document-upload" />
          </div>
          <span class="text-core-800 text-sm">{{ label }}</span>
          <span class="text-core-600 text-xs">{{ placeholderText }}</span>
        </div>
      </slot>

      <!-- Processing overlay -->
      <div
        v-if="isProcessing"
        class="bg-primary-50/80 absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl backdrop-blur-[2px]"
      >
        <svg
          class="text-primary-500 h-7 w-7 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="3"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span class="text-primary-700 text-xs font-medium">Processing…</span>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*,video/*"
        :class="[
          'absolute inset-0 h-full w-full cursor-pointer opacity-0',
          fileName || isProcessing ? 'pointer-events-none' : '',
        ]"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import { useImageConverter } from "@/composables/useImageConverter"
import { toast } from "@/composables/useToast"

const MAX_FILENAME_LENGTH = 99
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB

interface Props {
  label?: string
  modelValue?: File | string | null
  showPrimaryLabel?: boolean
  placeholder?: string
}

const emit = defineEmits(["update:modelValue"])
const props = withDefaults(defineProps<Props>(), {
  label: "Upload Image",
  modelValue: null,
  showPrimaryLabel: false,
  placeholder: "Supports: JPG, PNG, HEIC, AVIF",
})

const fileName = ref("")
const filePreview = ref("")
const fileInputRef = ref<HTMLInputElement | null>(null)
const createdObjectUrl = ref<string | null>(null)
const isProcessing = ref(false)
const isEditMode = ref(false)

const { convertAndCompressImage } = useImageConverter()

const placeholderText = computed(() => props.placeholder)

watch(
  () => props.modelValue,
  (newValue) => {
    if (typeof newValue === "string" && newValue) {
      fileName.value = newValue.split("/").pop() || "image"
      filePreview.value = newValue
      isEditMode.value = true
    } else if (newValue === null) {
      fileName.value = ""
      filePreview.value = ""
      isEditMode.value = false
    } else if (newValue instanceof File) {
      fileName.value = newValue.name

      if (createdObjectUrl.value) {
        try {
          URL.revokeObjectURL(createdObjectUrl.value)
        } catch (e) {
          console.warn("Failed to revoke object URL:", e)
        }
        createdObjectUrl.value = null
      }

      if (newValue.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          filePreview.value = e.target?.result as string
        }
        reader.readAsDataURL(newValue)
      } else if (newValue.type.startsWith("video/")) {
        const url = URL.createObjectURL(newValue)
        createdObjectUrl.value = url
        filePreview.value = url
      } else {
        filePreview.value = ""
      }
    }
  },
  { immediate: true },
)

const isImage = computed(() => {
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".avif", ".heic"]
  return imageExts.some((ext) => fileName.value.toLowerCase().endsWith(ext))
})

const isVideo = computed(() => {
  const videoExts = [".mp4", ".webm", ".ogg", ".mov", ".m4v"]
  return videoExts.some((ext) => fileName.value.toLowerCase().endsWith(ext))
})

const truncateFilename = (filename: string, maxLength: number): string => {
  if (filename.length <= maxLength) return filename
  const lastDotIndex = filename.lastIndexOf(".")
  if (lastDotIndex === -1) return filename.substring(0, maxLength)
  const extension = filename.substring(lastDotIndex)
  const nameWithoutExt = filename.substring(0, lastDotIndex)
  const maxNameLength = maxLength - extension.length
  if (maxNameLength <= 0) return filename.substring(0, maxLength)
  return nameWithoutExt.substring(0, maxNameLength) + extension
}

const processFile = async (file: File): Promise<File | null> => {
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)
    toast.error(`File size exceeds ${maxSizeMB}MB limit. Please select a smaller image.`)
    return null
  }

  let processedFile = file

  if (file.name.length > MAX_FILENAME_LENGTH) {
    const newName = truncateFilename(file.name, MAX_FILENAME_LENGTH)
    processedFile = new File([file], newName, { type: file.type })
  }

  try {
    processedFile = await convertAndCompressImage(processedFile)
  } catch (error) {
    console.error("Failed to process image:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to process image"
    toast.error(errorMessage)
    return null
  }

  return processedFile
}

const applyPreview = (file: File) => {
  fileName.value = file.name

  if (createdObjectUrl.value) {
    try {
      URL.revokeObjectURL(createdObjectUrl.value)
    } catch (e) {
      console.warn("Failed to revoke object URL:", e)
    }
    createdObjectUrl.value = null
  }

  if (file.type.startsWith("image/")) {
    const reader = new FileReader()
    reader.onload = (e) => {
      filePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else if (file.type.startsWith("video/")) {
    const url = URL.createObjectURL(file)
    createdObjectUrl.value = url
    filePreview.value = url
  } else {
    filePreview.value = ""
  }
}

const handleFileChange = async (event: Event) => {
  if (isProcessing.value) return
  event.stopPropagation()
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isProcessing.value = true
  try {
    const processedFile = await processFile(file)
    if (!processedFile) return
    applyPreview(processedFile)
    emit("update:modelValue", processedFile)
  } finally {
    isProcessing.value = false
    target.value = ""
  }
}

const handleDrop = async (event: DragEvent) => {
  if (isProcessing.value) return
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (!file) return

  isProcessing.value = true
  try {
    const processedFile = await processFile(file)
    if (!processedFile) return
    applyPreview(processedFile)
    emit("update:modelValue", processedFile)
  } finally {
    isProcessing.value = false
  }
}

const preventDefaults = (event: Event) => {
  event.preventDefault()
}

const replaceFile = (event: MouseEvent) => {
  event.stopPropagation()
  fileInputRef.value?.click()
}

const removeFile = (event: MouseEvent) => {
  event.stopPropagation()
  fileName.value = ""
  filePreview.value = ""
  if (fileInputRef.value) fileInputRef.value.value = ""

  if (createdObjectUrl.value) {
    try {
      URL.revokeObjectURL(createdObjectUrl.value)
    } catch (e) {
      console.warn("Failed to revoke object URL:", e)
    }
    createdObjectUrl.value = null
  }

  emit("update:modelValue", null)
}

onBeforeUnmount(() => {
  if (createdObjectUrl.value) {
    try {
      URL.revokeObjectURL(createdObjectUrl.value)
    } catch (e) {
      console.warn("Failed to revoke object URL on unmount:", e)
    }
    createdObjectUrl.value = null
  }
})
</script>
