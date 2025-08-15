<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: "Search..." },
  class: { type: [String, Array], default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const hasText = computed(() => props.modelValue?.length);
</script>

<template>
  <div class="relative w-full" :class="props.class">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      class="absolute left-3 top-1/2 h-5 w-5 text-brand-500 -translate-y-1/2"
    >
      <path
        opacity=".4"
        d="M11.5 21a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z"
        fill="currentColor"
      ></path>
      <path
        d="M21.3 21.999c-.18 0-.36-.07-.49-.2l-1.86-1.86a.706.706 0 0 1 0-.99c.27-.27.71-.27.99 0l1.86 1.86c.27.27.27.71 0 .99-.14.13-.32.2-.5.2Z"
        fill="currentColor"
      ></path>
    </svg>

    <!-- Input Field -->
    <input
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      :class="[
        'h-11 w-full rounded-lg border border-brand-200 bg-brand-50 pl-10 pr-10 py-2.5',
        'text-sm placeholder:text-brand-300 focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10',
      ]"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <!-- Clear Button -->
    <button
      v-if="hasText"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-300"
      @click="emit('update:modelValue', '')"
    >
      <svg
        class="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
