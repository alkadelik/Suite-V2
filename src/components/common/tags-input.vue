<script setup>
import { Icon } from "@iconify/vue";
import { ref, computed } from "vue";

const props = defineProps({
  placeholder: { type: String, default: "Input value" },
  modelValue: { type: Array, default: () => [] },
  label: String,
  required: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = ref("");
const tags = ref([...props.modelValue].filter(Boolean)); // Filter out falsy values

const uniqueTags = computed(() => [...new Set(tags.value)]);

const addTag = () => {
  if (inputValue.value.trim()) {
    tags.value.push(inputValue.value.trim());
    inputValue.value = "";
    emit("update:modelValue", uniqueTags.value);
  }
};

const handleBackspace = () => {
  if (!inputValue.value.trim()) {
    tags.value.pop();
    emit("update:modelValue", uniqueTags.value);
  }
};

const removeTag = (tag) => {
  tags.value = tags.value.filter((t) => t !== tag);
  emit("update:modelValue", uniqueTags.value);
};
</script>

<template>
  <div>
    <!-- Label -->
    <label v-if="label" class="mb-1 block text-sm text-brand-400">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Tag Input Container -->
    <div
      :class="[
        'min-h-12 flex flex-wrap items-center gap-2 w-full rounded-lg bg-brand-50 border border-brand-200 px-3 py-2 text-sm',
        'text-brand-600 focus-within:border-brand-500 focus-within:ring focus-within:ring-brand-500/10',
      ]"
    >
      <!-- Tags -->
      <span
        v-for="tag in uniqueTags"
        :key="tag"
        class="flex items-center gap-1.5 text-xs font-medium bg-brand-500/20 text-brand-500 px-2 py-1 rounded-md"
      >
        <span>{{ tag }}</span>
        <Icon icon="mdi:close" class="h-3 w-3" @click="removeTag(tag)" />
      </span>

      <!-- Input -->
      <input
        v-model="inputValue"
        :placeholder="placeholder"
        class="flex-1 bg-transparent focus:outline-none placeholder:text-brand-300"
        @keydown.enter.prevent="addTag"
        @keydown="
          (e) => {
            if (e.key === ',') {
              e.preventDefault();
              addTag();
            }
          }
        "
        @keydown.backspace="handleBackspace"
      />
    </div>
    <p class="text-brand-300 text-xs mt-1">Press Enter or use a Comma to save.</p>
  </div>
</template>
