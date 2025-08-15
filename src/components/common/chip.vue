<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  label: { type: String },
  class: { type: [String, Array], default: "" },
  variant: { type: String },
  dense: Boolean,
  icon: String,
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["click"]);

const variantClass = computed(() => {
  switch (props.variant) {
    case "success":
      return "bg-brand-500/10 text-brand-500";
    case "warning":
      return "bg-yellow-600/20 text-yellow-600";
    case "error":
      return "bg-error/10 text-error";
    case "none":
      return "border-0";
    default:
      return "bg-brand-50 text-brand-400 border border-brand-200";
  }
});
</script>

<template>
  <span
    :class="[
      variantClass,
      'rounded-full inline-flex items-center gap-1',
      dense ? 'px-2.5 py-1 text-xs' : 'px-3 py-2 text-sm',
      props.class,
      { '!bg-gray-600/20 !text-gray-600': disabled },
    ]"
    @click="emit('click')"
  >
    <slot><Icon v-if="icon" :icon="icon" :class="dense ? 'h-4 w-4' : 'h-6 w-6'" />{{ label }}</slot>
  </span>
</template>
