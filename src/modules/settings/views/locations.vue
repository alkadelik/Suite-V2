<template>
  <div class="space-y-6">
    <SectionHeader
      title="Locations"
      subtitle="Keep track of all your business locations in one place."
    >
      <template #action>
        <AppButton icon="add" label="Add new location" @click="showModal = true" />
      </template>
    </SectionHeader>

    <DataTable
      :data="LOCATIONS"
      :columns="LOCATION_COLUMNS"
      :loading="isPending"
      :show-pagination="false"
    >
      <template #cell:status="{ value }">
        <Chip
          showDot
          size="sm"
          :label="String(value)"
          :color="value === 'Active' ? 'success' : 'error'"
          variant="outlined"
        />
      </template>

      <template #cell:action="{ item }">
        <div class="flex items-center gap-2">
          <Icon name="eye" @click="handleAction('view', item)" />
          <Icon name="folder" @click="handleAction('edit', item)" />
        </div>
      </template>
    </DataTable>

    <AddLocationModal :open="showModal" @close="showModal = false" />
  </div>
</template>

<script lang="ts" setup>
import DataTable from "@components/DataTable.vue"
import SectionHeader from "../../../components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"
import { LOCATION_COLUMNS, LOCATIONS } from "../constants"
import { TLocation } from "../types"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import AddLocationModal from "../components/AddLocationModal.vue"
import { ref } from "vue"
import { useGetLocations } from "../api"

const showModal = ref(false)

const { data: locations, isPending } = useGetLocations()
console.log("Locations:", locations)

const handleAction = (action: "view" | "edit", item: TLocation) => {
  alert(`Action: ${action} ==> ${item.name}`)
}
</script>
