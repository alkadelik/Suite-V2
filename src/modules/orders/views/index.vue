<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import DataTable from "@components/DataTable.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import MetricsGrid from "@components/MetricsGrid.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref } from "vue"
import Avatar from "@components/Avatar.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import { TOrder } from "../types"
import CreateOrderDrawer from "../components/CreateOrderDrawer.vue"
import VoidDeleteOrder from "../components/VoidDeleteOrder.vue"
import { useDeleteOrder, useGetOrders, useVoidOrder } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { ORDER_COLUMNS, ORDER_STATUS_TAB } from "../constants"
import { startCase } from "@/utils/format-strings"
import OrderCard from "../components/OrderCard.vue"
import FulfilOrderModal from "../components/FulfilOrderModal.vue"
import OrderMemoDrawer from "../components/OrderMemoDrawer.vue"
import ShareInvoiceReceipt from "../components/ShareInvoiceReceipt.vue"
import OrderPaymentDrawer from "../components/OrderPaymentDrawer.vue"
import Tabs from "@components/Tabs.vue"

const openCreate = ref(false)
const openVoid = ref(false)
const openDelete = ref(false)
const openMemo = ref(false)
const openFulfil = ref(false)
const openShare = ref(false)
const openPayment = ref(false)
const selectedOrder = ref<TOrder | null>(null)
const status = ref(ORDER_STATUS_TAB[0].key)

const orderMetrics = computed(() => {
  return [
    {
      label: "Total Orders",
      value: "0",
      prev_value: "0",
      icon: "user-octagon",
      chartData: [0, 0, 0, 0, 0, 0, 0],
      chartColor: "#D0F8AA",
      iconClass: "md:text-green-700",
    },
    {
      label: "Total Unpaid",
      value: "0",
      prev_value: "0",
      icon: "user-octagon",
      chartData: [0, 0, 0, 0, 0, 0, 0],
      chartColor: "#D0F8AA",
      iconClass: "md:text-bloom-700",
    },
    {
      label: "Total Ongoing",
      value: "0",
      prev_value: "0",
      icon: "user-circle-add",
      chartData: [0, 0, 0, 0, 0, 0, 0],
      chartColor: "#FECCD6",
      iconClass: "md:text-bloom-700",
    },
    {
      label: "Total Fulfilled",
      value: "0",
      prev_value: "0",
      icon: "user-circle-add",
      chartData: [0, 0, 0, 0, 0, 0, 0],
      chartColor: "#FECCD6",
      iconClass: "md:text-bloom-700",
    },
  ]
})

const searchQuery = ref("")
const showFilter = ref(false)
const isMobile = useMediaQuery("(max-width: 768px)")

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (status.value && status.value !== "all") {
    if (status.value.includes("paid")) {
      params.payment_status = status.value
    } else {
      params.fulfilment_status = status.value
    }
  }
  return params
})

const { data: orders, isFetching, refetch } = useGetOrders(computedParams)

const getActionItems = (item: TOrder) => [
  {
    label: "View memos",
    icon: "eye",
    action: () => {
      selectedOrder.value = item
      openMemo.value = true
    },
  },
  {
    label: "Share invoice",
    icon: "share",
    action: () => {
      selectedOrder.value = item
      openShare.value = true
    },
  },
  {
    label: "Update Payment",
    icon: "money-add",
    action: () => {
      selectedOrder.value = item
      openPayment.value = true
    },
  },
  {
    label: "Fulfill Order",
    icon: "money-add",
    action: () => {
      selectedOrder.value = item
      openFulfil.value = true
    },
  },
  { divider: true },
  {
    label: "Void Order",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => {
      selectedOrder.value = item
      openVoid.value = true
    },
  },
  {
    label: "Delete Order",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => {
      selectedOrder.value = item
      openDelete.value = true
    },
  },
]

const onCloseVoidDel = () => {
  openVoid.value = false
  openDelete.value = false
}

const { mutate: voidOrder, isPending: isVoiding } = useVoidOrder()
const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder()

const handleVoidDelete = ({ action, reason }: { action: string; reason: string }) => {
  if (action === "void") {
    voidOrder(
      { id: selectedOrder.value?.uid || "", void_reason: reason },
      {
        onSuccess: () => {
          toast.success("Order voided successfully")
          onCloseVoidDel()
          refetch()
        },
        onError: displayError,
      },
    )
  } else if (action === "delete") {
    deleteOrder(selectedOrder.value?.uid || "", {
      onSuccess: () => {
        toast.success("Order deleted successfully")
        onCloseVoidDel()
        refetch()
      },
      onError: displayError,
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <SectionHeader title="Orders" subtitle="Track, manage, and fulfil every order in one place." />

    <EmptyState
      v-if="!orders?.results?.length && status === 'all'"
      title="No Orders Yet"
      description="You haven't received any orders. Once you start receiving orders, they will appear here."
      action-label="Add an order"
      action-icon="add"
      :loading="isFetching"
      @action="openCreate = true"
    />

    <section v-else>
      <MetricsGrid :items="orderMetrics" />

      <div class="mt-8">
        <Tabs v-model="status" :tabs="ORDER_STATUS_TAB" />
      </div>

      <div class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white">
        <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
          <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
            {{ ORDER_STATUS_TAB.find((tab) => tab.key === status)?.title }} Orders
            <Chip v-if="orders?.count" :label="orders?.count" />
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
          :data="orders?.results ?? []"
          :columns="ORDER_COLUMNS"
          :loading="isFetching"
          :show-pagination="true"
          :enable-row-selection="false"
          :empty-state="{
            title: 'No Order Found',
            description:
              searchQuery || status !== 'all'
                ? 'Try adjusting your filters or search query'
                : `You haven't received any orders. Once you start receiving orders, they will appear here.`,
          }"
        >
          <template #cell:items="{ item }">
            <div class="max-w-[100px] truncate">
              {{ item.items.map((v) => v.product_name).join(", ") }}
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
              <DropdownMenu
                :items="getActionItems(item)"
                size="sm"
                @toggle="selectedOrder = item"
              />
            </div>
          </template>
          <template #mobile="{ item }">
            <OrderCard :order="item" />
          </template>
        </DataTable>
      </div>
    </section>

    <!--  -->
    <VoidDeleteOrder
      :open="openVoid || openDelete"
      :action="openVoid ? 'void' : 'delete'"
      :loading="isVoiding || isDeleting"
      @close="onCloseVoidDel"
      @action="handleVoidDelete"
    />

    <CreateOrderDrawer :open="openCreate" @close="openCreate = false" @refresh="refetch" />
    <FulfilOrderModal
      v-if="selectedOrder"
      :open="openFulfil"
      @close="openFulfil = false"
      :order-id="selectedOrder?.uid"
      :items="selectedOrder?.items || []"
    />

    <OrderMemoDrawer
      v-if="selectedOrder"
      :order="selectedOrder"
      :open="openMemo"
      @close="openMemo = false"
    />

    <ShareInvoiceReceipt
      v-if="selectedOrder"
      :open="openShare"
      @close="openShare = false"
      :order="selectedOrder"
    />

    <OrderPaymentDrawer
      v-if="selectedOrder"
      :open="openPayment"
      @close="openPayment = false"
      :order="selectedOrder"
    />
  </div>
</template>
