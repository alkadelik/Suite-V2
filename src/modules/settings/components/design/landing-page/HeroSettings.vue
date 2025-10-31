<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Hero</h4>
    </div>
    <form @submit="onSubmit" class="grid gap-6 md:p-6">
      <FormField name="title" label="Title" placeholder="e.g. Welcome to my Store" />

      <FormField
        name="subtitle"
        type="textarea"
        label="Subtitle/Description"
        placeholder="e.g. Discover amazing products and deals!"
      />

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField name="cta_button_text" label="CTA Button Text" placeholder="e.g. Shop Now" />
        <FormField
          name="cta_button_link"
          label="CTA Button Link"
          placeholder="e.g. https://yourstore.com/shop"
          disabled
          hint="Link is fixed to your store URL"
        />
      </div>

      <div class="flex gap-6">
        <div class="flex-1">
          <FormField
            type="file"
            name="hero_image"
            label="Hero Image"
            accept="image/*"
            :show-preview="true"
            placeholder="Upload a hero banner (1200 x 600 px recommended)"
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

// Define form data interface
interface HeroFormData {
  title: string
  subtitle?: string
  cta_button_text?: string
  cta_button_link?: string
  hero_image?: File | string | null
}

const props = defineProps<{ heroSection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

// Validation schema using Yup
const validationSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  subtitle: yup.string().max(500, "Subtitle must not exceed 500 characters").optional(),
  cta_button_text: yup.string().max(50, "CTA button text must not exceed 50 characters").optional(),
  cta_button_link: yup
    .string()
    .url("Please enter a valid URL")
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  hero_image: yup.mixed().nullable().optional(),
})

const { handleSubmit, setValues } = useForm<HeroFormData>({
  validationSchema,
})

// Watch for prop changes and update form values
watch(
  () => props.heroSection,
  (newSection) => {
    if (newSection) {
      setValues({
        title: newSection.title || "",
        subtitle: newSection.subtitle || "",
        cta_button_text: newSection.cta_text || "",
        cta_button_link: newSection.cta_link || "https://shop.leyyow.com/store_slug",
        hero_image: newSection.image || null,
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  // Check if hero section exists
  if (!props.heroSection?.uid) {
    return toast.error("Hero section not found. Please refresh the page.")
  }

  const formData = new FormData()
  formData.append("title", values.title)
  if (values.subtitle) formData.append("subtitle", values.subtitle)
  if (values.cta_button_text) formData.append("cta_text", values.cta_button_text)
  if (values.cta_button_link) formData.append("cta_link", values.cta_button_link)
  if (values.hero_image && typeof values.hero_image !== "string") {
    formData.append("image", values.hero_image)
  }

  updateSection(
    { id: props.heroSection.uid, body: formData },
    {
      onSuccess: () => {
        toast.success("Hero section updated successfully")
        emit("refetch")
      },
      onError: displayError,
    },
  )
})
</script>
