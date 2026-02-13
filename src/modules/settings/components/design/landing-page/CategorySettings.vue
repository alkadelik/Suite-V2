<template>
  <div class="rounded-lg bg-white md:block md:border md:border-gray-200">
    <div class="hidden border-b border-gray-200 p-4 md:block">
      <h4 class="text-lg font-semibold text-gray-900">Categories</h4>
    </div>

    <div
      class="bg-primary-25 text-warning-700 border-warning-300 flex flex-col items-start gap-3 border-b px-6 py-3 lg:flex-row lg:items-center"
    >
      <span
        class="border-primary-200 ring-primary-100 hidden size-8 items-center justify-center rounded-full border-2 p-0.5 ring-2 ring-offset-2 lg:flex"
      >
        <Icon name="info-circle" size="20" />
      </span>
      <p class="flex-1 text-sm">
        This section will show on the landing page when you have at least 2 categories
      </p>
    </div>

    <div class="grid gap-6 md:p-6">
      <!-- Visible Categories Section -->
      <div class="bg-base-background space-y-3 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <h5 class="text-sm font-semibold text-gray-900">Visible Categories</h5>
          <Chip
            :label="`${visibleCategories.length}/7`"
            :color="
              visibleCategories.length >= 7
                ? 'success'
                : visibleCategories.length < 2
                  ? 'error'
                  : 'primary'
            "
            show-dot
          />
        </div>

        <div
          v-if="visibleCategories.length === 0"
          class="flex flex-col items-center justify-center gap-3 p-4 text-center"
        >
          <Icon name="grid" size="24" />
          <h4 class="!font-outif text-sm font-semibold text-gray-900">No Visible Categories</h4>
          <p class="text-sm text-gray-600">Newly added categories will show up here</p>
        </div>

        <draggable
          v-else
          v-model="visibleCategories"
          item-key="uid"
          :animation="200"
          ghost-class="ghost-item"
          drag-class="drag-item"
          chosen-class="chosen-item"
          handle=".drag-handle"
          class="space-y-2"
        >
          <template #item="{ element: category }">
            <div
              class="flex items-center gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white pr-3 transition-colors hover:border-gray-300"
            >
              <div
                class="drag-handle flex h-16 w-6 flex-shrink-0 cursor-grab items-center justify-center rounded-l bg-gray-100 active:cursor-grabbing"
              >
                <Icon name="six-dots" size="16" />
              </div>

              <label class="relative cursor-pointer">
                <div class="bg-core-100 flex size-10 items-center justify-center rounded-lg">
                  <img
                    v-if="category.image"
                    :src="category.image"
                    class="size-10 rounded-lg object-cover"
                  />
                  <Icon v-else name="shop-add" size="18" class="text-core-700" />
                </div>

                <button
                  type="button"
                  class="bg-primary-600 absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full"
                >
                  <Icon name="edit" class="text-white" size="12" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  class="absolute inset-0 cursor-pointer opacity-0"
                  @change="handleImageUpload($event, category)"
                />
              </label>

              <span class="flex-1 text-sm font-medium text-gray-900">{{ category.name }} </span>

              <button
                type="button"
                class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded hover:bg-gray-100"
                @click="toggleCategoryVisibility(category)"
              >
                <Icon name="eye-slash" size="18" class="text-gray-600" />
              </button>
            </div>
          </template>
        </draggable>

        <p v-if="visibleCategories.length >= 7" class="text-xs text-orange-600">
          Maximum of 7 categories can be visible. Hide some to add more.
        </p>
      </div>

      <!-- Available/Hidden Categories Section -->
      <div class="space-y-3 rounded-xl border border-gray-200 p-4">
        <div class="flex items-center gap-3">
          <h5 class="text-sm font-semibold text-gray-900">Hidden</h5>
          <Chip :label="`${hiddenCategories.length}`" />
        </div>

        <div class="relative">
          <TextField v-model="searchQuery" type="text" placeholder="Search categories..." />
        </div>

        <div
          v-if="filteredHiddenCategories.length === 0"
          class="flex flex-col items-center justify-center gap-3 bg-gray-100 p-4 text-center"
        >
          <Icon name="grid" size="24" />
          <h4 class="!font-outif text-sm font-semibold text-gray-900">No Hidden Categories</h4>
          <p class="text-sm text-gray-600">Newly added categories will show up here</p>
        </div>

        <div v-else class="max-h-80 space-y-2 overflow-y-auto">
          <div
            v-for="category in filteredHiddenCategories"
            :key="category.uid"
            class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
          >
            <div class="bg-core-100 flex size-10 items-center justify-center rounded-lg">
              <img
                v-if="category.image"
                :src="category.image"
                class="size-10 rounded-lg object-cover"
              />
              <Icon name="shop-add" size="18" class="text-core-700" />
            </div>

            <span class="flex-1 text-sm font-medium text-gray-700">{{ category.name }} </span>

            <button
              type="button"
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded hover:bg-gray-100"
              :disabled="visibleCategories.length >= 7"
              @click="toggleCategoryVisibility(category)"
            >
              <Icon
                name="eye"
                size="18"
                :class="[
                  visibleCategories.length >= 7
                    ? 'text-gray-300'
                    : 'hover:text-primary-600 text-gray-600',
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end border-t border-gray-200 pt-4">
        <AppButton
          type="button"
          :disabled="visibleCategories.length < 2"
          label="Save Section"
          :loading="isPending || isPendingCategory"
          @click="saveSection"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import draggable from "vuedraggable"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import { useGetCategories, useUpdateBulkCategoryImages } from "@modules/inventory/api"
import { useUpdateStorefrontSection } from "@modules/settings/api"
import type { ThemeSection } from "@modules/settings/types"
import type { IProductCategory } from "@modules/inventory/types"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import TextField from "@components/form/TextField.vue"

interface CategoryItem extends IProductCategory {
  position?: number
  image?: string | null
  imageFile?: File | null
}

const props = defineProps<{ categorySection?: ThemeSection | null }>()
const emit = defineEmits<{ refetch: [] }>()

const { mutate: updateSection, isPending } = useUpdateStorefrontSection()
const { data: categoriesData, refetch: refetchCategories } = useGetCategories()
const { mutate: updateBulkCategoryImages, isPending: isPendingCategory } =
  useUpdateBulkCategoryImages()

const visibleCategories = ref<CategoryItem[]>([])
const searchQuery = ref("")

const allCategories = computed<IProductCategory[]>(() => {
  return categoriesData.value?.data?.results || []
})

const hiddenCategories = computed<CategoryItem[]>(() => {
  const visibleUids = visibleCategories.value.map((c) => c.uid)
  return allCategories.value.filter((c) => !visibleUids.includes(c.uid))
})

const filteredHiddenCategories = computed(() => {
  if (!searchQuery.value) return hiddenCategories.value

  const query = searchQuery.value.toLowerCase()
  return hiddenCategories.value.filter((category) => category.name.toLowerCase().includes(query))
})

// Watch for both prop changes and categories loading to initialize visible categories
watch(
  [() => props.categorySection, allCategories],
  ([newSection, categories]) => {
    // Only proceed if both section and categories are available
    if (newSection && newSection.featured_categories_display && categories.length > 0) {
      // Map category items from the section
      const categoryItems = newSection.featured_categories_display
        .map((item) => {
          const fullCategory = categories.find((c) => c.uid === item.uid)
          if (!fullCategory) return null

          console.log("Mapping category item:", {
            item,
            fullCategory,
          })

          return {
            ...fullCategory,
            position: 0,
            image: item.image || fullCategory?.image || null,
          }
        })
        .filter((item) => item !== null)

      visibleCategories.value = categoryItems
    }
  },
  { immediate: true },
)

const toggleCategoryVisibility = (category: CategoryItem) => {
  const index = visibleCategories.value.findIndex((c) => c.uid === category.uid)

  if (index !== -1) {
    // Remove from visible
    visibleCategories.value.splice(index, 1)
  } else {
    // Add to visible (if not at max)
    if (visibleCategories.value.length >= 7) {
      toast.error("Maximum of 7 categories can be visible at once")
      return
    }
    visibleCategories.value.unshift(category)
  }
}

const handleImageUpload = (event: Event, category: CategoryItem) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  // convert file to base64 and set to category.image for preview
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      category.image = e.target?.result as string
      category.imageFile = file
    }
    reader.readAsDataURL(file)
  }
}

const saveSection = () => {
  if (!props.categorySection?.uid) {
    return toast.error("Category section not found. Please refresh the page.")
  }

  if (visibleCategories.value.length === 0) {
    return toast.error("Please select at least one category to display")
  }

  const featuredCategoryUids = visibleCategories.value.map((c) => c.uid)
  const body = { featured_categories: featuredCategoryUids }

  updateSection(
    { id: props.categorySection.uid, body },
    {
      onSuccess: () => {
        // Prepare bulk category images update
        const categoryImagesToUpdate = visibleCategories.value
          .filter((cat) => cat.imageFile)
          .map((cat) => ({
            uid: cat.uid,
            image: cat.imageFile!,
          }))

        // If there are category images to update, call the bulk update
        if (categoryImagesToUpdate.length > 0) {
          const bulkFormData = new FormData()
          categoryImagesToUpdate.forEach((item, index) => {
            bulkFormData.append(`categories[${index}]uid`, item.uid)
            bulkFormData.append(`categories[${index}]image`, item.image)
          })

          updateBulkCategoryImages(bulkFormData, {
            onSuccess: () => {
              toast.success("Category section and images saved successfully")
              emit("refetch")
              refetchCategories()
            },
            onError: displayError,
          })
        } else {
          toast.success("Category section saved successfully")
          emit("refetch")
        }
      },
      onError: displayError,
    },
  )
}
</script>

<style scoped>
.ghost-item {
  opacity: 0.5;
  background-color: var(--color-gray-100);
  border: 2px dashed var(--color-gray-300);
}

.drag-item {
  transform: rotate(2deg);
  z-index: 1000;
}

.chosen-item {
  cursor: grabbing !important;
}
</style>
