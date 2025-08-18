<script setup>
const props = defineProps({
  modelValue: [String, Number, Boolean],
  options: Array, // [{ value, disabled }]
  name: String,
  required: Boolean,
  disabled: Boolean,
})

const emit = defineEmits(["update:modelValue"])

const onChange = (option) => {
  if (!props.disabled && !option.disabled) {
    emit("update:modelValue", option.value)
  }
}
</script>

<template>
  <div class="flex gap-3">
    <div
      v-for="option in options"
      :key="option.value"
      class="w-1/2 cursor-pointer rounded-md border p-3 transition-all"
      :class="[
        modelValue === option.value ? 'border-primary-500 bg-primary-50' : 'border-primary-200',
        option.disabled ? 'pointer-events-none opacity-60' : '',
      ]"
      @click="onChange(option)"
    >
      <!-- Top Section: Label Slot + Radio -->
      <div class="flex items-center justify-between">
        <div class="text-primary-600 text-sm">
          <slot :name="`${option.value}-label`">
            {{ option.label }}
          </slot>
        </div>
        <input
          type="radio"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          class="text-primary-500 accent-primary-500 h-4 w-4"
          :disabled="disabled || option.disabled"
          @change="onChange(option)"
        />
      </div>

      <!-- Bottom Section: Description Slot -->
      <div class="text-primary-400 mt-2 text-xs">
        <slot :name="`${option.value}-description`" />
      </div>
    </div>
  </div>
</template>
