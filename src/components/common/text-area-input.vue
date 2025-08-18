<script setup>
defineProps({
  modelValue: String,
  value: String,
  placeholder: String,
  label: String,
  required: Boolean,
  dense: Boolean,
  rows: { type: [String, Number], default: 2 },
})

const emit = defineEmits(["update:modelValue"])
</script>

<template>
  <div>
    <label v-if="label" class="text-primary-400 mb-1 block" :class="dense ? 'text-xs' : 'text-sm'">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <textarea
      :placeholder="placeholder"
      :value="value ?? modelValue"
      :rows="rows"
      :required="required"
      class="bg-primary-50 border-primary-200 text-primary-600 placeholder:text-primary-300 focus:border-primary-500 focus:ring-primary-500/10 w-full rounded-lg border px-4 py-2.5 text-sm placeholder:font-light focus:ring focus:outline-none"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
