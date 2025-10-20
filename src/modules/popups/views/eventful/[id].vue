<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import { useGetEventfulPopupById } from "@modules/popups/api"
import RegisterForEventfulModal from "@modules/popups/components/RegisterForEventfulModal.vue"
import { EventfulPopup } from "@modules/popups/types"
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"

const SAMPLE_EVENTFUL: EventfulPopup = {
  uid: "b209b951-ddbb-40bb-873e-8e361484335b",
  name: "Tech Innovators Popup 2025",
  description: "A showcase of the latest innovations in consumer tech and design.",
  event_instructions: "Bring your company ID for entry. Setup begins at 8:00 AM.",
  terms_and_conditions: "All participants must adhere to venue regulations.",
  event_address: "Innovation Hub, Victoria Island, Lagos",
  start_date: "2025-10-15",
  end_date: "2025-10-18",
  is_active: true,
  is_live: false,
  status: "upcoming",
  banner_image: "https://example.com/images/event-banner.jpg",
  qr_code: null,
  event_ref: "EVT2025-TECHPOPUP",
  slug: "tech-innovators-popup-2025",
  location: "0d62e1bd-f628-426e-92b8-b87562ba99dd",
  location_name: "Innovation Hub",
  company: "a1ddcf94-8b6a-49ad-a4b0-94aef6203684",
  company_name: "FutureWorks Ltd.",
  company_email: "info@futureworks.com",
  participant_fee: 2500,
}

const isLoading = ref(false)
const route = useRoute()

const openRegister = ref(false)
const { data: eventful } = useGetEventfulPopupById(route.params.id as string)

const popupEvt = computed(() => eventful.value || SAMPLE_EVENTFUL)

onMounted(() => {
  console.log("data", popupEvt.value)
})

const getEventStatus = (event: { start_date?: string; end_date?: string } | null) => {
  if (!event?.start_date || !event?.end_date) return "ended"
  const now = new Date()
  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  if (now < startDate) return "upcoming"
  if (now >= startDate && now <= endDate) return "ongoing"
  return "ended"
}

const openShare = ref(false)

const overviewInfo = computed(() => {
  return {
    "Participation Fee": popupEvt.value?.participant_fee
      ? formatCurrency(popupEvt.value?.participant_fee)
      : "Free",
    Description: popupEvt.value?.description || "N/A",
    eventInstructions: popupEvt.value?.event_instructions || "N/A",
    "Terms & Conditions": popupEvt.value?.terms_and_conditions || "N/A",
  }
})
</script>

<template>
  <EmptyState
    v-if="isLoading || !popupEvt"
    title="Event Details"
    description="Details for this event is currently not available."
    :loading="isLoading"
  />

  <AppSection v-else class="flex min-h-[80vh] flex-col px-8 py-4 md:py-8">
    <BackButton label="Go Back" class="mb-6" />

    <section class="space-y-6">
      <div class="relative z-[1] rounded-xl">
        <img
          src="@/assets/images/eventful-noise-grid.svg?url"
          :alt="popupEvt?.name"
          class="h-40 w-full rounded-xl bg-amber-600 object-cover"
        />
      </div>

      <section class="flex flex-col gap-6 md:flex-row">
        <div class="flex-1">
          <div class="mb-3 flex items-center gap-2">
            <h3 class="truncate text-xl font-semibold capitalize">{{ popupEvt?.name }}</h3>
            <Chip
              :label="getEventStatus(popupEvt)"
              size="sm"
              class="capitalize"
              :color="
                getEventStatus(popupEvt) === 'upcoming'
                  ? 'primary'
                  : getEventStatus(popupEvt) === 'ongoing'
                    ? 'success'
                    : 'alt'
              "
            />
          </div>
          <div class="space-y-3">
            <p class="flex items-center gap-2 text-sm">
              <Icon name="calendar" size="20" />
              {{ formatDate(popupEvt?.start_date || "") }} -
              {{ formatDate(popupEvt?.end_date || "") }}
            </p>
            <p class="flex items-center gap-2 text-sm capitalize">
              <Icon name="location" size="20" />
              {{ popupEvt?.event_address || "N/A" }}
            </p>

            <div class="flex items-center gap-2">
              <Icon name="dollar-circle" size="20" />
              <p class="mr-2 text-sm">
                {{ popupEvt?.participant_fee ? formatCurrency(popupEvt?.participant_fee) : "Free" }}
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <AppButton color="alt" label="Share Event" @click="openShare = true" />
          <AppButton label="Register For  Event" @click="openRegister = true" />
        </div>
      </section>

      <div class="rounded-2xl bg-white py-6 shadow-xs">
        <div class="divide-core-100 divide-y px-6">
          <div
            v-for="(value, key) in overviewInfo"
            :key="key"
            class="flex flex-col gap-1 py-3 text-sm"
          >
            <p class="text-core-600 flex-1 font-semibold">{{ startCase(key) }}</p>
            <p class="flex-2 font-medium">{{ value }}</p>
          </div>
        </div>
      </div>

      <section>
        <h3 class="mb-2 text-lg font-medium">Organized by</h3>

        <div
          class="bg-core-25 border-core-300 item-start flex cursor-pointer gap-4 rounded-2xl border px-4 py-4"
        >
          <div class="flex-shrink-0">
            <img
              src="@/assets/images/eventful-noise-grid.svg?url"
              alt="Organizer"
              class="h-12 w-12 rounded-xl object-cover"
            />
          </div>
          <div class="flex-1">
            <p class="font-semibold">{{ popupEvt?.company_name || "N/A" }}</p>
            <p class="text-core-600 text-sm">{{ popupEvt?.company_email || "N/A" }}</p>
          </div>
        </div>
      </section>
    </section>

    <!--  -->
    <RegisterForEventfulModal :open="openRegister" @close="openRegister = false" />
  </AppSection>
</template>
