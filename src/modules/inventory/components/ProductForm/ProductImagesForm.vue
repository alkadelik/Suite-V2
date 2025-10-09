<template>
  <div class="space-y-6">
    <div>
      <MultiFileInput v-model="images" :number-of-images="5" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import MultiFileInput from "@components/form/MultiFileInput.vue"

interface Props {
  /** Product images */
  modelValue: Array<File | string | null>
}

interface Emits {
  /** Update images */
  "update:modelValue": [value: Array<File | string | null>]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const images = computed({
  get: () => props.modelValue,
  set: (val: Array<File | string | null>) => emit("update:modelValue", val),
})
</script>
