<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Newsletter Signup</h4>
    </div>
    <form @submit="onSubmit" class="grid gap-6 md:p-6">
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
    </form>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { watch } from "vue"
import { useForm } from "vee-validate"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import { useUpdateStorefrontSection } from "@modules/settings/api"
import type { ThemeSection } from "@modules/settings/types"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

interface NewsletterSignupFormData {
  headline: string
  body_text?: string
  cta_button_text?: string
  email_capture_field?: string
}

const props = defineProps<{ newsletterSignupSection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

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

const { handleSubmit, setValues } = useForm<NewsletterSignupFormData>({
  validationSchema,
})

watch(
  () => props.newsletterSignupSection,
  (newSection) => {
    if (newSection) {
      setValues({
        headline: newSection.title || "",
        body_text: newSection.content || "",
        cta_button_text: newSection.cta_text || "",
        email_capture_field: newSection.subtitle || "",
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  if (!props.newsletterSignupSection?.uid) {
    return toast.error("Newsletter Signup section not found. Please refresh the page.")
  }

  const body = {
    title: values.headline,
    content: values.body_text || "",
    cta_text: values.cta_button_text || "",
    subtitle: values.email_capture_field || "",
  }

  updateSection(
    { id: props.newsletterSignupSection.uid, body: body as unknown as FormData },
    {
      onSuccess: () => {
        toast.success("Newsletter Signup section updated successfully")
        emit("refetch")
      },
      onError: displayError,
    },
  )
})
</script>
