<template>
  <Modal
    :open="modelValue"
    title="Set Up Pickup"
    max-width="3xl"
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
          Choose the location where customers can pick up their orders and pickup time.
        </p>
      </div>

      <div class="space-y-5 rounded-xl bg-white px-6 py-4">
        <GooglePlacesAutocomplete
          name="pickup_location"
          label="Select Pickup Address"
          type="select"
          placeholder="Enter a keyword to get suggestions"
          v-model="pickup_location"
          direction="down"
          required
        />

        <hr class="border-gray-200" />

        <!-- Pickup Times Section -->
        <div class="space-y-4">
          <h3 class="text-core-800 text-base font-semibold">Select Pickup Times</h3>

          <!-- Weekdays Row -->
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p class="text-core-700 text-sm font-medium">Weekdays ( Mon - Fri)</p>
            <div class="flex items-center gap-3">
              <div
                class="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 md:min-w-[180px]"
              >
                <span class="text-core-400 text-sm">From</span>
                <input
                  type="time"
                  v-model="weekdayFrom"
                  class="text-core-800 flex-1 border-none bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
              <div
                class="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 md:min-w-[180px]"
              >
                <span class="text-core-400 text-sm">To</span>
                <input
                  type="time"
                  v-model="weekdayTo"
                  class="text-core-800 flex-1 border-none bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Weekends Row -->
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p class="text-core-700 text-sm font-medium">Weekends (Sat - Sun)</p>
            <div class="flex items-center gap-3">
              <div
                class="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 md:min-w-[180px]"
              >
                <span class="text-core-400 text-sm">From</span>
                <input
                  type="time"
                  v-model="weekendFrom"
                  class="text-core-800 flex-1 border-none bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
              <div
                class="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 md:min-w-[180px]"
              >
                <span class="text-core-400 text-sm">To</span>
                <input
                  type="time"
                  v-model="weekendTo"
                  class="text-core-800 flex-1 border-none bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <AppButton
            type="submit"
            label="Save Settings"
            :loading="isPending"
            :disabled="isPending || !pickup_location"
            class="w-full md:w-40"
            @click="onSubmit"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import Icon from "@components/Icon.vue"
import GooglePlacesAutocomplete from "@components/GooglePlacesAutocomplete.vue"
import { useUpdateStoreDetails, useGetStoreDetails } from "@modules/settings/api"
import { useAuthStore } from "@modules/auth/store"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const authStore = useAuthStore()
const storeUid = authStore.user?.store_uid || ""

const { mutate: updateStore, isPending } = useUpdateStoreDetails()
const { data: storeDetails } = useGetStoreDetails(storeUid)

const pickup_location = ref("")

// Pickup time refs with default values
const weekdayFrom = ref("09:00")
const weekdayTo = ref("17:00")
const weekendFrom = ref("09:00")
const weekendTo = ref("17:00")

// Prefill data when modal opens or store details load
watch(
  [() => props.modelValue, storeDetails],
  ([isOpen, details]) => {
    if (isOpen && details) {
      pickup_location.value = details.pickup_location || ""
      weekdayFrom.value = details.pickup_weekday_start_time || "09:00"
      weekdayTo.value = details.pickup_weekday_end_time || "17:00"
      weekendFrom.value = details.pickup_weekend_start_time || "09:00"
      weekendTo.value = details.pickup_weekend_end_time || "17:00"
    }
  },
  { immediate: true },
)

const onSubmit = () => {
  const payload = {
    pickup_location: pickup_location.value,
    pickup_weekday_start_time: weekdayFrom.value,
    pickup_weekday_end_time: weekdayTo.value,
    pickup_weekend_start_time: weekendFrom.value,
    pickup_weekend_end_time: weekendTo.value,
  }

  updateStore(
    { id: storeUid, body: payload },
    {
      onSuccess: () => {
        toast.success("Pickup settings saved!")
        emit("update:modelValue", false)
        emit("refresh")
      },
      onError: displayError,
    },
  )
}
</script>
