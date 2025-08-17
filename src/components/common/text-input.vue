<script setup>
import { Icon } from "@iconify/vue"
import { ref, computed } from "vue"

const props = defineProps({
  modelValue: { type: [String, Number] },
  type: { type: String, default: "text" },
  placeholder: String,
  label: String,
  required: Boolean,
  dense: Boolean,
  disabled: Boolean,
  min: { type: [String, Number] },
  max: { type: [String, Number] },
  appendIcon: String,
  suffix: String,
  prefix: String,
  error: String,
  hint: String,
  name: String,
  tooltipText: String,
})

const emit = defineEmits([
  "update:modelValue",
  "enter",
  "click:append",
  "input",
  "keypress",
  "change",
])
const showPassword = ref(false)
const inputType = computed(() =>
  props.type === "password" ? (showPassword.value ? "text" : "password") : props.type,
)
</script>

<template>
  <div>
    <label v-if="label" class="mb-2 block text-neutral-800" :class="dense ? 'text-xs' : 'text-sm'">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
      <span v-if="tooltipText" v-tooltip.right="tooltipText" class="ml-1 inline-flex align-middle">
        <Icon icon="mdi:information-outline" class="text-neutral-800" :size="18" />
      </span>
    </label>
    <div class="relative">
      <span
        v-if="prefix"
        class="absolute top-0.5 left-px flex h-[90%] w-max items-center rounded-l-lg border-r border-neutral-50 pr-2.5 pl-1.5 text-sm text-neutral-800"
        :class="disabled ? 'bg-gray-200' : 'bg-neutral-0'"
      >
        {{ prefix }}
      </span>
      <input
        :type="inputType"
        :placeholder="placeholder"
        :value="modelValue"
        :class="[
          'bg-neutral-0 w-full rounded-2xl border border-neutral-50',
          dense ? 'h-10 px-3 py-1.5' : 'h-12 px-4 py-2.5',
          prefix && '!pl-14',
          'text-brand-600 placeholder:text-disabled-text text-sm placeholder:font-light',
          'focus:border-brand-500 focus:ring-brand-500/10 focus:ring focus:outline-none disabled:bg-gray-200 disabled:opacity-80',
        ]"
        :required="required"
        :min="min"
        :max="max"
        v-bind="$attrs"
        :name="name"
        :disabled="disabled"
        @input="
          (e) => {
            emit(
              'update:modelValue',
              type === 'number' ? Number(e.target.value) || null : e.target.value,
            )
            emit('input', e)
          }
        "
        @change="emit('change', $event)"
        @keypress="emit('keypress', $event)"
        @keydown="
          (e) => {
            if (props.type === 'number' && ['e', 'E', '+', '-'].includes(e.key)) {
              e.preventDefault()
            }
            emit('keypress', e)
          }
        "
      />
      <button
        v-if="props.type === 'password'"
        type="button"
        class="absolute inset-y-0 right-3 text-base text-neutral-800 outline-none"
        @click="showPassword = !showPassword"
      >
        <Icon :icon="showPassword ? 'mdi:hide' : 'mdi:show'" />
      </button>

      <Icon
        v-if="appendIcon"
        :icon="appendIcon"
        class="text-brand-500 absolute top-3.5 right-2 h-5 w-5"
        @click="emit('click:append')"
      />

      <span
        v-if="suffix"
        class="absolute top-0.5 right-px flex h-[90%] w-max items-center rounded-r-lg border-0 px-1.5 text-neutral-800"
        :class="disabled ? 'bg-gray-200' : 'bg-neutral-0'"
      >
        {{ suffix }}
      </span>
    </div>
    <p v-if="error || hint" :class="[error ? 'text-red-500' : 'text-neutral-800', 'mt-1 text-xs']">
      {{ error || hint }}
    </p>
  </div>
</template>

<style scoped>
input {
  -webkit-appearance: none;
  appearance: none;
}
</style>
