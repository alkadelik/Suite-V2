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
import { getFullName, TNameObj } from "@/utils/format-strings"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import { TOrder } from "../types"
import CreateOrderDrawer from "../components/CreateOrderDrawer.vue"
import VoidDeleteOrder from "../components/VoidDeleteOrder.vue"
import { useDeleteOrder, useGetOrders, useVoidOrder } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { ORDER_COLUMNS } from "../constants"

const openCreate = ref(false)
const openVoid = ref(false)
const openDelete = ref(false)
const selectedOrder = ref<TOrder | null>(null)

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

const { data: orders, refetch } = useGetOrders()

const handleRowClick = (row: Record<string, unknown>) => {
  // Handle row click event
  console.log("Row clicked:", row)
}

type Action = "view" | "edit" | "share" | "update-payment" | "void" | "delete"
const handleAction = (action: Action, item: Record<string, unknown>) => {
  // Handle action based on type
  console.log(`Action: ${action}`, item)
  selectedOrder.value = item as TOrder
  if (action === "void") openVoid.value = true
  if (action === "delete") openDelete.value = true
}

const getActionItems = (item: Record<string, unknown>) => [
  {
    label: "View memos",
    icon: "eye",
    action: () => handleAction("view", item),
  },
  {
    label: "Share invoice",
    icon: "share",
    action: () => handleAction("share", item),
  },
  {
    label: "Update Payment",
    icon: "money-add",
    action: () => handleAction("update-payment", item),
  },
  { divider: true },
  {
    label: "Void Order",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => handleAction("void", item),
  },
  {
    label: "Delete Order",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => handleAction("delete", item),
  },
]

const onCloseVoidDel = () => {
  openVoid.value = false
  openDelete.value = false
}

const { mutate: voidOrder, isPending: isVoiding } = useVoidOrder()
const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder()

const handleVoidDelete = ({ action, reason }: { action: string; reason: string }) => {
  console.log("Action:", action, "Reason:", reason, "Selected Order:", selectedOrder.value)
  if (action === "void") {
    voidOrder(
      { id: selectedOrder.value?.id as number, void_reason: reason },
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
    deleteOrder(selectedOrder.value?.id as number, {
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
      v-if="!orders?.results?.length"
      title="No Orders Yet"
      description="You haven't received any orders. Once you start receiving orders, they will appear here."
      action-label="Add an order"
      action-icon="add"
      :loading="false"
      @action="openCreate = true"
    />

    <section v-else>
      <MetricsGrid :items="orderMetrics" />

      <div
        class="mt-4 space-y-4 overflow-hidden rounded-xl border-gray-200 bg-white pt-3 md:border"
      >
        <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
          <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
            All Orders <Chip :label="String(20)" />
          </h3>
          <div class="flex items-center gap-2">
            <TextField
              left-icon="search-lg"
              size="md"
              class="min-w-64"
              placeholder="Search by customer or order ref"
              v-model="searchQuery"
            />

            <AppButton
              icon="filter-lines"
              variant="outlined"
              size="sm"
              color="alt"
              :label="isMobile ? '' : 'Filter'"
              @click="showFilter = true"
            />

            <AppButton
              icon="add"
              size="sm"
              :label="isMobile ? '' : 'Add Order'"
              @click="openCreate = true"
            />
          </div>
        </div>

        <DataTable
          :data="orders?.results ?? []"
          :columns="ORDER_COLUMNS"
          :loading="false"
          :show-pagination="true"
          :enable-row-selection="true"
          @row-click="handleRowClick"
        >
          <template #cell:items_count="{ item }">
            <div class="flex items-center gap-2 text-xs">
              <div class="h-1.5 w-full rounded-full bg-gray-200">
                <div class="bg-primary-600 h-1.5 rounded-full" style="width: 50%"></div>
              </div>
              {{ item.items_count + "/2" }}
            </div>
          </template>
          <!--  -->
          <template #cell:status="{ item }">
            <Chip
              :icon="
                item.payment_status === 1 ? 'money' : item.payment_status === 2 ? 'money' : 'money'
              "
              :label="
                item.payment_status === 1
                  ? 'Paid (Transfer)'
                  : item.payment_status === 2
                    ? 'Partially paid'
                    : 'Unpaid'
              "
              :color="
                item.payment_status === 1
                  ? 'success'
                  : item.payment_status === 2
                    ? 'warning'
                    : 'error'
              "
            />
          </template>
          <!--  -->
          <template #cell:customer_info="{ item }">
            <Avatar :extra-text="true" :name="getFullName(item.customer_info as TNameObj)" />
          </template>
          <template #cell:actions="{ item }">
            <div class="inline-flex items-center gap-1">
              <Icon name="edit" @click.stop="handleAction('edit', item)" />
              <DropdownMenu :items="getActionItems(item)" size="sm" @toggle="selectedOrder = item">
                <template #trigger>
                  <Icon name="dots-vertical" />
                </template>
              </DropdownMenu>
            </div>
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

    <CreateOrderDrawer :open="openCreate" @close="openCreate = false" />
  </div>
</template>
