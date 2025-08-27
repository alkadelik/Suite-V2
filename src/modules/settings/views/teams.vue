<template>
  <div>
    <SectionHeader
      title="Teams"
      size="md"
      subtitle="Manage your team members and their account permissions here."
    />

    <div class="mt-4 space-y-4 rounded-xl border border-gray-200 bg-white pt-3">
      <div class="flex items-center justify-between px-4">
        <h3 class="flex items-center gap-1 text-lg font-semibold">
          Team Members <Chip label="5" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField left-icon="box" size="md" />
          <AppButton icon="filter" size="sm" color="alt" label="Filter" />
          <AppButton icon="add" size="sm" label="Invite" @click="showModal = true" />
        </div>
      </div>

      <DataTable :data="TEAMS" :columns="TEAMS_COLUMN" :loading="false" :show-pagination="false">
        <template #cell:role="{ value }">
          <Chip :label="String(value)" variant="outlined" />
        </template>

        <template #cell:firstName="{ item }">
          <Avatar :name="`${item.firstName} ${item.lastName}`" :extra-text="item.email" />
        </template>

        <template #cell:action="{ item }">
          <div class="flex items-center gap-2">
            <Icon name="edit" @click="handleAction('edit', item)" />
            <Icon name="archive" @click="handleAction('archive', item)" />
          </div>
        </template>
      </DataTable>
    </div>

    <AddLocationModal :open="showModal" @close="showModal = false" />
  </div>
</template>

<script lang="ts" setup>
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import { TEAMS, TEAMS_COLUMN } from "../constants"
import { TTeam } from "../types"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import AddLocationModal from "../components/AddLocationModal.vue"
import { ref } from "vue"
import SectionHeader from "@components/SectionHeader.vue"
import Avatar from "@components/Avatar.vue"
import TextField from "@components/form/TextField.vue"
// import { useGetLocations } from "../api"
// import { displayError } from "@/utils/error-handler"

const showModal = ref(false)

// const { data: locations, isPending, error } = useGetLocations()
// watch(error, displayError)

const handleAction = (action: "archive" | "edit", item: TTeam) => {
  alert(`Action: ${action} ==> ${item.firstName} ${item.lastName}`)
}
</script>
