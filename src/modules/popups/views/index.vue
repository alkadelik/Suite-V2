<script setup lang="ts">
import { startCase } from "@/utils/format-strings"
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import Icon from "@components/Icon.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Tabs from "@components/Tabs.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref, watch } from "vue"
import { getEventStatus, POPUP_COLUMN } from "../constants"
import { PopupEvent } from "../types"
import PopupEventCard from "../components/PopupEventCard.vue"
import CreatePopupEventModal from "../components/CreatePopupEventModal.vue"
import { useGetEventfulPopups, useGetPopupEvents } from "../api"
import OrganizerPopupCard from "../components/OrganizerPopupCard.vue"
import "vue3-carousel/carousel.css"
import { Carousel, Slide } from "vue3-carousel"
import DeletePopupEvent from "../components/DeletePopupEvent.vue"
import { useRoute } from "vue-router"
import PopupCreatedSuccessModal from "../components/PopupCreatedSuccessModal.vue"

const TABS = [
  { title: "All", key: "" },
  { title: "Ongoing", key: "ongoing" },
  { title: "Upcoming", key: "upcoming" },
  { title: "Past", key: "past" },
]

const status = ref(TABS[0].key)
const searchQuery = ref("")
const openCreate = ref(false)
const openDelete = ref(false)
const showFilter = ref(false)
const activeSlide = ref(0)
const openSuccess = ref(false)

const selectedPopup = ref<PopupEvent | null>(null)

const isMobile = useMediaQuery("(max-width: 768px)")

const handleAction = (action: string, item: PopupEvent) => {
  selectedPopup.value = item
  if (action === "edit") openCreate.value = true
  if (action === "delete") openDelete.value = true
}

const computedFilters = computed(() => {
  const filters: Record<string, string> = {}
  if (status.value) filters.status = status.value
  if (searchQuery.value) filters.search = searchQuery.value
  return filters
})
const { data: popupEvents, isPending, isFetching, refetch } = useGetPopupEvents(computedFilters)

const params = computed(() => ({ status: "upcoming", limit: 5 }))
const { data: eventfulPopups } = useGetEventfulPopups(params)
const route = useRoute()

// Watch for route query to open create modal/drawer
watch(
  () => route.query.create,
  (newVal) => {
    if (newVal === "true") {
      selectedPopup.value = null
      openCreate.value = true
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex flex-col p-4 md:p-8">
    <div class="hidden lg:block">
      <SectionHeader
        title="Popups"
        subtitle="Track, manage, and fulfil every order in one place."
      />
    </div>

    <div v-if="eventfulPopups?.results?.length">
      <div class="flex justify-between">
        <h3 class="text-lg font-semibold">Upcoming events</h3>
        <AppButton
          variant="text"
          color="alt"
          label="View All"
          icon="arrow-right"
          class="flex-row-reverse"
          @click="() => $router.push('/popups/eventful')"
        />
      </div>

      <Carousel
        v-model="activeSlide"
        v-bind="{
          itemsToShow: 1,
          autoplay: 3000,
          wrapAround: true,
          gap: 16,
          breakpoints: {
            640: {
              itemsToShow: eventfulPopups?.results?.length > 1 ? 2 : 1,
            },
          },
        }"
      >
        <Slide v-for="(eventful, n) in eventfulPopups?.results" :key="n">
          <OrganizerPopupCard :event="eventful" :class="isMobile ? 'w-full' : 'w-1/2'" />
        </Slide>

        <template #addons>
          <div class="mt-6 flex items-center justify-between px-2">
            <div class="inline-flex items-center gap-1">
              <span
                v-for="(_, n) in eventfulPopups?.count"
                :key="n"
                :class="['flex h-1 w-4 rounded', activeSlide === n ? 'bg-gray-500' : 'bg-gray-200']"
              />
            </div>

            <div class="inline-flex gap-2">
              <AppButton
                variant="outlined"
                color="alt"
                size="xs"
                icon="arrow-left"
                class="!bg-core-25"
                @click="
                  activeSlide =
                    activeSlide === 0 ? (eventfulPopups?.count || 5) - 1 : activeSlide - 1
                "
              />
              <AppButton
                variant="outlined"
                color="alt"
                size="xs"
                icon="arrow-right"
                class="!bg-core-25"
                @click="
                  activeSlide =
                    activeSlide === (eventfulPopups?.count || 5) - 1 ? 0 : activeSlide + 1
                "
              />
            </div>
          </div>
        </template>
      </Carousel>
    </div>

    <EmptyState
      v-if="!popupEvents?.count && !status"
      title="You don't have any popup yet!"
      description="Create a popup event."
      action-label="Create a popup event"
      action-icon="add"
      @action="
        () => {
          selectedPopup = null
          openCreate = true
        }
      "
      :loading="isPending || isFetching"
    />

    <section v-else class="mt-6">
      <Tabs v-model="status" :tabs="TABS" class="max-w-md" />

      <div
        class="mt-4 space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
      >
        <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
          <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
            {{ startCase(status) + " Popups" }}
            <Chip v-if="popupEvents?.count" :label="popupEvents?.count" />
          </h3>
          <div class="flex items-center gap-2">
            <TextField
              left-icon="search-lg"
              size="md"
              class="w-full md:min-w-64"
              placeholder="Search by name"
              v-model="searchQuery"
            />

            <AppButton
              icon="filter-lines"
              variant="outlined"
              size="sm"
              color="alt"
              class="flex-shrink-0"
              :label="isMobile ? '' : 'Filter'"
              @click="showFilter = true"
            />

            <AppButton
              icon="add"
              size="sm"
              class="flex-shrink-0"
              :label="isMobile ? '' : 'Add Popup'"
              @click="
                () => {
                  selectedPopup = null
                  openCreate = true
                }
              "
            />
          </div>
        </div>

        <DataTable
          :data="popupEvents?.results ?? []"
          :columns="POPUP_COLUMN"
          :show-pagination="true"
          fix-last-column
          :loading="isPending || isFetching"
          @row-click="(item) => $router.push(`/popups/${item.uid}`)"
        >
          <template #cell:items_sold_count="{ item }">
            <div class="flex items-center gap-2 text-xs">
              <div class="h-1.5 w-16 rounded-full bg-gray-200">
                <div
                  class="bg-primary-600 h-1.5 rounded-full"
                  :style="`width: ${((item.items_sold_count || 0) / (item.products_count || 1)) * 100}%`"
                ></div>
              </div>
              <span class="flex flex-shrink-0 break-keep">
                {{
                  `${parseInt(String(((item.items_sold_count || 0) / (item.products_count || 1)) * 100))}%`
                }}
              </span>
            </div>
          </template>
          <template #cell:status="{ item }">
            <Chip
              :label="getEventStatus(item)"
              size="sm"
              class="capitalize"
              show-dot
              :color="
                getEventStatus(item) === 'upcoming'
                  ? 'primary'
                  : getEventStatus(item) === 'ongoing'
                    ? 'success'
                    : 'alt'
              "
            />
          </template>
          <template #cell:name="{ item }">
            <div class="flex items-center gap-1">
              <span class="max-w-xs truncate font-medium">
                {{ item.organizer_event_name || item.name }}
              </span>
              <Chip
                v-if="item.organizer_event_name"
                label="Eventful"
                size="sm"
                class="flex-shrink-0"
              />
            </div>
          </template>
          <template #cell:action="{ item }">
            <div class="flex justify-end gap-3">
              <Icon
                v-if="getEventStatus(item) !== 'ended'"
                name="edit"
                @click.stop="handleAction('edit', item)"
              />
              <Icon name="trash" @click.stop="handleAction('delete', item)" />
            </div>
          </template>

          <template #mobile="{ item }">
            <PopupEventCard
              :event="item"
              @click="() => $router.push(`/popups/${item.uid}`)"
              @edit="() => handleAction('edit', item)"
              @delete="() => handleAction('delete', item)"
            />
          </template>
        </DataTable>
      </div>
    </section>

    <CreatePopupEventModal
      :open="openCreate"
      @close="
        () => {
          $router.replace({ name: 'Popups', query: {} })
          openCreate = false
          // Don't clear selectedPopup here if success modal is opening
          if (!openSuccess) {
            selectedPopup = null
          }
        }
      "
      :is-edit-mode="!!selectedPopup"
      :event="selectedPopup"
      @refresh="
        (popup) => {
          if (!selectedPopup) {
            selectedPopup = popup
            openSuccess = true
          }
          refetch()
        }
      "
    />

    <DeletePopupEvent
      v-if="selectedPopup"
      :open="openDelete"
      @close="openDelete = false"
      :event="selectedPopup"
      @refresh="refetch"
    />

    <PopupCreatedSuccessModal
      :popup="selectedPopup"
      :open="openSuccess"
      @close="
        () => {
          selectedPopup = null
          openSuccess = false
        }
      "
    />
  </div>
</template>
