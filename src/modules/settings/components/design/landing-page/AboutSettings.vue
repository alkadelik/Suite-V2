<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">About</h4>
    </div>
    <AppForm
      :schema="validationSchema"
      :initial-values="initialValues"
      @submit="handleFormSubmit"
      class="grid gap-6 md:p-6"
    >
      <FormField name="headline" label="Headline" placeholder="e.g. About Acme Supplies" />

      <FormField
        name="description"
        type="textarea"
        label="Description"
        placeholder="e.g. Discover amazing products and deals!"
      />

      <div class="flex gap-6">
        <div v-if="false" class="flex flex-col items-center gap-2">
          <img class="h-24 w-24 object-cover" />
          <span class="text-sm text-gray-600">Image</span>
        </div>
        <div class="flex-1">
          <FormField
            type="file"
            name="image"
            label="Image"
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
interface AboutFormData {
  headline: string
  description?: string
  image?: File | null
}

// API composables
const { data: landingPageData, refetch } = useGetStorefrontSections()
const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

// Get about section from landing page data
const aboutSection = computed(() => {
  const sections = landingPageData.value || []
  for (const section of sections) {
    const aboutItem = section.items?.find((item) => item.id === "about")
    if (aboutItem) return { sectionUid: section.uid, ...aboutItem }
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
  description: yup.string().max(500, "Description must not exceed 500 characters").optional(),
  image: yup.mixed().optional(),
})

// Initial form values
const initialValues = reactive<AboutFormData>({
  headline: "",
  description: "",
  image: null,
})

// Watch for API data and populate form
watch(
  () => aboutSection.value,
  (section) => {
    if (section) {
      Object.assign(initialValues, {
        headline: (section as Record<string, unknown>).headline || "",
        description: (section as Record<string, unknown>).description || "",
      })
    }
  },
  { immediate: true },
)

// Form submit handler
const handleFormSubmit = (values: AboutFormData) => {
  if (!aboutSection.value?.sectionUid) {
    toast.error("Section not found")
    return
  }

  const formData = new FormData()
  formData.append("id", "about")
  formData.append("headline", values.headline)
  if (values.description) formData.append("description", values.description)
  if (values.image) formData.append("image", values.image)

  updateSection(
    {
      id: aboutSection.value.sectionUid,
      body: formData as unknown as Record<string, unknown>,
    },
    {
      onSuccess: () => {
        toast.success("About section updated successfully")
        refetch()
      },
      onError: displayError,
    },
  )
}
</script>
