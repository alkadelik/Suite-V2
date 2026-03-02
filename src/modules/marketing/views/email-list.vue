<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import Chip from "@components/Chip.vue"
import DataTable from "@components/DataTable.vue"
import EmptyState from "@components/EmptyState.vue"
import Icon from "@components/Icon.vue"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import TextField from "@components/form/TextField.vue"
import ExportSubscriberModal from "../components/ExportSubscriberModal.vue"
import { ref, computed } from "vue"
import { useMediaQuery } from "@vueuse/core"
import type { TableColumn } from "@components/DataTable.vue"
import type { ISubscriber } from "../types"
import { useGetSubscribers } from "../api"
import { useDebouncedRef } from "@/composables/useDebouncedRef"

const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)
const showFilter = ref(false)
const showExportModal = ref(false)
const isMobile = useMediaQuery("(max-width: 1024px)")
const page = ref(1)
const itemsPerPage = ref(10)

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})

const { data: subscribers, isPending, isFetching } = useGetSubscribers(computedParams)

const columns: TableColumn<ISubscriber>[] = [
  { header: "Email Address", accessor: "email" },
  { header: "Sign-up Date", accessor: "created_at" },
  { header: "Source", accessor: "source" },
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

const handleExport = () => {
  showExportModal.value = true
}
</script>

<template>
  <div class="px-6 pt-5 pb-6">
    <PageHeader title="Email List" :count="subscribers?.count" count-label="subscribers" />

    <div class="flex flex-col gap-8">
      <div class="hidden lg:block">
        <SectionHeader
          title="Email List"
          subtitle="See everyone who has opted in to receive your newsletters or on your waitlist."
        />
      </div>

      <EmptyState
        v-if="!subscribers?.results?.length && !debouncedSearch && !isPending"
        title="No subscribers yet"
        description="When customers opt in to receive your newsletters or join your waitlist, they'll appear here."
      >
        <template #image>
          <div
            class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100"
          >
            <Icon name="sms" size="48" class="text-gray-400" />
          </div>
        </template>
      </EmptyState>

      <section v-else class="flex flex-col gap-5 lg:gap-8">
        <div
          class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
        >
          <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
            <h3 class="mb-2 hidden items-center gap-1 text-lg font-semibold md:mb-0 lg:flex">
              All Subscribers
              <Chip v-if="subscribers?.count" :label="String(subscribers.count)" />
            </h3>
            <div class="flex items-center gap-2">
              <TextField
                left-icon="search-lg"
                size="sm"
                class="w-full md:min-w-64"
                placeholder="Search by email"
                v-model="searchQuery"
              />

              <AppButton
                icon="filter-lines"
                size="sm"
                color="alt"
                class="flex-shrink-0"
                :label="isMobile ? '' : 'Filter'"
                @click="showFilter = true"
              />

              <AppButton
                icon="upload-cloud-02"
                size="sm"
                class="flex-shrink-0"
                variant="outlined"
                :label="isMobile ? '' : 'Export List'"
                @click="handleExport"
              />
            </div>
          </div>

          <DataTable
            :data="subscribers?.results ?? []"
            :columns="columns"
            :loading="isFetching"
            :enable-row-selection="true"
            :empty-state="{
              title: 'No Subscribers Found',
              description: searchQuery
                ? 'Try adjusting your search query'
                : 'When customers opt in to receive your newsletters or join your waitlist, they will appear here.',
            }"
            :show-pagination="true"
            :items-per-page="itemsPerPage"
            :total-items-count="subscribers?.count || 0"
            :total-page-count="Math.ceil((subscribers?.count || 0) / itemsPerPage) || 1"
            :server-pagination="true"
            @pagination-change="(d) => (page = d.currentPage)"
          >
            <template #cell:email="{ item }">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100"
                >
                  <Icon name="sms-filled" size="20" class="text-gray-500" />
                </div>
                <span class="text-sm font-medium">{{ item.email }}</span>
              </div>
            </template>

            <template #cell:created_at="{ item }">
              <span class="text-sm text-gray-600">{{ formatDate(item.created_at) }}</span>
            </template>

            <template #cell:source="{ item }">
              <Chip
                :label="item.source === 'newsletter' ? 'Newsletter' : 'Waitlist'"
                :color="item.source === 'newsletter' ? 'blue' : 'purple'"
                :icon="item.source === 'newsletter' ? 'global' : 'shop'"
              />
            </template>

            <!-- Mobile View -->
            <template #mobile="{ item }">
              <div class="border-primary-200 rounded-xl border">
                <div class="bg-primary-50 flex items-center gap-2.5 rounded-t-xl p-3">
                  <span
                    class="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Icon name="sms" size="20" class="text-primary-700" />
                  </span>
                  <span class="!font-outfit flex-1 truncate text-sm font-medium">
                    {{ item.email }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-4">
                  <div>
                    <p class="text-sm font-medium">{{ formatDate(item.created_at) }}</p>
                    <p class="text-core-600 text-xs">Sign-up Date</p>
                  </div>
                  <Chip
                    :label="item.source === 'newsletter' ? 'Newsletter' : 'Waitlist'"
                    :color="item.source === 'newsletter' ? 'blue' : 'purple'"
                    :icon="item.source === 'newsletter' ? 'global' : 'shop'"
                    size="sm"
                  />
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </section>
    </div>
  </div>

  <ExportSubscriberModal v-model="showExportModal" />
</template>
