<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Switch from "@components/form/Switch.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import DeliveryOptionsSkeleton from "../components/skeletons/DeliveryOptionsSkeleton.vue"
import { useAuthStore } from "@modules/auth/store"
import {
  useGetLiveStatus,
  useGetManualDeliveryOptions,
  useGetExpressDeliveryOptions,
} from "@modules/shared/api"
import { useGetStoreDetails, useUpdateStoreDetails } from "@modules/settings/api"
import ConfigureDeliveryModal from "@modules/shared/components/ConfigureDeliveryModal.vue"
import ConfigurePickupModal from "@modules/shared/components/ConfigurePickupModal.vue"
import ManageShipBubbleModal from "@modules/shared/components/ManageShipBubbleModal.vue"
import ManageManualDeliveryModal from "@modules/shared/components/ManageManualDeliveryModal.vue"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

import { computed, ref, watch } from "vue"

const form = ref({
  allow_pickup: false,
  delivery_enabled: false,
  manual_delivery_enabled: false,
  express_delivery_enabled: false,
})
const originalValues = ref({
  allow_pickup: false,
  delivery_enabled: false,
  manual_delivery_enabled: false,
  express_delivery_enabled: false,
})

const openPickup = ref(false)
const openDelivery = ref(false)
const openNewDelivery = ref(false)
const openManualDelivery = ref(false)
const manualDeliveryMode = ref<"manual" | "express">("manual")
const expressSetupMode = ref(false)
const manualSetupMode = ref(false)
const automaticSetupMode = ref(false)

// Track which delivery type is currently being displayed (automatic or manual)
const currentDeliveryView = ref<"automatic" | "manual">("automatic")

const storeSlug = computed(() => useAuthStore().user?.store_slug || "")
const storeUid = computed(() => useAuthStore().user?.store_uid || "")

const {
  data: liveStatus,
  refetch: refetchLiveStatus,
  isPending: isLoadingLiveStatus,
} = useGetLiveStatus(storeSlug.value)
const {
  data: storeDetails,
  refetch: refetchStoreDetails,
  isPending: isLoadingStore,
} = useGetStoreDetails(storeUid.value)
const { mutate: updateStore, isPending: isUpdating } = useUpdateStoreDetails()
const { data: manualDeliveryOptions, refetch: refetchManualOptions } = useGetManualDeliveryOptions()
const { data: expressDeliveryOptions, refetch: refetchExpressOptions } =
  useGetExpressDeliveryOptions()

const isLoading = computed(() => isLoadingLiveStatus.value || isLoadingStore.value)

const computedLiveStatusDelivery = computed(
  () => liveStatus.value?.data?.criteria?.delivery_options?.details || null,
)

// Check if user has a shipping account set up
const hasShippingAccount = computed(() => computedLiveStatusDelivery.value?.shipping_account)

// Check if user has manual delivery options set up
const hasManualDeliveries = computed(() => (manualDeliveryOptions.value?.length ?? 0) > 0)

// Check if user has express delivery options set up
const hasExpressDeliveries = computed(() => (expressDeliveryOptions.value?.length ?? 0) > 0)

// Scenario: No shipping account AND no manual deliveries - show setup prompt
const showSetupDeliveryPrompt = computed(
  () => !hasShippingAccount.value && !hasManualDeliveries.value,
)

// Scenario: Has shipping account - show automatic/manual toggle and express section
const showDeliveryOptions = computed(() => hasShippingAccount.value)

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

      // Automatic delivery enabled
      form.value.delivery_enabled = newVal.delivery_enabled || false
      originalValues.value.delivery_enabled = newVal.delivery_enabled || false

      // Manual delivery enabled
      form.value.manual_delivery_enabled = newVal.manual_delivery_enabled || false
      originalValues.value.manual_delivery_enabled = newVal.manual_delivery_enabled || false

      // Express delivery enabled
      form.value.express_delivery_enabled = newVal.express_delivery_enabled || false
      originalValues.value.express_delivery_enabled = newVal.express_delivery_enabled || false

      // Set initial view based on which is enabled (prefer manual if enabled)
      if (newVal.manual_delivery_enabled) {
        currentDeliveryView.value = "manual"
      } else {
        currentDeliveryView.value = "automatic"
      }
    }
  },
  { immediate: true },
)

// Check if form has changes
const hasChanges = computed(() => {
  return (
    form.value.allow_pickup !== originalValues.value.allow_pickup ||
    form.value.delivery_enabled !== originalValues.value.delivery_enabled ||
    form.value.manual_delivery_enabled !== originalValues.value.manual_delivery_enabled ||
    form.value.express_delivery_enabled !== originalValues.value.express_delivery_enabled
  )
})

// Handle automatic delivery toggle - turn off manual if automatic is turned on
// Also works like express: if not enabled, opens modal for setup
const handleAutomaticToggle = (value: boolean) => {
  if (value && !form.value.delivery_enabled && !originalValues.value.delivery_enabled) {
    // Automatic delivery not set up, open modal for setup
    automaticSetupMode.value = true
    form.value.delivery_enabled = true
    form.value.manual_delivery_enabled = false
    openDelivery.value = true
  } else {
    // Has automatic delivery or turning off, just toggle normally
    form.value.delivery_enabled = value
    if (value && form.value.manual_delivery_enabled) {
      form.value.manual_delivery_enabled = false
    }
  }
}

// Handle manual delivery toggle - turn off automatic if manual is turned on
// Also works like express: if not set up, opens modal for setup
const handleManualToggle = (value: boolean) => {
  if (value && !hasManualDeliveries.value) {
    // No manual deliveries, open modal for setup
    manualSetupMode.value = true
    form.value.manual_delivery_enabled = true
    form.value.delivery_enabled = false
    openManualDeliveryModal("manual")
  } else {
    // Has manual deliveries or turning off, just toggle normally
    form.value.manual_delivery_enabled = value
    if (value && form.value.delivery_enabled) {
      form.value.delivery_enabled = false
    }
  }
}

// Handle switching between automatic and manual delivery views
const handleSwitchDeliveryType = () => {
  if (currentDeliveryView.value === "automatic") {
    // Switching to manual view
    currentDeliveryView.value = "manual"
    // If manual has options, enable it and disable automatic
    if (hasManualDeliveries.value) {
      form.value.manual_delivery_enabled = true
      form.value.delivery_enabled = false
    } else {
      // No manual deliveries set up, switch is off by default
      form.value.manual_delivery_enabled = false
      form.value.delivery_enabled = false
    }
  } else {
    // Switching to automatic view
    currentDeliveryView.value = "automatic"
    // If automatic was previously enabled, just enable it
    if (originalValues.value.delivery_enabled) {
      form.value.delivery_enabled = true
      form.value.manual_delivery_enabled = false
    } else {
      // Automatic not set up, switch is off by default
      form.value.delivery_enabled = false
      form.value.manual_delivery_enabled = false
    }
  }
}

// Handle express delivery toggle - open modal if no express deliveries exist
const handleExpressToggle = (value: boolean) => {
  if (value && !hasExpressDeliveries.value) {
    // No express deliveries, open modal for setup
    expressSetupMode.value = true
    form.value.express_delivery_enabled = true
    openManualDeliveryModal("express")
  } else {
    // Has express deliveries or turning off, just toggle normally
    form.value.express_delivery_enabled = value
  }
}

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

  if (form.value.delivery_enabled !== originalValues.value.delivery_enabled) {
    payload.delivery_enabled = form.value.delivery_enabled
  }

  if (form.value.manual_delivery_enabled !== originalValues.value.manual_delivery_enabled) {
    payload.manual_delivery_enabled = form.value.manual_delivery_enabled
  }

  if (form.value.express_delivery_enabled !== originalValues.value.express_delivery_enabled) {
    payload.express_delivery_enabled = form.value.express_delivery_enabled
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

// Open manual delivery modal with mode
const openManualDeliveryModal = (mode: "manual" | "express") => {
  manualDeliveryMode.value = mode
  openManualDelivery.value = true
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
  async ([newOpenDelivery, newOpenNewDelivery], [oldOpenDelivery, oldOpenNewDelivery]) => {
    // Check if either modal was just closed (changed from true to false)
    const deliveryModalClosed = oldOpenDelivery === true && newOpenDelivery === false
    const newDeliveryModalClosed = oldOpenNewDelivery === true && newOpenNewDelivery === false

    if (deliveryModalClosed || newDeliveryModalClosed) {
      // Refetch both store details and live status
      await refetchStoreDetails()
      refetchLiveStatus()

      // If we were in automatic setup mode, check if delivery was actually enabled
      if (automaticSetupMode.value) {
        // Check if still not enabled after refetch
        if (!storeDetails.value?.delivery_enabled) {
          form.value.delivery_enabled = false
        }
        automaticSetupMode.value = false
      }
    }
  },
)

// Watch manual/express delivery modal to refetch data when it closes
watch(openManualDelivery, async (newOpen, oldOpen) => {
  if (oldOpen === true && newOpen === false) {
    // Refetch data first
    await refetchExpressOptions()
    await refetchManualOptions()
    refetchStoreDetails()
    refetchLiveStatus()

    // If we were in express setup mode and no express deliveries were added, turn off the switch
    if (expressSetupMode.value) {
      // Check if still no express deliveries after refetch
      if ((expressDeliveryOptions.value?.length ?? 0) === 0) {
        form.value.express_delivery_enabled = false
      }
      expressSetupMode.value = false
    }

    // If we were in manual setup mode and no manual deliveries were added, turn off the switch
    if (manualSetupMode.value) {
      // Check if still no manual deliveries after refetch
      if ((manualDeliveryOptions.value?.length ?? 0) === 0) {
        form.value.manual_delivery_enabled = false
      }
      manualSetupMode.value = false
    }
  }
})

// Refresh handler for modals
const handleRefresh = () => {
  refetchStoreDetails()
  refetchLiveStatus()
  refetchManualOptions()
  refetchExpressOptions()
}
</script>

<template>
  <DeliveryOptionsSkeleton v-if="isLoading" />
  <div v-else>
    <section>
      <SectionHeader
        title="Delivery Options"
        size="sm"
        subtitle="Manage how your orders are fulfilled—pickup, delivery, or a mix of both."
      />

      <div class="border-core-100 mt-6 rounded-2xl border bg-white">
        <div class="grid gap-10 p-4 md:p-6">
          <!-- Pickup Section -->
          <div>
            <!-- <h3 class="mb-3 text-xl font-semibold">Pickup</h3> -->
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
                    @click="openPickup = true"
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
                  @click="openPickup = true"
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
          </div>

          <!-- Standard Delivery Section -->
          <div>
            <h3 class="text-md !font-outfit mb-3 font-semibold">Standard Delivery</h3>

            <!-- Case 1: No shipping account AND no manual deliveries - Show setup prompt -->
            <div
              v-if="showSetupDeliveryPrompt"
              class="flex items-start gap-3 md:items-center md:gap-6"
            >
              <span
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 md:h-10 md:w-10"
              >
                <Icon name="truck-fast" size="20" class="text-gray-600" />
              </span>

              <div class="flex-1">
                <h3 class="mb-1 text-base font-semibold">Setup Standard Delivery</h3>
                <p class="text-core-600 text-sm">
                  Configure how you want to deliver orders to your customers.
                </p>
              </div>
              <Switch
                :model-value="false"
                @update:model-value="
                  ($event) => {
                    if ($event) openNewDelivery = true
                  }
                "
              />
            </div>

            <!-- Case 2: Has shipping account - Show automatic OR manual toggle (one at a time) -->
            <template v-if="showDeliveryOptions">
              <!-- Automatic Delivery View -->
              <template v-if="currentDeliveryView === 'automatic'">
                <div class="flex items-start gap-3 md:items-center md:gap-6">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 md:h-10 md:w-10"
                  >
                    <Icon name="truck-fast" size="20" class="text-gray-600" />
                  </span>

                  <div class="flex-1">
                    <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                      Allow Automatic Delivery?
                      <button
                        v-if="form.delivery_enabled"
                        type="button"
                        class="text-primary-600 hidden text-sm underline md:block"
                        @click="openDelivery = true"
                      >
                        Manage shipping
                      </button>
                    </h3>
                    <p class="text-core-600 text-sm">
                      Let ShipBubble handle the delivery logistics for you.
                    </p>
                    <button
                      v-if="form.delivery_enabled"
                      type="button"
                      class="text-primary-600 block text-sm font-semibold underline md:hidden"
                      @click="openDelivery = true"
                    >
                      Manage shipping
                    </button>
                  </div>
                  <Switch
                    :model-value="form.delivery_enabled"
                    @update:model-value="handleAutomaticToggle"
                  />
                </div>

                <!-- Switch to Manual Delivery Banner -->
                <div
                  class="border-primary-600 bg-primary-25 text-warning-700 mt-6 flex cursor-pointer flex-col items-center justify-between gap-3 rounded-lg border px-4 py-6 md:flex-row"
                  @click="handleSwitchDeliveryType"
                >
                  <div class="flex gap-3">
                    <div
                      class="bg-primary-100 hidden size-9 items-center justify-center rounded-full md:flex"
                    >
                      <div
                        class="bg-primary-200 flex size-7 items-center justify-center rounded-full"
                      >
                        <Icon name="layers-two-01" size="16" class="text-primary-600" />
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <h6 class="text-md font-semibold">Switch to Manual Delivery Service</h6>
                      <p class="text-sm">
                        Manage the delivery of orders to your customers all by yourself.
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <Icon name="arrow-right" size="16" class="text-primary-600" />
                  </div>
                </div>
              </template>

              <!-- Manual Delivery View -->
              <template v-else>
                <div class="flex items-start gap-3 md:items-center md:gap-6">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 md:h-10 md:w-10"
                  >
                    <Icon name="truck-fast" size="20" class="text-gray-600" />
                  </span>

                  <div class="flex-1">
                    <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                      Allow Manual Delivery?
                      <button
                        v-if="hasManualDeliveries"
                        type="button"
                        class="text-primary-600 hidden text-sm underline md:block"
                        @click="openManualDeliveryModal('manual')"
                      >
                        Manage locations
                      </button>
                    </h3>
                    <p class="text-core-600 text-sm">
                      Manage the delivery of orders to your customers all by yourself.
                    </p>
                    <button
                      v-if="hasManualDeliveries"
                      type="button"
                      class="text-primary-600 block text-sm font-semibold underline md:hidden"
                      @click="openManualDeliveryModal('manual')"
                    >
                      Manage locations
                    </button>
                  </div>
                  <Switch
                    :model-value="form.manual_delivery_enabled"
                    @update:model-value="handleManualToggle"
                  />
                </div>

                <!-- Switch to Automatic Delivery Banner -->
                <div
                  class="border-primary-600 bg-primary-25 text-warning-700 mt-6 flex cursor-pointer flex-col items-center justify-between gap-3 rounded-lg border px-4 py-6 md:flex-row"
                  @click="handleSwitchDeliveryType"
                >
                  <div class="flex gap-3">
                    <div
                      class="bg-primary-100 hidden size-9 items-center justify-center rounded-full md:flex"
                    >
                      <div
                        class="bg-primary-200 flex size-7 items-center justify-center rounded-full"
                      >
                        <Icon name="layers-two-01" size="16" class="text-primary-600" />
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <h6 class="text-md font-semibold">Switch to Automatic Delivery Service</h6>
                      <p class="text-sm">Let ShipBubble handle the delivery logistics for you.</p>
                    </div>
                  </div>

                  <div class="flex items-center">
                    <Icon name="arrow-right" size="16" class="text-primary-600" />
                  </div>
                </div>
              </template>
            </template>
          </div>

          <!-- Express Delivery Section -->
          <div>
            <!-- <h3 class="mb-3 text-xl font-semibold">Express Delivery</h3> -->

            <!-- Show only if has shipping account -->
            <template v-if="showDeliveryOptions">
              <div class="flex items-start gap-3 md:items-center md:gap-6">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-200 md:h-10 md:w-10"
                >
                  <Icon name="truck-fast" size="20" class="text-gray-600" />
                </span>

                <div class="flex-1">
                  <h3 class="mb-1 flex items-end gap-2 text-base font-semibold">
                    Allow Express Delivery?
                    <button
                      v-if="form.express_delivery_enabled || hasExpressDeliveries"
                      type="button"
                      class="text-primary-600 hidden text-sm underline md:block"
                      @click="openManualDeliveryModal('express')"
                    >
                      Manage locations
                    </button>
                  </h3>
                  <p class="text-core-600 text-sm">
                    Offer faster delivery options for customers who need their orders urgently.
                  </p>
                </div>
                <Switch
                  :model-value="form.express_delivery_enabled"
                  @update:model-value="handleExpressToggle"
                />
              </div>
            </template>

            <!-- Show setup prompt if no shipping account -->
            <template v-else>
              <div
                class="flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-100 p-4 md:p-8"
              >
                <Icon name="truck-fast" size="20" class="text-gray-900" />
                <p class="text-sm text-gray-900">
                  Setup Standard Delivery to enable Express Delivery
                </p>
              </div>
            </template>
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
    <ConfigureDeliveryModal v-model="openNewDelivery" @refresh="handleRefresh" />
    <ManageManualDeliveryModal
      v-model="openManualDelivery"
      :mode="manualDeliveryMode"
      @refresh="handleRefresh"
    />
  </div>
</template>
