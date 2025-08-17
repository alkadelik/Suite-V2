<script setup>
import { ref, watch } from "vue"
import { Icon } from "@iconify/vue"
import checkbox from "./checkbox.vue"

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, required: true }, // [{ label, value }]
  label: String,
  placeholder: { type: String, default: "Select options..." },
  required: Boolean,
  error: String,
  menuDirection: { type: String, default: "down" },
})

const emit = defineEmits(["update:modelValue"])
const selected = ref([...props.modelValue])
const open = ref(false)

const isSelected = (item) => selected.value.some((s) => s.value === item.value)

const toggleSelection = (item) => {
  const index = selected.value.findIndex((s) => s.value === item.value)
  if (index > -1) {
    selected.value.splice(index, 1)
  } else {
    selected.value.push(item)
  }
  emit("update:modelValue", [...selected.value])
}

const removeTag = (item) => {
  selected.value = selected.value.filter((s) => s.value !== item.value)
  emit("update:modelValue", [...selected.value])
}

watch(
  () => props.modelValue,
  (newVal) => {
    selected.value = [...newVal]
  },
  { deep: true },
)
</script>

<template>
  <div>
    <label v-if="label" class="text-brand-400 mb-1 block text-xs capitalize">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <!-- Button-like input with tags -->
      <div
        class="bg-brand-50 border-brand-200 text-brand-600 focus-within:border-brand-500 focus-within:ring-brand-500/10 relative flex w-full cursor-pointer flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring"
        @click="open = !open"
      >
        <template v-if="selected.length">
          <span
            v-for="item in selected"
            :key="item.value"
            class="bg-brand-500/20 text-brand-500 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
          >
            <span>{{ item.label }}</span>
            <Icon icon="mdi:close" class="h-3 w-3 cursor-pointer" @click.stop="removeTag(item)" />
          </span>
        </template>
        <span v-else class="text-brand-300">{{ placeholder }}</span>
        <Icon icon="mdi:menu-down" class="text-brand-300 ml-auto h-5 w-5" />
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
          class="absolute z-10 mb-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-2 shadow-md ring-1 ring-black/10 focus:outline-none"
          :class="menuDirection === 'up' ? 'bottom-full' : 'top-full'"
        >
          <li
            v-for="item in options"
            :key="item.value"
            class="hover:bg-brand-100 text-brand-600 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm"
            @click.stop="toggleSelection(item)"
          >
            <!-- <input type="checkbox" class="form-checkbox" :checked="isSelected(item)" /> -->
            <checkbox :model-value="isSelected(item)" />
            <span>{{ item.label }}</span>
          </li>
          <li v-if="!options.length" class="text-brand-300 py-2 text-center text-sm">
            No options available
          </li>
        </ul>
      </transition>
    </div>

    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<style scoped>
.form-checkbox {
  accent-color: var(--color-brand-500);
}
</style>
