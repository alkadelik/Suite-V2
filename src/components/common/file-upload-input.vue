<script setup>
import { ref, defineEmits } from "vue"
import { Icon } from "@iconify/vue"

const emit = defineEmits(["update:modelValue"])
const props = defineProps({ label: { type: String, default: "Upload File" } })

const fileName = ref("")

const handleFileChange = (event) => {
  if (fileName.value) return
  const file = event.target.files[0]
  if (file) {
    fileName.value = file.name
    emit("update:modelValue", file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file) {
    fileName.value = file.name
    emit("update:modelValue", file)
  }
}

const preventDefaults = (event) => {
  event.preventDefault()
}

const removeFile = (event) => {
  event.stopPropagation()
  fileName.value = ""
  // Reset the input field value
  const fileInput = event.target.closest("div").querySelector("input[type='file']")
  if (fileInput) {
    fileInput.value = "" // Clear the file input
  }
  emit("update:modelValue", null)
}
</script>

<template>
  <div>
    <label class="text-primary-400 mb-1 block text-sm">{{ props.label }}</label>
    <div
      class="bg-primary-50 border-primary-200 text-primary-600 relative flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-4 text-sm"
      @dragover="preventDefaults"
      @drop="handleDrop"
    >
      <div v-if="fileName" class="flex w-full items-center gap-2">
        <Icon icon="mdi:file" class="text-primary-500 h-5 w-5" />
        <p class="text-primary-400 flex-1 truncate">
          {{ fileName }}
        </p>
        <button type="button" class="text-primary-300 text-lg" @click.stop="removeFile">
          <Icon icon="mdi:close" />
        </button>
      </div>
      <slot v-else name="placeholder">
        <div class="flex w-full flex-col items-center justify-center gap-2 text-center">
          <Icon icon="meteor-icons:upload-cloud" class="text-primary-500 text-2xl" />
          <span class="text-primary-400 text-sm">Click to upload or drag & drop</span>
          <span class="text-primary-300 text-sm">Max size: (3MB)</span>
        </div>
      </slot>

      <input
        v-if="!fileName"
        type="file"
        class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>
