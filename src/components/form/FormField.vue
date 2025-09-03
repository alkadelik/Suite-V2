<template>
  <Field v-slot="{ field, errors: fieldErrors }" :name="name">
    <!-- Select Field -->
    <SelectField
      v-if="type === 'select'"
      v-bind="{ ...field, ...$attrs }"
      :model-value="field.value"
      :label="hideLabel ? '' : label || startCase(name)"
      :options="options || []"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :error="fieldErrors[0]"
      :hint="hint"
      :variant="variant"
      :size="size"
      @update:model-value="field.value = $event"
    />

    <!-- Select Tags Field -->
    <SelectTagsField
      v-else-if="type === 'tags'"
      v-bind="{ ...field, ...$attrs }"
      :model-value="field.value"
      :label="hideLabel ? '' : label || startCase(name)"
      :options="normalizedTagOptions"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :error="fieldErrors[0]"
      :hint="hint"
      :variant="variant"
      :size="size"
      :searchable="searchable"
      :clearable="clearable"
      @update:model-value="field.value = $event"
    />

    <!-- Textarea Field -->
    <TextAreaField
      v-else-if="type === 'textarea'"
      v-bind="{ ...field, ...$attrs }"
      :label="hideLabel ? '' : label || startCase(name)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :error="fieldErrors[0]"
      :hint="hint"
      :variant="variant"
      :size="size"
      :rows="rows"
      :cols="cols"
      :maxlength="maxlength"
      :minlength="minlength"
      :show-character-count="showCharacterCount"
      :auto-resize="autoResize"
    />

    <!-- OTP Field -->
    <OtpField
      v-else-if="type === 'otp'"
      v-bind="{ ...field, ...$attrs }"
      :label="hideLabel ? '' : label || startCase(name)"
      :required="required"
      :disabled="disabled"
      :error="fieldErrors[0]"
      :hint="hint"
      :variant="variant"
      :size="size"
      :length="otpLength"
      :digits-only="digitsOnly"
      :separator="separator"
    />

    <!-- Text Field (default for all other types) -->
    <TextField
      v-else
      v-bind="{ ...field, ...$attrs }"
      :type="type"
      :label="hideLabel ? '' : label || startCase(name)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :error="fieldErrors[0]"
      :hint="hint"
      :variant="variant"
      :size="size"
      :maxlength="maxlength"
      :minlength="minlength"
      :min="min"
      :max="max"
      :step="step"
      :autocomplete="autocomplete"
    />
  </Field>
</template>

<script setup lang="ts">
import { Field } from "vee-validate"
import TextField from "./TextField.vue"
import SelectField from "./SelectField.vue"
import SelectTagsField from "./SelectTagsField.vue"
import TextAreaField from "./TextAreaField.vue"
import OtpField from "./OtpField.vue"
import { startCase } from "@/utils/format-strings"
import { computed } from "vue"

/**
 * Form field types supported by the dynamic FormField component
 */
export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "date"
  | "time"
  | "datetime-local"
  | "month"
  | "week"
  | "search"
  | "select"
  | "tags"
  | "textarea"
  | "otp"

/**
 * Option value type for select fields (matches SelectField component)
 */
export type OptionValue = string | number | Record<string, unknown>

/**
 * Props interface for the FormField component
 */
interface FormFieldProps {
  /** The name attribute for the field (used for vee-validate) */
  name: string
  /** The type of form field to render */
  type?: FormFieldType
  /** The label for the field */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is readonly */
  readonly?: boolean
  /** Hint text to display */
  hint?: string
  /** The visual variant of the field */
  variant?: "default" | "error" | "success"
  /** The size of the field */
  size?: "sm" | "md" | "lg"
  /** Whether to hide the label */
  hideLabel?: boolean

  // Text Input specific props
  /** Maximum length for text inputs */
  maxlength?: number
  /** Minimum length for text inputs */
  minlength?: number
  /** Minimum value for number inputs */
  min?: number | string
  /** Maximum value for number inputs */
  max?: number | string
  /** Step value for number inputs */
  step?: number | string
  /** Autocomplete attribute */
  autocomplete?: string

  // Select and Tags specific props
  /** Options for select fields */
  options?: OptionValue[]
  /** Enable search functionality for tags field */
  searchable?: boolean
  /** Show clear button for tags field */
  clearable?: boolean

  // Textarea specific props
  /** Number of rows for textarea */
  rows?: number
  /** Number of columns for textarea */
  cols?: number
  /** Whether to show character count for textarea */
  showCharacterCount?: boolean
  /** Whether textarea should auto-resize */
  autoResize?: boolean

  // OTP specific props
  /** Length of OTP field */
  otpLength?: number
  /** Whether OTP should accept only digits */
  digitsOnly?: boolean
  /** Separator character for OTP field */
  separator?: string
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  type: "text",
  variant: "default",
  size: "md",
  rows: 4,
  otpLength: 6,
  digitsOnly: true,
  separator: "-",
  searchable: false,
  clearable: false,
})

// Expose props for reactive access in template
const {
  name,
  type,
  label,
  placeholder,
  required,
  disabled,
  readonly,
  hint,
  variant,
  size,
  maxlength,
  minlength,
  min,
  max,
  step,
  autocomplete,
  options,
  searchable,
  clearable,
  rows,
  cols,
  showCharacterCount,
  autoResize,
  otpLength,
  digitsOnly,
  separator,
} = props

// OptionWithClass type should match the expected type in SelectTagsField
type OptionWithClass = {
  value: string | number | Record<string, unknown>
  label: string
  class?: string
}

// Normalize options for SelectTagsField to OptionWithClass[]
const normalizedTagOptions = computed<OptionWithClass[]>(() => {
  if (!options) return []
  return options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: String(opt) }
    }
    // If already an object, assume it matches OptionWithClass or convert as needed
    if ("value" in opt && "label" in opt) {
      return opt as OptionWithClass
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return { value: opt, label: String(opt) }
  })
})
</script>
