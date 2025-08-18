<template>
  <div>
    <label
      v-if="label"
      class="text-primary-400 mb-1 block capitalize"
      :class="dense ? 'text-xs' : 'text-sm'"
    >
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <multiselect
      :id="name || id"
      v-model="selectedValue"
      :options="options"
      :multiple="multiple"
      :searchable="searchable"
      :close-on-select="closeOnSelect"
      :clear-on-select="clearOnSelect"
      :preserve-search="preserveSearch"
      :placeholder="placeholder"
      :label="optionLabel"
      :track-by="trackBy"
      :loading="loading"
      :disabled="disabled"
      :max-height="maxHeight"
      :show-no-results="showNoResults"
      :show-no-options="showNoOptions"
      :hide-selected="hideSelected"
      :allow-empty="allowEmpty"
      :reset-after="resetAfter"
      :open-direction="openDirection"
      :show-labels="showLabels"
      :limit="limit"
      :limit-text="limitText"
      :internal-search="internalSearch"
      :custom-label="customLabel"
      :taggable="taggable"
      :tag-placeholder="tagPlaceholder"
      :tag-position="tagPosition"
      :name="name"
      :class="[
        'multiselect-custom, bg-transparent',
        dense ? 'multiselect-dense' : '',
        error ? 'multiselect-error' : '',
        disabled ? 'multiselect-disabled' : '',
      ]"
      @input="$emit('update:modelValue', $event)"
      @select="$emit('select', $event)"
      @remove="$emit('remove', $event)"
      @search-change="$emit('search-change', $event)"
      @tag="$emit('tag', $event)"
      @open="$emit('open')"
      @close="$emit('close')"
    >
      <!-- Custom option template -->
      <template v-if="$slots.option" #option="props">
        <slot name="option" v-bind="props" />
      </template>

      <!-- Custom single label template -->
      <template v-if="$slots.singleLabel" #singleLabel="props">
        <slot name="singleLabel" v-bind="props" />
      </template>

      <!-- Custom multiple label template -->
      <template v-if="$slots.tag" #tag="props">
        <slot name="tag" v-bind="props" />
      </template>

      <!-- Custom no results template -->
      <template v-if="$slots.noResult" #noResult>
        <slot name="noResult" />
      </template>

      <!-- Custom no options template -->
      <template v-if="$slots.noOptions" #noOptions>
        <slot name="noOptions" />
      </template>

      <!-- Custom loading template -->
      <template v-if="$slots.loading" #loading>
        <slot name="loading" />
      </template>

      <!-- Custom clear template -->
      <template v-if="$slots.clear" #clear="props">
        <slot name="clear" v-bind="props" />
      </template>

      <!-- Custom caret template -->
      <template v-if="$slots.caret" #caret="props">
        <slot name="caret" v-bind="props" />
      </template>
    </multiselect>

    <!-- Hidden native select for form validation -->
    <select
      v-if="required || name"
      :value="getValidationValue()"
      :name="name"
      :required="required"
      autoCapitalize="off"
      autoComplete="off"
      class="pointer-events-none absolute bottom-0 left-0 z-0 h-[1px] w-full appearance-none bg-transparent text-transparent opacity-0 shadow-none !outline-none select-none"
      @click.prevent
      @change.prevent
    >
      <option value="" disabled></option>
      <option v-for="(option, index) in options" :key="index" :value="getOptionValue(option)">
        {{ getOptionLabel(option) }}
      </option>
    </select>

    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
    <p v-if="hint && !error" class="text-primary-300 mt-1 text-xs">{{ hint }}</p>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect"
import { computed } from "vue"

export default {
  name: "SelectField",
  components: { Multiselect },
  props: {
    // Core functionality
    modelValue: {
      type: [Array, Object, String, Number],
      default: null,
    },
    options: {
      type: Array,
      required: true,
      default: () => [],
    },

    // Display props
    label: String,
    placeholder: {
      type: String,
      default: "Select option",
    },
    hint: String,
    error: String,

    // Form props
    name: String,
    id: String,
    required: Boolean,
    disabled: Boolean,

    // Styling props
    dense: Boolean,

    // Multiselect behavior props
    multiple: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: true,
    },
    closeOnSelect: {
      type: Boolean,
      default: true,
    },
    clearOnSelect: {
      type: Boolean,
      default: true,
    },
    preserveSearch: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },

    // Option handling props
    optionLabel: {
      type: String,
      default: "label",
    },
    trackBy: {
      type: String,
      default: "value",
    },
    customLabel: Function,

    // Display behavior props
    maxHeight: {
      type: Number,
      default: 300,
    },
    showNoResults: {
      type: Boolean,
      default: true,
    },
    showNoOptions: {
      type: Boolean,
      default: true,
    },
    hideSelected: {
      type: Boolean,
      default: false,
    },
    allowEmpty: {
      type: Boolean,
      default: true,
    },
    resetAfter: {
      type: Boolean,
      default: false,
    },
    openDirection: {
      type: String,
      default: "below",
      validator: (value) => ["below", "above", "bottom", "top"].includes(value),
    },
    showLabels: {
      type: Boolean,
      default: true,
    },

    // Multiple selection props
    limit: Number,
    limitText: Function,

    // Search props
    internalSearch: {
      type: Boolean,
      default: true,
    },

    // Tagging props
    taggable: {
      type: Boolean,
      default: false,
    },
    tagPlaceholder: {
      type: String,
      default: "Press enter to create a tag",
    },
    tagPosition: {
      type: String,
      default: "top",
      validator: (value) => ["top", "bottom"].includes(value),
    },
  },

  emits: ["update:modelValue", "select", "remove", "search-change", "tag", "open", "close"],

  setup(props, { emit }) {
    const selectedValue = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val),
    })

    const getOptionValue = (option) => {
      if (typeof option === "object" && option !== null) {
        return option[props.trackBy] || option.value
      }
      return option
    }

    const getOptionLabel = (option) => {
      if (typeof option === "object" && option !== null) {
        return option[props.optionLabel] || option.label
      }
      return option
    }

    const getValidationValue = () => {
      if (!selectedValue.value) return ""

      if (props.multiple) {
        if (Array.isArray(selectedValue.value)) {
          return selectedValue.value.map(getOptionValue).join(",")
        }
        return ""
      }

      return getOptionValue(selectedValue.value)
    }

    return {
      selectedValue,
      getOptionValue,
      getOptionLabel,
      getValidationValue,
    }
  },
}
</script>

<!-- Add Multiselect CSS. Can be added as a static asset or inside a component. -->
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>
/* Custom styling to match your design system */
.multiselect-custom {
  border-radius: 0.5rem;
}

.multiselect-custom :deep(.multiselect__tags) {
  background-color: rgb(245 252 244);
  border: 1px solid rgb(196 219 213);
  border-radius: 0.5rem;
  min-height: 3rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
}

.multiselect-custom.multiselect-dense :deep(.multiselect__tags) {
  min-height: 2.5rem;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
}

.multiselect-custom.multiselect-error :deep(.multiselect__tags) {
  border-color: #ce3c55;
}

.multiselect-custom :deep(.multiselect__tags:focus-within) {
  border-color: #008060;
  box-shadow: 0 0 0 3px rgba(0, 128, 96, 0.1);
}

.multiselect-custom :deep(.multiselect__placeholder) {
  color: rgb(146 170 163);
  margin-bottom: 0;
}

.multiselect-custom :deep(.multiselect__single) {
  color: rgb(0, 46, 34);
  margin-bottom: 0;
}

.multiselect-custom :deep(.multiselect__input) {
  background-color: transparent;
  color: rgb(0, 46, 34);
}

.multiselect-custom :deep(.multiselect__content-wrapper) {
  border: 1px solid rgb(196 219 213);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-top: 0.25rem;
}

.multiselect-custom :deep(.multiselect__content) {
  padding: 0.5rem 0;
}

.multiselect-custom :deep(.multiselect__option) {
  color: rgb(0, 46, 34);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.multiselect-custom.multiselect-dense :deep(.multiselect__option) {
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
}

.multiselect-custom :deep(.multiselect__option--highlight) {
  background-color: rgb(240 245 239);
  color: rgb(0, 128, 96);
}

.multiselect-custom :deep(.multiselect__option--selected) {
  background-color: #008060;
  color: white;
  font-weight: 500;
}

.multiselect-custom :deep(.multiselect__tag) {
  background-color: #008060;
  color: white;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
}

.multiselect-custom :deep(.multiselect__tag-icon) {
  color: rgba(255, 255, 255, 0.8);
  margin-left: 0.25rem;
}

.multiselect-custom :deep(.multiselect__tag-icon:hover) {
  color: white;
}

.multiselect-custom :deep(.multiselect__tag-icon:after) {
  color: rgba(255, 255, 255, 0.8);
}

.multiselect-custom :deep(.multiselect__spinner) {
  border-color: #008060;
}

.multiselect-custom :deep(.multiselect__select) {
  color: rgb(146 170 163);
}

.multiselect-custom :deep(.multiselect__select:hover) {
  color: rgb(0, 128, 96);
}

.multiselect-custom.multiselect-disabled :deep(.multiselect__tags) {
  background-color: rgb(243 244 246);
  color: rgb(156 163 175);
  cursor: not-allowed;
}

.multiselect-custom :deep(.multiselect__element:first-child .multiselect__option) {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.multiselect-custom :deep(.multiselect__element:last-child .multiselect__option) {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
</style>

<!-- 
Usage Examples:

1. Basic single select:
<SelectField
  v-model="selectedOption"
  :options="[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]"
  label="Choose an option"
  placeholder="Select..."
/>

2. Multiple select with search:
<SelectField
  v-model="selectedOptions"
  :options="users"
  label="Select Users"
  multiple
  searchable
  option-label="name"
  track-by="id"
/>

3. Dense mode with validation:
<SelectField
  v-model="category"
  :options="categories"
  label="Category"
  dense
  required
  :error="categoryError"
  hint="Choose a category for your product"
/>

4. Taggable select (allows creating new options):
<SelectField
  v-model="tags"
  :options="existingTags"
  label="Tags"
  multiple
  taggable
  tag-placeholder="Add this as new tag"
/>

5. Custom option template:
<SelectField
  v-model="selectedCountry"
  :options="countries"
  label="Country"
>
  <template #option="{ option }">
    <div class="flex items-center gap-2">
      <img :src="option.flag" class="w-4 h-4" />
      <span>{{ option.name }}</span>
    </div>
  </template>
</SelectField>
-->
