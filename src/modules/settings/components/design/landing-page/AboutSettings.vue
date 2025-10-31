<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">About</h4>
    </div>
    <form @submit="onSubmit" class="grid gap-6 md:p-6">
      <FormField name="headline" label="Headline" placeholder="e.g. About Acme Supplies" />

      <FormField
        name="description"
        type="textarea"
        label="Description"
        placeholder="e.g. Discover amazing products and deals!"
      />

      <div class="flex gap-6">
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
interface AboutFormData {
  headline: string
  description?: string
  image?: File | string | null
}

const props = defineProps<{ aboutSection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

// Validation schema using Yup
const validationSchema = yup.object({
  headline: yup
    .string()
    .required("Headline is required")
    .min(3, "Headline must be at least 3 characters")
    .max(100, "Headline must not exceed 100 characters"),
  description: yup.string().max(500, "Description must not exceed 500 characters").optional(),
  image: yup.mixed().nullable().optional(),
})

const { handleSubmit, setValues } = useForm<AboutFormData>({
  validationSchema,
})

// Watch for prop changes and update form values
watch(
  () => props.aboutSection,
  (newSection) => {
    if (newSection) {
      setValues({
        headline: newSection.title || "",
        description: newSection.content || "",
        image: newSection.image,
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  if (!props.aboutSection?.uid) {
    return toast.error("About section not found. Please refresh the page.")
  }

  const formData = new FormData()
  formData.append("title", values.headline)
  if (values.description) formData.append("content", values.description)
  if (values.image && typeof values.image !== "string") formData.append("image", values.image)

  updateSection(
    { id: props.aboutSection.uid, body: formData },
    {
      onSuccess: () => {
        toast.success("About section updated successfully")
        emit("refetch")
      },
      onError: displayError,
    },
  )
})
</script>
