<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Hero</h4>
    </div>
    <AppForm
      :schema="validationSchema"
      :initial-values="initialValues"
      @submit="handleFormSubmit"
      class="grid gap-6 md:p-6"
    >
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
        />
      </div>

      <div class="flex gap-6">
        <div v-if="false" class="flex flex-col items-center gap-2">
          <img class="h-24 w-24 object-cover" />
          <span class="text-sm text-gray-600">Current Hero Image</span>
        </div>
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
interface HeroFormData {
  title: string
  subtitle?: string
  cta_button_text?: string
  cta_button_link?: string
  hero_image?: File | null
}

// API composables
const { data: landingPageData, refetch } = useGetStorefrontSections()
const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

// Get hero section from landing page data
const heroSection = computed(() => {
  const sections = landingPageData.value || []
  for (const section of sections) {
    const heroItem = section.items?.find((item) => item.id === "hero")
    if (heroItem) return { sectionUid: section.uid, ...heroItem }
  }
  return null
})

// Validation schema using Yup
const validationSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  subtitle: yup.string().max(500, "Subtitle must not exceed 500 characters").optional(),
  cta_button_text: yup.string().max(50, "CTA button text must not exceed 50 characters").optional(),
  cta_button_link: yup.string().url("Please enter a valid URL").optional(),
  hero_image: yup.mixed().optional(),
})

// Initial form values
const initialValues = reactive<HeroFormData>({
  title: "",
  subtitle: "",
  cta_button_text: "",
  cta_button_link: "",
  hero_image: null,
})

// Watch for API data and populate form
watch(
  () => heroSection.value,
  (section) => {
    if (section) {
      // Populate form with API data when available
      // Assuming the section has these fields, adjust as needed
      Object.assign(initialValues, {
        title: (section as Record<string, unknown>).title || "",
        subtitle: (section as Record<string, unknown>).subtitle || "",
        cta_button_text: (section as Record<string, unknown>).cta_button_text || "",
        cta_button_link: (section as Record<string, unknown>).cta_button_link || "",
      })
    }
  },
  { immediate: true },
)

// Form submit handler
const handleFormSubmit = (values: HeroFormData) => {
  // Prepare form data for multipart/form-data
  const formData = new FormData()
  formData.append("id", "hero")
  formData.append("title", values.title)
  if (values.subtitle) formData.append("subtitle", values.subtitle)
  if (values.cta_button_text) formData.append("cta_button_text", values.cta_button_text)
  if (values.cta_button_link) formData.append("cta_button_link", values.cta_button_link)
  if (values.hero_image) formData.append("hero_image", values.hero_image)

  updateSection(
    {
      id: heroSection.value?.sectionUid || "",
      body: formData as unknown as Record<string, unknown>,
    },
    {
      onSuccess: () => {
        toast.success("Hero section updated successfully")
        refetch()
      },
      onError: displayError,
    },
  )
}
</script>
