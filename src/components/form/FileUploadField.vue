<template>
  <div class="h-full">
    <label v-if="label" class="text-core-800 mb-1 block text-sm font-medium">
      {{ props.label }}
    </label>
    <div
      class="text-core-800 relative flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-dashed px-4 py-4 text-sm transition-colors duration-200"
      :class="
        fileName && (isImage || isVideo) && filePreview
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 bg-transparent hover:bg-gray-50'
      "
      @dragover="preventDefaults"
      @drop="handleDrop"
    >
      <!-- File Preview -->
      <div v-if="fileName" class="flex w-full items-center gap-2">
        <img
          v-if="isImage && filePreview"
          :src="filePreview"
          :alt="fileName"
          class="h-15 w-30 rounded object-cover"
        />
        <video
          v-else-if="isVideo && filePreview"
          :src="filePreview"
          autoplay
          muted
          loop
          playsinline
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
        <div class="flex w-full flex-col items-center justify-center gap-2 text-center">
          <div class="border-core-400 rounded-xl border p-2"><Icon name="document-upload" /></div>
          <span class="text-core-800 text-sm">{{ props.label }}</span>
          <span class="text-core-600 text-xs">{{ props.placeholder }}</span>
        </div>
      </slot>

      <!-- Hidden file input - always rendered for programmatic access via ref -->
      <input
        ref="fileInputRef"
        type="file"
        :class="[
          'absolute inset-0 h-full w-full cursor-pointer opacity-0',
          fileName ? 'pointer-events-none' : '',
        ]"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue"
import Icon from "@components/Icon.vue"

const MAX_FILENAME_LENGTH = 99

interface Props {
  label?: string
  modelValue?: File | string | null
  placeholder?: string
}

const emit = defineEmits(["update:modelValue"])
const props = withDefaults(defineProps<Props>(), {
  label: "Upload File",
  modelValue: null,
  placeholder: "Supports: JPG, PNG, HEIC, AVIF, PDF",
})

const fileName = ref("")
const filePreview = ref("")
const fileInputRef = ref<HTMLInputElement | null>(null)
// Track object URLs so we can revoke them later
const createdObjectUrl = ref<string | null>(null)
// Guard against concurrent processing (Windows Chrome double-fires @change on programmatic .click())
const isProcessing = ref(false)

// Watch for modelValue changes to handle existing images (URLs) and File objects
watch(
  () => props.modelValue,
  (newValue) => {
    if (typeof newValue === "string" && newValue) {
      fileName.value = newValue.split("/").pop() || "file"
      filePreview.value = newValue
    } else if (newValue === null) {
      fileName.value = ""
      filePreview.value = ""
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
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"]
  return imageExtensions.some((ext) => fileName.value.toLowerCase().endsWith(ext))
})

const isVideo = computed(() => {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"]
  return videoExtensions.some((ext) => fileName.value.toLowerCase().endsWith(ext))
})

/** Truncates a filename if it exceeds the maximum length. */
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

const handleFileChange = (event: Event) => {
  if (isProcessing.value) return
  event.stopPropagation()
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isProcessing.value = true
  try {
    let processedFile = file

    if (file.name.length > MAX_FILENAME_LENGTH) {
      const newName = truncateFilename(file.name, MAX_FILENAME_LENGTH)
      processedFile = new File([file], newName, { type: file.type })
    }

    fileName.value = processedFile.name

    if (createdObjectUrl.value) {
      try {
        URL.revokeObjectURL(createdObjectUrl.value)
      } catch (e) {
        console.warn("Failed to revoke object URL:", e)
      }
      createdObjectUrl.value = null
    }

    if (processedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(processedFile)
    } else if (processedFile.type.startsWith("video/")) {
      const url = URL.createObjectURL(processedFile)
      createdObjectUrl.value = url
      filePreview.value = url
    } else {
      filePreview.value = ""
    }

    emit("update:modelValue", processedFile)
  } finally {
    isProcessing.value = false
    target.value = ""
  }
}

const handleDrop = (event: DragEvent) => {
  if (isProcessing.value) return
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (!file) return

  isProcessing.value = true
  try {
    let processedFile = file

    if (file.name.length > MAX_FILENAME_LENGTH) {
      const newName = truncateFilename(file.name, MAX_FILENAME_LENGTH)
      processedFile = new File([file], newName, { type: file.type })
    }

    fileName.value = processedFile.name

    if (createdObjectUrl.value) {
      try {
        URL.revokeObjectURL(createdObjectUrl.value)
      } catch (e) {
        console.warn("Failed to revoke object URL:", e)
      }
      createdObjectUrl.value = null
    }

    if (processedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(processedFile)
    } else if (processedFile.type.startsWith("video/")) {
      const url = URL.createObjectURL(processedFile)
      createdObjectUrl.value = url
      filePreview.value = url
    } else {
      filePreview.value = ""
    }

    emit("update:modelValue", processedFile)
  } finally {
    isProcessing.value = false
  }
}

const preventDefaults = (event: Event) => {
  event.preventDefault()
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
