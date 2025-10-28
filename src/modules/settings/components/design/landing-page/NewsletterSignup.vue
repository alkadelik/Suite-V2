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
        <AppButton type="submit" label="Save Section" :loading="isPending" />
      </div>
    </AppForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { reactive, watch, computed } from "vue"
import AppButton from "@components/AppButton.vue"
import AppForm from "@components/form/AppForm.vue"
import FormField from "@components/form/FormField.vue"
import { useGetStorefrontSections, useUpdateStorefrontSection } from "@modules/settings/api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

// Define form data interface
interface NewsletterSignupFormData {
  headline: string
  body_text?: string
  cta_button_text?: string
  email_capture_field?: string
}

// API composables
const { data: landingPageData, refetch } = useGetStorefrontSections()
const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

// Get newsletter signup section from landing page data
const newsletterSignupSection = computed(() => {
  const sections = landingPageData.value || []
  for (const section of sections) {
    const item = section.items?.find((i) => i.id === "newsletter-signup")
    if (item) return { sectionUid: section.uid, ...item }
  }
  return null
})

// Validation schema using Yup
const validationSchema = yup.object({
  headline: yup
    .string()
    .required("Headline is required")
    .min(3, "Headline must be at least 3 characters")
    .max(100, "Headline must not exceed 100 characters"),
  body_text: yup.string().max(500, "Body Text must not exceed 500 characters").optional(),
  cta_button_text: yup.string().max(50, "CTA button text must not exceed 50 characters").optional(),
  email_capture_field: yup
    .string()
    .max(100, "Email capture field must not exceed 100 characters")
    .optional(),
})

// Initial form values
const initialValues = reactive<NewsletterSignupFormData>({
  headline: "",
  body_text: "",
  cta_button_text: "",
  email_capture_field: "",
})

// Watch for API data and populate form
watch(
  () => newsletterSignupSection.value,
  (section) => {
    if (section) {
      const sectionData = section as Record<string, unknown>
      Object.assign(initialValues, {
        headline: sectionData.headline || "",
        body_text: sectionData.body_text || "",
        cta_button_text: sectionData.cta_button_text || "",
        email_capture_field: sectionData.email_capture_field || "",
      })
    }
  },
  { immediate: true },
)

// Form submit handler
const handleFormSubmit = (values: NewsletterSignupFormData) => {
  const body = {
    id: "newsletter-signup",
    headline: values.headline,
    body_text: values.body_text || "",
    cta_button_text: values.cta_button_text || "",
    email_capture_field: values.email_capture_field || "",
  }

  updateSection(
    {
      id: newsletterSignupSection.value?.sectionUid || "",
      body,
    },
    {
      onSuccess: () => {
        toast.success("Newsletter Signup section updated successfully")
        refetch()
      },
      onError: displayError,
    },
  )
}
</script>
