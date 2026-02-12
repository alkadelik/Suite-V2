<script setup lang="ts">
import BackButton from "@components/BackButton.vue"
import EmptyState from "@components/EmptyState.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useGetEventfulPopups } from "@modules/popups/api"
import OrganizerPopupCard from "@modules/popups/components/OrganizerPopupCard.vue"
import { computed } from "vue"

const params = computed(() => ({ status: "upcoming", limit: 20 }))
const { data: eventfulPopups, isPending } = useGetEventfulPopups(params)
</script>

<template>
  <div class="flex flex-col p-4 md:p-8">
    <BackButton to="/popups" label="Back to Popups" />
    <SectionHeader
      title="Upcoming Events"
      subtitle="View and register for upcoming events from Eventful."
      class="mt-2 mb-8"
    />

    <EmptyState
      v-if="!eventfulPopups?.results?.length"
      title="No Events Available"
      description="There are currently no upcoming events available. Please check back later."
      :loading="isPending"
    />

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <OrganizerPopupCard
        v-for="event in eventfulPopups?.results"
        :key="event.uid"
        :event="event"
      />
    </div>
  </div>
</template>
