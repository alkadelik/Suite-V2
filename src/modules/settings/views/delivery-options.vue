<script setup lang="ts">
import AppButton from "@components/AppButton.vue"

import Switch from "@components/form/Switch.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import { useGetLiveStatus } from "@modules/shared/api"
import ConfigureDeliveryModal from "@modules/shared/components/ConfigureDeliveryModal.vue"
import ConfigurePickupModal from "@modules/shared/components/ConfigurePickupModal.vue"
import ManageShipBubbleModal from "@modules/shared/components/ManageShipBubbleModal.vue"

import { computed, ref, watch } from "vue"
const form = ref({ allow_pickup: false, allow_delivery: false })

const openPickup = ref(false)
const openDelivery = ref(false)
const openNewDelivery = ref(false)
const storeSlug = computed(() => useAuthStore().user?.store_slug || "")

const { data: liveStatus, refetch: refetchLiveStatus } = useGetLiveStatus(storeSlug.value)
const computedLiveStatusDelivery = computed(
  () => liveStatus.value?.data?.criteria?.delivery_options?.details || null,
)

watch(
  liveStatus,
  (newVal) => {
    console.log({ newVal })
    if (newVal) {
      form.value.allow_pickup =
        newVal.data?.criteria?.delivery_options?.details?.pickup_location || false
      form.value.allow_delivery =
        newVal.data?.criteria?.delivery_options?.details?.delivery_enabled || false
    }
  },
  { immediate: true },
)

// Watch both delivery modals to refetch status and reset form when they close
watch(
  [openDelivery, openNewDelivery],
  ([newOpenDelivery, newOpenNewDelivery], [oldOpenDelivery, oldOpenNewDelivery]) => {
    // Check if either modal was just closed (changed from true to false)
    const deliveryModalClosed = oldOpenDelivery === true && newOpenDelivery === false
    const newDeliveryModalClosed = oldOpenNewDelivery === true && newOpenNewDelivery === false

    if (deliveryModalClosed || newDeliveryModalClosed) {
      // Refetch the live status to get the actual delivery state
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
        <div class="grid gap-10 p-4 md:p-6">
          <!-- pickup -->
          <div class="flex items-start gap-3 md:items-center md:gap-6">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 md:h-10 md:w-10"
            >
              <Icon name="shop" size="20" class="text-gray-600" />
            </span>

            <div class="flex-1">
              <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                Allow Pickup?
                <button
                  v-if="computedLiveStatusDelivery?.pickup_location"
                  type="button"
                  class="text-primary-600 hidden text-sm underline md:block"
                >
                  Manage address
                </button>
              </h3>
              <p class="text-core-600 text-sm">
                Let customers pick up their orders directly from you.
              </p>
              <button
                v-if="computedLiveStatusDelivery?.pickup_location"
                type="button"
                class="text-primary-600 block text-sm font-semibold underline md:hidden"
              >
                Manage address
              </button>
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
          <div class="flex items-start gap-3 md:items-center md:gap-6">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 md:h-10 md:w-10"
            >
              <Icon name="truck-fast" size="20" class="text-gray-600" />
            </span>

            <div class="flex-1">
              <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                Allow Delivery?
                <button
                  v-if="computedLiveStatusDelivery?.delivery_enabled"
                  type="button"
                  class="text-primary-600 hidden text-sm underline md:block"
                  @click="openDelivery = true"
                >
                  Manage shipping
                </button>
              </h3>
              <p class="text-core-600 text-sm">Offer deliver to your customers.</p>
              <button
                v-if="computedLiveStatusDelivery?.delivery_enabled"
                type="button"
                class="text-primary-600 block text-sm font-semibold underline md:hidden"
                @click="openDelivery = true"
              >
                Manage shipping
              </button>
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
          <AppButton label="Save Changes" disabled />
        </div>
      </div>
    </section>

    <ConfigurePickupModal v-model="openPickup" />
    <ManageShipBubbleModal v-model="openDelivery" />
    <ConfigureDeliveryModal v-model="openNewDelivery" @refresh="refetchLiveStatus" />
  </div>
</template>
