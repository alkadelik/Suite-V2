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
    <label v-if="label" class="text-core-800 mb-2 block" :class="dense ? 'text-xs' : 'text-sm'">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
      <span v-if="tooltipText" v-tooltip.right="tooltipText" class="ml-1 inline-flex align-middle">
        <Icon icon="mdi:information-outline" class="text-core-800" :size="18" />
      </span>
    </label>
    <div class="relative">
      <span
        v-if="prefix"
        class="border-core-50 text-core-800 absolute top-0.5 left-px flex h-[90%] w-max items-center rounded-l-lg border-r pr-2.5 pl-1.5 text-sm"
        :class="disabled ? 'bg-gray-200' : 'bg-core-0'"
      >
        {{ prefix }}
      </span>
      <input
        :type="inputType"
        :placeholder="placeholder"
        :value="modelValue"
        :class="[
          'bg-core-0 border-core-50 w-full rounded-2xl border',
          dense ? 'h-10 px-3 py-1.5' : 'h-12 px-4 py-2.5',
          prefix && '!pl-14',
          'text-primary-600 placeholder:text-disabled-text text-sm placeholder:font-light',
          'focus:border-primary-500 focus:ring-primary-500/10 focus:ring focus:outline-none disabled:bg-gray-200 disabled:opacity-80',
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
        class="text-core-800 absolute inset-y-0 right-3 text-base outline-none"
        @click="showPassword = !showPassword"
      >
        <Icon :icon="showPassword ? 'mdi:hide' : 'mdi:show'" />
      </button>

      <Icon
        v-if="appendIcon"
        :icon="appendIcon"
        class="text-primary-500 absolute top-3.5 right-2 h-5 w-5"
        @click="emit('click:append')"
      />

      <span
        v-if="suffix"
        class="text-core-800 absolute top-0.5 right-px flex h-[90%] w-max items-center rounded-r-lg border-0 px-1.5"
        :class="disabled ? 'bg-gray-200' : 'bg-core-0'"
      >
        {{ suffix }}
      </span>
    </div>
    <p v-if="error || hint" :class="[error ? 'text-red-500' : 'text-core-800', 'mt-1 text-xs']">
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
