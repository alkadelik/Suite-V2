<template>
  <div class="space-y-6 overflow-hidden rounded-xl border-gray-200 bg-white md:border md:pt-6">
    <div class="flex flex-col items-end justify-between gap-2 md:flex-row md:items-center md:px-4">
      <div class="w-full md:w-auto">
        <h3 class="flex items-center gap-1 text-lg font-semibold">
          Locations
          <Chip v-if="locations?.results" :label="locations?.results.length + ' locations'" />
        </h3>
        <p class="text-sm">Keep track of all your business locations in one place.</p>
      </div>
      <AppButton
        v-if="!locations?.results || locations?.results.length < 5"
        icon="add"
        size="sm"
        :variant="isMobile ? 'outlined' : 'filled'"
        label="Add new location"
        @click="showModal = true"
      />
    </div>

    <DataTable
      :data="locations?.results ?? []"
      :columns="LOCATION_COLUMNS"
      :loading="isPending"
      :show-pagination="false"
    >
      <template #cell:status>
        <Chip showDot label="Active" color="success" variant="outlined" />
      </template>

      <template #cell:action="{ item }">
        <div class="flex items-center gap-2">
          <Icon name="edit" @click="handleAction('edit', item)" />
          <Icon v-if="!item.is_hq" name="archive" @click="handleAction('archive', item)" />
        </div>
      </template>

      <template #mobile="{ item }">
        <div class="bg-core-25 border-core-300 cursor-pointer rounded-2xl border p-4">
          <div class="mb-2 flex items-center gap-3">
            <h3 class="w-full max-w-3/4 truncate text-base font-semibold capitalize">
              {{ item.name }}
            </h3>
            <Chip showDot label="Active" color="success" variant="outlined" />
          </div>
          <div class="space-y-2">
            <div class="mb-2 flex items-center justify-between gap-3">
              <div class="line-clamp-1 flex w-full items-center gap-2 text-sm capitalize">
                <Icon name="location" size="18" class="flex-shrink-0" />
                <p class="line-clamp-1 flex-1">
                  {{ item.address }} Another thing you can say here is
                </p>
              </div>
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
            <p class="flex items-center gap-2 text-sm">
              <Icon name="call" size="18" />
              {{ "--" }}
            </p>
          </div>
        </div>
      </template>
    </DataTable>

    <AddLocationModal
      :open="showModal"
      @close="onClose"
      @refresh="refetch"
      :location="selectedLocation"
    />

    <DeleteConfirmationModal
      v-model="openArchive"
      @close="onClose"
      :loading="isArchiving"
      header="Archive Location?"
      paragraph="Are you sure you want to archive this location? You can restore it anytime."
      @delete="handleDeleteLocation"
      action-label="Archive"
    >
      <template #warning>
        <p class="font-medium">What happens when you archive:</p>
        <ul class="list-disc pl-5">
          <li>You will be unable to create orders/expenses for this location.</li>
          <li>Team members will no longer be able to access this location.</li>
        </ul>
      </template>
    </DeleteConfirmationModal>
  </div>
</template>

<script lang="ts" setup>
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import { LOCATION_COLUMNS } from "../constants"
import { TLocation } from "../types"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import AddLocationModal from "../components/AddLocationModal.vue"
import { ref, watch } from "vue"
import { useDeleteLocation, useGetLocations } from "../api"
import { displayError } from "@/utils/error-handler"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import { toast } from "@/composables/useToast"
import { useMediaQuery } from "@vueuse/core"
import DropdownMenu from "@components/DropdownMenu.vue"

const showModal = ref(false)
const openArchive = ref(false)
const selectedLocation = ref<TLocation | null>(null)
const isMobile = useMediaQuery("(max-width: 768px)")

const { data: locations, isPending, error, refetch } = useGetLocations()
watch(error, displayError)

const handleAction = (action: "archive" | "edit", item: TLocation) => {
  selectedLocation.value = item
  if (action === "edit") showModal.value = true
  if (action === "archive") openArchive.value = true
}

const { mutate: archiveLocation, isPending: isArchiving } = useDeleteLocation()

const handleDeleteLocation = () => {
  if (selectedLocation.value) {
    archiveLocation(selectedLocation.value.uid, {
      onSuccess: () => {
        toast.success("Location archived successfully")
        refetch()
        onClose()
      },
      onError: displayError,
    })
  }
}

const onClose = () => {
  showModal.value = false
  openArchive.value = false
  selectedLocation.value = null
}

const getActionItems = (item: TLocation) => [
  {
    label: "Edit Location",
    icon: "edit",
    action: () => handleAction("edit", item),
  },
  {
    label: "Archive Location",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => handleAction("archive", item),
  },
]
</script>
