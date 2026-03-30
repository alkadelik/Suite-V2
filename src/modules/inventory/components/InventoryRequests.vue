<template>
  <!-- Table Content -->
  <div class="mt-4 space-y-4 rounded-xl border-gray-200 pt-3 md:mt-8 md:border md:bg-white">
    <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
      <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
        All Requests <Chip :label="String(requestsData?.data?.count || 0)" />
      </h3>
      <div class="flex items-center gap-2">
        <TextField
          v-model="search"
          left-icon="search-lg"
          size="md"
          class="flex-1"
          placeholder="Search by product name or location"
        />
        <AppButton
          icon="filter-lines"
          size="sm"
          :color="activeFilterCount ? 'primary' : 'alt'"
          :variant="activeFilterCount ? 'outlined' : 'filled'"
          label="Filter"
          :badge="activeFilterCount || undefined"
          class="!hidden md:!inline-flex"
          @click="showFilter = true"
        />
        <AppButton
          icon="filter-lines"
          size="sm"
          :color="activeFilterCount ? 'primary' : 'alt'"
          :variant="activeFilterCount ? 'outlined' : 'filled'"
          label=""
          :badge="activeFilterCount || undefined"
          class="md:hidden"
          @click="showFilter = true"
        />
      </div>
    </div>

    <ListFilterDrawer
      v-model="showFilter"
      :filter-groups="filterGroups"
      @apply="handleApplyFilters"
    />

    <!-- Empty State: Only when no results AND no search/filters active -->
    <EmptyState
      v-if="!isLoading && requestsData?.data.count === 0 && !hasActiveFilters"
      icon="inbox"
      title="No requests found"
      description="There are currently no inventory transfer requests."
    />

    <DataTable
      v-else
      :columns="requestColumns"
      :data="requestsData?.data.results || []"
      :loading="isLoading"
      :server-pagination="true"
      :show-pagination="true"
      :current-page="currentPage"
      :items-per-page="pageSize"
      :total-page-count="Math.ceil((requestsData?.data.count || 0) / pageSize)"
      :total-items-count="requestsData?.data.count || 0"
      :empty-state="{
        icon: 'inbox',
        title: 'No results match this filter',
        description: 'Try adjusting or clearing your filters.',
        actionLabel: 'Clear Filter',
        actionIcon: 'x-close',
      }"
      @empty-action="clearFilters"
      @row-click="handleRequestClick"
      @pagination-change="handlePaginationChange"
    >
      <!-- Custom cell templates -->
      <template #cell:item="{ item }">
        <div class="flex flex-col">
          <ProductAvatar :name="item.variant_name" />
        </div>
      </template>

      <template #cell:stock="{ item }">
        <p class="text-core-800 text-sm font-semibold">{{ item.quantity }}</p>
      </template>

      <template #cell:requested_by="{ item }">
        <div class="flex flex-col">
          <p class="text-core-800 text-sm font-medium">{{ item.from_location_name }}</p>
        </div>
      </template>

      <template #cell:request_date="{ item }">
        <p class="text-core-700 text-sm">{{ formatDate(item.created_at) }}</p>
      </template>

      <template #cell:status="{ item }">
        <Chip
          :label="getStatusLabel(item.status)"
          :color="getStatusColor(item.status)"
          :show-dot="true"
          size="sm"
        />
      </template>

      <template #mobile="{ item }">
        <InventoryRequestCard
          :request="item"
          :format-date="formatDate"
          :get-status-label="getStatusLabel"
          :get-status-color="getStatusColor"
          @click="handleRequestClick"
        />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import DataTable, { type TableColumn } from "@components/DataTable.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import ListFilterDrawer from "@components/ListFilterDrawer.vue"
import { useGetTransferRequests } from "../api"
import type { IInventoryTransferRequest, TTransferRequestStatus } from "../types"
import type { FilterGroup } from "@components/ListFilterDrawer.vue"
import { formatDate as projectFormatDate } from "@/utils/formatDate"
import ProductAvatar from "@components/ProductAvatar.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import InventoryRequestCard from "./InventoryRequestCard.vue"
import { useDebouncedRef } from "@/composables/useDebouncedRef"

interface Emits {
  /** Emitted when a request row is clicked */
  "request-click": [request: IInventoryTransferRequest]
}

const emit = defineEmits<Emits>()

// State
const currentPage = ref(1)
const pageSize = ref(20)
const search = ref("")
const debouncedSearch = useDebouncedRef(search, 750)
const showFilter = ref(false)
const activeFilters = ref<Record<string, string | null>>({})

const filterGroups: FilterGroup[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "pending", label: "Pending", color: "warning", showDot: true },
      { value: "approved", label: "Approved", color: "success", showDot: true },
      { value: "rejected", label: "Rejected", color: "error", showDot: true },
      { value: "cancelled", label: "Cancelled", color: "error", showDot: true },
    ],
  },
  {
    key: "type",
    label: "Type",
    options: [
      { value: "request", label: "Request" },
      { value: "direct", label: "Direct Transfer" },
    ],
  },
  {
    key: "date_range",
    label: "Date Range",
    type: "date-range",
    startKey: "created_at_after",
    endKey: "created_at_before",
  },
]

const activeFilterCount = computed(() => {
  return Object.values(activeFilters.value).filter((v) => v !== null && v !== undefined).length
})

const hasActiveFilters = computed(() => {
  return !!debouncedSearch.value || activeFilterCount.value > 0
})

const handleApplyFilters = (filters: Record<string, string | null>) => {
  activeFilters.value = filters
  currentPage.value = 1
}

const clearFilters = () => {
  activeFilters.value = {}
  search.value = ""
  currentPage.value = 1
}

const requestParams = computed(() => {
  const params: Record<string, string | number> = {
    limit: pageSize.value,
    offset: (currentPage.value - 1) * pageSize.value,
  }
  if (debouncedSearch.value) params.search = debouncedSearch.value
  if (activeFilters.value.status) params.status = activeFilters.value.status
  if (activeFilters.value.type) params.type = activeFilters.value.type
  if (activeFilters.value.created_at_after)
    params.created_at_after = activeFilters.value.created_at_after
  if (activeFilters.value.created_at_before)
    params.created_at_before = activeFilters.value.created_at_before
  return params
})

const { data: requestsData, isPending: isLoading } = useGetTransferRequests(requestParams)

// Table columns configuration
const requestColumns: TableColumn<IInventoryTransferRequest>[] = [
  { header: "Item", accessor: "item" },
  { header: "Stock", accessor: "stock" },
  { header: "Requested By", accessor: "requested_by" },
  { header: "Request Date", accessor: "request_date" },
  { header: "Status", accessor: "status" },
]

/**
 * Format date using project utility
 */
const formatDate = (dateString: string): string => {
  try {
    return projectFormatDate(dateString)
  } catch {
    return dateString
  }
}

/**
 * Get status label for display
 */
const getStatusLabel = (status: TTransferRequestStatus): string => {
  const labels: Record<TTransferRequestStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    fulfilled: "Fulfilled",
  }
  return labels[status] || status
}

/**
 * Get status color for chip
 */
const getStatusColor = (
  status: TTransferRequestStatus,
): "warning" | "error" | "success" | "primary" => {
  const colors: Record<TTransferRequestStatus, "warning" | "error" | "success" | "primary"> = {
    pending: "warning",
    rejected: "error",
    approved: "success",
    fulfilled: "primary",
  }
  return colors[status] || "primary"
}

/**
 * Handle request row click
 */
const handleRequestClick = (request: IInventoryTransferRequest) => {
  emit("request-click", request)
}

/**
 * Handle pagination change
 */
const handlePaginationChange = (params: { currentPage: number; itemsPerPage: number }) => {
  currentPage.value = params.currentPage
  pageSize.value = params.itemsPerPage
}
</script>
