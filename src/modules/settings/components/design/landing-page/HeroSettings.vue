<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Hero</h4>
    </div>

    <div class="grid gap-6 md:p-6">
      <!-- Hero Slides List -->
      <div v-if="heroSlides.length > 0" class="space-y-4">
        <h5 class="text-md font-medium text-gray-900">Slides</h5>
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

                <!-- <FormField
                  :name="`heroSlides.${index}.cta_button_link`"
                  label="Button Link (optional)"
                  placeholder="e.g. https://yourstore.com/shop"
                /> -->

                <div class="flex justify-between border-t border-gray-200 pt-4">
                  <AppButton
                    type="button"
                    label="Remove Slide"
                    icon="trash"
                    variant="text"
                    class="text-red-600 hover:text-red-700"
                    @click="confirmDelete(index)"
                  />

                  <AppButton
                    type="button"
                    :label="slide.id.startsWith('slide_') ? 'Save Slide' : 'Update Slide'"
                    :loading="savingSlideId === slide.id"
                    @click="saveSlide(index, slide.id)"
                  />
                </div>
              </div>
            </template>
          </Collapsible>
        </div>
      </div>

      <div class="flex justify-start">
        <AppButton
          v-if="heroSlides.length < 4"
          type="button"
          label="Add Slide"
          icon="add"
          variant="text"
          @click="addSlide"
        />
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
import { computed, ref, watch } from "vue"
import { useForm } from "vee-validate"
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Collapsible from "@components/Collapsible.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import {
  useCreateHeroCarousel,
  useDeleteHeroCarousel,
  useUpdateHeroCarousel,
} from "@modules/settings/api"
import type { ThemeSection } from "@modules/settings/types"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useSettingsStore } from "@modules/settings/store"

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

const props = defineProps<{ heroSection?: ThemeSection | null; oldSection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const { mutate: createHeroCarousel } = useCreateHeroCarousel()
const { mutate: updateHeroCarousel } = useUpdateHeroCarousel()
const { mutate: deleteHeroCarousel } = useDeleteHeroCarousel()

const heroSlides = ref<HeroSlide[]>([])
const savingSlideId = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleteIndex = ref<number | null>(null)
const isDeletingSlide = ref(false)

const storefrontUrl = computed(() => `https://${useSettingsStore().storefrontUrl}/store`)

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
        title: yup.string().max(200, "Title must not exceed 200 characters").optional(),
        subtitle: yup.string().max(500, "Subtitle must not exceed 500 characters").optional(),
        cta_button_text: yup
          .string()
          .max(50, "CTA button text must not exceed 50 characters")
          .optional(),
        cta_button_link: yup.string().url("Please enter a valid URL").optional().nullable(),
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
          subtitle: slide.content || "",
          cta_button_text: slide.cta_text || "Shop Now",
          cta_button_link: slide.cta_link || storefrontUrl.value,
          hero_media: slide.media,
        })) || []

      // If no carousel items exist, create an array from the old section format
      if (mappedSlides.length === 0 && props.oldSection) {
        heroSlides.value = [
          {
            id: `slide_${Date.now()}`,
            title: props.oldSection.title || "",
            subtitle: props.oldSection.subtitle || "",
            cta_button_text: props.oldSection.cta_text || "Shop Now",
            cta_button_link: props.oldSection.cta_link || storefrontUrl.value,
            hero_media: props.oldSection.image || null,
          },
        ]
      } else {
        heroSlides.value = mappedSlides
      }

      setValues({ heroSlides: heroSlides.value })
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
    cta_button_link: storefrontUrl.value,
    hero_media: null,
  }
  heroSlides.value.push(newSlide)

  setValues({
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

  // Check if this is an existing slide from backend (has uid format)
  // Backend IDs are UUIDs, client-generated IDs start with 'slide_'
  const isExistingSlide = !slide.id.startsWith("slide_")

  if (isExistingSlide) {
    // Delete from backend
    isDeletingSlide.value = true
    deleteHeroCarousel(slide.id, {
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
    })
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

const saveSlide = (index: number, slideId: string) => {
  // Get the slide data from the form values
  const slide = formValues.heroSlides?.[index]

  if (!slide) {
    return toast.error("Slide data not found")
  }

  if (!slide.hero_media) {
    return toast.error("Please upload media (image or video) for the slide")
  }

  if (!props.heroSection?.uid) {
    return toast.error("Hero section not found. Please refresh the page.")
  }

  savingSlideId.value = slideId

  const formData = new FormData()
  formData.append("section", props.heroSection.uid)
  if (slide.title) formData.append("title", slide.title)
  if (slide.subtitle) formData.append("content", slide.subtitle)
  if (slide.cta_button_text) formData.append("cta_text", slide.cta_button_text)
  if (slide.cta_button_link) formData.append("cta_link", slide.cta_button_link)
  if (slide.hero_media && typeof slide.hero_media !== "string") {
    formData.append("media", slide.hero_media)
  }
  formData.append("sort_order", String(index))

  // Check if this is an existing slide from backend (has uid format)
  // Backend IDs are UUIDs, client-generated IDs start with 'slide_'
  const isExistingSlide = !slideId.startsWith("slide_")

  if (isExistingSlide) {
    // Update existing slide
    updateHeroCarousel(
      { id: slideId, body: formData },
      {
        onSuccess: () => {
          toast.success(`Slide ${index + 1} updated successfully`)
          emit("refetch")
          savingSlideId.value = null
        },
        onError: (error) => {
          displayError(error)
          savingSlideId.value = null
        },
      },
    )
  } else {
    // Create new slide
    createHeroCarousel(formData, {
      onSuccess: () => {
        toast.success(`Slide ${index + 1} saved successfully`)
        emit("refetch")
        savingSlideId.value = null
      },
      onError: (error) => {
        displayError(error)
        savingSlideId.value = null
      },
    })
  }
}
</script>
