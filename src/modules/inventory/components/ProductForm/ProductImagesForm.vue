<template>
  <div class="space-y-6">
    <!-- Primary Image (File Upload Field) -->
    <div class="h-48">
      <FileUploadField
        v-model="primaryImage"
        label="Upload Primary Image"
        :fullscreen-preview="true"
      />
    </div>

    <!-- Additional Images (Multi File Input) -->
    <div>
      <MultiFileInput v-model="additionalImages" :number-of-images="4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import MultiFileInput from "@components/form/MultiFileInput.vue"
import FileUploadField from "@components/form/FileUploadField.vue"

interface Props {
  /** Product images */
  modelValue: Array<File | string | null>
}

interface Emits {
  /** Update images */
  "update:modelValue": [value: Array<File | string | null>]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Primary image (first slot)
const primaryImage = computed({
  get: () => props.modelValue[0] || null,
  set: (val: File | string | null) => {
    const newImages = [...props.modelValue]
    newImages[0] = val
    emit("update:modelValue", newImages)
  },
})

// Additional images (remaining 4 slots)
const additionalImages = computed({
  get: () => props.modelValue.slice(1, 5),
  set: (val: Array<File | string | null>) => {
    const newImages = [primaryImage.value, ...val]
    emit("update:modelValue", newImages)
  },
})
</script>
