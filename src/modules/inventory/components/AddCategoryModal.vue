<template>
  <Modal
    :open="modelValue"
    title="Add New Category"
    variant="centered"
    max-width="md"
    body-class="!p-0"
    @close="handleClose"
  >
    <AppForm
      :schema="categorySchema"
      @submit="handleSubmit"
      v-slot="{ meta }"
      class="flex h-full flex-col"
    >
      <div class="p-4 md:px-6">
        <IconHeader
          class="mb-6"
          icon-name="shop-add"
          subtext="Create a new category to use in classifying your products."
        />

        <FormField
          name="name"
          label="Category Name"
          type="text"
          placeholder="e.g Footwear, Accessories"
          @input="handleInput"
        />
      </div>

      <div class="sticky bottom-0 space-y-3 border-t border-gray-200 bg-white px-4 py-4 md:px-6">
        <AppButton
          type="submit"
          label="Add Category"
          :loading="isPending"
          class="w-full"
          :disabled="!meta.valid || isPending"
        />
      </div>
    </AppForm>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from "vue"
import * as yup from "yup"
import Modal from "@/components/Modal.vue"
import AppButton from "@/components/AppButton.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import { useCreateCategory } from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { useTextTransform } from "@/composables/useTextTransform"
import { useQueryClient } from "@tanstack/vue-query"
import IconHeader from "@components/IconHeader.vue"

interface FormValues {
  name: string
}

interface Emits {
  /** Update the modelValue */
  "update:modelValue": [value: boolean]
  /** Emitted when category is successfully created */
  success: [category: { label: string; value: string }]
}

defineProps<{
  /** Whether the modal is open */
  modelValue: boolean
}>()

const emit = defineEmits<Emits>()

// Composables
const { mutate: createCategory, isPending } = useCreateCategory()
const { capitalizeFirstLetter } = useTextTransform()
const queryClient = useQueryClient()

// Validation schema
const categorySchema = computed(() => {
  return yup.object({
    name: yup
      .string()
      .required("Category name is required")
      .min(2, "Category name must be at least 2 characters"),
  })
})

/**
 * Handle input with auto-capitalization
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const cursorPosition = target.selectionStart || 0
  const oldValue = target.value
  const newValue = capitalizeFirstLetter(oldValue)

  if (newValue !== oldValue) {
    target.value = newValue
    // Preserve cursor position after capitalization
    requestAnimationFrame(() => {
      target.setSelectionRange(cursorPosition, cursorPosition)
    })
  }
}

/**
 * Handle form submission
 */
const handleSubmit = (values: FormValues) => {
  createCategory(
    {
      name: values.name.trim(),
      description: "",
      is_active: true,
    },
    {
      onSuccess: (response: unknown) => {
        // Extract UID from response
        const uid = extractUid(response)

        toast.success("Category created successfully")

        // Invalidate categories query to refresh dropdown
        queryClient.invalidateQueries({ queryKey: ["categories"] })

        // Emit success with new category data
        emit("success", {
          label: values.name.trim(),
          value: uid,
        })

        // Close modal
        emit("update:modelValue", false)
      },
      onError: (error: unknown) => {
        displayError(error)
      },
    },
  )
}

/**
 * Extract UID from API response
 * Response format: { uid: string, name: string, ... }
 */
const extractUid = (response: unknown): string => {
  try {
    // Try direct uid property first (for direct response)
    const directUid = (response as { uid?: string })?.uid
    if (typeof directUid === "string" && directUid.length > 0) {
      return directUid
    }

    // Fallback to nested structure (response.data.data.uid)
    const nestedUid = (response as { data?: { data?: { uid?: string } } })?.data?.data?.uid
    if (typeof nestedUid === "string" && nestedUid.length > 0) {
      return nestedUid
    }

    return ""
  } catch (error) {
    console.error("Could not extract UID from response:", response, error)
    return ""
  }
}

/**
 * Handle modal close
 */
const handleClose = () => {
  if (isPending.value) return
  emit("update:modelValue", false)
}
</script>
