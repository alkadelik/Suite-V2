<script setup>
import Chip from "./chip.vue";

defineProps({
  variant: { type: String, default: "warning" },
  label: { type: String, default: "Note" },
  text: { type: String, default: "" },
  customClass: { type: [String, Array], default: "" },
  textClass: { type: String, default: "" },
});
</script>

<template>
  <div class="bg-white p-2 rounded-lg" :class="customClass">
    <Chip :variant="variant" dense :label="label" />
    <div class="text-sm mt-2 px-1" :class="textClass">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>
