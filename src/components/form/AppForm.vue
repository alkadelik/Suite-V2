<template>
  <Form
    v-slot="{ errors, meta, values }"
    :validation-schema="props.schema"
    :initial-values="props.initialValues"
    @submit="handleFormSubmit"
    @invalid-submit="handleInvalidSubmit"
  >
    <slot :errors="errors" :meta="meta" :values="values" />
  </Form>
</template>

<script setup lang="ts">
import { Form, type GenericObject } from "vee-validate"
import type { AnyObjectSchema, InferType } from "yup"

/**
 * Props interface for the AppForm component
 */
interface AppFormProps {
  /** Yup validation schema for form validation */
  schema: AnyObjectSchema
  /** Initial values for form fields */
  initialValues?: Record<string, unknown>
}

/**
 * Events emitted by the AppForm component
 */
interface AppFormEvents {
  /** Emitted when form is successfully submitted with valid data */
  submit: [values: InferType<AnyObjectSchema>]
}

const props = defineProps<AppFormProps>()
const emit = defineEmits<AppFormEvents>()

/**
 * Handles invalid form submissions by scrolling to and focusing the first error field
 * @param errors - Object containing field validation errors
 */
const handleInvalidSubmit = ({ errors }: { errors: GenericObject }): void => {
  const firstErrorFieldName = Object.keys(errors)[0]

  if (firstErrorFieldName) {
    const element = document.querySelector(`[name="${firstErrorFieldName}"]`) as HTMLElement

    if (element) {
      // Smooth scroll to the error field
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      // Focus the field for better UX
      element.focus()
    }
  }
}

/**
 * Handles successful form submissions
 * @param values - Form values that passed validation
 */
const handleFormSubmit = (values: InferType<AnyObjectSchema>): void => {
  emit("submit", values)
}
</script>
