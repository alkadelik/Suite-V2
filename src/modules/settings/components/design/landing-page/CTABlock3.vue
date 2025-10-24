<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">CTA Block 3</h4>
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

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField name="cta_button_text" label="CTA Button Text" placeholder="e.g. Shop Now" />
        <FormField
          name="cta_button_link"
          label="CTA Button Link"
          placeholder="e.g. https://yourstore.com/shop"
        />
      </div>

      <div class="flex gap-6">
        <div v-if="false" class="flex flex-col items-center gap-2">
          <img class="h-24 w-24 object-cover" />
          <span class="text-sm text-gray-600">Image</span>
        </div>
        <div class="flex-1">
          <FormField
            type="file"
            name="image"
            label="Image (Optional)"
            accept="image/*"
            :show-preview="true"
            placeholder="Upload an image (1200 x 600 px recommended)"
            class="w-full"
          />
        </div>
      </div>

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
  cta_button_link?: string
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
  cta_button_link: yup.string().url("Please enter a valid URL").optional(),
  image: yup.mixed().optional(),
})

// Initial form values
const initialValues = reactive<HeroFormData>({
  title: "",
  body_text: "",
  cta_button_text: "",
  cta_button_link: "",
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
