<template>
  <div class="h-full">
    <!-- <label class="text-core-800 mb-1 block text-sm font-medium">{{ props.label }}</label> -->
    <div
      class="text-core-800 relative flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-dashed text-sm transition-colors duration-200"
      :class="[
        props.fullscreenPreview ? 'h-full' : 'px-4 py-4',
        fileName && isImage && filePreview
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 bg-transparent hover:bg-gray-50',
      ]"
      @dragover="preventDefaults"
      @drop="handleDrop"
    >
      <!-- Fullscreen Preview Mode -->
      <div
        v-if="fileName && isImage && filePreview && props.fullscreenPreview"
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

        <!-- Replace button -->
        <button
          type="button"
          class="absolute -top-4.5 right-38 flex h-6 w-6 items-center justify-center rounded-full"
          @click.stop="removeFile"
        >
          <Chip icon="refresh-cw-01" label="Replace" class="border-primary-700 bg-primary-100" />
        </button>
        <!-- Remove button -->
        <button
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
          :class="props.fullscreenPreview ? 'py-4' : ''"
        >
          <div class="border-core-400 rounded-xl border p-2"><Icon name="document-upload" /></div>
          <span class="text-core-800 text-sm">{{ props.label }}</span>
          <span class="text-core-600 text-xs">Supports: JPG, PNG, PDF (Max - 3MB)</span>
        </div>
      </slot>

      <input
        v-if="!fileName || (fileName && (!isImage || !filePreview || !props.fullscreenPreview))"
        type="file"
        class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"

interface Props {
  label?: string
  fullscreenPreview?: boolean
  modelValue?: File | string | null
  showPrimaryLabel?: boolean
}

const emit = defineEmits(["update:modelValue"])
const props = withDefaults(defineProps<Props>(), {
  label: "Upload File",
  fullscreenPreview: false,
  modelValue: null,
  showPrimaryLabel: false,
})

const fileName = ref("")
const filePreview = ref("")

// Watch for modelValue changes to handle existing images (URLs)
watch(
  () => props.modelValue,
  (newValue) => {
    if (typeof newValue === "string" && newValue) {
      // It's a URL string from existing image
      fileName.value = newValue.split("/").pop() || "image"
      filePreview.value = newValue
    } else if (newValue === null) {
      // Reset when null
      fileName.value = ""
      filePreview.value = ""
    }
    // If it's a File object, it will be handled by handleFileChange
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

const handleFileChange = (event: Event) => {
  if (fileName.value) return
  const target = event.target as HTMLInputElement
  const file = target.files && target.files[0]
  if (file) {
    fileName.value = file.name

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } else {
      filePreview.value = ""
    }

    emit("update:modelValue", file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file) {
    fileName.value = file.name

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } else {
      filePreview.value = ""
    }

    emit("update:modelValue", file)
  }
}

const preventDefaults = (event: Event) => {
  event.preventDefault()
}

const removeFile = (event: MouseEvent) => {
  event.stopPropagation()
  fileName.value = ""
  filePreview.value = ""
  // Reset the input field value
  const fileInput = (event.target as HTMLElement)
    .closest("div")
    ?.querySelector("input[type='file']") as HTMLInputElement | null
  if (fileInput) {
    fileInput.value = "" // Clear the file input
  }
  emit("update:modelValue", null)
}
</script>
