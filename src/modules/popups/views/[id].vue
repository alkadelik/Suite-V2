<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import BackButton from "@components/BackButton.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import { useGetPopupEventById } from "../api"
import Tabs from "@components/Tabs.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import CreatePopupEventModal from "../components/CreatePopupEventModal.vue"
import DeletePopupEvent from "../components/DeletePopupEvent.vue"
import PopupSalesTab from "../components/popup-tabs/PopupSalesTab.vue"
import PopupInventoryTab from "../components/popup-tabs/PopupInventoryTab.vue"
import { clipboardCopy } from "@/utils/others"

const route = useRoute()
const openDelete = ref(false)
const openEdit = ref(false)
const activeTab = ref("overview")

const { data: popupEvt, isPending, refetch } = useGetPopupEventById(route.params.id as string)

const getEventStatus = (event: { start_date?: string; end_date?: string } | null) => {
  if (!event?.start_date || !event?.end_date) return "ended"
  const now = new Date()
  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  if (now < startDate) return "upcoming"
  if (now >= startDate && now <= endDate) return "ongoing"
  return "ended"
}

const overviewInfo = computed(() => {
  return {
    "Participation Fee": popupEvt.value?.participant_fee
      ? formatCurrency(popupEvt.value?.participant_fee)
      : "Free",
    Description: popupEvt.value?.description || "N/A",
  }
})

const actionMenu = computed(() => [
  { label: "Edit Event", icon: "edit", action: () => (openEdit.value = true) },
  { divider: true },
  {
    label: "Delete Event",
    icon: "trash",
    iconClass: "text-red-500",
    class: "text-red-500",
    action: () => (openDelete.value = true),
  },
])
</script>

<template>
  <EmptyState
    v-if="isPending || !popupEvt"
    title="Event Details"
    description="Details for this event is currently not available."
    :loading="isPending"
  />

  <section v-else class="flex flex-col px-4 py-4 md:px-8 md:py-8">
    <div>
      <BackButton label="Go Back" class="mb-6" />
    </div>

    <section>
      <div class="bg-primary-800 mb-6 flex flex-col gap-6 rounded-xl p-6 text-white md:flex-row">
        <div class="bg-core-200 size-20 rounded"></div>
        <div class="flex-1">
          <div class="mb-2 flex items-center gap-2">
            <h3 class="truncate text-xl font-semibold capitalize">{{ popupEvt?.name }}</h3>
            <Chip
              :label="getEventStatus(popupEvt)"
              size="sm"
              class="capitalize"
              show-dot
              :color="
                getEventStatus(popupEvt) === 'upcoming'
                  ? 'primary'
                  : getEventStatus(popupEvt) === 'ongoing'
                    ? 'success'
                    : 'alt'
              "
            />
          </div>
          <div class="space-y-1">
            <p class="flex items-center gap-2 text-sm">
              <Icon name="calendar" size="20" />
              {{ formatDate(popupEvt?.start_date || "") }} -
              {{ formatDate(popupEvt?.end_date || "") }}
            </p>
            <p class="flex items-center gap-2 text-sm">
              <span class="max-w-2/3 truncate md:max-w-1/3">
                {{ `www.popup.leyyow.com/${popupEvt?.slug || ""}` }}
              </span>
              <Icon
                name="copy"
                size="20"
                @click="clipboardCopy(`https://popup.leyyow.com/${popupEvt?.slug}`)"
              />
            </p>
          </div>
        </div>

        <div>
          <DropdownMenu :items="actionMenu" />
        </div>
      </div>

      <Tabs
        v-model="activeTab"
        :tabs="[
          { title: 'Overview', key: 'overview' },
          { title: 'Sales', key: 'sales' },
        ]"
      >
        <template #overview>
          <div class="mt-4 mb-8 rounded-2xl bg-white py-6 shadow">
            <div class="border-core-200 border-b px-6 pb-4">
              <h3 class="text-lg font-semibold">Popup Details</h3>
            </div>
            <div class="divide-core-100 divide-y px-6">
              <div
                v-for="(value, key) in overviewInfo"
                :key="key"
                class="flex flex-col gap-1 py-3 text-sm"
              >
                <p class="text-core-600 flex-1 font-semibold">{{ startCase(key) }}</p>
                <p class="flex-2 font-medium">{{ value }}</p>
              </div>
            </div>
          </div>

          <PopupInventoryTab />
        </template>
        <template #sales>
          <PopupSalesTab />
        </template>
      </Tabs>
    </section>

    <!-- Create/Edit Popup Event Modal -->
    <CreatePopupEventModal
      :open="openEdit"
      @close="openEdit = false"
      :is-edit-mode="true"
      :event="popupEvt"
      @refresh="
        () => {
          refetch()
        }
      "
    />

    <DeletePopupEvent
      :open="openDelete"
      @close="openDelete = false"
      :event="popupEvt"
      @refresh="() => $router.push('/popups')"
    />
  </section>
</template>
