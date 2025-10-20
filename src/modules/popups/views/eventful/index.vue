<script setup lang="ts">
import BackButton from "@components/BackButton.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useGetEventfulPopups } from "@modules/popups/api"
import OrganizerPopupCard from "@modules/popups/components/OrganizerPopupCard.vue"

const { data: eventfulPopups } = useGetEventfulPopups()
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <BackButton to="/popups" label="Back to Popups" />
    <SectionHeader
      title="Upcoming Events"
      subtitle="View and register for upcoming events from Eventful."
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
