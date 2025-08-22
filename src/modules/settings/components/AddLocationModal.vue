<template>
  <Modal :open="open" max-width="2xl" title="Add Location" @close="$emit('close')">
    <form @submit.prevent="onSubmit" class="space-y-6">
      <FormField name="name" label="Location Name" required />
      <FormField name="address" type="text" required label="Location Address" />
    </form>

    <template #footer>
      <AppButton
        label="Add Location"
        :loading="isPending"
        class="w-full"
        @click="submitForm"
        :disabled="!meta.valid"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import FormField from "@components/form/FormField.vue"
import Modal from "@components/Modal.vue"
import { useForm } from "vee-validate"
import * as yup from "yup"
import { useCreateLocation } from "../api"
import { displayError, formatError } from "@/utils/error-handler"

interface LocationFormData {
  name: string
  address: string
}

interface Props {
  open: boolean
}

interface Emits {
  (e: "close"): void
}

const userSchema = yup.object({
  name: yup.string().required(),
  address: yup.string().required(),
})

const { handleSubmit, meta } = useForm<LocationFormData>({
  validationSchema: userSchema,
})

const { mutate: createLocation, isPending } = useCreateLocation()

const onCreate = (values: LocationFormData) => {
  console.log("Form submitted:", values)
  createLocation(
    { ...values },
    {
      onSuccess: () => {
        console.log("Location created successfully")
        // Optionally, you can show a success message or perform other actions
      },
      onError: (error) => {
        displayError(error)
        // or handle separately
        const errorMsg = formatError(error)
        console.error("Login failed!!!", errorMsg)
      },
    },
  )
}

const onSubmit = handleSubmit(onCreate)

const submitForm = async (): Promise<void> => {
  await onSubmit()
}

defineProps<Props>()
defineEmits<Emits>()
</script>
