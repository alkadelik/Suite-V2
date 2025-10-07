<template>
  <Modal :open="open" title="Add Customer'" max-width="xl" body-class="!p-0" @close="emit('close')">
    <AppForm :schema="schema" @submit="onSubmit" v-slot="{ meta }" class="flex h-full flex-col">
      <div class="m flex-1 space-y-4 px-4 py-4 md:px-6">
        <div class="grid grid-cols-2 gap-4 md:gap-6">
          <FormField name="first_name" label="First Name" type="text" placeholder="e.g. Adebola" />

          <FormField
            name="last_name"
            label="Last Name (optional)"
            type="text"
            placeholder="e.g. Smith"
          />
        </div>

        <FormField name="phone" label="Phone Number" type="text" placeholder="Enter phone number" />

        <FormField
          name="email"
          label="Email Address (optional)"
          type="email"
          placeholder="Enter email address"
        />
      </div>

      <div class="sticky bottom-0 space-y-3 border-t border-gray-200 bg-white px-4 py-4 md:px-6">
        <AppButton
          type="submit"
          label="Add Customer"
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
import { toast } from "@/composables/useToast"
import AppButton from "@/components/AppButton.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import type { ICustomerFormPayload, TCustomer } from "../types"
import { useCreateCustomer } from "../api"
import { displayError } from "@/utils/error-handler"
import Modal from "@components/Modal.vue"

interface FormValues {
  first_name: string
  last_name: string
  email: string
  phone: string
}

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; refresh: []; submit: [payload: TCustomer] }>()

const { mutate: createCustomer, isPending } = useCreateCustomer()

const schema = computed(() => {
  return yup.object({
    first_name: yup.string().required("First name is required"),
    last_name: yup.string().optional(),
    email: yup.string().email("Please enter a valid email address").optional(),
    phone: yup.string().optional(),
  })
})

const onSubmit = (values: FormValues) => {
  const payload: Partial<ICustomerFormPayload> = {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
  }

  createCustomer(payload as ICustomerFormPayload, {
    onSuccess: (res) => {
      console.log("Customer created successfully:", res.data)
      toast.success("Customer added successfully!")
      emit("refresh")
      emit("close")
      emit("submit", res.data)
    },
    onError: displayError,
  })
}
</script>
