<script setup>
const props = defineProps({
  modelValue: [String, Number, Boolean], // Selected value
  options: Array, // Array of { value, label }
  name: String,
  label: String,
  required: Boolean,
  dense: Boolean,
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
  <div>
    <!-- Group Label -->
    <label class="text-primary-400 mb-1 block" :class="dense ? 'text-xs' : 'text-sm'">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Radio Group -->
    <div class="flex flex-wrap gap-2">
      <div
        v-for="option in options"
        :key="option.value"
        :class="[
          'bg-primary-50 border-primary-200 flex cursor-pointer items-center gap-1 rounded-lg border transition-all',
          dense ? 'h-8 pr-3 pl-2' : 'h-10 pr-4 pl-3',
          { 'border-primary-500': modelValue === option.value },
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
            'text-primary-500 bg-primary-50 border-primary-300 h-4 w-4',
            'accent-primary-500 focus:ring-0 focus:outline-none',
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
            modelValue === option.value ? 'text-primary-500' : 'text-primary-400',
          ]"
        >
          {{ option.label }}
        </label>
      </div>
    </div>
  </div>
</template>
