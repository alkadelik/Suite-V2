<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Drawer from "@components/Drawer.vue"
import Modal from "@components/Modal.vue"
// import RadioInputField from "@components/form/RadioInputField.vue"
import TextField from "@components/form/TextField.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"

defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  apply: [filters: Record<string, string>]
}>()

const isMobile = useMediaQuery("(max-width: 1028px)")

// const ORGANIZER_EVENT_OPTIONS = [
//   { value: "true", label: "Eventful Only" },
//   { value: "false", label: "Popups Only" },
// ]

const hasOrganizerEvent = ref<string | null>(null)
const startDate = ref("")
const endDate = ref("")

// const toggleOrganizerEvent = (value: string) => {
//   hasOrganizerEvent.value = hasOrganizerEvent.value === value ? null : value
// }

const activeFilterCount = computed(() => {
  let count = 0
  if (hasOrganizerEvent.value !== null) count++
  if (startDate.value) count++
  if (endDate.value) count++
  return count
})

const applyFilters = () => {
  const filters: Record<string, string> = {}
  if (hasOrganizerEvent.value !== null) filters.has_organizer_event = hasOrganizerEvent.value
  if (endDate.value) filters.start_date_before = endDate.value
  if (startDate.value) filters.start_date_after = startDate.value
  emit("apply", filters)
  emit("close")
}

const clearFilters = () => {
  hasOrganizerEvent.value = null
  startDate.value = ""
  endDate.value = ""
  emit("apply", {})
  emit("close")
}
</script>

<template>
  <component
    :is="isMobile ? Modal : Drawer"
    :open="open"
    title="Filter Popups"
    max-width="lg"
    variant="fullscreen"
    @close="emit('close')"
  >
    <div class="space-y-6">
      <!-- Organizer Event -->
      <!-- <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Organizer Event?</h3>
        <RadioInputField
          :model-value="hasOrganizerEvent ?? ''"
          :options="ORGANIZER_EVENT_OPTIONS"
          options-container-class="grid! grid-cols-2!"
          @update:model-value="(v) => toggleOrganizerEvent(v as string)"
        />
      </div> -->

      <div class="border-b border-gray-100" />

      <!-- Date Range -->
      <div>
        <h3 class="text-core-700 mb-3 text-sm font-semibold">Start Date</h3>
        <div class="grid grid-cols-2 gap-3">
          <TextField v-model="startDate" label="From" type="date" left-icon="calendar" />
          <TextField v-model="endDate" label="To" type="date" left-icon="calendar" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-4">
        <AppButton color="alt" label="Clear All" @click="clearFilters" />
        <AppButton
          :label="activeFilterCount ? `Apply (${activeFilterCount})` : 'Apply Filters'"
          @click="applyFilters"
        />
      </div>
    </template>
  </component>
</template>
