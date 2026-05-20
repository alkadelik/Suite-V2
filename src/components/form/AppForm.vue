<template>
  <Form
    v-slot="{ errors, meta, values, submitCount, setFieldValue, validateField }"
    :validation-schema="props.schema"
    :initial-values="props.initialValues"
    novalidate
    @submit="handleFormSubmit"
    @invalid-submit="handleInvalidSubmit"
  >
    <slot
      :errors="errors"
      :meta="meta"
      :values="values"
      :submit-count="submitCount"
      :invalid-submit-count="invalidSubmitCount"
      :submit-attempted="submitAttempted"
      :set-field-value="setFieldValue"
      :validate-field="validateField"
    />
  </Form>
</template>

<script setup lang="ts">
import { onInvalidSubmit as scrollToFirstInvalidField } from "@/utils/validations"
import { Form, type GenericObject } from "vee-validate"
import type { AnyObjectSchema, InferType } from "yup"
import { computed, ref } from "vue"

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
const invalidSubmitCount = ref(0)
const submitAttempted = computed(() => invalidSubmitCount.value > 0)

/**
 * Handles invalid form submissions by scrolling to and focusing the first error field
 * @param errors - Object containing field validation errors
 */
const handleInvalidSubmit = ({ errors }: { errors: GenericObject }): void => {
  invalidSubmitCount.value += 1
  scrollToFirstInvalidField({ errors })
}

/**
 * Handles successful form submissions
 * @param values - Form values that passed validation
 */
const handleFormSubmit = (values: InferType<AnyObjectSchema>): void => {
  emit("submit", values)
}
</script>
