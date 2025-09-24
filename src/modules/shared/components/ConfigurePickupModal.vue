<template>
  <Modal
    :open="modelValue"
    title="Set Up Pickup"
    max-width="xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
    :handle-padding="false"
  >
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
        <GooglePlacesAutocomplete
          name="pickup_location"
          label="Select Pickup Address"
          type="select"
          placeholder="Enter a keyword to get suggestions"
          v-model="pickup_location"
          required
        />
        <div class="flex justify-end">
          <AppButton
            type="submit"
            label="Save Address"
            :loading="isPending"
            :disabled="isPending"
            class="w-full md:w-40"
            @click="onSubmit"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { toast } from "@/composables/useToast"
// import { displayError } from "@/utils/error-handler"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import Icon from "@components/Icon.vue"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

// Mock data for development (remove when API is ready)
const isPending = ref(false)
const pickup_location = ref("")

const onSubmit = () => {
  const payload = {
    pickup_location: pickup_location.value,
  }

  // Mock success for development
  console.log("Submitting pickup location:", payload)
  toast.success("Pickup location details saved!")
  emit("update:modelValue", false)
  emit("refresh")
}
</script>
