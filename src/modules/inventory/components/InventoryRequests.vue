<template>
  <!-- Empty State -->
  <EmptyState
    v-if="!isLoading && (!requestsData || requestsData.data.count === 0)"
    icon="inbox"
    title="No requests found"
    description="There are currently no inventory transfer requests."
  />

  <!-- Table Content -->
  <div v-else class="mt-4 space-y-4 rounded-xl border-gray-200 pt-3 md:mt-8 md:border md:bg-white">
    <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
      <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
        All Requests <Chip :label="String(requestsData?.data?.count || 0)" />
      </h3>
      <div class="flex items-center gap-2">
        <TextField
          left-icon="search-lg"
          size="md"
          class="flex-1"
          placeholder="Search by product name or category"
        />
        <AppButton
          icon="filter-lines"
          size="sm"
          color="alt"
          label="Filter"
          class="!hidden md:!inline-flex"
        />
        <AppButton icon="filter-lines" size="sm" color="alt" label="" class="md:hidden" />
      </div>
    </div>

    <DataTable
      :columns="requestColumns"
      :data="requestsData?.data.results || []"
      :loading="isLoading"
      :enable-row-selection="true"
      :server-pagination="true"
      :show-pagination="true"
      :current-page="currentPage"
      :items-per-page="pageSize"
      :total-page-count="Math.ceil((requestsData?.data.count || 0) / pageSize)"
      :total-items-count="requestsData?.data.count || 0"
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
import { ref } from "vue"
import DataTable, { type TableColumn } from "@components/DataTable.vue"
import Chip from "@components/Chip.vue"
import EmptyState from "@components/EmptyState.vue"
import { useGetTransferRequests } from "../api"
import type { IInventoryTransferRequest, TTransferRequestStatus } from "../types"
import { formatDate as projectFormatDate } from "@/utils/formatDate"
import ProductAvatar from "@components/ProductAvatar.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import InventoryRequestCard from "./InventoryRequestCard.vue"

interface Emits {
  /** Emitted when a request row is clicked */
  "request-click": [request: IInventoryTransferRequest]
}

const emit = defineEmits<Emits>()

// State
const currentPage = ref(1)
const pageSize = ref(20)

// Computed params for API
// const requestParams = computed(() => ({
//   limit: pageSize.value,
//   offset: (currentPage.value - 1) * pageSize.value,
//   type: "request", // Only fetch requests, not direct transfers
// }))

// API Query
const { data: requestsData, isPending: isLoading } = useGetTransferRequests()

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
