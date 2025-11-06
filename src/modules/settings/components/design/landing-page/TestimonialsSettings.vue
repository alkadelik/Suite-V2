<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Testimonials</h4>
    </div>

    <div class="grid gap-6 md:p-6">
      <!-- Section Title Form -->
      <form @submit="onSubmitSectionTitle" class="border-b border-gray-200 pb-6">
        <div class="space-y-4">
          <FormField
            name="section_title"
            label="Section Title"
            placeholder="e.g. What Our Customers Say"
          />
          <div class="flex justify-end">
            <AppButton type="submit" label="Save Title" :loading="isSectionTitlePending" />
          </div>
        </div>
      </form>

      <!-- Testimonials List -->
      <div v-if="testimonials.length > 0" class="space-y-4">
        <h5 class="text-md font-medium text-gray-900">Testimonials</h5>

        <div v-for="(testimonial, index) in testimonials" :key="testimonial.id" class="space-y-4">
          <Collapsible :header="`Testimonial ${index + 1}`" :default-open="index === 0">
            <template #body>
              <div class="space-y-4">
                <FormField
                  :name="`testimonials.${index}.quote`"
                  type="textarea"
                  label="Quote"
                  placeholder="e.g. This is the best product I have ever used!"
                />

                <FormField
                  :name="`testimonials.${index}.name`"
                  label="Name"
                  placeholder="e.g. Chinwe Okafor"
                />

                <FormField
                  :name="`testimonials.${index}.descriptor`"
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
                      :name="`testimonials.${index}.image`"
                      label="Image"
                      accept="image/*"
                      :show-preview="true"
                      placeholder="Upload an image (100 x 100 px recommended)"
                      class="w-full"
                    />
                  </div>
                </div>

                <div class="flex justify-between border-t border-gray-200 pt-4">
                  <AppButton
                    type="button"
                    label="Remove Testimonial"
                    icon="trash"
                    variant="text"
                    class="text-red-600 hover:text-red-700"
                    @click="removeTestimonial(index)"
                  />

                  <AppButton
                    type="button"
                    label="Save Testimonial"
                    :loading="savingTestimonialId === testimonial.id"
                    @click="saveTestimonial(index, testimonial.id)"
                  />
                </div>
              </div>
            </template>
          </Collapsible>
        </div>
      </div>

      <div class="flex justify-start">
        <AppButton
          type="button"
          label="Add Testimonial"
          icon="add"
          variant="text"
          @click="addTestimonial"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { ref, watch } from "vue"
import { useForm } from "vee-validate"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Collapsible from "@components/Collapsible.vue"
import { useCreateTestimonial, useUpdateStorefrontSection } from "@modules/settings/api"
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
  testimonials: Testimonial[]
}

const props = defineProps<{ testimonialsSection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const { mutate: updateSection, isPending: isSectionTitlePending } = useUpdateStorefrontSection()
const { mutate: createTestimonial } = useCreateTestimonial()

const testimonials = ref<Testimonial[]>([])
const savingTestimonialId = ref<string | null>(null)

const validationSchema = yup.object({
  section_title: yup
    .string()
    .required("Section title is required")
    .min(3, "Section title must be at least 3 characters")
    .max(100, "Section title must not exceed 100 characters"),
  testimonials: yup
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

const {
  handleSubmit,
  setValues,
  values: formValues,
} = useForm<TestimonialsFormData>({
  validationSchema,
})

watch(
  () => props.testimonialsSection,
  (newSection) => {
    if (newSection) {
      setValues({
        section_title: newSection.title || "",
        testimonials: [],
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
  testimonials.value.push(newTestimonial)
}

const removeTestimonial = (index: number): void => {
  testimonials.value.splice(index, 1)
}

const onSubmitSectionTitle = handleSubmit((values) => {
  if (!props.testimonialsSection?.uid) {
    return toast.error("Testimonials section not found. Please refresh the page.")
  }

  const formData = new FormData()
  formData.append("title", values.section_title)

  updateSection(
    { id: props.testimonialsSection.uid, body: formData },
    {
      onSuccess: () => {
        toast.success("Section title updated successfully")
        emit("refetch")
      },
      onError: displayError,
    },
  )
})

const saveTestimonial = (index: number, testimonialId: string) => {
  // Get the testimonial data from the form values, not the ref array
  const testimonial = formValues.testimonials?.[index]

  if (!testimonial) {
    return toast.error("Testimonial data not found")
  }

  if (!testimonial.quote || !testimonial.name || !testimonial.descriptor) {
    return toast.error("Please fill in all required fields for the testimonial")
  }

  if (!props.testimonialsSection?.uid) {
    return toast.error("Testimonials section not found. Please refresh the page.")
  }

  savingTestimonialId.value = testimonialId

  const formData = new FormData()
  formData.append("section", props.testimonialsSection.uid)
  formData.append("name", testimonial.name)
  formData.append("role", testimonial.descriptor)
  formData.append("comment", testimonial.quote)
  if (testimonial.image) formData.append("image", testimonial.image)

  createTestimonial(formData, {
    onSuccess: () => {
      toast.success(`Testimonial ${index + 1} saved successfully`)
      emit("refetch")
      savingTestimonialId.value = null
    },
    onError: (error) => {
      displayError(error)
      savingTestimonialId.value = null
    },
  })
}
</script>
