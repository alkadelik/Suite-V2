<template>
  <Field v-slot="{ field, errors: fieldErrors }" :name="name">
    <!-- Select Field -->
    <SelectField
      v-if="type === 'select'"
      v-bind="{ ...field, ...$attrs }"
      :model-value="field.value"
      :label="hideLabel ? '' : label || startCase(name)"
      :options="optionsData || []"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :error="fieldErrors[0]"
      :hint="hintText"
      :searchable="searchable"
      :variant="variant"
      :size="size"
      :clearable="clearable"
      :placement="placement"
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
      :hint="hintText"
      :variant="variant"
      :size="size"
      :searchable="searchable"
      :clearable="clearable"
      :placement="placement"
      @update:model-value="field.value = $event"
    />

    <!-- Other field types remain the same... -->
    <TextAreaField
      v-else-if="type === 'textarea'"
      v-bind="{ ...field, ...$attrs }"
      :label="hideLabel ? '' : label || startCase(name)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :error="fieldErrors[0]"
      :hint="hintText"
      :variant="variant"
      :size="size"
      :rows="rows"
      :cols="cols"
      :maxlength="maxlength"
      :minlength="minlength"
      :show-character-count="showCharacterCount"
      :auto-resize="autoResize"
    />

    <!-- File Field -->
    <FileUploadField
      v-else-if="type === 'file'"
      v-bind="{ ...field, ...$attrs }"
      :model-value="field.value"
      :label="hideLabel ? '' : label || startCase(name)"
      :required="required"
      :disabled="disabled"
      :error="fieldErrors[0]"
      :hint="hintText"
      :variant="variant"
      :size="size"
      :accept="accept"
      :max-size="maxSize"
      :placeholder="placeholder"
      @update:model-value="field.value = $event"
    />

    <!-- OTP Field -->
    <OtpField
      v-else-if="type === 'otp'"
      v-bind="{ ...field, ...$attrs }"
      :label="hideLabel ? '' : label || startCase(name)"
      :required="required"
      :disabled="disabled"
      :error="fieldErrors[0]"
      :hint="hintText"
      :variant="variant"
      :size="size"
      :length="otpLength"
      :digits-only="digitsOnly"
      :separator="separator"
    />

    <!-- Radio Input Field -->
    <RadioInputField
      v-else-if="type === 'radio'"
      v-bind="{ ...field, ...$attrs }"
      :model-value="field.value"
      :label="hideLabel ? '' : label || startCase(name)"
      :options="radioOptions || []"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :error="fieldErrors[0]"
      :hint="hintText"
      :size="size"
      @update:model-value="field.value = $event"
    />

    <!-- Text Field (default for all other types) -->
    <TextField
      v-else
      v-bind="{ ...field, ...$attrs }"
      :model-value="field.value"
      :type="type"
      :label="hideLabel ? '' : label || startCase(name)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :error="fieldErrors[0]"
      :hint="hintText"
      :variant="variant"
      :size="size"
      :maxlength="maxlength"
      :minlength="minlength"
      :min="min"
      :max="max"
      :step="step"
      :autocomplete="autocomplete"
      :description="description"
      :show-steppers="showSteppers"
      @update:model-value="field.value = $event"
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
import RadioInputField from "./RadioInputField.vue"
import { startCase } from "@/utils/format-strings"
import { computed } from "vue"
import FileUploadField from "./FileUploadField.vue"
import { TChipColor } from "@modules/shared/types"

// Import or define the ISelectOption interface to match your existing type
interface ISelectOption {
  label: string
  value: string | number
  color?: string
  [key: string]: unknown // This makes it compatible with Record<string, unknown>
}

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
  | "file"
  | "radio"

/**
 * Updated option value type that includes ISelectOption
 */
export type OptionValue = string | number | ISelectOption | Record<string, unknown>

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
  /** Additional description text below the input */
  description?: string

  // Select and Tags specific props
  /** Options for select fields - now accepts ISelectOption[] */
  options?: OptionValue[]
  /** Enable search functionality for tags field */
  searchable?: boolean
  /** Show clear button for tags field */
  clearable?: boolean
  /** Placement of the dropdown menu (for select fields) */
  placement?: "top" | "bottom" | "auto"

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

  // File specific props
  /** Accepted file types */
  accept?: string
  /** Maximum file size in MB */
  maxSize?: number

  // Radio specific props
  /** Options for radio fields */
  radioOptions?: { label: string; value: string; description?: string }[]

  // Number input specific props
  /** Show increment/decrement buttons for number inputs */
  showSteppers?: boolean
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
  placement: "bottom",
})

// OptionWithClass type that matches SelectTagsField expectations
type OptionWithClass = {
  value: string | number | Record<string, unknown>
  label: string
  class?: string
  color?: TChipColor
}

// Enhanced normalization function for SelectTagsField
const normalizedTagOptions = computed<OptionWithClass[]>(() => {
  if (!options) return []

  return options.map((opt) => {
    // Handle ISelectOption objects
    if (typeof opt === "object" && opt !== null && "label" in opt && "value" in opt) {
      const selectOption = opt as ISelectOption
      // Ensure color is TChipColor or undefined
      let color: TChipColor | undefined = undefined
      if (selectOption.color !== undefined) {
        color = selectOption.color as TChipColor
      }
      return {
        value: selectOption.value,
        label: String(selectOption.label),
        color,
        // Spread any additional properties
        ...Object.fromEntries(
          Object.entries(selectOption).filter(
            ([key]) => !["label", "value", "color"].includes(key),
          ),
        ),
      }
    }

    // Handle primitive values
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: String(opt) }
    }

    // Handle generic objects
    if (typeof opt === "object" && opt !== null) {
      // If it already has the right structure
      if ("value" in opt && "label" in opt) {
        // Ensure color is TChipColor or undefined
        let color: TChipColor | undefined = undefined
        if ("color" in opt && opt.color !== undefined) {
          color = opt.color as TChipColor
        }
        return {
          value: opt.value as string | number | Record<string, unknown>,
          label: String(opt.label),
          color,
          ...opt,
        }
      }

      // Try to extract meaningful label/value from generic object
      return {
        value: opt,
        label: JSON.stringify(opt),
      }
    }

    // Fallback
    return { value: opt, label: String(opt) }
  })
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
  placement,
  rows,
  cols,
  showCharacterCount,
  autoResize,
  otpLength,
  digitsOnly,
  separator,
} = props

// Computed properties for options and hint text because of dynamic props
const optionsData = computed(() => props.options ?? [])
const hintText = computed(() => props.hint ?? "")
</script>
