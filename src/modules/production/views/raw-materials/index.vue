<script setup lang="ts">
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import StatCard from "@components/StatCard.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { useGetRawMaterials, useGetRawMaterialsStats } from "../../api"
import { truncateCurrency } from "@/utils/format-currency"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import EmptyState from "@components/EmptyState.vue"
import { MOCK_MATERIALS, RAW_MATERIALS_COLUMN } from "../../constants"
import DataTable from "@components/DataTable.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { TRawMaterial } from "../../types"
import RawMaterialCard from "../../components/RawMaterialCard.vue"
import SelectComponentName from "../../components/SelectComponentName.vue"
import { useProductionStore } from "../../store"
import AppButton from "@components/AppButton.vue"
import TextField from "@components/form/TextField.vue"
import AddRawMaterialDrawer from "@modules/production/components/AddRawMaterialDrawer.vue"

const isMobile = computed(() => useMediaQuery("(max-width: 1024px)").value)

const showFilter = ref(false)
const showAddDrawer = ref(false)
const page = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})

const { data: rawMaterials, isPending, isFetching } = useGetRawMaterials(computedParams)
const { data: stats } = useGetRawMaterialsStats()

const materialStats = computed(() => [
  ...(isMobile.value
    ? []
    : [
        {
          label: `Total ${selectedComponent.value?.label || "Materials"}`,
          value: stats.value?.total || 0,
          icon: "bag",
          iconClass: "lg:text-gray-700",
        },
      ]),
  {
    label: "Low Stock",
    value: stats.value?.low_stock || 0,
    icon: "bag",
    iconClass: "lg:text-gray-700",
  },
  {
    label: "Expiring Soon",
    value: stats.value?.expiring_soon || 0,
    icon: "bag",
    iconClass: "lg:text-gray-700",
    chip: stats.value?.expiring_soon
      ? `Worth ${truncateCurrency(stats.value?.expiring_soon_amount || 0)}`
      : undefined,
    chipColor: "pink",
  },
  ...(isMobile.value
    ? []
    : [
        {
          label: "Inventory Value",
          value: truncateCurrency(stats.value?.inventory_value || 0),
          icon: "bag",
          iconClass: "lg:text-gray-700",
        },
      ]),
])

const getActionItems = (item: TRawMaterial) => [
  {
    label: "Edit material",
    icon: "edit",
    action: () => {
      console.log("edit", item)
    },
  },
  {
    label: "Adjust stock",
    icon: "box",
    action: () => {},
  },
  {
    label: "View usage",
    icon: "eye",
    action: () => {},
  },
]

const selectedComponent = computed(() => useProductionStore().selectedComponentOption)

const onSelect = (option: { label: string; value: string }) => {
  useProductionStore().setSelectedComponentOption(option)
}
</script>

<template>
  <div class="px-3 pb-6">
    <PageHeader
      v-if="isMobile"
      :title="selectedComponent?.label || 'Raw Materials'"
      :count="rawMaterials?.count || 100"
    />
    <SectionHeader
      v-else
      :title="selectedComponent?.label || 'Raw Materials'"
      :subtitle="`Manage and organize your ${selectedComponent?.value?.toLowerCase() || 'materials'} efficiently.`"
    />
    <div class="mt-6" />

    <SelectComponentName v-if="!selectedComponent" @select="onSelect" />

    <div v-else class="flex flex-col gap-8">
      <EmptyState
        v-if="isPending && !rawMaterials?.count"
        :title="`You don't have any ${selectedComponent.label.toLowerCase()} yet!`"
        :description="`Start tracking everything you use to make your products by adding your ${selectedComponent.value}.`"
        :action-label="`Add ${selectedComponent.value}`"
        :loading="isPending"
        action-icon="add"
        @action="() => (showAddDrawer = true)"
      >
        <template #image>
          <img src="@/assets/images/empty-material.svg?url" class="mx-auto mb-4" />
        </template>
      </EmptyState>

      <section v-else class="flex flex-col gap-5 lg:gap-8">
        <div v-if="isMobile">
          <p class="text-core-600 mb-1 flex items-center gap-1 text-xs font-medium">
            <Icon name="tag" size="16" />
            Inventory Value
          </p>
          <p class="text-4xl font-semibold">
            {{ truncateCurrency(stats?.inventory_value || 2400000) }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard v-for="item in materialStats" :key="item.label" :stat="item" />
        </div>

        <div
          class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
        >
          <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
            <h3 class="mb-2 hidden items-center gap-1 text-lg font-semibold md:mb-0 lg:flex">
              {{ "All " + selectedComponent.label }}
              <Chip v-if="rawMaterials?.count" :label="rawMaterials?.count" />
            </h3>
            <div class="flex items-center gap-2">
              <TextField
                left-icon="search-lg"
                size="sm"
                class="w-full md:min-w-64"
                placeholder="Search by name"
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
                icon="add"
                size="sm"
                class="flex-shrink-0"
                :label="isMobile ? '' : `Add ${selectedComponent.value}`"
                @click="() => (showAddDrawer = true)"
              />
            </div>
          </div>

          <DataTable
            :data="rawMaterials?.results ?? MOCK_MATERIALS ?? []"
            :columns="RAW_MATERIALS_COLUMN"
            :loading="isFetching"
            :enable-row-selection="false"
            :empty-state="{
              title: `No ${selectedComponent.label} Found`,
              description: searchQuery
                ? 'Try adjusting your filters or search query'
                : `Start tracking everything you use to make your products by adding your ${selectedComponent.value}.`,
            }"
            :show-pagination="true"
            :items-per-page="itemsPerPage"
            :total-items-count="rawMaterials?.count || 0"
            :total-page-count="Math.ceil((rawMaterials?.count || 0) / itemsPerPage) || 1"
            :server-pagination="true"
            @pagination-change="(d) => (page = d.currentPage)"
            @row-click="(row) => $router.push(`/raw-materials/${row.uid}`)"
          >
            <template #cell:name="{ item }">
              <div class="flex max-w-48 items-center gap-2 truncate">
                <span
                  class="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100"
                >
                  <Icon name="shop" :size="24" class="text-core-800" />
                </span>
                <h4 class="!font-outfit truncate text-left text-sm font-medium capitalize">
                  {{ item.name }}
                </h4>
                <Icon
                  v-if="item.low_stock || item.expired"
                  name="danger"
                  :class="item.expired ? 'text-error-500' : 'text-warning-500'"
                />
                <Chip v-else-if="item.subassembly" color="purple" label="Sub-assembly" />
              </div>
            </template>

            <template #mobile="{ item }">
              <RawMaterialCard
                :material="item"
                @click="() => $router.push(`/raw-materials/${item.uid}`)"
                class="mb-4"
              />
            </template>
            <template #cell:actions="{ item }">
              <DropdownMenu :items="getActionItems(item)" />
            </template>
          </DataTable>
        </div>
      </section>
    </div>
    <!--  -->

    <AddRawMaterialDrawer :open="showAddDrawer" @close="showAddDrawer = false" />
  </div>
</template>
