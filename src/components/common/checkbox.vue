<script setup>
import { computed } from "vue"

const props = defineProps({
  modelValue: Boolean,
  label: String,
  required: Boolean,
  dense: Boolean,
  disabled: Boolean,
  checkPosition: {
    type: String,
    default: "left",
  },
  checkColor: {
    type: String,
    default: "", // fallback to default if not provided
  },
  size: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(["update:modelValue"])

const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`

const resolvedCheckColor = computed(() => props.checkColor || "#008060")

const isRight = computed(() => props.checkPosition === "right")
</script>

<template>
  <div :class="['flex items-center space-x-2', isRight ? 'flex-row-reverse' : '']">
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="border-primary-300 text-primary-500 focus:ring-primary-400 rounded"
      :class="!size ? (dense ? 'h-4 w-4' : 'h-5 w-5') : ''"
      :style="{
        accentColor: resolvedCheckColor,
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
      }"
      @change="emit('update:modelValue', $event.target.checked)"
    />

    <label
      v-if="label || $slots.default"
      :for="checkboxId"
      class="text-primary-300"
      :class="[dense ? 'text-xs' : 'text-sm', disabled ? 'cursor-not-allowed' : 'cursor-pointer']"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
