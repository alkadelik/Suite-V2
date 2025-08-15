<script setup>
import { ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import checkbox from "./checkbox.vue";

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, required: true }, // [{ label, value }]
  label: String,
  placeholder: { type: String, default: "Select options..." },
  required: Boolean,
  error: String,
  menuDirection: { type: String, default: "down" },
});

const emit = defineEmits(["update:modelValue"]);
const selected = ref([...props.modelValue]);
const open = ref(false);

const isSelected = (item) => selected.value.some((s) => s.value === item.value);

const toggleSelection = (item) => {
  const index = selected.value.findIndex((s) => s.value === item.value);
  if (index > -1) {
    selected.value.splice(index, 1);
  } else {
    selected.value.push(item);
  }
  emit("update:modelValue", [...selected.value]);
};

const removeTag = (item) => {
  selected.value = selected.value.filter((s) => s.value !== item.value);
  emit("update:modelValue", [...selected.value]);
};

watch(
  () => props.modelValue,
  (newVal) => {
    selected.value = [...newVal];
  },
  { deep: true },
);
</script>

<template>
  <div>
    <label v-if="label" class="mb-1 block text-brand-400 capitalize text-xs">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <!-- Button-like input with tags -->
      <div
        class="relative w-full cursor-pointer rounded-lg bg-brand-50 border px-3 py-2 flex flex-wrap items-center gap-2 text-sm border-brand-200 text-brand-600 focus-within:border-brand-500 focus-within:ring focus-within:ring-brand-500/10"
        @click="open = !open"
      >
        <template v-if="selected.length">
          <span
            v-for="item in selected"
            :key="item.value"
            class="flex items-center gap-1.5 text-xs font-medium bg-brand-500/20 text-brand-500 px-2 py-1 rounded-md"
          >
            <span>{{ item.label }}</span>
            <Icon icon="mdi:close" class="h-3 w-3 cursor-pointer" @click.stop="removeTag(item)" />
          </span>
        </template>
        <span v-else class="text-brand-300">{{ placeholder }}</span>
        <Icon icon="mdi:menu-down" class="ml-auto text-brand-300 h-5 w-5" />
      </div>

      <!-- Dropdown -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <ul
          v-if="open"
          class="absolute z-10 mb-1 w-full max-h-60 overflow-auto py-2 rounded-lg bg-white shadow-md ring-1 ring-black/10 focus:outline-none"
          :class="menuDirection === 'up' ? 'bottom-full' : 'top-full'"
        >
          <li
            v-for="item in options"
            :key="item.value"
            class="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-brand-100 text-brand-600"
            @click.stop="toggleSelection(item)"
          >
            <!-- <input type="checkbox" class="form-checkbox" :checked="isSelected(item)" /> -->
            <checkbox :model-value="isSelected(item)" />
            <span>{{ item.label }}</span>
          </li>
          <li v-if="!options.length" class="text-center text-sm text-brand-300 py-2">
            No options available
          </li>
        </ul>
      </transition>
    </div>

    <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
  </div>
</template>

<style scoped>
.form-checkbox {
  accent-color: var(--color-brand-500);
}
</style>
