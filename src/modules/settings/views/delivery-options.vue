<script setup lang="ts">
import AppButton from "@components/AppButton.vue"

import Switch from "@components/form/Switch.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import { useGetLiveStatus } from "@modules/shared/api"
import { useGetStoreDetails, useUpdateStoreDetails } from "@modules/settings/api"
import ConfigureDeliveryModal from "@modules/shared/components/ConfigureDeliveryModal.vue"
import ConfigurePickupModal from "@modules/shared/components/ConfigurePickupModal.vue"
import ManageShipBubbleModal from "@modules/shared/components/ManageShipBubbleModal.vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

import { computed, ref, watch } from "vue"
const form = ref({ allow_pickup: false, allow_delivery: false })
const originalValues = ref({ allow_pickup: false, allow_delivery: false })

const openPickup = ref(false)
const openDelivery = ref(false)
const openNewDelivery = ref(false)
const storeSlug = computed(() => useAuthStore().user?.store_slug || "")
const storeUid = computed(() => useAuthStore().user?.store_uid || "")

const { data: liveStatus, refetch: refetchLiveStatus } = useGetLiveStatus(storeSlug.value)
const { data: storeDetails, refetch: refetchStoreDetails } = useGetStoreDetails(storeUid.value)
const { mutate: updateStore, isPending: isUpdating } = useUpdateStoreDetails()

const computedLiveStatusDelivery = computed(
  () => liveStatus.value?.data?.criteria?.delivery_options?.details || null,
)

// Watch store details for pickup location and delivery settings
watch(
  storeDetails,
  (newVal) => {
    if (newVal) {
      // Pickup location
      const pickupLocation = newVal.pickup_location
      const hasPickup = typeof pickupLocation === "string" ? pickupLocation.trim() !== "" : false
      form.value.allow_pickup = hasPickup
      originalValues.value.allow_pickup = hasPickup

      // Delivery enabled
      form.value.allow_delivery = newVal.delivery_enabled || false
      originalValues.value.allow_delivery = newVal.delivery_enabled || false
    }
  },
  { immediate: true },
)

// Check if form has changes
const hasChanges = computed(() => {
  return (
    form.value.allow_pickup !== originalValues.value.allow_pickup ||
    form.value.allow_delivery !== originalValues.value.allow_delivery
  )
})

// Handle save
const handleSave = () => {
  const payload: Record<string, unknown> = {}

  if (form.value.allow_pickup !== originalValues.value.allow_pickup) {
    // If turning off pickup, clear the pickup location
    if (!form.value.allow_pickup) {
      payload.pickup_location = ""
    }
    // If turning on pickup, the ConfigurePickupModal handles the save
  }

  if (form.value.allow_delivery !== originalValues.value.allow_delivery) {
    payload.delivery_enabled = form.value.allow_delivery
  }

  updateStore(
    { id: storeUid.value, body: payload },
    {
      onSuccess: () => {
        toast.success("Delivery options updated successfully")
        refetchStoreDetails()
        refetchLiveStatus()
      },
      onError: displayError,
    },
  )
}

// Watch pickup modal to refetch store details when it closes
watch(openPickup, (newOpen, oldOpen) => {
  if (oldOpen === true && newOpen === false) {
    refetchStoreDetails()
  }
})

// Watch both delivery modals to refetch data when they close
watch(
  [openDelivery, openNewDelivery],
  ([newOpenDelivery, newOpenNewDelivery], [oldOpenDelivery, oldOpenNewDelivery]) => {
    // Check if either modal was just closed (changed from true to false)
    const deliveryModalClosed = oldOpenDelivery === true && newOpenDelivery === false
    const newDeliveryModalClosed = oldOpenNewDelivery === true && newOpenNewDelivery === false

    if (deliveryModalClosed || newDeliveryModalClosed) {
      // Refetch both store details and live status
      refetchStoreDetails()
      refetchLiveStatus()
    }
  },
)
</script>

<template>
  <div>
    <section>
      <SectionHeader
        title="Delivery Options"
        size="sm"
        subtitle="Manage how your orders are fulfilled—pickup, delivery, or a mix of both."
      />

      <div class="border-core-100 mt-6 rounded-2xl border bg-white">
        <div class="grid gap-10 p-6">
          <!-- pickup -->
          <div class="flex items-center gap-6">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
              <Icon name="shop" size="24" class="text-gray-600" />
            </span>

            <div class="flex-1">
              <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                Allow Pickup?
                <button
                  v-if="computedLiveStatusDelivery?.pickup_location"
                  type="button"
                  class="text-primary-600 text-sm underline"
                >
                  Manage address
                </button>
              </h3>
              <p class="text-core-600 text-sm">
                Let customers pick up their orders directly from you.
              </p>
            </div>
            <Switch
              :model-value="form.allow_pickup"
              @update:model-value="
                ($event) => {
                  form.allow_pickup = $event
                  if ($event) openPickup = true
                }
              "
            />
          </div>

          <!-- delivery -->
          <div class="flex items-center gap-6">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
              <Icon name="truck-fast" size="24" class="text-gray-600" />
            </span>

            <div class="flex-1">
              <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                Allow Delivery?
                <button
                  v-if="computedLiveStatusDelivery?.delivery_enabled"
                  type="button"
                  class="text-primary-600 text-sm underline"
                  @click="openDelivery = true"
                >
                  Manage shipping
                </button>
              </h3>
              <p class="text-core-600 text-sm">Offer deliver to your customers.</p>
            </div>
            <Switch
              :model-value="form.allow_delivery"
              @update:model-value="
                ($event) => {
                  if ($event) {
                    // If delivery is not enabled yet, show ConfigureDeliveryModal
                    if (!computedLiveStatusDelivery?.delivery_enabled) {
                      openNewDelivery = true
                    } else {
                      // If delivery is already enabled, show ManageShipBubbleModal
                      openDelivery = true
                    }
                  } else {
                    // If turning off, update the form value
                    form.allow_delivery = false
                  }
                }
              "
            />
          </div>
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton
            label="Save Changes"
            :disabled="!hasChanges"
            :loading="isUpdating"
            @click="handleSave"
          />
        </div>
      </div>
    </section>

    <ConfigurePickupModal v-model="openPickup" />
    <ManageShipBubbleModal v-model="openDelivery" />
    <ConfigureDeliveryModal
      v-model="openNewDelivery"
      @refresh="
        () => {
          refetchStoreDetails()
          refetchLiveStatus()
        }
      "
    />
  </div>
</template>
