<template>
  <div>
    <Modal
      :open="modelValue"
      title="Set Up Delivery"
      max-width="xl"
      @close="emit('update:modelValue', false)"
      :variant="isMobile ? 'fullscreen' : 'centered'"
      :handle-padding="false"
    >
      <ConfigureDeliverySkeleton v-if="isGettingShippingProfile || isGettingStoreDetails" />

      <div v-else class="space-y-4 px-4 py-4 md:space-y-8 md:px-6">
        <div class="space-y-4">
          <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-50 p-2">
            <Icon name="truck-fast" size="20" />
          </div>

          <p class="text-xs md:text-sm">
            Choose how you want to deliver orders from your Leyyow store.
          </p>
        </div>

        <div class="space-y-5 rounded-xl bg-white px-6 py-4">
          <!-- shipbubble -->
          <div
            class="cursor-pointer rounded-2xl border-2"
            :class="
              selectedDeliveryOption === 'shipbubble' ? 'border-primary-600' : 'border-gray-200'
            "
            @click="selectedDeliveryOption = 'shipbubble'"
          >
            <header
              class="flex items-center justify-between rounded-t-2xl border-b-2 px-4 py-3"
              :class="
                selectedDeliveryOption === 'shipbubble'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200'
              "
            >
              <div class="flex items-center gap-3">
                <div class="bg-primary-100 rounded-full p-1.5">
                  <div class="bg-primary-200 rounded-full p-2">
                    <Icon name="layers-two-01" size="16" class="text-primary-600" />
                  </div>
                </div>

                <h4 class="text-primary-800 text-lg font-medium md:text-xl">ShipBubble</h4>
              </div>

              <Icon
                v-if="selectedDeliveryOption === 'shipbubble'"
                name="check-filled"
                size="24"
                class="text-primary-600"
              />
            </header>
            <div class="p-4">
              <p class="mb-2 text-xs md:text-sm">
                Connect with trusted courier partners instantly. Get real-time rates and tracking.
              </p>
              <Chip showDot label="Provided by" color="blue">
                <template #append>
                  <img src="/images/shipbubble-logo.png" alt="shipbubble logo" />
                </template>
              </Chip>
            </div>
          </div>

          <!-- manual delivery -->
          <div
            class="cursor-pointer rounded-2xl border-2"
            :class="selectedDeliveryOption === 'manual' ? 'border-primary-600' : 'border-gray-200'"
            @click="selectedDeliveryOption = 'manual'"
          >
            <header
              class="flex items-center justify-between rounded-t-2xl border-b-2 px-4 py-3"
              :class="
                selectedDeliveryOption === 'manual'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200'
              "
            >
              <div class="flex items-center gap-3">
                <div class="bg-primary-100 rounded-full p-1.5">
                  <div class="bg-primary-200 rounded-full p-2">
                    <Icon name="layers-three-01" size="16" class="text-primary-600" />
                  </div>
                </div>

                <h4 class="text-primary-800 text-lg font-medium md:text-xl">Manual Delivery</h4>
              </div>

              <Icon
                v-if="selectedDeliveryOption === 'manual'"
                name="check-filled"
                size="24"
                class="text-primary-600"
              />
            </header>
            <div class="p-4">
              <p class="text-xs md:text-sm">
                Manage the delivery of orders to your customers all by yourself. Ensure to only add
                the areas your logistics covers.
              </p>
            </div>
          </div>

          <div class="flex justify-end">
            <AppButton
              type="submit"
              label="Continue"
              @click="handleContinue"
              class="w-full md:w-40"
            />
          </div>
        </div>

        <WarningBox header="Heads Up">
          <p class="text-xs md:text-sm">
            For now, Leyyow doesn’t handle deliveries directly. You’ll be redirected to ShipBubble
            to set up your shipping account and select couriers that work for your store.
          </p>
        </WarningBox>
      </div>
    </Modal>

    <!-- overlays -->
    <ShipbubbleAccountSetup
      v-if="showShipbubbleScreens"
      v-model:auth-form="shipbubbleAuthForm"
      v-model:courier-options="courierOptions"
      class="z-50"
      :current-step="shipBubbleStep"
      :loading="isSettingUpShipping || isUpdatingShippingProfile"
      @submit-auth-form="handleSetupShippingProfile"
      @submit-couriers="handleCouriersSubmit"
      @close="handleClose"
    />

    <ManageManualDeliveryModal v-model="showManualDeliveryModal" @refresh="emit('refresh')" />
  </div>
</template>

<script setup lang="ts">
import AppButton from "@/components/AppButton.vue"
import Modal from "@/components/Modal.vue"
import Icon from "@components/Icon.vue"
import WarningBox from "@components/WarningBox.vue"
import Chip from "@components/Chip.vue"
import { ref, reactive, onMounted, watch } from "vue"
import ShipbubbleAccountSetup from "./ShipbubbleAccountSetup.vue"
import ManageManualDeliveryModal from "./ManageManualDeliveryModal.vue"
import { useAuthStore } from "@modules/auth/store"
import { useRoute, useRouter } from "vue-router"
import {
  useGetShippingProfile,
  useUpdateShippingProfile,
  useSetupShippingProfile,
} from "@/modules/shared/api"
import { useUpdateStoreDetails, useGetStoreDetails } from "@/modules/settings/api"
import type { ICourier } from "@/modules/shared/types"
import { useMediaQuery } from "@vueuse/core"
import ConfigureDeliverySkeleton from "./skeletons/ConfigureDeliverySkeleton.vue"

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const route = useRoute()
const router = useRouter()
const { user } = useAuthStore()
const shipBubbleStep = ref<number>(1)
const showShipbubbleScreens = ref<boolean>(false)
const showManualDeliveryModal = ref<boolean>(false)
const isShippingProfileActive = ref<boolean>(false)
const isMobile = useMediaQuery("(max-width: 768px)")
const selectedDeliveryOption = ref<"shipbubble" | "manual">("shipbubble")

const { data: shippingProfileData, isPending: isGettingShippingProfile } = useGetShippingProfile()
const { data: storeDetails, isPending: isGettingStoreDetails } = useGetStoreDetails(
  user?.store_uid || "",
)
const { mutate: setupShippingProfile, isPending: isSettingUpShipping } = useSetupShippingProfile()
const { mutate: updateShippingProfile, isPending: isUpdatingShippingProfile } =
  useUpdateShippingProfile()
const { mutate: updateStoreDetails } = useUpdateStoreDetails()

const shipbubbleAuthForm = reactive({
  business_name: user?.store?.store_name || "",
  email: user?.email || "",
  password: "",
  address: user?.store?.address || "",
  phone: user?.store?.phone1 || user?.store?.phone || "",
})
const courierOptions = ref<string[]>([])

// Helper function to normalize phone number to +234 format
const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return ""

  // Remove all non-digit characters except leading +
  let cleanedPhone = phone.replace(/[^\d+]/g, "")

  // Remove + if present
  cleanedPhone = cleanedPhone.replace(/^\+/, "")

  // Remove leading 234 if present
  if (cleanedPhone.startsWith("234")) {
    cleanedPhone = cleanedPhone.substring(3)
  }

  // Remove leading 0 if present
  if (cleanedPhone.startsWith("0")) {
    cleanedPhone = cleanedPhone.substring(1)
  }

  // Add +234 prefix
  return `+234${cleanedPhone}`
}

const handleSetupShippingProfile = () => {
  const payload = {
    store_name: shipbubbleAuthForm.business_name,
    store_address: shipbubbleAuthForm.address,
    email: shipbubbleAuthForm.email,
    password: shipbubbleAuthForm.password,
    phone: normalizePhoneNumber(shipbubbleAuthForm.phone),
    preferred_couriers: [],
  }
  setupShippingProfile(payload, {
    onSuccess: () => {
      isShippingProfileActive.value = true
      shipBubbleStep.value = 2
    },
  })

  console.log(payload)
}

const handleCouriersSubmit = () => {
  const payload = {
    preferred_courier_ids: courierOptions.value,
  }
  updateShippingProfile(payload, {
    onSuccess: () => {
      // After successfully updating courier preferences, enable delivery
      updateStoreDetails(
        {
          id: user?.store_uid || "",
          body: { delivery_enabled: true },
        },
        {
          onSuccess: () => {
            shipBubbleStep.value = 3
            setTimeout(() => {
              showShipbubbleScreens.value = false
              emit("refresh")
            }, 3000)
          },
          onError: (error) => {
            console.error("Failed to enable delivery:", error)
            // Still proceed to step 3 even if enabling delivery fails
            shipBubbleStep.value = 3
            setTimeout(() => {
              showShipbubbleScreens.value = false
              emit("refresh")
            }, 3000)
          },
        },
      )
    },
  })

  console.log(payload)
}

const handleContinue = () => {
  if (selectedDeliveryOption.value === "manual") {
    // Show the manual delivery modal
    showManualDeliveryModal.value = true
    emit("update:modelValue", false)
    return
  }

  // ShipBubble flow
  // If user already has a shipping profile, skip step 1 and go directly to step 2
  if (shippingProfileData.value && shippingProfileData.value.uid) {
    shipBubbleStep.value = 2
  } else {
    shipBubbleStep.value = 1
  }
  showShipbubbleScreens.value = true
  emit("update:modelValue", false)
}

const handleClose = () => {
  showShipbubbleScreens.value = false
  // Get the redirect path from query parameter, or default to current path without query params
  const redirectPath = (route.query.redirect as string) || route.path.split("?")[0]
  router.push(redirectPath)
}

// --- Sync showShipbubbleScreens and step with route query ---
onMounted(() => {
  const shipbubbleParam = route.query.shipbubble
  const stepParam = route.query.step
  showShipbubbleScreens.value = shipbubbleParam === "true"
  if (stepParam && typeof stepParam === "string") {
    const parsedStep = parseInt(stepParam, 10)
    if (parsedStep >= 1 && parsedStep <= 3) {
      shipBubbleStep.value = parsedStep
    }
  }
})

watch(showShipbubbleScreens, (val) => {
  router.replace({
    query: {
      ...route.query,
      shipbubble: val ? "true" : undefined,
      step: val ? String(shipBubbleStep.value) : undefined,
    },
  })
})

watch(
  () => route.query.shipbubble,
  (val) => {
    showShipbubbleScreens.value = val === "true"
  },
)

// Sync step with query parameter
watch(shipBubbleStep, (step) => {
  if (showShipbubbleScreens.value) {
    router.replace({
      query: {
        ...route.query,
        step: String(step),
      },
    })
  }
})

watch(
  () => route.query.step,
  (val) => {
    if (val && typeof val === "string" && showShipbubbleScreens.value) {
      const parsedStep = parseInt(val, 10)
      if (parsedStep >= 1 && parsedStep <= 3) {
        shipBubbleStep.value = parsedStep
      }
    }
  },
)

// Update courier options when shipping profile data loads
watch(
  () => shippingProfileData.value,
  (data) => {
    if (data?.preferred_couriers) {
      courierOptions.value = data.preferred_couriers.map((courier: ICourier) => courier.uid)
    }
  },
  { immediate: true },
)

// Update form when store details are fetched
watch(
  () => storeDetails.value,
  (details) => {
    if (details) {
      shipbubbleAuthForm.business_name = details.name || ""
      shipbubbleAuthForm.email = details.store_email || user?.email || ""
      shipbubbleAuthForm.phone = details.store_phone || ""
      // Address comes from the first location if available
      if (details.locations && details.locations.length > 0 && details.locations[0]?.address) {
        shipbubbleAuthForm.address = details.locations[0].address
      }
    }
  },
  { immediate: true },
)

// Update form when shipping profile data is available (for existing profiles)
watch(
  () => shippingProfileData.value,
  (profileData) => {
    if (profileData) {
      // Prefill from existing shipping profile if available
      shipbubbleAuthForm.business_name = profileData.store_name || shipbubbleAuthForm.business_name
      shipbubbleAuthForm.email = profileData.email || shipbubbleAuthForm.email
      shipbubbleAuthForm.address = profileData.store_address || shipbubbleAuthForm.address
    }
  },
  { immediate: true },
)

// Update form when user data becomes available (fallback)
watch(
  () => user,
  (userData) => {
    if (userData && !storeDetails.value) {
      // Only use user data as fallback if store details haven't loaded yet
      shipbubbleAuthForm.business_name =
        userData.store?.store_name || shipbubbleAuthForm.business_name
      shipbubbleAuthForm.email = userData.email || shipbubbleAuthForm.email
      shipbubbleAuthForm.address = userData.store?.address || shipbubbleAuthForm.address
      shipbubbleAuthForm.phone =
        userData.store?.phone1 || userData.store?.phone || shipbubbleAuthForm.phone
    }
  },
  { immediate: true, deep: true },
)
</script>
