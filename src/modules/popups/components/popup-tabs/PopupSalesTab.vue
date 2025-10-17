<script setup lang="ts">
import { startCase } from "@/utils/format-strings"
import Avatar from "@components/Avatar.vue"
import Chip from "@components/Chip.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import EmptyState from "@components/EmptyState.vue"
import OrderCard from "@modules/orders/components/OrderCard.vue"
import { TOrder } from "@modules/orders/types"
import { useGetPopupOrders } from "@modules/popups/api"
import { POPUP_ORDER_COLUMNS } from "@modules/popups/constants"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import CreatePopupOrderDrawer from "../CreatePopupOrderDrawer.vue"
import DataTable from "@components/DataTable.vue"

const isEmpty = true
const searchQuery = ref("")
const openCreate = ref(false)
const showFilter = ref(false)
const selectedOrder = ref<TOrder | null>(null)

const route = useRoute()
const isMobile = useMediaQuery("(max-width: 768px)")

const { data: popupOrders } = useGetPopupOrders(route.params.id as string)

const actionMenu = computed(() => [
  { label: "View memos", icon: "eye" },
  {
    label: "Mark As Paid",
    icon: "money-add",
  },
  { divider: true },
  {
    label: "Void Order",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
  },
  {
    label: "Delete Order",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
  },
])
</script>

<template>
  <EmptyState
    v-if="isEmpty"
    title="You haven't made any sales yet!"
    description="Your popup sales will appear here when customers purchase from you. You can also add an order."
    action-icon="add"
    action-label="Add an order"
    @action="openCreate = true"
  />

  <section v-else>
    <div
      class="mt-4 space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white"
    >
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          All Orders <Chip :label="popupOrders?.count || 0" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="md"
            class="w-full md:min-w-64"
            placeholder="Search by customer or order ref"
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
            :label="isMobile ? '' : 'Add Order'"
            @click="openCreate = true"
          />
        </div>
      </div>

      <DataTable
        :data="popupOrders?.results ?? []"
        :columns="POPUP_ORDER_COLUMNS"
        :loading="false"
        :show-pagination="true"
        :enable-row-selection="true"
      >
        <template #cell:items="{ item }">
          <div class="max-w-[100px] truncate">
            {{ item.items.map((v: { product_name: string }) => v.product_name).join(", ") }}
          </div>
        </template>
        <!--  -->
        <template #cell:payment_status="{ item }">
          <Chip
            :icon="item.payment_status === 'paid' ? 'card-tick' : 'card-pos'"
            :label="startCase(item.payment_status)"
            :color="
              item.payment_status === 'paid'
                ? 'success'
                : item.payment_status === 'partially_paid'
                  ? 'warning'
                  : 'error'
            "
          />
        </template>
        <!--  -->
        <template #cell:customer_info="{ item }">
          <Avatar :extra-text="true" :name="`Customer ${item.customer}`" />
        </template>
        <template #cell:actions="{ item }">
          <div class="inline-flex items-center gap-1">
            <DropdownMenu :items="actionMenu" size="sm" @toggle="selectedOrder = item" />
          </div>
        </template>
        <template #mobile="{ item }">
          <OrderCard :order="item" />
        </template>
      </DataTable>
    </div>
  </section>

  <!--  -->
  <CreatePopupOrderDrawer
    :open="openCreate"
    @close="openCreate = false"
    :popup-id="String(route.params.id)"
  />
</template>
