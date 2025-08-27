<template>
  <Modal
    :open="modelValue"
    title="Add Bank Details"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
    <AppForm :schema="pickupLocationSchema" @submit="onSubmit" v-slot="{ meta }">
      <div class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
        <div class="space-y-4">
          <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
            <Icon name="shop" size="20" />
          </div>

          <p class="text-xs md:text-sm">
            Choose the location where customers can pick up their orders.
          </p>
        </div>

        <div class="space-y-5 rounded-xl bg-white px-6 py-4">
          <FormField
            name="pickup_location"
            label="Select Pickup Address"
            type="select"
            :options="supportedlocations"
            placeholder="Enter a keyword to get suggestions"
            required
            searchable
          />
          <div class="flex justify-end">
            <AppButton
              type="submit"
              label="Save Address"
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
// import { displayError } from "@/utils/error-handler"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import AppForm from "@/components/form/AppForm.vue"
import FormField from "@/components/form/FormField.vue"
import Icon from "@components/Icon.vue"

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

// Validation schema
const pickupLocationSchema = yup.object({
  pickup_location: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .required("Please select a pickup location"),
})

// Mock data for development (remove when API is ready)
const supportedlocations = ref([])
const isPending = ref(false)

const onSubmit = (values: { pickup_location: { value: string } }) => {
  const payload = {
    pickup_location: values.pickup_location.value,
  }

  // Mock success for development
  console.log("Submitting pickup location:", payload)
  toast.success("Pickup location details saved!")
  emit("update:modelValue", false)
  emit("refresh")
}
</script>
