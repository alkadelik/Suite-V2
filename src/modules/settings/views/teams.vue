<template>
  <div>
    <SectionHeader
      title="Teams"
      size="md"
      subtitle="Manage your team members and their account permissions here."
    />

    <div class="mt-4 space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:border">
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          Team Members <Chip label="5" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="md"
            class="flex-1"
            placeholder="Search by member name or email"
          />
          <AppButton
            icon="filter-lines"
            size="sm"
            color="alt"
            label="Filter"
            class="!hidden md:!inline-flex"
          />
          <AppButton icon="filter-lines" size="sm" color="alt" label="" class="md:hidden" />
          <AppButton
            icon="add"
            size="sm"
            label="Invite"
            @click="showInvitationModal = true"
            class="!hidden md:!inline-flex"
          />
          <AppButton
            icon="add"
            size="sm"
            label=""
            @click="showInvitationModal = true"
            class="md:hidden"
          />
        </div>
      </div>

      <DataTable :data="TEAMS" :columns="TEAMS_COLUMN" :loading="false" :show-pagination="false">
        <!-- Desktop cell templates (unchanged) -->
        <template #cell:role="{ value }">
          <Chip :label="String(value)" variant="outlined" />
        </template>

        <template #cell:firstName="{ item }">
          <!-- Mobile: Avatar without extra text -->
          <div class="md:hidden">
            <Avatar class="items-start" :name="`${item.firstName} ${item.lastName}`" />
          </div>
          <!-- Desktop/Tablet: Avatar with extra text -->
          <div class="hidden md:block">
            <Avatar :name="`${item.firstName} ${item.lastName}`" :extra-text="item.email" />
          </div>
        </template>

        <template #cell:action="{ item }">
          <div class="flex items-center gap-2">
            <Icon name="edit" @click="handleAction('edit', item)" class="hidden md:inline-block" />
            <DropdownMenu
              :items="getActionItems(item)"
              placement="bottom-end"
              :show-chevron="false"
              size="sm"
              trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
            >
              <template #trigger>
                <Icon name="dots-vertical" />
              </template>
            </DropdownMenu>
          </div>
        </template>

        <!-- mobile view cell templates -->
        <template #mobile-content="{ item }">
          <div class="space-y-2">
            <Avatar :name="`${item.firstName} ${item.lastName}`" class="items-start" />
            <div class="ms-12 -mt-4 space-y-1">
              <div class="flex flex-col items-start justify-center gap-2">
                <div class="flex items-center gap-1">
                  <Chip :label="String(item.role)" variant="outlined" size="sm" />
                  <!-- <Chip
                    v-if="item.role.length > 1"
                    :label="`+${item.role.length - 1}`"
                    size="sm"
                    color="alt"
                    class="ml-1"
                  /> -->
                </div>

                <!-- Locations if available -->
                <div
                  v-if="item.locations && item.locations.length > 0"
                  class="flex items-center gap-1"
                >
                  <span class="text-xs text-gray-500">
                    {{ item.locations[0].name }}
                  </span>
                  <Chip
                    v-if="item.locations.length > 1"
                    :label="`+${item.locations.length - 1}`"
                    size="sm"
                    class="ml-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #mobile-actions="{ item }">
          <div class="flex items-center gap-2">
            <DropdownMenu
              :items="getActionItems(item)"
              placement="bottom-end"
              :show-chevron="false"
              size="sm"
              trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
            >
              <template #trigger>
                <Icon name="dots-vertical" />
              </template>
            </DropdownMenu>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- modals -->
    <InviteToLocationmodal v-model="showInvitationModal" @close="showInvitationModal = false" />
    <EditMemberModal
      v-model="showEditMemberModal"
      @close="showEditMemberModal = false"
      :member="member"
    />
    <DeleteConfirmationModal
      v-model="showDeleteConfirmationModal"
      @close="showDeleteConfirmationModal = false"
      header="Delete Member"
      paragraph="Are you sure you want to delete this member?"
      :member="member"
      @delete="
        () => {
          console.log(member)
          showDeleteConfirmationModal = false
        }
      "
    />
    <SuspendMemberModal
      v-model="showSuspendMemberModal"
      @close="showSuspendMemberModal = false"
      :member="member"
      @suspend="
        () => {
          console.log(member)
          showSuspendMemberModal = false
        }
      "
    />
  </div>
</template>

<script lang="ts" setup>
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { TEAMS, TEAMS_COLUMN } from "../constants"
import { TTeam } from "../types"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { ref } from "vue"
import SectionHeader from "@components/SectionHeader.vue"
import Avatar from "@components/Avatar.vue"
import TextField from "@components/form/TextField.vue"
import InviteToLocationmodal from "../components/InviteToLocationmodal.vue"
import EditMemberModal from "../components/EditMemberModal.vue"
import SuspendMemberModal from "../components/SuspendMemberModal.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
// import { useGetLocations } from "../api"
// import { displayError } from "@/utils/error-handler"

const showInvitationModal = ref(false)
const showEditMemberModal = ref(false)
const showDeleteConfirmationModal = ref(false)
const showSuspendMemberModal = ref(false)
const member = ref<TTeam | null>(null)

// const { data: locations, isPending, error } = useGetLocations()
// watch(error, displayError)

const getActionItems = (item: TTeam) => [
  {
    id: "edit",
    label: "Edit Member",
    icon: "edit",
    action: () => handleAction("edit", item),
  },
  {
    id: "suspend",
    label: "Suspend Member",
    icon: "pause",
    action: () => handleAction("suspend", item),
  },
  {
    divider: true,
  },
  {
    id: "delete",
    label: "Delete Member",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => handleAction("delete", item),
  },
]

const handleAction = (action: "archive" | "edit" | "suspend" | "delete", item: TTeam) => {
  member.value = item
  if (action === "edit") {
    showEditMemberModal.value = true
  } else if (action === "delete") {
    showDeleteConfirmationModal.value = true
  } else if (action === "suspend") {
    showSuspendMemberModal.value = true
  }
}
</script>
