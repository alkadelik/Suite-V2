<template>
  <div class="space-y-6 rounded-xl border border-gray-200 bg-white pt-6">
    <div class="flex items-center justify-between px-4">
      <div>
        <h3 class="flex items-center gap-1 text-2xl font-semibold">
          Locations <Chip label="5 locations" />
        </h3>
        <p>Keep track of all your business locations in one place.</p>
      </div>
      <AppButton icon="add" size="sm" label="Add new location" @click="showModal = true" />
    </div>

    <DataTable
      :data="locations?.data?.results || LOCATIONS"
      :columns="LOCATION_COLUMNS"
      :loading="isPending"
      :show-pagination="false"
    >
      <template #cell:status="{ value }">
        <Chip
          showDot
          :label="String(value)"
          :color="value === 'Active' ? 'success' : 'error'"
          variant="outlined"
        />
      </template>

      <template #cell:action="{ item }">
        <div class="flex items-center gap-2">
          <Icon name="edit" @click="handleAction('edit', item)" />
          <Icon name="archive" @click="handleAction('archive', item)" />
        </div>
      </template>
    </DataTable>

    <AddLocationModal :open="showModal" @close="showModal = false" />
  </div>
</template>

<script lang="ts" setup>
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import { LOCATION_COLUMNS, LOCATIONS } from "../constants"
import { TLocation } from "../types"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import AddLocationModal from "../components/AddLocationModal.vue"
import { ref, watch } from "vue"
import { useGetLocations } from "../api"
import { displayError } from "@/utils/error-handler"

const showModal = ref(false)

const { data: locations, isPending, error } = useGetLocations()
watch(error, displayError)

const handleAction = (action: "archive" | "edit", item: TLocation) => {
  alert(`Action: ${action} ==> ${item.name}`)
}
</script>
