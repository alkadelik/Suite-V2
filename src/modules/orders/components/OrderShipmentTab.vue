<!-- eslint-disable @typescript-eslint/no-explicit-any  -->
<script setup lang="ts">
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import { useGetShipments, useGetShipmentById, type TShipment } from "../shipments.api"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { ORDER_SHIPMENT_COLUMNS } from "../constants"
import DataTable from "@components/DataTable.vue"
import { startCase } from "@/utils/format-strings"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import OrderShipmentCard from "./OrderShipmentCard.vue"
import OrderShipmentDetailsDrawer from "./OrderShipmentDetailsDrawer.vue"
import {
  getStatus,
  getShipmentId,
  pickFirst,
  isRecord,
  UnknownRecord,
} from "../utilis/shipmentFormatters"

// IMPORTANT: use the API type (so TS matches everywhere)
type Shipment = TShipment

const openDetails = ref(false)
const selectedShipmentId = ref("")

const isMobile = useMediaQuery("(max-width: 768px)")
const searchQuery = ref("")

const page = ref(1)
const itemsPerPage = ref(10)
const debouncedSearch = useDebouncedRef(searchQuery, 500)

const params = computed(() => {
  const p: Record<string, string | number | boolean> = {}
  if (debouncedSearch.value) p.search = debouncedSearch.value
  p.limit = itemsPerPage.value
  p.offset = (page.value - 1) * itemsPerPage.value
  return p
})

const { data: shipments, isFetching } = useGetShipments(params)
const normalizedShipments = computed(() => {
  const rows = shipments.value?.results ?? []

  return rows.map((r) => {
    const x = r as Record<string, any>
    const order = x.order ?? {}

    return {
      ...x,

      // flatten nested fields so your columns can read them
      customer_name: x.customer_name ?? order.customer_name,
      delivery_fee: x.delivery_fee ?? order.delivery_fee ?? x.price,
      pickup_date: x.pickup_date ?? x.created_at ?? order.created_at,
      delivery_date: x.delivery_date ?? x.last_status_update,
      status: x.status ?? order.fulfilment_status,
    }
  })
})

const openDrawer = (row: Shipment) => {
  selectedShipmentId.value = getShipmentId(row)
  openDetails.value = true
}

const closeDrawer = () => {
  openDetails.value = false
  selectedShipmentId.value = ""
}

const { data: shipmentDetails, isFetching: isFetchingDetails } = useGetShipmentById(
  computed(() => selectedShipmentId.value),
)
const toText = (v: unknown, fallback = "--") => {
  if (v === null || v === undefined) return fallback
  if (typeof v === "string") {
    const s = v.trim()
    return s.length ? s : fallback
  }
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : fallback
  if (typeof v === "boolean" || typeof v === "bigint") return String(v)
  return fallback
}

const toNumber = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const cleaned = v.replace(/[₦,\s]/g, "").trim()
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

const toCardItem = (item: Shipment) => {
  const x = item as UnknownRecord
  const courier = isRecord(x.courier) ? x.courier : undefined

  const feeRaw = pickFirst(x, ["delivery_fee", "deliveryFee", "fee", "price", "shipping_fee"])
  const amount = toNumber(feeRaw)

  const customerNameRaw = pickFirst(x, ["customer_name", "customerName", "receiver_name"])
  const courierNameRaw = pickFirst({ ...(courier ?? {}), ...x }, [
    "name",
    "courier_name",
    "courierName",
  ])

  return {
    customer_name: toText(customerNameRaw, "--"),

    // pass number if possible, else "--" (card formatter will show "--")
    amount: amount ?? "--",
    currency: "NGN",

    courier_name: toText(courierNameRaw, "Courier"),
    courier_logo_url:
      courier && typeof courier.image_url === "string" && courier.image_url.trim().length
        ? courier.image_url
        : undefined,

    courier_rating: pickFirst({ ...(courier ?? {}), ...x }, ["rating", "courier_rating"]),
    courier_reviews_count: pickFirst({ ...(courier ?? {}), ...x }, [
      "reviews_count",
      "courier_reviews_count",
    ]),
    courier_quality_label: pickFirst({ ...(courier ?? {}), ...x }, [
      "quality_label",
      "courier_quality_label",
    ]),

    pickup_date: toText(pickFirst(x, ["pickup_date", "picked_up_date", "pickedUpDate"]), "-"),
    in_transit_date: toText(pickFirst(x, ["in_transit_date", "inTransitDate"]), "-"),
    arrived_date: toText(pickFirst(x, ["arrived_date", "arrivedDate"]), "-"),
    delivered_date: toText(pickFirst(x, ["delivered_date", "delivery_date", "deliveredDate"]), "-"),

    current_step: (getStatus(x) as any) || "pickup",
  }
}

declare const handleOpenCreate: () => void
</script>

<template>
  <div class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white">
    <div class="mb-4 flex flex-col justify-between md:flex-row md:items-center md:px-4">
      <h3 v-if="!isMobile" class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
        All Shipments
        <Chip :label="String(shipments?.count ?? 0)" />
      </h3>

      <div class="flex items-center gap-2">
        <TextField
          left-icon="search-lg"
          size="sm"
          class="w-full md:min-w-64"
          placeholder="Find by order or tracking ID"
          v-model="searchQuery"
        />
        <AppButton
          icon="add"
          size="sm"
          class="flex-shrink-0"
          :label="isMobile ? '' : 'Add Order'"
          @click="handleOpenCreate"
        />
      </div>
    </div>

    <DataTable
      :data="normalizedShipments"
      :columns="ORDER_SHIPMENT_COLUMNS"
      :loading="isFetching"
      :enable-row-selection="false"
      :empty-state="{
        title: 'No Shipment Found',
        description: `You haven't received any shipments. Once you start receiving shipments, they will appear here.`,
      }"
      :show-pagination="false"
      @row-click="(row) => openDrawer(row as Shipment)"
    >
      <template #cell:status="{ item }">
        <Chip
          :color="
            getStatus(item as UnknownRecord) === 'delivered'
              ? 'success'
              : ['in_transit', 'in transit'].includes(getStatus(item as UnknownRecord))
                ? 'warning'
                : getStatus(item as UnknownRecord)
                  ? 'error'
                  : 'alt'
          "
          :label="
            getStatus(item as UnknownRecord) ? startCase(getStatus(item as UnknownRecord)) : '--'
          "
          icon="truck-fast"
        />
      </template>

      <template #cell:courier="{ item }">
        <div class="flex items-center gap-2">
          <img
            v-if="item?.courier?.image_url"
            :src="item.courier.image_url"
            class="size-10 rounded-md border border-gray-200 p-1"
            :alt="String(item?.courier?.name ?? '')"
          />
          <span
            v-else
            class="flex size-10 items-center justify-center rounded-lg border border-gray-200"
          >
            <Icon name="truck-fast" size="20" />
          </span>

          <span>{{ item?.courier?.name }}</span>
        </div>
      </template>

      <template #mobile="{ item }">
        <div class="cursor-pointer" @click="openDrawer(item as Shipment)">
          <OrderShipmentCard :item="toCardItem(item as Shipment)" />
        </div>
      </template>
    </DataTable>

    <OrderShipmentDetailsDrawer
      :open="openDetails"
      :shipment="shipmentDetails ?? null"
      :loading="isFetchingDetails"
      @close="closeDrawer"
    />
  </div>
</template>
