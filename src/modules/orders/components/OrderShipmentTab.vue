<script setup lang="ts">
import TextField from "@components/form/TextField.vue"
import { useMediaQuery } from "@vueuse/core"
import { ref } from "vue"
import { ORDER_SHIPMENT_COLUMNS, SAMPLE_SHIPMENTS } from "../constants"
import DataTable from "@components/DataTable.vue"
import { startCase } from "@/utils/format-strings"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import OrderShipmentCard from "./OrderShipmentCard.vue"

const isMobile = useMediaQuery("(max-width: 768px)")
const searchQuery = ref<string>("")
</script>

<template>
  <div class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white">
    <div class="mb-4 flex flex-col justify-between md:flex-row md:items-center md:px-4">
      <h3 v-if="!isMobile" class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
        Shipments
        <Chip label="25" />
      </h3>
      <div class="flex items-center gap-2">
        <TextField
          left-icon="search-lg"
          size="sm"
          class="w-full md:min-w-64"
          placeholder="Find by order or tracking ID"
          v-model="searchQuery"
        />
      </div>
    </div>

    <DataTable
      :data="SAMPLE_SHIPMENTS"
      :columns="ORDER_SHIPMENT_COLUMNS"
      :loading="false"
      :enable-row-selection="false"
      :empty-state="{
        title: 'No Shipment Found',
        description: `You haven't received any shipments. Once you start receiving shipments, they will appear here.`,
      }"
      :show-pagination="false"
      @row-click="
        (row: unknown) => {
          console.log('Row clicked:', row)
        }
      "
    >
      <template #cell:status="{ value }">
        <Chip
          :color="value === 'delivered' ? 'success' : value === 'in_transit' ? 'warning' : 'error'"
          :label="startCase(String(value))"
          icon="truck-fast"
        />
      </template>
      <template #cell:courier="{ item }">
        <div class="flex items-center gap-2">
          <img
            v-if="item.courier.image_url"
            class="size-10 rounded-md border border-gray-200 p-1"
            :alt="item.courier.name"
          />
          <span
            v-else
            class="flex size-10 items-center justify-center rounded-lg border border-gray-200"
          >
            <Icon name="truck-fast" size="20" />
          </span>
          <span>{{ item.courier.name }}</span>
        </div>
      </template>

      <template #mobile="{ item }">
        <OrderShipmentCard :item="item" />
      </template>
    </DataTable>

    <!--  -->
    <OrderShipmentDetailsDrawer />
  </div>
</template>
