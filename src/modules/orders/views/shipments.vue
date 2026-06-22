<script setup lang="ts">
import Tabs from "@components/Tabs.vue"
import { computed, ref } from "vue"
import { useMediaQuery } from "@vueuse/core"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { ORDER_SHIPMENT_COLUMNS, SAMPLE_SHIPMENTS } from "../constants"
import { startCase } from "@/utils/format-strings"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import TextField from "@components/form/TextField.vue"
import { toast } from "@/composables/useToast"
import ShipmentCard from "../components/shipments/ShipmentCard.vue"
import { TShipment } from "../types.ts"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"

const pageTabs = [
  { title: "ShipBubble", key: "shipbubble" },
  { title: "Manual", key: "manual" },
  { title: "Pickup", key: "pickup" },
]
const activeTab = ref("shipbubble")

const isMobile = computed(() => useMediaQuery("(max-width: 768px)").value)

const page = ref(1)
const itemsPerPage = ref(10)
const showFilter = ref(false)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)
const activeFilters = ref<Record<string, string>>({})

const activeFilterCount = computed(() => Object.keys(activeFilters.value).length)

// const handleApplyFilters = (filters: Record<string, string>) => {
//   activeFilters.value = filters
//   page.value = 1
// }

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((debouncedSearch.value ? 0 : page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  Object.assign(params, activeFilters.value)
  return params
})
console.log("params", computedParams.value)

const selectedShipment = ref()

const shipments = {
  count: 0,
  results: [],
}

const getActionItems = (item: TShipment) => {
  return [
    {
      label: `View details`,
      icon: "eye",
      action: () => toast.info("Viewing", { title: item.status }),
    },
    {
      label: `Fulfil order (shipment)`,
      icon: "copy",
      action: () => toast.info("fulfilling"),
    },
  ]
}
</script>

<template>
  <div class="space-y-8 px-3 pb-6 lg:pt-6">
    <PageHeader v-if="isMobile" title="Shipments" :count="0" />
    <SectionHeader v-else title="Shipments" subtitle="Manage all your shipment types" />

    <Tabs v-model="activeTab" :tabs="pageTabs" class="max-w-md" />

    <div
      class="mt-4 space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
    >
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          {{ startCase(activeTab) + " shipments" }}
          <Chip v-if="shipments?.count" :label="shipments?.count" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="sm"
            class="w-full md:min-w-64"
            placeholder="Search by customer or order"
            v-model="searchQuery"
          />

          <AppButton
            icon="filter-lines"
            size="sm"
            color="alt"
            class="relative flex-shrink-0"
            :label="isMobile ? '' : 'Filter'"
            :badge="activeFilterCount ? activeFilterCount : ''"
            @click="showFilter = true"
          />
        </div>
      </div>

      <DataTable
        :data="SAMPLE_SHIPMENTS ?? []"
        :columns="ORDER_SHIPMENT_COLUMNS"
        :loading="false"
        :show-pagination="true"
        :items-per-page="itemsPerPage"
        :total-items-count="shipments?.count || 0"
        :total-page-count="Math.ceil((shipments?.count || 0) / itemsPerPage) || 1"
        :server-pagination="true"
        @pagination-change="(d) => (page = d.currentPage)"
        :empty-state="{
          title: `No ${startCase(activeTab)} Shipment Found`,
          description:
            searchQuery || activeFilterCount
              ? 'Try adjusting your filters or search query'
              : `You don't have any ${activeTab} shipment yet. Create an order with ${activeTab} to get started.`,
        }"
      >
        <template #cell:courier="{ item }">
          <div class="flex items-center gap-2">
            <img
              v-if="item.courier.image_url"
              :src="item.courier.image_url"
              class="size-10 rounded-md border border-gray-200 p-1"
              :alt="item.courier.name"
            />
            <span v-else class="bg-core-200 flex size-10 items-center justify-center rounded-lg">
              <Icon name="truck-fast" size="20" class="text-cor600" />
            </span>
            <span>{{ item.courier.name }}</span>

            <span>{{ item?.courier?.name }}</span>
          </div>
        </template>

        <template #cell:status="{ item }">
          <Chip :label="startCase(item.status)" icon="truck-fast-outline" />
        </template>

        <template #cell:actions="{ item }">
          <DropdownMenu :items="getActionItems(item)" @toggle="selectedShipment = item" />
        </template>

        <template #mobile="{ item }">
          <ShipmentCard :item="item" @toggle="selectedShipment = item" />
        </template>
      </DataTable>
    </div>
  </div>
</template>
