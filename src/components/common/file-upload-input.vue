<script setup>
import { ref, defineEmits } from "vue";
import { Icon } from "@iconify/vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({ label: { type: String, default: "Upload File" } });

const fileName = ref("");

const handleFileChange = (event) => {
  if (fileName.value) return;
  const file = event.target.files[0];
  if (file) {
    fileName.value = file.name;
    emit("update:modelValue", file);
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    fileName.value = file.name;
    emit("update:modelValue", file);
  }
};

const preventDefaults = (event) => {
  event.preventDefault();
};

const removeFile = (event) => {
  event.stopPropagation();
  fileName.value = "";
  // Reset the input field value
  const fileInput = event.target.closest("div").querySelector("input[type='file']");
  if (fileInput) {
    fileInput.value = ""; // Clear the file input
  }
  emit("update:modelValue", null);
};
</script>

<template>
  <div>
    <label class="mb-1 block text-sm text-brand-400">{{ props.label }}</label>
    <div
      class="relative w-full rounded-lg bg-brand-50 border border-brand-200 px-4 py-4 text-sm text-brand-600 cursor-pointer flex items-center justify-between"
      @dragover="preventDefaults"
      @drop="handleDrop"
    >
      <div v-if="fileName" class="flex items-center gap-2 w-full">
        <Icon icon="mdi:file" class="h-5 w-5 text-brand-500" />
        <p class="flex-1 truncate text-brand-400">
          {{ fileName }}
        </p>
        <button type="button" class="text-brand-300 text-lg" @click.stop="removeFile">
          <Icon icon="mdi:close" />
        </button>
      </div>
      <slot v-else name="placeholder">
        <div class="flex flex-col items-center justify-center gap-2 text-center w-full">
          <Icon icon="meteor-icons:upload-cloud" class="text-brand-500 text-2xl" />
          <span class="text-sm text-brand-400">Click to upload or drag & drop</span>
          <span class="text-sm text-brand-300">Max size: (3MB)</span>
        </div>
      </slot>

      <input
        v-if="!fileName"
        type="file"
        class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>
