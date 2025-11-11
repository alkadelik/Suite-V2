<template>
  <div class="h-full w-full py-5 md:flex md:justify-center">
    <LoadingIcon v-if="isLoading" class="mx-auto my-20" />
    <div v-else class="text-center md:w-3xl">
      <div class="mb-4 flex flex-col gap-2 p-3">
        <h1 class="text-2xl font-bold md:text-3xl">Welcome to Leyyow 🎉</h1>
        <p class="text-xs md:text-sm">
          The steps below will help you set up your store and start selling.
        </p>
      </div>

      <div class="w-full bg-white md:rounded-2xl md:shadow-[0px_16px_32px_-12px_#585C5F1A]">
        <header
          class="bg-base-background flex items-center justify-between border-b border-gray-100 p-5 md:bg-transparent md:p-6"
        >
          <h2 class="flex items-center text-lg font-semibold md:text-xl">
            <span>Tasks</span>
            <span class="text-core-600 ms-1 text-xs font-normal md:text-sm"
              >({{ completionPercentage }}% completed)</span
            >
          </h2>

          <Chip color="alt" size="md" label="Storefront" class="!pr-1">
            <template #append>
              <Chip
                showDot
                :label="isLive ? 'Live' : 'Not live'"
                :color="isLive ? 'success' : 'error'"
              />
            </template>
          </Chip>
        </header>

        <div class="px-3 pb-4 md:px-6">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="my-3 flex items-center gap-3 py-3"
            :class="{
              'border-t border-dashed border-gray-300': task.id === 3, // 3rd item
              'border-b border-dashed border-gray-300': task.id === 4, // 4th item
            }"
          >
            <div class="rounded-xl bg-gray-200 p-2" :class="{ 'opacity-30': task.completed }">
              <Icon :name="task.icon" size="20" />
            </div>

            <div class="flex-1 text-left" :class="{ 'opacity-30': task.completed }">
              <h6 class="text-ms md:text-md mb-1 font-semibold md:mb-2">{{ task.title }}</h6>
              <p class="text-xs text-gray-500 md:text-sm">{{ task.subtext }}</p>
            </div>

            <div v-if="!task.completed">
              <AppButton
                v-if="task.isButton"
                :label="task.buttonLabel"
                @click="task.action"
                class="!hidden w-40 md:!inline-flex"
              />
              <Icon
                v-if="task.isButton"
                name="arrow-right"
                @click="task.action"
                class="text-primary-500 inline-flex cursor-pointer md:hidden"
              />
              <Switch v-else @click="task.action" />
            </div>
            <Icon v-else name="tick-circle" class="!size-7 text-green-500 md:!size-10" />
          </div>
        </div>
      </div>
    </div>

    <!-- modals -->
    <BankAccountModal v-model="showBankAccountModal" @refresh="refetchLiveStatus" />
    <SetPickupModal v-model="showPickupModal" @refresh="refetchLiveStatus" />
    <VerifyIdentityModal v-model="showVerifyIdentityModal" @refresh="refetchLiveStatus" />
    <ConfigureDeliveryModal v-model="showConfigureDeliveryModal" @refresh="refetchLiveStatus" />
  </div>
</template>

<script setup>
import Chip from "@/components/Chip.vue"
import AppButton from "@components/AppButton.vue"
import Switch from "@components/form/Switch.vue"
import Icon from "@components/Icon.vue"
import LoadingIcon from "@components/LoadingIcon.vue"
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import BankAccountModal from "../components/BankAccountModal.vue"
import SetPickupModal from "../components/ConfigurePickupModal.vue"
import VerifyIdentityModal from "../components/VerifyIdentityModal.vue"
import ConfigureDeliveryModal from "../components/ConfigureDeliveryModal.vue"
import { useGetLiveStatus } from "../api"
import { useAuthStore } from "@modules/auth/store"

const router = useRouter()

const authStore = useAuthStore()
const storeSlug = authStore.user?.store_slug || ""

const {
  data: liveStatusData,
  isPending: isLoading,
  refetch: refetchLiveStatus,
} = useGetLiveStatus(storeSlug)

const isLive = computed(() => liveStatusData.value?.data?.is_live || false)
const completionPercentage = computed(() => liveStatusData.value?.data?.completion_percentage || 0)

const showBankAccountModal = ref(false)
const showPickupModal = ref(false)
const showVerifyIdentityModal = ref(false)
const showConfigureDeliveryModal = ref(false)

const tasks = computed(() => {
  const criteria = liveStatusData.value?.data?.criteria

  return [
    {
      id: 1,
      title: "Add Bank Details",
      completed: criteria?.bank_account?.status || false,
      subtext: "Add your account to receive payments from your sales.",
      isButton: true,
      buttonLabel: "Add Bank",
      action: () => {
        showBankAccountModal.value = true
      },
      icon: "bank",
    },
    {
      id: 2,
      title: "Verify Your Identity",
      completed: criteria?.kyc_verification?.status || false,
      subtext: "Secure your account by confirming your identity.",
      isButton: true,
      buttonLabel: "Verify Identity",
      action: () => {
        showVerifyIdentityModal.value = true
      },
      icon: "personalcard",
    },
    {
      id: 5,
      title: "Add a product",
      completed: criteria?.products?.status || false,
      subtext: "Upload a product and get ready for your first sale.",
      isButton: true,
      buttonLabel: "Add Product",
      action: () => {
        router.push({ name: "Inventory", query: { create: "true" } })
      },
      icon: "box",
    },
    {
      id: 3,
      title: "Allow Pickup?",
      completed: criteria?.delivery_options?.details?.pickup_location || false,
      subtext: "Let customers pick up their orders directly from you.",
      isButton: false,
      buttonLabel: "",
      modelValue: showPickupModal,
      action: () => {
        showPickupModal.value = true
      },
      icon: "shop",
    },
    {
      id: 4,
      title: "Allow Delivery?",
      completed: criteria?.delivery_options?.details?.delivery_enabled || false,
      subtext: "Offer delivery to your customers.",
      isButton: false,
      buttonLabel: "",
      modelValue: showConfigureDeliveryModal,
      action: () => {
        showConfigureDeliveryModal.value = true
      },
      icon: "truck-fast",
    },
    {
      id: 6,
      title: "Add a customer",
      completed: false,
      subtext: "Save your first customer to start building your list.",
      isButton: true,
      buttonLabel: "Add Customer",
      action: () => {
        // Handle button click
      },
      icon: "box",
    },
    {
      id: 7,
      title: "Record your first order",
      completed: false,
      subtext: "Track your first order and manage your sales easily.",
      isButton: true,
      buttonLabel: "Record Order",
      action: () => {
        // Handle button click
      },
      icon: "box",
    },
    {
      id: 8,
      title: "Take a tour",
      completed: false,
      subtext: "See how Leyyow helps you run every part of your business.",
      isButton: true,
      buttonLabel: "Start Tour",
      action: () => {
        // Handle button click
      },
      icon: "routing",
    },
  ]
})
</script>
