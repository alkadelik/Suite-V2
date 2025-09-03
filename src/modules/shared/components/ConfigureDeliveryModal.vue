<template>
  <div>
    <Modal
      :open="modelValue"
      title="Set Up Delivery"
      max-width="xl"
      @close="emit('update:modelValue', false)"
      variant="bottom-nav"
      :handle-padding="false"
    >
      <LoadingIcon v-if="isGettingShippingProfile" icon-class="text-black h-6 w-6" />
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
          <div class="border-primary-600 cursor-pointer rounded-2xl border-2">
            <header
              class="border-primary-600 bg-primary-50 flex items-center justify-between rounded-t-2xl border-b-2 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <div class="bg-primary-100 rounded-full p-1.5">
                  <div class="bg-primary-200 rounded-full p-2">
                    <Icon name="layers-two-01" size="16" class="text-primary-600" />
                  </div>
                </div>

                <h4 class="text-primary-800 text-lg font-medium md:text-xl">ShipBubble</h4>
              </div>

              <Icon name="check-filled" size="24" class="text-primary-600" />
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

          <!-- leyyow logistics -->
          <div class="cursor-no-allowed rounded-2xl border-2 border-gray-200">
            <header
              class="flex items-center justify-between rounded-t-2xl border-b-2 border-gray-200 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <div class="bg-primary-100 rounded-full p-1.5">
                  <div class="bg-primary-200 rounded-full p-2">
                    <Icon name="layers-three-01" size="16" class="text-primary-600" />
                  </div>
                </div>

                <h4 class="text-primary-800 text-lg font-medium md:text-xl">Leyyow Logistics</h4>
              </div>

              <Chip showDot label="Coming Soon" />
            </header>
            <div class="p-4">
              <p class="mb-2 text-xs md:text-sm">
                Deliver with Leyyow’s own logistics service. Simpler setup, competitive rates, and
                full integration.
              </p>
              <Chip showDot label="Provided by" color="warning">
                <template #append>
                  <img src="/images/logos/leyyow-logo-2.svg" class="h-3" alt="leyyow logo" />
                </template>
              </Chip>
            </div>
          </div>
          <div class="flex justify-end">
            <AppButton
              type="submit"
              label="Continue"
              @click="showShipbubbleScreens = true"
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
      @close="showShipbubbleScreens = false"
    />
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
import { useAuthStore } from "@modules/auth/store"
import { useRoute, useRouter } from "vue-router"
import {
  useGetShippingProfile,
  useUpdateShippingProfile,
  useSetupShippingProfile,
} from "@/modules/shared/api"
import LoadingIcon from "@components/LoadingIcon.vue"

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
const isShippingProfileActive = ref<boolean>(false)

const { data: shippingProfileData, isPending: isGettingShippingProfile } = useGetShippingProfile()
const { mutate: setupShippingProfile, isPending: isSettingUpShipping } = useSetupShippingProfile()
const { mutate: updateShippingProfile, isPending: isUpdatingShippingProfile } =
  useUpdateShippingProfile()

const shipbubbleAuthForm = reactive({
  business_name: user?.store?.store_name ? user.store.store_name : "",
  email: user?.email ? user.email : "",
  password: "",
  address: user?.store?.address ? user.store.address : "",
  phone: user?.store?.phone1 ? user.store.phone1 : "",
})
const courierOptions = ref(
  shippingProfileData.value?.preferred_couriers
    ? shippingProfileData.value.preferred_couriers.map((courier: { id: number }) => courier.id)
    : [],
)

const handleSetupShippingProfile = () => {
  const payload = {
    store_name: shipbubbleAuthForm.business_name,
    store_address: shipbubbleAuthForm.address,
    email: shipbubbleAuthForm.email,
    password: shipbubbleAuthForm.password,
    phone: shipbubbleAuthForm.phone,
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
      shipBubbleStep.value = 3
      setTimeout(() => {
        showShipbubbleScreens.value = false
      }, 3000)
    },
  })

  console.log(payload)
}

// --- Sync showShipbubbleScreens with route query ---
onMounted(() => {
  const shipbubbleParam = route.query.shipbubble
  showShipbubbleScreens.value = shipbubbleParam === "true"
})

watch(showShipbubbleScreens, (val) => {
  router.replace({
    query: {
      ...route.query,
      shipbubble: val ? "true" : undefined,
    },
  })
})

watch(
  () => route.query.shipbubble,
  (val) => {
    showShipbubbleScreens.value = val === "true"
  },
)
</script>
