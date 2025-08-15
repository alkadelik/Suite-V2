<script setup>
import { VsxIcon } from "vue-iconsax";

defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [String, Number],
    default: 24,
  },
  color: {
    type: String,
    default: "currentColor",
  },
  type: {
    type: String,
    default: "bulk", // can be 'linear', 'bold', 'bulk', 'broken', 'outline', 'twotone'
  },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <span v-bind="$attrs" @click="emit('click')">
    <VsxIcon :icon-name="name" :size="size" :color="color" :type="type" />
  </span>
</template>
