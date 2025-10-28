<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">CTA Block 2</h4>
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
interface CTABlockFormData {
  headline: string
  body_text?: string
  cta_button_text?: string
  cta_button_link?: string
  image?: File | null
}

// API composables
const { data: landingPageData, refetch } = useGetStorefrontSections()
const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

// Get CTA block 2 section from landing page data
const ctaBlock2Section = computed(() => {
  const sections = landingPageData.value || []
  for (const section of sections) {
    const item = section.items?.find((i) => i.id === "cta-block-2")
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
  cta_button_link: yup.string().url("Please enter a valid URL").optional(),
  image: yup.mixed().optional(),
})

// Initial form values
const initialValues = reactive<CTABlockFormData>({
  headline: "",
  body_text: "",
  cta_button_text: "",
  cta_button_link: "",
  image: null,
})

// Watch for API data and populate form
watch(
  () => ctaBlock2Section.value,
  (section) => {
    if (section) {
      const sectionData = section as Record<string, unknown>
      Object.assign(initialValues, {
        headline: sectionData.headline || "",
        body_text: sectionData.body_text || "",
        cta_button_text: sectionData.cta_button_text || "",
        cta_button_link: sectionData.cta_button_link || "",
      })
    }
  },
  { immediate: true },
)

// Form submit handler
const handleFormSubmit = (values: CTABlockFormData) => {
  const formData = new FormData()
  formData.append("id", "cta-block-2")
  formData.append("headline", values.headline)
  if (values.body_text) formData.append("body_text", values.body_text)
  if (values.cta_button_text) formData.append("cta_button_text", values.cta_button_text)
  if (values.cta_button_link) formData.append("cta_button_link", values.cta_button_link)
  if (values.image) formData.append("image", values.image)

  updateSection(
    {
      id: ctaBlock2Section.value?.sectionUid || "",
      body: formData as unknown as Record<string, unknown>,
    },
    {
      onSuccess: () => {
        toast.success("CTA Block 2 section updated successfully")
        refetch()
      },
      onError: displayError,
    },
  )
}
</script>
