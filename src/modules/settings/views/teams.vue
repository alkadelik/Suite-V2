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
          Team Members <Chip :label="String(teamMembers.length)" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="md"
            class="flex-1"
            placeholder="Search by member name or email"
            v-model="searchQuery"
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

      <DataTable
        :data="filteredTeamMembers"
        :columns="TEAMS_COLUMN"
        :loading="isPending"
        :show-pagination="false"
      >
        <!-- Desktop cell templates -->
        <template #cell:role="{ item }">
          <div class="flex items-center gap-1">
            <Chip
              :label="item.roles && item.roles.length > 0 ? item.roles[0].name : 'No Role'"
              variant="outlined"
            />
            <Chip
              v-if="item.roles && item.roles.length > 1"
              :label="`+${item.roles.length - 1}`"
              size="sm"
              color="alt"
              class="ml-1"
            />
          </div>
        </template>

        <template #cell:firstName="{ item }">
          <!-- Mobile: Avatar without extra text -->
          <div class="md:hidden">
            <Avatar class="items-start" :name="`${item.first_name} ${item.last_name}`" />
          </div>
          <!-- Desktop/Tablet: Avatar with extra text -->
          <div class="hidden md:block">
            <Avatar :name="`${item.first_name} ${item.last_name}`" :extra-text="item.email" />
          </div>
        </template>

        <template #cell:status="{ item }">
          <Chip
            :label="item.is_suspended ? 'Suspended' : 'Active'"
            :color="item.is_suspended ? 'error' : 'success'"
            size="sm"
          />
        </template>

        <template #cell:locations="{ item }">
          <div
            v-if="item.assigned_locations && item.assigned_locations.length > 0"
            class="flex items-center gap-1"
          >
            <span class="text-sm">{{ item.assigned_locations[0].name }}</span>
            <Chip
              v-if="item.assigned_locations.length > 1"
              :label="`+${item.assigned_locations.length - 1}`"
              size="sm"
              color="alt"
              class="ml-1"
            />
          </div>
          <span v-else class="text-sm text-gray-500">No locations</span>
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
              @click.stop
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
            <div class="flex items-start gap-2">
              <Avatar :name="`${item.first_name} ${item.last_name}`" class="items-start" />
              <!-- <Chip
                :label="item.is_suspended ? 'Suspended' : 'Active'"
                :variant="item.is_suspended ? 'solid' : 'outlined'"
                :color="item.is_suspended ? 'red' : 'green'"
                size="sm"
              /> -->
            </div>
            <div class="ms-12 -mt-4 space-y-1">
              <div class="flex flex-col items-start justify-center gap-2">
                <div class="flex items-center gap-1">
                  <Chip
                    :label="item.roles && item.roles.length > 0 ? item.roles[0].name : 'No Role'"
                    variant="outlined"
                    size="sm"
                  />
                  <Chip
                    v-if="item.roles && item.roles.length > 1"
                    :label="`+${item.roles.length - 1}`"
                    size="sm"
                    color="alt"
                    class="ml-1"
                  />
                </div>

                <!-- Locations if available -->
                <div
                  v-if="item.assigned_locations && item.assigned_locations.length > 0"
                  class="flex items-center gap-1"
                >
                  <span class="text-xs text-gray-500">
                    {{ item.assigned_locations[0].name }}
                  </span>
                  <Chip
                    v-if="item.assigned_locations.length > 1"
                    :label="`+${item.assigned_locations.length - 1}`"
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
              @click.stop
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
      @refresh="refetch"
    />
    <DeleteConfirmationModal
      v-model="showDeleteConfirmationModal"
      @close="showDeleteConfirmationModal = false"
      header="Delete Member"
      paragraph="Are you sure you want to delete this member?"
      :member="member"
      @delete="handleDeleteMember"
    />
    <SuspendMemberModal
      v-model="showSuspendMemberModal"
      @close="showSuspendMemberModal = false"
      :member="member"
      :loading="isSuspending"
      @suspend="handleSuspendMember"
    />
  </div>
</template>

<script lang="ts" setup>
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { TEAMS_COLUMN } from "../constants"
import { TTeam } from "../types"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import { ref, computed, watch } from "vue"
import SectionHeader from "@components/SectionHeader.vue"
import Avatar from "@components/Avatar.vue"
import TextField from "@components/form/TextField.vue"
import InviteToLocationmodal from "../components/InviteToLocationmodal.vue"
import EditMemberModal from "../components/EditMemberModal.vue"
import SuspendMemberModal from "../components/SuspendMemberModal.vue"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import { useGetStoreMembers, useSuspendMember } from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

// API calls
const { data: storeMembersData, isPending, refetch } = useGetStoreMembers()
const { mutate: suspendMember, isPending: isSuspending } = useSuspendMember()

// Component state
const showInvitationModal = ref(false)
const showEditMemberModal = ref(false)
const showDeleteConfirmationModal = ref(false)
const showSuspendMemberModal = ref(false)
const member = ref<TTeam | null>(null)
const searchQuery = ref("")

// Computed properties
const teamMembers = computed(() => {
  if (!storeMembersData.value?.data?.results) return []
  return storeMembersData.value.data.results
})

const filteredTeamMembers = computed(() => {
  if (!searchQuery.value) return teamMembers.value

  const query = searchQuery.value.toLowerCase()
  return teamMembers.value.filter(
    (member: TTeam) =>
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query),
  )
})

// Action items for dropdown
const getActionItems = (item: TTeam) => [
  {
    id: "edit",
    label: "Edit Member",
    icon: "edit",
    action: () => handleAction("edit", item),
  },
  {
    id: "suspend",
    label: item.is_suspended ? "Unsuspend Member" : "Suspend Member",
    icon: item.is_suspended ? "play" : "pause",
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

// Handle various actions
const handleAction = (action: "edit" | "suspend" | "delete", item: TTeam) => {
  member.value = item
  if (action === "edit") {
    showEditMemberModal.value = true
  } else if (action === "delete") {
    showDeleteConfirmationModal.value = true
  } else if (action === "suspend") {
    showSuspendMemberModal.value = true
  }
}

// Handle member deletion
const handleDeleteMember = async () => {
  if (!member.value) return

  try {
    // Add your delete member API call here
    // const deleteMutation = useDeleteMember(member.value.uid)
    // await deleteMutation.mutateAsync()
    toast.success("Member deleted successfully")
    showDeleteConfirmationModal.value = false
    member.value = null
    await refetch() // Refetch the team members list
  } catch (error) {
    console.error("Error deleting member:", error)
    toast.error("Failed to delete member")
  }
}

// Handle member suspension
const handleSuspendMember = () => {
  if (!member.value) return

  suspendMember(
    { uid: member.value.uid },
    {
      onSuccess: () => {
        const action = member.value?.is_suspended ? "unsuspended" : "suspended"
        toast.success(`Member ${action} successfully`)
        showSuspendMemberModal.value = false
        member.value = null
        refetch()
      },
      onError: displayError,
    },
  )
}

// Watch for data changes and log them
watch(
  () => storeMembersData.value,
  (newData) => {
    if (newData) {
      console.log("Fetched team members:", newData.data.results)
    }
  },
  { immediate: true },
)
</script>
