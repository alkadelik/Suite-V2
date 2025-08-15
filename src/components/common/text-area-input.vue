<script setup>
defineProps({
  modelValue: String,
  value: String,
  placeholder: String,
  label: String,
  required: Boolean,
  dense: Boolean,
  rows: { type: [String, Number], default: 2 },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div>
    <label v-if="label" class="mb-1 block text-brand-400" :class="dense ? 'text-xs' : 'text-sm'">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <textarea
      :placeholder="placeholder"
      :value="value ?? modelValue"
      :rows="rows"
      :required="required"
      class="w-full rounded-lg bg-brand-50 border border-brand-200 px-4 py-2.5 text-sm text-brand-600 placeholder:text-brand-300 placeholder:font-light focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-500/10"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
