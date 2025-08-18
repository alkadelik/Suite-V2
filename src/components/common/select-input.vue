<script setup>
import { ref, computed } from "vue"
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from "@headlessui/vue"
import { Icon } from "@iconify/vue"

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
})

const emit = defineEmits(["update:modelValue"])

const query = ref("")

const selectedValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
})

const filteredOptions = computed(() => {
  if (!query.value) return props.options
  return props.options.filter((opt) =>
    opt.label
      .toLowerCase()
      .replace(/\s+/g, "")
      .includes(query.value.toLowerCase().replace(/\s+/g, "")),
  )
})
</script>

<template>
  <div>
    <label
      v-if="label"
      class="text-primary-400 mb-1 block capitalize"
      :class="dense ? 'text-xs' : 'text-sm'"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <Combobox v-model="selectedValue">
      <div class="relative">
        <!-- Clickable button containing the input -->
        <ComboboxButton
          class="bg-primary-50 relative flex w-full cursor-text items-center rounded-lg border px-3 text-left"
          :class="[
            dense ? 'h-10 text-xs' : 'h-12 text-sm',
            error
              ? 'border-error'
              : 'border-primary-200 focus-within:ring-primary-500/10 focus-within:ring',
            !searchable ? 'cursor-pointer' : 'cursor-text',
          ]"
        >
          <ComboboxInput
            class="placeholder:text-primary-300 text-primary-600 w-full border-none bg-transparent focus:ring-0 focus:outline-none"
            :class="!searchable ? 'cursor-pointer' : 'cursor-text'"
            :placeholder="placeholder"
            :display-value="(item) => item?.label"
            :readonly="!searchable"
            @change="query = $event.target.value"
          />
          <Icon
            icon="mdi:menu-down"
            class="text-primary-300 ml-2 shrink-0"
            :class="dense ? 'h-5 w-5' : 'h-6 w-6'"
            aria-hidden="true"
          />
        </ComboboxButton>

        <!-- Hidden select for submission -->
        <select
          v-if="required || name"
          :value="selectedValue?.value || selectedValue?.label"
          :name="name"
          class="pointer-events-none absolute bottom-0 left-0 h-[1px] w-full opacity-0"
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
            class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg bg-white py-1 shadow-md ring-1 ring-black/10 focus:outline-none"
            :class="menuDirection === 'up' ? 'bottom-full' : 'top-full'"
          >
            <div
              v-if="!filteredOptions.length && query !== ''"
              class="text-primary-300 cursor-default px-4 py-2 text-sm select-none"
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
                  active ? 'bg-primary-100 text-primary-500' : 'text-primary-600',
                  'cursor-pointer px-4 py-2 select-none',
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

    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>
