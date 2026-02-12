<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">CTA Block 1</h4>
    </div>
    <form @submit="onSubmit" class="grid gap-6 md:p-6">
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

interface CTABlockFormData {
  headline: string
  body_text?: string
  cta_button_text?: string
  cta_button_link?: string
  image?: File | string | null
}

const props = defineProps<{ ctaBlock1Section?: ThemeSection | null }>()
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
  cta_button_link: yup
    .string()
    .url("Please enter a valid URL")
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  image: yup.mixed().nullable().optional(),
})

const { handleSubmit, setValues } = useForm<CTABlockFormData>({
  validationSchema,
})

watch(
  () => props.ctaBlock1Section,
  (newSection) => {
    if (newSection) {
      setValues({
        headline: newSection.title || "",
        body_text: newSection.content || "",
        cta_button_text: newSection.cta_text || "",
        cta_button_link: newSection.cta_link || "",
        image: newSection.image || null,
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  if (!props.ctaBlock1Section?.uid) {
    return toast.error("CTA Block 1 section not found. Please refresh the page.")
  }

  const formData = new FormData()
  formData.append("title", values.headline)
  if (values.body_text) formData.append("content", values.body_text)
  if (values.cta_button_text) formData.append("cta_text", values.cta_button_text)
  if (values.cta_button_link) formData.append("cta_link", values.cta_button_link)
  if (values.image && typeof values.image !== "string") formData.append("image", values.image)

  updateSection(
    { id: props.ctaBlock1Section.uid, body: formData },
    {
      onSuccess: () => {
        toast.success("CTA Block 1 section updated successfully")
        emit("refetch")
      },
      onError: displayError,
    },
  )
})
</script>
