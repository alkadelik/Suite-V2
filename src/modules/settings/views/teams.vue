<template>
  <div>
    <SectionHeader
      title="Teams"
      size="md"
      subtitle="Manage your team members and their account permissions here."
    />

    <EmptyState
      v-if="!isPending && teamMembers.length === 0 && !searchQuery"
      title="No team members found"
      description="Add your first ream member to start managing them."
      action-label="Add Member"
      action-icon="add"
      @action="showInvitationModal = true"
      class="mt-6"
    />
    <div v-else class="mt-4 space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:border">
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          Team Members <Chip :label="String(teamMembers.length)" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="sm"
            class="flex-1"
            placeholder="Search by member name or email"
            v-model="searchQuery"
          />
          <!-- <AppButton
            icon="filter-lines"
            size="sm"
            color="alt"
            label="Filter"
            class="!hidden md:!inline-flex"
          />
          <AppButton icon="filter-lines" size="sm" color="alt" label="" class="md:hidden" /> -->
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
        :data="teamMembers"
        :columns="TEAMS_COLUMN"
        :loading="isPending"
        :show-pagination="false"
      >
        <!-- Desktop cell templates -->
        <template #cell:role="{ item }">
          <div class="flex items-center gap-1">
            <Chip
              :label="item.roles && item.roles.length > 0 ? item.roles[0].name : 'No Role'"
              :color="getRoleColor(item.roles && item.roles.length > 0 ? item.roles[0].uid : '')"
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

        <template #cell:first_name="{ item }">
          <Avatar :name="getFullName(item)" :extra-text="item.email" />
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
          <div v-if="canPerformActions(item)" class="flex items-center gap-2">
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
        <template #mobile="{ item }">
          <div
            class="bg-core-25 border-core-300 mb-3 flex cursor-pointer items-start gap-2 rounded-xl border p-3"
          >
            <div class="flex items-start gap-2">
              <Avatar :name="getFullName(item)" class="items-start" />
            </div>

            <div class="flex flex-1 flex-col items-start justify-center gap-2">
              <h3 class="font-medium">{{ getFullName(item) }}</h3>
              <div class="flex items-center gap-1">
                <Chip
                  :label="item.roles && item.roles.length > 0 ? item.roles[0].name : 'No Role'"
                  :color="
                    getRoleColor(item.roles && item.roles.length > 0 ? item.roles[0].uid : '')
                  "
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

            <div v-if="canPerformActions(item)" class="flex items-center gap-2">
              <DropdownMenu
                :items="getActionItems(item)"
                placement="bottom-end"
                :show-chevron="false"
                size="sm"
                trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
                @click.stop
              />
            </div>
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
    <ConfirmationModal
      v-model="showSuspendMemberModal"
      @close="showSuspendMemberModal = false"
      header="Suspend Member"
      paragraph="Are you sure you want to suspend this member?"
      info-message="You can reverse this action by reactivating the member."
      variant="warning"
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
import { ref, computed } from "vue"
import SectionHeader from "@components/SectionHeader.vue"
import Avatar from "@components/Avatar.vue"
import TextField from "@components/form/TextField.vue"
import InviteToLocationmodal from "../components/InviteToLocationmodal.vue"
import EditMemberModal from "../components/EditMemberModal.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import { useGetStoreMembers, useSuspendMember } from "../api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import { getRoleColor } from "@modules/shared/utils"
import { useAuthStore } from "@modules/auth/store"
import EmptyState from "@components/EmptyState.vue"

// Component state
const showInvitationModal = ref(false)
const showEditMemberModal = ref(false)
const showSuspendMemberModal = ref(false)
const member = ref<TTeam | null>(null)
const searchQuery = ref("")
const { user } = useAuthStore()

// API calls
const { data: storeMembersData, isPending, refetch } = useGetStoreMembers(searchQuery)
const { mutate: suspendMember, isPending: isSuspending } = useSuspendMember()

// Helper function to get full name
const getFullName = (item: TTeam) => {
  return `${item.first_name || ""} ${item.last_name || ""}`.trim() || "Unknown User"
}

// Helper function to check if user can perform actions
const canPerformActions = (item: TTeam) => {
  // Don't show actions if user is not an owner
  if (!isLoggedInUserOwner.value) return false

  // Don't show actions if the item is the current user
  if (user?.uid === item.uid) return false

  return true
}

// Computed properties
const teamMembers = computed(() => {
  if (!storeMembersData.value?.data?.results) return []
  return storeMembersData.value.data.results
})

const isLoggedInUserOwner = computed(() => {
  return user?.roles?.some((role) => role.type === "owner") ?? false
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
    icon: "pause",
    action: () => handleAction("suspend", item),
  },
]

// Handle various actions
const handleAction = (action: "edit" | "suspend", item: TTeam) => {
  member.value = item
  if (action === "edit") {
    showEditMemberModal.value = true
  } else if (action === "suspend") {
    showSuspendMemberModal.value = true
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
</script>
