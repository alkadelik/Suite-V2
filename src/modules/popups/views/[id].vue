<script setup lang="ts">
import { formatCurrency } from "@/utils/format-currency"
import { startCase } from "@/utils/format-strings"
import { formatDate } from "@/utils/formatDate"
import PageHeader from "@components/PageHeader.vue"
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
import { clipboardCopy, isStaging } from "@/utils/others"
import { useMediaQuery } from "@vueuse/core"
import Collapsible from "@components/Collapsible.vue"
import { useSettingsStore } from "@modules/settings/store"
import { getEventStatus } from "../constants"

const route = useRoute()
const openDelete = ref(false)
const openEdit = ref(false)
const activeTab = ref("overview")

const { data: popupEvt, isPending, refetch } = useGetPopupEventById(route.params.id as string)

const overviewInfo = computed(() => {
  return {
    "Participation Fee": Number(popupEvt.value?.participation_fee)
      ? formatCurrency(popupEvt.value?.participation_fee || 0)
      : "Free",
    Description: popupEvt.value?.description || "N/A",
  }
})

const actionMenu = computed(() => [
  ...(getEventStatus(popupEvt.value!) === "ended"
    ? []
    : [
        { label: "Edit Event", icon: "edit", action: () => (openEdit.value = true) },
        { divider: true },
      ]),
  ...(!popupEvt.value?.total_orders
    ? [
        {
          label: "Delete Event",
          icon: "trash",
          iconClass: "text-red-500",
          class: "text-red-500",
          action: () => (openDelete.value = true),
        },
      ]
    : []),
])

const isMobile = useMediaQuery("(max-width: 768px)")

const storeDetails = computed(() => useSettingsStore().storeDetails)
</script>

<template>
  <PageHeader title="Popup Details" inner />

  <EmptyState
    v-if="isPending || !popupEvt"
    title="Event Details"
    description="Details for this event is currently not available."
    :loading="isPending"
  />

  <section v-else class="flex flex-col px-4 py-4 md:px-8 md:py-8">
    <section>
      <div class="bg-primary-800 mb-6 flex gap-2 rounded-xl p-3 text-white md:gap-6 md:p-6">
        <div
          class="bg-core-50 flex w-16 flex-shrink-0 items-center justify-center rounded md:h-[20] md:w-20"
        >
          <img
            v-if="popupEvt?.banner_image"
            :src="popupEvt?.banner_image"
            alt="Popup Banner"
            class="h-full w-full rounded object-cover"
          />

          <Icon v-else name="calendar-tick" size="40" class="text-core-800" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex items-center gap-2">
            <h3
              class="min-w-0 flex-1 truncate text-base font-semibold capitalize md:flex-none md:text-xl"
            >
              {{ popupEvt?.name }}
            </h3>
            <Chip
              v-if="!isMobile"
              :label="getEventStatus(popupEvt)"
              size="sm"
              class="flex-shrink-0 capitalize"
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
              <Icon name="calendar" size="20" class="flex-shrink-0" />
              <span class="min-w-0 truncate">
                {{ formatDate(popupEvt?.start_date || "") }} -
                {{ formatDate(popupEvt?.end_date || "") }}
              </span>
            </p>
            <p class="flex items-center gap-2 text-sm">
              <span class="min-w-0 truncate">
                {{
                  `${isStaging ? "www.storefronts-v2.vercel.app" : "www.buy.leyyow.com"}/${storeDetails?.slug}/events/${popupEvt?.slug}`
                }}
              </span>
              <Icon
                name="copy"
                size="20"
                class="flex-shrink-0 cursor-pointer"
                @click="
                  clipboardCopy(
                    `https://${isStaging ? 'storefronts-v2.vercel.app' : 'buy.leyyow.com'}/${storeDetails?.slug}/events/${popupEvt?.slug}`,
                  )
                "
              />
            </p>
            <Chip
              v-if="isMobile"
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
        </div>

        <div
          v-if="getEventStatus(popupEvt) !== 'ended' || popupEvt.total_orders"
          class="flex flex-shrink-0 items-start"
        >
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
          <div class="mb-6">
            <Collapsible header="Popup Details" :default-open="true">
              <template #body>
                <div class="divide-core-100 divide-y">
                  <div
                    v-for="(value, key) in overviewInfo"
                    :key="key"
                    class="flex flex-col gap-1 py-3 text-sm"
                  >
                    <p class="text-core-600 flex-1 font-semibold">{{ startCase(key) }}</p>
                    <p class="flex-2 font-medium">{{ value }}</p>
                  </div>
                </div>
              </template>
            </Collapsible>
          </div>

          <PopupInventoryTab />
        </template>
        <template #sales>
          <PopupSalesTab
            :is-active="getEventStatus(popupEvt) === 'ongoing'"
            :start-date="popupEvt?.start_date"
          />
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
