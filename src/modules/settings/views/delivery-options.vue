<script setup lang="ts">
import AppButton from "@components/AppButton.vue"

import Switch from "@components/form/Switch.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useAuthStore } from "@modules/auth/store"
import { useGetLiveStatus } from "@modules/shared/api"
import ConfigurePickupModal from "@modules/shared/components/ConfigurePickupModal.vue"
import ManageShipBubbleModal from "@modules/shared/components/ManageShipBubbleModal.vue"

import { computed, ref, watch } from "vue"
const form = ref({ allow_pickup: false, allow_delivery: false })

const openPickup = ref(false)
const openDelivery = ref(false)
const storeSlug = computed(() => useAuthStore().user?.store_slug || "")

const { data: liveStatus } = useGetLiveStatus(storeSlug.value)
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
                  v-if="!computedLiveStatusDelivery?.delivery_enabled"
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
                  form.allow_delivery = $event
                  if ($event) openDelivery = true
                }
              "
            />
          </div>
        </div>

        <div class="border-core-100 flex justify-end gap-6 border-t px-6 py-4">
          <AppButton label="Save Changes" />
        </div>
      </div>
    </section>

    <ConfigurePickupModal v-model="openPickup" />
    <ManageShipBubbleModal v-model="openDelivery" />
  </div>
</template>
