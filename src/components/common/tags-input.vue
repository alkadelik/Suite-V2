<script setup>
import { Icon } from "@iconify/vue"
import { ref, computed } from "vue"

const props = defineProps({
  placeholder: { type: String, default: "Input value" },
  modelValue: { type: Array, default: () => [] },
  label: String,
  required: Boolean,
})

const emit = defineEmits(["update:modelValue"])

const inputValue = ref("")
const tags = ref([...props.modelValue].filter(Boolean)) // Filter out falsy values

const uniqueTags = computed(() => [...new Set(tags.value)])

const addTag = () => {
  if (inputValue.value.trim()) {
    tags.value.push(inputValue.value.trim())
    inputValue.value = ""
    emit("update:modelValue", uniqueTags.value)
  }
}

const handleBackspace = () => {
  if (!inputValue.value.trim()) {
    tags.value.pop()
    emit("update:modelValue", uniqueTags.value)
  }
}

const removeTag = (tag) => {
  tags.value = tags.value.filter((t) => t !== tag)
  emit("update:modelValue", uniqueTags.value)
}
</script>

<template>
  <div>
    <!-- Label -->
    <label v-if="label" class="text-primary-400 mb-1 block text-sm">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Tag Input Container -->
    <div
      :class="[
        'bg-primary-50 border-primary-200 flex min-h-12 w-full flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm',
        'text-primary-600 focus-within:border-primary-500 focus-within:ring-primary-500/10 focus-within:ring',
      ]"
    >
      <!-- Tags -->
      <span
        v-for="tag in uniqueTags"
        :key="tag"
        class="bg-primary-500/20 text-primary-500 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
      >
        <span>{{ tag }}</span>
        <Icon icon="mdi:close" class="h-3 w-3" @click="removeTag(tag)" />
      </span>

      <!-- Input -->
      <input
        v-model="inputValue"
        :placeholder="placeholder"
        class="placeholder:text-primary-300 flex-1 bg-transparent focus:outline-none"
        @keydown.enter.prevent="addTag"
        @keydown="
          (e) => {
            if (e.key === ',') {
              e.preventDefault()
              addTag()
            }
          }
        "
        @keydown.backspace="handleBackspace"
      />
    </div>
    <p class="text-primary-300 mt-1 text-xs">Press Enter or use a Comma to save.</p>
  </div>
</template>
