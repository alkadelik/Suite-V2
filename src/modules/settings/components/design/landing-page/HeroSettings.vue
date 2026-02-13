<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Hero</h4>
    </div>

    <div class="grid gap-6 md:p-6">
      <!-- Hero Slides List -->
      <div v-if="heroSlides.length > 0" class="space-y-4">
        <div v-for="(slide, index) in heroSlides" :key="slide.id" class="space-y-4">
          <Collapsible :header="`Slide ${index + 1}`" :default-open="index === 0">
            <template #body>
              <div class="space-y-6">
                <FormField
                  type="file"
                  :name="`heroSlides.${index}.hero_media`"
                  label="Hero Image or Video"
                  accept="image/*,video/*"
                  :show-preview="true"
                  placeholder="Upload a hero banner (1200 x 600 px recommended) or video"
                  class="w-full"
                />

                <FormField
                  :name="`heroSlides.${index}.title`"
                  label="Heading (optional)"
                  placeholder="e.g. Welcome to my Store"
                />

                <FormField
                  :name="`heroSlides.${index}.subtitle`"
                  type="textarea"
                  label="Description (optional)"
                  placeholder="e.g. Discover amazing products and deals!"
                />

                <FormField
                  :name="`heroSlides.${index}.cta_button_text`"
                  label="Button Text (optional)"
                  placeholder="e.g. Shop Now"
                />

                <FormField
                  :name="`heroSlides.${index}.cta_button_link`"
                  label="Button Description (optional)"
                  placeholder="e.g. https://yourstore.com/shop"
                  disabled
                  hint="Link is fixed to your store URL"
                />

                <div
                  v-if="heroSlides.length > 1"
                  class="flex justify-start border-t border-gray-200 pt-4"
                >
                  <AppButton
                    type="button"
                    label="Remove Slide"
                    icon="trash"
                    variant="text"
                    class="text-red-600 hover:text-red-700"
                    @click="confirmDelete(index)"
                  />
                </div>
              </div>
            </template>
          </Collapsible>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <AppButton
          v-if="heroSlides.length < 4"
          type="button"
          label="Add New Slide"
          icon="add"
          variant="text"
          @click="addSlide"
        />

        <AppButton type="button" label="Save Section" :loading="isPending" @click="saveSection" />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      v-model="showDeleteModal"
      header="Delete Slide"
      paragraph="Are you sure you want to delete this slide? This action cannot be undone."
      :loading="isDeletingSlide"
      @delete="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup"
import { ref, watch } from "vue"
import { useForm } from "vee-validate"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Collapsible from "@components/Collapsible.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import { useUpdateStorefrontSection } from "@modules/settings/api"
import type { ThemeSection } from "@modules/settings/types"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

interface HeroSlide {
  id: string
  title: string
  subtitle?: string
  cta_button_text?: string
  cta_button_link?: string
  hero_media?: File | null | string
}

interface HeroFormData {
  section_title: string
  heroSlides: HeroSlide[]
}

const props = defineProps<{ heroSection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const { mutate: updateSection, isPending } = useUpdateStorefrontSection()

const heroSlides = ref<HeroSlide[]>([])
const showDeleteModal = ref(false)
const deleteIndex = ref<number | null>(null)
const isDeletingSlide = ref(false)

const validationSchema = yup.object({
  section_title: yup
    .string()
    .required("Section title is required")
    .min(3, "Section title must be at least 3 characters")
    .max(100, "Section title must not exceed 100 characters"),
  heroSlides: yup
    .array()
    .of(
      yup.object({
        title: yup
          .string()
          .min(3, "Title must be at least 3 characters")
          .max(100, "Title must not exceed 100 characters"),
        subtitle: yup.string().max(500, "Subtitle must not exceed 500 characters").optional(),
        cta_button_text: yup
          .string()
          .max(50, "CTA button text must not exceed 50 characters")
          .optional(),
        cta_button_link: yup
          .string()
          .url("Please enter a valid URL")
          .optional()
          .nullable()
          .transform((value) => (value === "" ? null : value)),
        hero_media: yup.mixed().nullable().optional(),
      }),
    )
    .optional(),
})

const { setValues, values: formValues } = useForm<HeroFormData>({
  validationSchema,
})

watch(
  () => props.heroSection,
  (newSection) => {
    if (newSection) {
      const mappedSlides =
        newSection.hero_carousel_items?.map((slide) => ({
          id: slide.uid,
          title: slide.title || "",
          subtitle: slide.subtitle || "",
          cta_button_text: slide.cta_text || "",
          cta_button_link: slide.cta_link || "https://buy.leyyow.com/store_slug",
          hero_media: slide.image || slide.video || null,
        })) || []

      heroSlides.value = mappedSlides

      setValues({
        section_title: newSection.title || "",
        heroSlides: mappedSlides,
      })
    }
  },
  { immediate: true },
)

const generateId = (): string => {
  return `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const addSlide = (): void => {
  const newSlide: HeroSlide = {
    id: generateId(),
    title: "",
    subtitle: "",
    cta_button_text: "",
    cta_button_link: "https://buy.leyyow.com/store_slug",
    hero_media: null,
  }
  heroSlides.value.push(newSlide)

  setValues({
    ...formValues,
    heroSlides: [...heroSlides.value],
  })
}

const confirmDelete = (index: number): void => {
  deleteIndex.value = index
  showDeleteModal.value = true
}

const handleDeleteConfirm = (): void => {
  if (deleteIndex.value === null) return

  const index = deleteIndex.value
  const slide = heroSlides.value[index]

  const isExistingSlide = !slide.id.startsWith("slide_")

  if (isExistingSlide) {
    // Mark slide for deletion by sending delete flag to backend
    if (!props.heroSection?.uid) {
      toast.error("Hero section not found. Please refresh the page.")
      return
    }

    isDeletingSlide.value = true
    const formData = new FormData()
    formData.append("delete_slide_id", slide.id)

    updateSection(
      { id: props.heroSection.uid, body: formData },
      {
        onSuccess: () => {
          toast.success("Slide deleted successfully")
          heroSlides.value.splice(index, 1)
          setValues({
            ...formValues,
            heroSlides: [...heroSlides.value],
          })
          emit("refetch")
          showDeleteModal.value = false
          deleteIndex.value = null
          isDeletingSlide.value = false
        },
        onError: (error) => {
          displayError(error)
          isDeletingSlide.value = false
        },
      },
    )
  } else {
    // Just remove from local state (not yet saved to backend)
    heroSlides.value.splice(index, 1)
    setValues({
      ...formValues,
      heroSlides: [...heroSlides.value],
    })
    showDeleteModal.value = false
    deleteIndex.value = null
  }
}

const saveSection = () => {
  const slides = formValues.heroSlides || []

  // Validate that all slides have titles
  const invalidSlides = slides.filter((slide) => !slide.title)
  if (invalidSlides.length > 0) {
    return toast.error("Please fill in the title for all slides")
  }

  if (!props.heroSection?.uid) {
    return toast.error("Hero section not found. Please refresh the page.")
  }

  const formData = new FormData()

  // Add section title
  formData.append("title", formValues.section_title)

  // Add all slides
  slides.forEach((slide, index) => {
    const isExistingSlide = !slide.id.startsWith("slide_")
    const prefix = `hero_carousel[${index}]`

    if (isExistingSlide) {
      formData.append(`${prefix}[id]`, slide.id)
    }

    formData.append(`${prefix}[title]`, slide.title)
    if (slide.subtitle) formData.append(`${prefix}[subtitle]`, slide.subtitle)
    if (slide.cta_button_text) formData.append(`${prefix}[cta_text]`, slide.cta_button_text)
    if (slide.cta_button_link) formData.append(`${prefix}[cta_link]`, slide.cta_button_link)

    if (slide.hero_media && typeof slide.hero_media !== "string") {
      // Determine if it's an image or video based on file type
      const file = slide.hero_media
      if (file.type.startsWith("video/")) {
        formData.append(`${prefix}[video]`, slide.hero_media)
      } else if (file.type.startsWith("image/")) {
        formData.append(`${prefix}[image]`, slide.hero_media)
      }
    }
  })

  updateSection(
    { id: props.heroSection.uid, body: formData },
    {
      onSuccess: () => {
        toast.success("Hero section saved successfully")
        emit("refetch")
      },
      onError: displayError,
    },
  )
}
</script>
