<script setup>
import Chip from "./chip.vue"

defineProps({
  variant: { type: String, default: "warning" },
  label: { type: String, default: "Note" },
  text: { type: String, default: "" },
  customClass: { type: [String, Array], default: "" },
  textClass: { type: String, default: "" },
})
</script>

<template>
  <div class="rounded-lg bg-white p-2" :class="customClass">
    <Chip :variant="variant" dense :label="label" />
    <div class="mt-2 px-1 text-sm" :class="textClass">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>
