<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import AppButton from "@components/AppButton.vue"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { useGetPopupEventById } from "../api"

const isLoading = ref(false)
const route = useRoute()

const { data: popupEvt } = useGetPopupEventById(route.params.id as string)

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
  }
})

const openRegisterPage = () => {
  // https://suite-staging-branch.vercel.app
  const baseUrl = window.location.origin.includes("localhost")
    ? "http://localhost:5173"
    : "https://suite-staging-branch.vercel.app"

  window.open(`${baseUrl}/dashboard/sales/upcoming-events/${popupEvt.value?.uid}`, "_blank")
}

const getFirst3Initials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 3)
    .toUpperCase()
}
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

        <div
          class="absolute top-0 bottom-0 flex w-full items-center justify-center text-7xl font-black tracking-wider text-white"
        >
          {{ getFirst3Initials(popupEvt?.name || "") }}
        </div>
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
          <AppButton label="Register For  Event" @click="openRegisterPage" />
        </div>
      </section>

      <div class="rounded-2xl bg-white py-6 shadow-xs">
        <div class="border-core-200 border-b px-6 pb-4">
          <h3 class="text-lg font-semibold">Popup Details</h3>
        </div>
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
    </section>
  </AppSection>
</template>
