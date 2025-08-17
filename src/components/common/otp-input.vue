<script setup>
import { ref, onMounted, watch } from "vue"

const props = defineProps({
  modelValue: String,
  length: { type: Number, default: 6 },
  dense: Boolean,
  disabled: Boolean,
  error: String,
  hint: String,
  label: String,
  class: String,
  digitsOnly: { type: Boolean, default: true },
})

const emit = defineEmits(["update:modelValue"])

const values = ref(Array(props.length).fill(""))
const inputs = ref([])

onMounted(() => {
  if (props.modelValue) {
    for (let i = 0; i < props.length; i++) {
      values.value[i] = props.modelValue[i] || ""
    }
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (!val) values.value = Array(props.length).fill("")
  },
)

const focusInput = (index) => {
  const input = inputs.value[index]
  if (input) input.focus()
}

const handleInput = (e, index) => {
  let val = e.target.value.slice(-1) // only last digit

  // If digitsOnly is enabled, filter out non-digit characters
  if (props.digitsOnly && val && !/^\d$/.test(val)) {
    e.target.value = values.value[index] || ""
    return
  }

  values.value[index] = val
  emit("update:modelValue", values.value.join(""))
  if (val && index < props.length - 1) focusInput(index + 1)
}

const handleKeydown = (e, index) => {
  // If digitsOnly is enabled, prevent non-digit key presses (except control keys)
  if (props.digitsOnly && e.key.length === 1 && !/^\d$/.test(e.key)) {
    e.preventDefault()
    return
  }

  if (e.key === "Backspace" && !values.value[index] && index > 0) {
    focusInput(index - 1)
  }
}

const handlePaste = (e, index) => {
  e.preventDefault()
  let pasteData = e.clipboardData.getData("text")

  // If digitsOnly is enabled, filter out non-digit characters
  if (props.digitsOnly) {
    pasteData = pasteData.replace(/\D/g, "") // only digits
  }

  if (pasteData) {
    // Fill the inputs starting from the current index
    for (let i = 0; i < Math.min(pasteData.length, props.length - index); i++) {
      values.value[index + i] = pasteData[i]
    }

    // Emit the updated value
    emit("update:modelValue", values.value.join(""))

    // Focus the next empty input or the last input
    const nextEmptyIndex = values.value.findIndex((val, idx) => idx > index && !val)
    const focusIndex =
      nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + pasteData.length, props.length - 1)
    focusInput(focusIndex)
  }
}
</script>

<template>
  <div>
    <label v-if="label" class="text-brand-400 mb-1 block" :class="dense ? 'text-xs' : 'text-sm'">
      {{ label }}
    </label>
    <div class="flex gap-3" :class="props.class">
      <input
        v-for="(_, i) in length"
        :key="i"
        ref="inputs"
        v-model="values[i]"
        type="text"
        :inputmode="digitsOnly ? 'numeric' : 'text'"
        :pattern="digitsOnly ? '[0-9]*' : undefined"
        maxlength="1"
        class="bg-brand-50 border-brand-200 text-brand-600 focus:ring-brand-500/10 focus:border-brand-500 w-11 rounded-lg border text-center text-lg font-semibold focus:ring focus:outline-none"
        :class="[dense ? 'h-10' : 'h-12', disabled ? 'bg-gray-200 opacity-80' : '']"
        :disabled="disabled"
        @input="(e) => handleInput(e, i)"
        @keydown="(e) => handleKeydown(e, i)"
        @paste="(e) => handlePaste(e, i)"
      />
    </div>
    <p v-if="error || hint" :class="[error ? 'text-red-500' : 'text-brand-300', 'mt-1 text-xs']">
      {{ error || hint }}
    </p>
  </div>
</template>
