<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { ref, computed, watch } from "vue"
import { useForm } from "vee-validate"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { onInvalidSubmit } from "@/utils/validations"
import { PopupEvent, PopupPayload } from "../types"
import { useCreatePopup, useUpdatePopup } from "../api"
import { validationSchema } from "../schemas"

const emit = defineEmits<{ (e: "close"): void; (e: "refresh"): void }>()
const props = defineProps<{ open: boolean; event?: PopupEvent | null; isEditMode?: boolean }>()

const { mutate: createEvent, isPending: isCreating } = useCreatePopup()
const { mutate: updateEvent, isPending: isUpdating } = useUpdatePopup()

const isLoading = computed(() => isCreating.value || isUpdating.value)
const modalTitle = computed(() => (props.isEditMode ? "Edit Event" : "Create Event"))
const buttonLabel = computed(() => (props.isEditMode ? "Update Event" : "Create Event"))

// Store initial values for comparison
const initialValues = ref<Partial<PopupPayload>>({})

// Get initial values for the form
const getInitialValues = (): Partial<PopupPayload> => {
  if (props.isEditMode && props.event) {
    const values: Partial<PopupPayload> = {
      name: props.event.name,
      start_date: props.event.start_date,
      end_date: props.event.end_date,
      event_address: props.event.event_address,
      participant_fee: props.event.participant_fee,
      description: props.event.description,
      banner_image: null,
    }
    initialValues.value = { ...values }
    return values
  }
  initialValues.value = {}
  return {}
}

// Helper function to prepare FormData for submission
const prepareFormData = (currentData: Partial<PopupPayload>): FormData => {
  const formData = new FormData()

  if (!props.isEditMode || !props.event) {
    // For create mode, include all required fields
    formData.append("name", currentData.name!)
    formData.append("event_address", currentData.event_address!)
    formData.append("description", currentData.description || "")
    formData.append("start_date", currentData.start_date!)
    formData.append("end_date", currentData.end_date!)
    formData.append("participant_fee", currentData.participant_fee!.toString())
    if (currentData.banner_image) formData.append("banner_image", currentData.banner_image)
  } else {
    // For edit mode, only include changed fields
    if (currentData.name !== initialValues.value.name) {
      formData.append("name", currentData.name!)
    }
    if (currentData.event_address !== initialValues.value.event_address) {
      formData.append("event_address", currentData.event_address!)
    }
    if (currentData.description !== initialValues.value.description) {
      formData.append("description", currentData.description || "")
    }
    if (currentData.start_date !== initialValues.value.start_date) {
      formData.append("start_date", currentData.start_date!)
    }
    if (currentData.end_date !== initialValues.value.end_date) {
      formData.append("end_date", currentData.end_date!)
    }
    if (currentData.participant_fee !== initialValues.value.participant_fee) {
      formData.append("participant_fee", currentData.participant_fee!.toString())
    }
    if (currentData.banner_image) {
      formData.append("banner_image", currentData.banner_image)
    }
  }

  return formData
}

// Initialize VeeValidate form - start with empty values
const { handleSubmit, resetForm, meta } = useForm({
  validationSchema: validationSchema,
})

const onSubmit = handleSubmit((data) => {
  const formData = prepareFormData(data)

  const handleResponse = {
    onSuccess: () => {
      toast.success(`Event ${props.isEditMode ? "updated" : "created"} successfully`)
      emit("refresh")
      emit("close")
      resetForm()
    },
    onError: displayError,
  }

  if (props.isEditMode && props.event) {
    // Check if there are any changes by checking if formData has entries
    let hasChanges = false
    for (const [,] of formData.entries()) {
      hasChanges = true
      break
    }

    if (!hasChanges) {
      toast.success("No changes to update")
      emit("close")
      return
    }
    updateEvent({ id: props.event.uid, body: formData }, handleResponse)
  } else {
    createEvent(formData, handleResponse)
  }
}, onInvalidSubmit)

const handleReset = () => {
  initialValues.value = {}
  resetForm({
    values: {
      name: "",
      start_date: "",
      end_date: "",
      event_address: "",
      participant_fee: null,
      description: "",
      banner_image: null,
    },
  })
}

watch(
  () => [props.open, props.isEditMode, props.event],
  ([open]) => {
    if (open) {
      const newInitialValues = getInitialValues()
      resetForm({ values: newInitialValues })
    } else {
      handleReset()
    }
  },
  { immediate: false },
)
</script>

<template>
  <Modal :open="open" @close="emit('close')" :title="modalTitle" max-width="2xl">
    <form @submit.prevent="onSubmit" class="space-y-6">
      <div>
        <span class="bg-core-200 flex size-10 items-center justify-center rounded-lg p-2">
          <Icon name="shop-add" size="32" />
        </span>
        <h3 class="mt-1 text-sm font-medium">Add the core details about your pop-up event.</h3>
      </div>

      <FormField name="name" label="Event Name" required />

      <div class="grid grid-cols-2 gap-6">
        <FormField name="start_date" type="date" required />

        <FormField name="end_date" type="date" required />
      </div>

      <FormField name="event_address" required />

      <FormField name="participant_fee" type="number" required />

      <FormField name="description" label="Description (optional)" type="textarea" :rows="4" />

      <FormField
        name="banner_image"
        label="Event Flier (Optional)"
        placeholder="Supported formats: PNG, JPG"
        accept="image/png,image/jpeg,image/jpg"
        type="file"
        :max-size="2"
      />
    </form>

    <template #footer>
      <div class="w-full">
        <AppButton
          class="w-full"
          :label="buttonLabel"
          :inactive="!meta.valid"
          :loading="isLoading"
          @click="onSubmit"
          size="lg"
          type="button"
        />
      </div>
    </template>
  </Modal>
</template>
