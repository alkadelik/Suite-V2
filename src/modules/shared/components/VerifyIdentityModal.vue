<template>
  <Modal
    :open="modelValue"
    title="Verify Identity"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
    <AppForm :schema="identityVerificationSchema" @submit="onSubmit" v-slot="{ meta }">
      <div class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
        <div class="space-y-4">
          <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
            <Icon name="personalcard" size="20" />
          </div>

          <p class="text-xs md:text-sm">
            We require your BVN and ID to verify your identity as part of KYC regulations.
          </p>
        </div>

        <div class="space-y-5 rounded-xl bg-white px-6 py-4">
          <FormField
            name="id_type"
            label="Select ID Type"
            type="select"
            :options="supportedIDs"
            placeholder="Select"
            required
          />

          <FormField name="id_document" label="Click to upload ID" type="file" required />

          <FormField
            name="id_number"
            label="Enter ID Number"
            placeholder="e.g. 1234567890"
            required
          />

          <FormField
            name="bvn"
            label="Enter BVN"
            placeholder="e.g. 12345678901"
            required
            type="text"
            :maxlength="11"
            inputmode="numeric"
            pattern="\d*"
          />

          <div class="flex justify-end">
            <AppButton
              type="submit"
              label="Submit"
              :loading="isPending"
              :disabled="!meta.valid"
              class="w-full md:w-40"
            />
          </div>
        </div>
      </div>
    </AppForm>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import * as yup from "yup"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import Icon from "@components/Icon.vue"
import { useSubmitKYC } from "../api"

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const { mutate: submitKYC, isPending } = useSubmitKYC()

// Validation schema
const identityVerificationSchema = yup.object({
  id_type: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .required("Please select an ID type"),
  id_number: yup.string().required("Please enter your ID number"),
  bvn: yup
    .string()
    .matches(/^\d{11}$/, "BVN must be exactly 11 digits")
    .required("Please enter your BVN"),
})

const supportedIDs = ref([
  {
    label: "International Passport",
    value: "international_passport",
  },
  {
    label: "National ID (NIN)",
    value: "national_id",
  },
  {
    label: "Driver's License",
    value: "drivers_license",
  },
  {
    label: "Voter's Card",
    value: "voters_card",
  },
])

const onSubmit = (values: {
  id_type: { value: string }
  id_document: File | null
  id_number: string
  bvn: string
}) => {
  const formData = new FormData()
  formData.append("doc_type", values.id_type.value)
  formData.append("bvn", values.bvn)
  formData.append("doc_number", values.id_number)
  if (values.id_document) {
    formData.append("file", values.id_document)
  }

  submitKYC(formData, {
    onSuccess: () => {
      toast.success("Identity verification submitted successfully!")
      emit("update:modelValue", false)
      emit("refresh")
    },
    onError: displayError,
  })
}
</script>
