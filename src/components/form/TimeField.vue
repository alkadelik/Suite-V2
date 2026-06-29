<template>
  <label
    class="relative flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 transition-colors focus-within:border-gray-300"
  >
    <span class="text-sm text-gray-400">{{ label }}</span>
    <span class="text-core-800 text-sm font-medium">{{ displayValue }}</span>
    <input
      type="time"
      :value="modelValue"
      class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      @click="openPicker"
      @input="onInput"
    />
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue"

/**
 * A compact time picker styled as a pill: a muted label (e.g. "From"/"To")
 * with the selected time rendered in 12-hour format on the right. A
 * transparent native `<input type="time">` is overlaid so the browser's
 * accessible time picker is used while the value stays a clean 24h "HH:MM".
 */
const props = defineProps<{
  /** Time value in 24-hour "HH:MM" format */
  modelValue: string
  /** Leading label, e.g. "From" or "To" */
  label: string
}>()

const emit = defineEmits<{ "update:modelValue": [value: string] }>()

const displayValue = computed(() => {
  const value = props.modelValue
  if (!value || !/^\d{1,2}:\d{2}/.test(value)) return "--:-- --"
  const [hours, minutes] = value.split(":").map((part) => Number(part))
  const period = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`
})

const onInput = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value)
}

// Open the native picker on click where supported (Chrome/Edge/Safari),
// so tapping anywhere on the pill reveals the time picker.
const openPicker = (event: MouseEvent) => {
  const target = event.target as HTMLInputElement & { showPicker?: () => void }
  try {
    target.showPicker?.()
  } catch {
    /* showPicker can throw if not user-activated — the native focus handles it */
  }
}
</script>
