<template>
  <div class="h-full">
    <!-- <label class="text-core-800 mb-1 block text-sm font-medium">{{ props.label }}</label> -->
    <div
      class="border-core-300 text-core-800 relative flex w-full cursor-pointer items-center justify-between rounded-lg border border-dashed bg-transparent text-sm"
      :class="props.fullscreenPreview ? 'h-full p-0' : 'px-4 py-4'"
      @dragover="preventDefaults"
      @drop="handleDrop"
    >
      <!-- Fullscreen Preview Mode -->
      <div
        v-if="fileName && isImage && filePreview && props.fullscreenPreview"
        class="relative h-full w-full"
      >
        <img :src="filePreview" :alt="fileName" class="h-full w-full rounded-lg object-cover" />
        <button
          type="button"
          class="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full"
          @click.stop="removeFile"
        >
          <Icon name="close-circle-filled" size="24" class="text-primary-800" />
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
import { ref, computed } from "vue"
import Icon from "@components/Icon.vue"

const emit = defineEmits(["update:modelValue"])
const props = defineProps({
  label: { type: String, default: "Upload File" },
  fullscreenPreview: { type: Boolean, default: false },
})

const fileName = ref("")
const filePreview = ref("")

const isImage = computed(() => {
  if (!fileName.value) return false
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
