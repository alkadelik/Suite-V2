<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Testimonials</h4>
    </div>

    <form @submit="onSubmit" class="grid gap-6 md:p-6">
      <div class="border-b border-gray-200 pb-6">
        <FormField
          name="section_title"
          label="Section Title"
          placeholder="e.g. What Our Customers Say"
        />
      </div>

      <!-- Primary Testimonial -->
      <div class="space-y-6">
        <h5 class="text-sm font-medium text-gray-900">Testimonial 1</h5>

        <FormField
          name="quote"
          type="textarea"
          label="Quote"
          placeholder="e.g. This is the best product I have ever used!"
        />

        <FormField name="name" label="Name" placeholder="e.g. Chinwe Okafor" />

        <FormField
          name="descriptor"
          label="Role/Descriptor"
          placeholder="e.g. Procurement Manager, Lagos"
        />

        <div class="flex gap-6">
          <div v-if="false" class="flex flex-col items-center gap-2">
            <img class="h-24 w-24 object-cover" />
            <span class="text-sm text-gray-600">Current Image</span>
          </div>
          <div class="flex-1">
            <FormField
              type="file"
              name="image"
              label="Image"
              accept="image/*"
              :show-preview="true"
              placeholder="Upload an image (100 x 100 px recommended)"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Additional Testimonials -->
      <div v-if="additionalTestimonials.length > 0" class="space-y-4">
        <h5 class="text-md font-medium text-gray-900">Additional Testimonials</h5>

        <div
          v-for="(testimonial, index) in additionalTestimonials"
          :key="testimonial.id"
          class="space-y-4"
        >
          <Collapsible :header="`Testimonial ${index + 2}`" :default-open="false">
            <template #body>
              <div class="space-y-4">
                <FormField
                  :name="`additional_testimonials.${index}.quote`"
                  type="textarea"
                  label="Quote"
                  placeholder="e.g. Amazing service and great quality!"
                />

                <FormField
                  :name="`additional_testimonials.${index}.name`"
                  label="Name"
                  placeholder="e.g. John Doe"
                />

                <FormField
                  :name="`additional_testimonials.${index}.descriptor`"
                  label="Role/Descriptor"
                  placeholder="e.g. CEO, Tech Company"
                />

                <div class="flex gap-6">
                  <div v-if="false" class="flex flex-col items-center gap-2">
                    <img class="h-24 w-24 object-cover" />
                    <span class="text-sm text-gray-600">Current Image</span>
                  </div>
                  <div class="flex-1">
                    <FormField
                      type="file"
                      :name="`additional_testimonials.${index}.image`"
                      label="Image"
                      accept="image/*"
                      :show-preview="true"
                      placeholder="Upload an image (100 x 100 px recommended)"
                      class="w-full"
                    />
                  </div>
                </div>

                <div class="flex justify-end">
                  <AppButton
                    type="button"
                    label="Remove Testimonial"
                    icon="trash"
                    variant="text"
                    class="text-red-600 hover:text-red-700"
                    @click="removeTestimonial(index)"
                  />
                </div>
              </div>
            </template>
          </Collapsible>
        </div>
      </div>

      <div class="flex justify-between">
        <AppButton
          type="button"
          label="Add Testimonial"
          icon="add"
          variant="text"
          @click="addTestimonial"
        />

        <AppButton type="submit" label="Save Section" :loading="isPending" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { ref, watch } from "vue"
import { useForm } from "vee-validate"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Collapsible from "@components/Collapsible.vue"
import { useUpdateStorefrontSection } from "@modules/settings/api"
import type { ThemeSection } from "@modules/settings/types"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

interface Testimonial {
  id: string
  quote: string
  name: string
  descriptor: string
  image?: File | null
}

interface TestimonialsFormData {
  section_title: string
  quote: string
  name: string
  descriptor: string
  image?: File | null
  additional_testimonials: Testimonial[]
}

const props = defineProps<{ testimonialsSection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

const additionalTestimonials = ref<Testimonial[]>([])

const validationSchema = yup.object({
  section_title: yup
    .string()
    .required("Section title is required")
    .min(3, "Section title must be at least 3 characters")
    .max(100, "Section title must not exceed 100 characters"),
  quote: yup
    .string()
    .required("Quote is required")
    .min(10, "Quote must be at least 10 characters")
    .max(500, "Quote must not exceed 500 characters"),
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  descriptor: yup
    .string()
    .required("Role/Descriptor is required")
    .min(2, "Role/Descriptor must be at least 2 characters")
    .max(150, "Role/Descriptor must not exceed 150 characters"),
  image: yup.mixed().nullable().optional(),
  additional_testimonials: yup
    .array()
    .of(
      yup.object({
        quote: yup
          .string()
          .min(10, "Quote must be at least 10 characters")
          .max(500, "Quote must not exceed 500 characters"),
        name: yup
          .string()
          .min(2, "Name must be at least 2 characters")
          .max(100, "Name must not exceed 100 characters"),
        descriptor: yup
          .string()
          .min(2, "Role/Descriptor must be at least 2 characters")
          .max(150, "Role/Descriptor must not exceed 150 characters"),
        image: yup.mixed().nullable().optional(),
      }),
    )
    .optional(),
})

const { handleSubmit, setValues } = useForm<TestimonialsFormData>({
  validationSchema,
})

watch(
  () => props.testimonialsSection,
  (newSection) => {
    if (newSection) {
      setValues({
        section_title: newSection.title || "",
        quote: newSection.content || "",
        name: "",
        descriptor: "",
        image: null,
        additional_testimonials: [],
      })
    }
  },
  { immediate: true },
)

const generateId = (): string => {
  return `testimonial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const addTestimonial = (): void => {
  const newTestimonial: Testimonial = {
    id: generateId(),
    quote: "",
    name: "",
    descriptor: "",
    image: null,
  }
  additionalTestimonials.value.push(newTestimonial)
}

const removeTestimonial = (index: number): void => {
  additionalTestimonials.value.splice(index, 1)
}

const onSubmit = handleSubmit((values) => {
  if (!props.testimonialsSection?.uid) {
    return toast.error("Testimonials section not found. Please refresh the page.")
  }

  const formData = new FormData()
  formData.append("title", values.section_title)
  formData.append("content", values.quote)
  if (values.image) formData.append("image", values.image)

  updateSection(
    { id: props.testimonialsSection.uid, body: formData },
    {
      onSuccess: () => {
        toast.success("Testimonials section updated successfully")
        emit("refetch")
      },
      onError: displayError,
    },
  )
})
</script>
