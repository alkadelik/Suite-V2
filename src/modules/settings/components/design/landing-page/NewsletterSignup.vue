<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Newsletter Signup</h4>
    </div>
    <AppForm
      :schema="validationSchema"
      :initial-values="initialValues"
      @submit="handleFormSubmit"
      class="grid gap-6 md:p-6"
    >
      <FormField name="headline" label="Headline" placeholder="e.g. Welcome to my Store" />

      <FormField
        name="body_text"
        type="textarea"
        label="Body Text"
        placeholder="e.g. Discover amazing products and deals!"
      />

      <FormField
        name="email_capture_field"
        label="Email Capture Field"
        placeholder="Your work email (e.g. name@company.com)"
      />

      <FormField name="cta_button_text" label="CTA Button Text" placeholder="e.g. Shop Now" />

      <div class="flex justify-end">
        <AppButton type="submit" label="Save Section" />
      </div>
    </AppForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { reactive } from "vue"
import AppButton from "@components/AppButton.vue"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"

// Define form data interface
interface HeroFormData {
  title: string
  body_text?: string
  cta_button_text?: string
  email_capture_field?: string
  image?: File | null
}

// Validation schema using Yup
const validationSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  body_text: yup.string().max(500, "Body Text must not exceed 500 characters").optional(),
  cta_button_text: yup.string().max(50, "CTA button text must not exceed 50 characters").optional(),
  email_capture_field: yup.string().email("Please enter a valid email").optional(),
  image: yup.mixed().optional(),
})

// Initial form values
const initialValues = reactive<HeroFormData>({
  title: "",
  body_text: "",
  cta_button_text: "",
  email_capture_field: "",
  image: null,
})

// Form submit handler
const handleFormSubmit = (values: HeroFormData) => {
  console.log("Hero Settings Form Data:", values)

  // Validate if form has any values
  const hasData = Object.values(values).some((value) => {
    if (typeof value === "string") return value.trim() !== ""
    return value !== null && value !== undefined
  })

  if (!hasData) {
    console.warn("Form submitted with no data")
    return
  }
}
</script>
