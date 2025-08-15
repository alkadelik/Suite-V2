<script setup>
import { ref, computed } from "vue";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from "@headlessui/vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  modelValue: Object,
  options: { type: Array, required: true }, // [{ label, value }]
  label: String,
  placeholder: { type: String, default: "Select..." },
  required: Boolean,
  name: String,
  dense: Boolean,
  error: String,
  searchable: { type: Boolean, default: false },
  menuDirection: { type: String, default: "down" },
});

const emit = defineEmits(["update:modelValue"]);

const query = ref("");

const selectedValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const filteredOptions = computed(() => {
  if (!query.value) return props.options;
  return props.options.filter((opt) =>
    opt.label
      .toLowerCase()
      .replace(/\s+/g, "")
      .includes(query.value.toLowerCase().replace(/\s+/g, "")),
  );
});
</script>

<template>
  <div>
    <label
      v-if="label"
      class="mb-1 block text-brand-400 capitalize"
      :class="dense ? 'text-xs' : 'text-sm'"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <Combobox v-model="selectedValue">
      <div class="relative">
        <!-- Clickable button containing the input -->
        <ComboboxButton
          class="relative w-full cursor-text rounded-lg border bg-brand-50 text-left flex items-center px-3"
          :class="[
            dense ? 'h-10 text-xs' : 'h-12 text-sm',
            error
              ? 'border-error'
              : 'border-brand-200 focus-within:ring focus-within:ring-brand-500/10',
            !searchable ? 'cursor-pointer' : 'cursor-text',
          ]"
        >
          <ComboboxInput
            class="w-full bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-brand-300 text-brand-600"
            :class="!searchable ? 'cursor-pointer' : 'cursor-text'"
            :placeholder="placeholder"
            :display-value="(item) => item?.label"
            :readonly="!searchable"
            @change="query = $event.target.value"
          />
          <Icon
            icon="mdi:menu-down"
            class="text-brand-300 shrink-0 ml-2"
            :class="dense ? 'w-5 h-5' : 'w-6 h-6'"
            aria-hidden="true"
          />
        </ComboboxButton>

        <!-- Hidden select for submission -->
        <select
          v-if="required || name"
          :value="selectedValue?.value || selectedValue?.label"
          :name="name"
          class="w-full h-[1px] absolute bottom-0 left-0 opacity-0 pointer-events-none"
          required
        >
          <option value="" disabled selected></option>
          <option v-for="opt in props.options" :key="opt.label" :value="opt.value || opt.label">
            {{ opt.value || opt.label }}
            {{ opt.label }}
          </option>
        </select>

        <!-- Dropdown -->
        <TransitionRoot
          leave="transition ease-in duration-100"
          leave-from="opacity-100"
          leave-to="opacity-0"
          @after-leave="query = ''"
        >
          <ComboboxOptions
            class="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-lg bg-white py-1 shadow-md ring-1 ring-black/10 focus:outline-none"
            :class="menuDirection === 'up' ? 'bottom-full' : 'top-full'"
          >
            <div
              v-if="!filteredOptions.length && query !== ''"
              class="cursor-default select-none px-4 py-2 text-brand-300 text-sm"
            >
              No options found.
            </div>

            <ComboboxOption
              v-for="opt in filteredOptions"
              :key="opt.label"
              v-slot="{ selected, active }"
              :value="opt"
              as="template"
            >
              <li
                :class="[
                  active ? 'bg-brand-100 text-brand-500' : 'text-brand-600',
                  'cursor-pointer select-none py-2 px-4',
                  dense ? 'text-xs' : 'text-sm',
                ]"
              >
                <slot name="label" :item="opt">
                  <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                    {{ opt.label }}
                  </span>
                </slot>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </TransitionRoot>
      </div>
    </Combobox>

    <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
  </div>
</template>
