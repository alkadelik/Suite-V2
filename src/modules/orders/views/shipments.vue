<script setup lang="ts">
import Tabs from "@components/Tabs.vue"
import { computed, ref, watch } from "vue"
import { useMediaQuery } from "@vueuse/core"
import PageHeader from "@components/PageHeader.vue"
import SectionHeader from "@components/SectionHeader.vue"
import {
  SHIPBUBBLE_SHIPMENT_COLUMNS,
  MANUAL_SHIPMENT_COLUMNS,
  PICKUP_SHIPMENT_COLUMNS,
  SHIPMENT_STATUS_COLORS,
} from "../constants"
import { startCase } from "@/utils/format-strings"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import DataTable from "@components/DataTable.vue"
import AppButton from "@components/AppButton.vue"
import TextField from "@components/form/TextField.vue"
import { toast } from "@/composables/useToast"
import ShipmentCard from "../components/shipments/ShipmentCard.vue"
import ShipmentFiltersDrawer from "../components/shipments/ShipmentFiltersDrawer.vue"
import ShipmentDetailsDrawer from "../components/shipments/ShipmentDetailsDrawer.vue"
import CreateShipmentDrawer from "../components/shipments/CreateShipmentDrawer.vue"
import FulfilOrderModal from "../components/FulfilOrderModal.vue"
import { TShipmentRow } from "../types"
import { useGetOrders, useGetShipments } from "../api"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import type { TChipColor } from "@modules/shared/types"
import { useQueryClient } from "@tanstack/vue-query"
import { useRouter } from "vue-router"

const pageTabs = [
  { title: "ShipBubble", key: "shipbubble" },
  { title: "Manual", key: "manual" },
  { title: "Pickups", key: "pickup" },
]
const activeTab = ref("shipbubble")

const isMobile = useMediaQuery("(max-width: 768px)")
const queryClient = useQueryClient()

const page = ref(1)
const itemsPerPage = ref(10)
const showFilter = ref(false)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)
const activeFilters = ref<Record<string, string>>({})

const activeFilterCount = computed(() => Object.keys(activeFilters.value).length)

const handleApplyFilters = (filters: Record<string, string>) => {
  activeFilters.value = filters
  page.value = 1
}

// Switching tabs restarts pagination and drops filters (status only applies to ShipBubble)
watch(activeTab, () => {
  page.value = 1
  activeFilters.value = {}
})

const paginationParams = computed(() => ({
  offset: ((debouncedSearch.value ? 0 : page.value - 1) * itemsPerPage.value).toString(),
  limit: itemsPerPage.value.toString(),
}))

const isShipbubbleTab = computed(() => activeTab.value === "shipbubble")

const shipmentParams = computed(() => {
  const params: Record<string, string> = { ...paginationParams.value }
  if (debouncedSearch.value) params.search = debouncedSearch.value
  Object.assign(params, activeFilters.value)
  return params
})

const orderParams = computed(() => {
  const params: Record<string, string> = {
    ...paginationParams.value,
    fulfilment_status: "unfulfilled",
    fulfilment_method: activeTab.value === "pickup" ? "pickup" : "delivery",
    ...(activeTab.value === "manual" ? { delivery_method: "custom" } : {}),
  }
  if (debouncedSearch.value) params.search = debouncedSearch.value
  return params
})

const {
  data: shipments,
  isFetching: isFetchingShipments,
  refetch: refetchShipments,
} = useGetShipments(shipmentParams, isShipbubbleTab)

const {
  data: orders,
  isFetching: isFetchingOrders,
  refetch: refetchOrders,
} = useGetOrders(orderParams, () => !isShipbubbleTab.value)

const isFetching = computed(() =>
  isShipbubbleTab.value ? isFetchingShipments.value : isFetchingOrders.value,
)

const totalCount = computed(() =>
  isShipbubbleTab.value ? shipments.value?.count || 0 : orders.value?.count || 0,
)

// Normalize both sources into a single row shape so all tabs share one table
const rows = computed<TShipmentRow[]>(() => {
  if (isShipbubbleTab.value) {
    return (shipments.value?.results ?? []).map((shipment) => ({
      uid: shipment.uid,
      order_number: shipment.order?.order_number || "-",
      customer_name: shipment.order?.customer_name || "Unknown Anonymous",
      courier: shipment.courier || null,
      fee: shipment.total_shipping_cost,
      amount: shipment.order?.total_amount ?? 0,
      date: shipment.delivery_estimate || shipment.created_at,
      status: shipment.status,
      order: shipment.order,
      shipment,
    }))
  }

  return (orders.value?.results ?? []).map((order) => ({
    uid: order.uid,
    order_number: order.order_number,
    customer_name: order.customer_name || "Unknown Anonymous",
    courier: order.courier_name ? { name: order.courier_name } : null,
    fee: order.delivery_fee,
    amount: order.total_amount,
    date: order.order_date || order.created_at,
    status: order.fulfilment_status,
    order,
    shipment: null,
  }))
})

const columns = computed(() => {
  if (activeTab.value === "shipbubble") return SHIPBUBBLE_SHIPMENT_COLUMNS
  if (activeTab.value === "manual") return MANUAL_SHIPMENT_COLUMNS
  return PICKUP_SHIPMENT_COLUMNS
})

const statusColor = (status: string): TChipColor => SHIPMENT_STATUS_COLORS[status] ?? "primary"

const selectedShipment = ref<TShipmentRow | null>(null)
const openFulfil = ref(false)
const openDetails = ref(false)
const openCreate = ref(false)

const createShipment = (item: TShipmentRow) => {
  selectedShipment.value = item
  openDetails.value = false
  openCreate.value = true
}

const router = useRouter()

const viewDetails = (item: TShipmentRow) => {
  selectedShipment.value = item
  openDetails.value = true
}

const viewOrder = (item: TShipmentRow) => {
  router.push({ name: "Orders", query: { order_id: item.order.uid } })
}

const openExternalLink = (url: string | null | undefined, missingMessage: string) => {
  if (!url) {
    toast.info(missingMessage)
    return
  }
  window.open(url, "_blank", "noopener")
}

const getActionItems = (item: TShipmentRow) => {
  const viewAction = {
    label: "View details",
    icon: "eye",
    action: () => viewDetails(item),
  }

  if (item.shipment) {
    return [
      viewAction,
      {
        label: "Track shipment",
        icon: "truck-fast-outline",
        action: () =>
          openExternalLink(item.shipment?.tracking_url, "No tracking link for this shipment yet"),
      },
      {
        label: "View waybill",
        icon: "note-2",
        action: () =>
          openExternalLink(
            item.shipment?.waybill_document_url,
            "No waybill document for this shipment yet",
          ),
      },
    ]
  }

  return [
    viewAction,
    {
      label: "Fulfill order (shipment)",
      icon: "box",
      action: () => {
        selectedShipment.value = item
        openFulfil.value = true
      },
    },
  ]
}

const handleRefresh = () => {
  // Fulfilling removes the order from every unfulfilled list, so invalidate all
  // orders queries (other tabs/pages share the ["orders", params] prefix)
  queryClient.invalidateQueries({ queryKey: ["orders"] })
  if (isShipbubbleTab.value) refetchShipments()
  else refetchOrders()
}

const emptyStateDescription = computed(() => {
  if (searchQuery.value || activeFilterCount.value) {
    return "Try adjusting your filters or search query"
  }
  if (activeTab.value === "shipbubble") {
    return "You don't have any ShipBubble shipment yet. Create a delivery order with ShipBubble to get started."
  }
  if (activeTab.value === "manual") {
    return "You don't have any unfulfilled manual delivery. Orders with manual delivery will appear here."
  }
  return "You don't have any unfulfilled pickup order. Pickup orders will appear here."
})
</script>

<template>
  <div class="space-y-6 px-3 pb-6 lg:pt-6">
    <PageHeader v-if="isMobile" title="Shipments" :count="totalCount" />
    <SectionHeader v-else title="Shipments" subtitle="Manage all your shipment types" />

    <Tabs v-model="activeTab" :tabs="pageTabs" class="max-w-md" />

    <div class="mt-4 space-y-4 overflow-hidden rounded-xl border-gray-200 md:border md:bg-white">
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          {{ pageTabs.find((tab) => tab.key === activeTab)?.title }}
          {{ activeTab === "pickup" ? "" : "deliveries" }}
          <Chip v-if="totalCount" :label="totalCount" />
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
            v-if="isShipbubbleTab"
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
        :key="activeTab"
        :data="rows"
        :columns="columns"
        :loading="isFetching"
        :show-pagination="true"
        :items-per-page="itemsPerPage"
        :total-items-count="totalCount"
        :total-page-count="Math.ceil(totalCount / itemsPerPage) || 1"
        :server-pagination="true"
        @pagination-change="(d) => (page = d.currentPage)"
        @row-click="viewDetails"
        :empty-state="{
          // title: `No ${startCase(activeTab)} ${activeTab === 'pickup' ? 'Order' : 'Shipment'} Found`,
          description: emptyStateDescription,
        }"
      >
        <template #cell:courier_name="{ item }">
          <div class="flex items-center gap-2">
            <img
              v-if="item.courier?.courier_image"
              :src="item.courier.courier_image"
              alt="Courier"
              class="size-10 rounded-lg object-cover"
            />
            <span v-else class="bg-core-200 flex size-10 items-center justify-center rounded-lg">
              <Icon name="truck-fast" size="20" class="text-core-600" />
            </span>
            <span>{{ item.courier?.courier_name || item.courier?.name || "-" }}</span>
          </div>
        </template>

        <template #cell:status="{ item }">
          <Chip
            v-if="item.status"
            :label="startCase(item.status)"
            icon="truck-fast-outline"
            :color="statusColor(item.status)"
          />
          <span v-else>--</span>
        </template>

        <template #cell:actions="{ item }">
          <DropdownMenu :items="getActionItems(item)" @toggle="selectedShipment = item" />
        </template>

        <template #mobile="{ item }">
          <ShipmentCard
            :item="item"
            :actions="getActionItems(item)"
            :status-color="statusColor(item.status)"
            @toggle="selectedShipment = item"
          />
        </template>
      </DataTable>
    </div>

    <ShipmentFiltersDrawer
      :open="showFilter"
      @close="showFilter = false"
      @apply="handleApplyFilters"
    />

    <ShipmentDetailsDrawer
      v-if="selectedShipment"
      :open="openDetails"
      :item="selectedShipment"
      @close="openDetails = false"
      @refresh="handleRefresh"
      @view-order="viewOrder(selectedShipment)"
      @create-shipment="createShipment(selectedShipment)"
      @fulfil="
        () => {
          openDetails = false
          openFulfil = true
        }
      "
    />

    <CreateShipmentDrawer
      v-if="selectedShipment"
      :open="openCreate"
      :item="selectedShipment"
      @close="openCreate = false"
      @refresh="handleRefresh"
    />

    <FulfilOrderModal
      v-if="selectedShipment"
      :open="openFulfil"
      :order-id="selectedShipment.order.uid"
      :items="selectedShipment.order.items || []"
      @close="openFulfil = false"
      @refresh="handleRefresh"
    />
  </div>
</template>
