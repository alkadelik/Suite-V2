<template>
  <Modal :open="open" max-width="xl" title="Add Location" @close="emit('close')">
    <div class="space-y-4">
      <FormField name="name" label="Location Name" required />

      <FormField name="address" type="text" required label="Location Address" />
    </div>

    <template #footer>
      <AppButton
        label="Add Location"
        :loading="isPending"
        class="w-full"
        @click="onSubmit"
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
import { displayError } from "@/utils/error-handler"
import { toast } from "vue3-toastify"
import { TLocationFormData } from "../types"

defineProps({ open: Boolean })
const emit = defineEmits(["close", "refresh"])
const { mutate: createFn, isPending } = useCreateLocation()

const { handleSubmit, meta } = useForm<TLocationFormData>({
  validationSchema: yup.object({
    name: yup.string().required(),
    address: yup.string().required(),
  }),
})

const onSubmit = handleSubmit((values) => {
  createFn(values, {
    onSuccess: () => {
      toast.success("Location created successfully")
      emit("refresh")
    },
    onError: displayError,
  })
})
</script>
