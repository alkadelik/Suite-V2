<script setup>
const props = defineProps({
  modelValue: [String, Number, Boolean],
  options: Array, // [{ value, disabled }]
  name: String,
  required: Boolean,
  disabled: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const onChange = (option) => {
  if (!props.disabled && !option.disabled) {
    emit("update:modelValue", option.value);
  }
};
</script>

<template>
  <div class="flex gap-3">
    <div
      v-for="option in options"
      :key="option.value"
      class="w-1/2 border rounded-md p-3 cursor-pointer transition-all"
      :class="[
        modelValue === option.value ? 'border-brand-500 bg-brand-50' : 'border-brand-200',
        option.disabled ? 'opacity-60 pointer-events-none' : '',
      ]"
      @click="onChange(option)"
    >
      <!-- Top Section: Label Slot + Radio -->
      <div class="flex justify-between items-center">
        <div class="text-sm text-brand-600">
          <slot :name="`${option.value}-label`">
            {{ option.label }}
          </slot>
        </div>
        <input
          type="radio"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          class="text-brand-500 w-4 h-4 accent-brand-500"
          :disabled="disabled || option.disabled"
          @change="onChange(option)"
        />
      </div>

      <!-- Bottom Section: Description Slot -->
      <div class="mt-2 text-xs text-brand-400">
        <slot :name="`${option.value}-description`" />
      </div>
    </div>
  </div>
</template>
