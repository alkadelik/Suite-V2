<script setup>
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";
import { computed } from "vue";

const props = defineProps({
  modelValue: Boolean, // Boolean value for switch state
  dense: Boolean, // Smaller size when true
  disabled: Boolean, // Disables the switch
  label: String,
});

const emit = defineEmits(["update:modelValue"]);

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<template>
  <SwitchGroup>
    <div class="flex items-center gap-1">
      <SwitchLabel v-if="label" :passive="disabled" class="text-sm text-brand-400">
        {{ label }}
      </SwitchLabel>
      <Switch
        v-model="value"
        :disabled="disabled"
        class="relative inline-flex items-center transition-colors duration-200 ease-in-out rounded-full border-2 border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        :class="[
          value ? 'bg-brand-500' : 'bg-gray-300',
          dense ? 'h-5 w-9' : 'h-6 w-11',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]"
      >
        <span class="sr-only">Toggle</span>
        <span
          class="inline-block transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out"
          :class="[
            value ? (dense ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0',
            dense ? 'h-4 w-4' : 'h-5 w-5',
          ]"
        />
      </Switch>
    </div>
  </SwitchGroup>
</template>
