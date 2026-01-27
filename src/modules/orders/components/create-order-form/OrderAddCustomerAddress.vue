<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import Icon from "@components/Icon.vue"
import Modal from "@components/Modal.vue"
import { useCreateCustomerAddress } from "@modules/customers/api"
import { toast } from "@/composables/useToast"
import { ref } from "vue"

interface Props {
  open: boolean
  customerUid: string
  customerName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [address: { label: string; value: string }]
}>()

const newAddressValue = ref("")
const addressValidationError = ref("")

const { mutate: createCustomerAddress, isPending: isCreatingAddress } = useCreateCustomerAddress()

const createAddress = () => {
  addressValidationError.value = ""

  if (!newAddressValue.value.trim()) {
    addressValidationError.value = "Please enter a delivery address"
    return
  }

  if (!props.customerUid) {
    toast.error("Customer information is required")
    return
  }

  const payload = {
    customer: props.customerUid,
    address: newAddressValue.value.trim(),
    address_code: null,
    city: null,
    state: null,
  }

  createCustomerAddress(payload, {
    onSuccess: (res) => {
      const data = res.data as { uid: string; address: string }
      toast.success("Address added successfully!")
      emit("success", { label: data.address, value: data.uid })
      handleClose()
    },
    onError: (error: unknown) => {
      const err =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Error adding address"
      addressValidationError.value = err
      toast.error(err)
    },
  })
}

const handleClose = () => {
  newAddressValue.value = ""
  addressValidationError.value = ""
  emit("close")
}
</script>

<template>
  <Modal :open="open" title="Add New Address" max-width="xl" @close="handleClose">
    <div class="space-y-4">
      <div class="bg-core-50 mb-2 flex size-10 items-center justify-center rounded-xl p-2">
        <Icon name="location" size="28" />
      </div>
      <p class="text-sm text-gray-600">Add a new delivery address for {{ customerName }}</p>

      <GooglePlacesAutocomplete
        label="Delivery Address"
        placeholder="e.g. 123, Allen Avenue, Ikeja, Lagos"
        :modelValue="newAddressValue"
        @update:modelValue="newAddressValue = $event"
        @selected="
          (item: any) => {
            console.log('Selected address:', item)
            newAddressValue = item.description
            addressValidationError = ''
          }
        "
        :error="addressValidationError"
        required
      />
    </div>

    <template #footer>
      <div class="flex gap-3">
        <AppButton label="Cancel" variant="outlined" class="flex-1" @click="handleClose" />
        <AppButton
          label="Add Address"
          class="flex-1"
          :loading="isCreatingAddress"
          :disabled="isCreatingAddress || !newAddressValue.trim()"
          @click="createAddress"
        />
      </div>
    </template>
  </Modal>
</template>
