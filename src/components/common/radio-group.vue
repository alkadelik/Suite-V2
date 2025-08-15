<script setup>
const props = defineProps({
  modelValue: [String, Number, Boolean], // Selected value
  options: Array, // Array of { value, label }
  name: String,
  label: String,
  required: Boolean,
  dense: Boolean,
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
  <div>
    <!-- Group Label -->
    <label class="mb-1 block text-brand-400" :class="dense ? 'text-xs' : 'text-sm'">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Radio Group -->
    <div class="flex flex-wrap gap-2">
      <div
        v-for="option in options"
        :key="option.value"
        :class="[
          'bg-brand-50 flex items-center gap-1 border border-brand-200 rounded-lg cursor-pointer transition-all',
          dense ? 'h-8 pl-2 pr-3' : 'h-10 pl-3 pr-4',
          { 'border-brand-500': modelValue === option.value },
          { 'opacity-70': disabled || option.disabled },
        ]"
        @click="onChange(option)"
      >
        <input
          type="radio"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          :class="[
            'w-4 h-4 text-brand-500 bg-brand-50 border-brand-300',
            'focus:outline-none focus:ring-0 accent-brand-500',
          ]"
          :disabled="disabled || option.disabled"
          :required="required"
          @change="onChange(option)"
        />
        <label
          class=""
          :class="[
            'w-full cursor-pointer',
            dense ? 'text-xs' : 'text-sm',
            modelValue === option.value ? 'text-brand-500' : 'text-brand-400',
          ]"
        >
          {{ option.label }}
        </label>
      </div>
    </div>
  </div>
</template>
