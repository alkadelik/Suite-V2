<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import DataTable from "@components/DataTable.vue"
import EmptyState from "@components/EmptyState.vue"
import TextField from "@components/form/TextField.vue"
import SectionHeader from "@components/SectionHeader.vue"
import PageHeader from "@components/PageHeader.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, ref, watch } from "vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import { TOrder } from "../types"
import CreateOrderDrawer from "../components/CreateOrderDrawer.vue"
import VoidDeleteOrder from "../components/VoidDeleteOrder.vue"
import { useDeleteOrder, useGetOrderDashboard, useGetOrders, useVoidOrder } from "../api"
import { displayError } from "@/utils/error-handler"
import { toast } from "@/composables/useToast"
import { anonymousCustomer, ORDER_COLUMNS, ORDER_STATUS_TAB } from "../constants"
import { startCase } from "@/utils/format-strings"
import OrderCard from "../components/OrderCard.vue"
import FulfilOrderModal from "../components/FulfilOrderModal.vue"
import OrderMemoDrawer from "../components/OrderMemoDrawer.vue"
import ShareInvoiceReceipt from "../components/ShareInvoiceReceipt.vue"
import OrderPaymentDrawer from "../components/OrderPaymentDrawer.vue"
import Tabs from "@components/Tabs.vue"
import { formatCurrency } from "@/utils/format-currency"
import { useRoute } from "vue-router"
import { useDebouncedRef } from "@/composables/useDebouncedRef"
import ProductAvatar from "@components/ProductAvatar.vue"
import { usePremiumAccess } from "@/composables/usePremiumAccess"
import OrderDetailsDrawer from "../components/OrderDetailsDrawer.vue"
import StatCard from "@components/StatCard.vue"

const openCreate = ref(false)
const openVoid = ref(false)
const openDelete = ref(false)
const openMemo = ref(false)
const openFulfil = ref(false)
const openShare = ref(false)
const openPayment = ref(false)
const openDetails = ref(false)
const selectedOrder = ref<TOrder | null>(null)
const status = ref(ORDER_STATUS_TAB[0].key)

const { data: orderDashboard, refetch: refetchStats } = useGetOrderDashboard()

const orderMetrics = computed(() => {
  const { current, change } = orderDashboard?.value || {}

  return [
    {
      label: "Orders",
      value: current?.order_count || 0,
      icon: "user-octagon",
      iconClass: "md:text-green-700",
      percentage: change?.order_count_pct || 0,
    },
    {
      label: "Receivables",
      value: formatCurrency(current?.total_outstanding || 0),
      icon: "user-octagon",
      iconClass: "md:text-bloom-700",
      percentage: change?.total_outstanding_pct || 0,
    },
    {
      label: "Volume",
      value: formatCurrency(current?.total_amount || 0),
      icon: "user-circle-add",
      iconClass: "md:text-bloom-700",
      percentage: change?.total_amount_pct || 0,
    },
    {
      label: "Fulfilled",
      value: current?.fulfilled_count || 0,
      icon: "user-circle-add",
      iconClass: "md:text-bloom-700",
      percentage: change?.fulfilled_count_pct || 0,
    },
  ]
})

const showFilter = ref(false)
const isMobile = useMediaQuery("(max-width: 768px)")

const page = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)

const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  if (status.value && status.value !== "all") {
    if (status.value.includes("paid")) {
      params.payment_status = status.value
    } else {
      params.fulfilment_status = status.value
    }
  }
  params.offset = ((page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})

const { data: orders, isPending, isFetching, refetch } = useGetOrders(computedParams)
const { checkPremiumAccess } = usePremiumAccess()

// Function to handle opening create order drawer
const handleOpenCreate = () => {
  // Check premium access before opening drawer
  if (!checkPremiumAccess()) return

  openCreate.value = true
}

const handleRefresh = () => {
  refetch()
  refetchStats()
}

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
    label: `Share ${item.payment_status === "paid" ? "receipt" : "invoice"}`,
    icon: "share",
    action: () => {
      selectedOrder.value = item
      openShare.value = true
    },
  },
  ...(item.payment_status !== "paid"
    ? [
        {
          label: "Update Payment",
          icon: "money-add",
          action: () => {
            selectedOrder.value = item
            openPayment.value = true
          },
        },
      ]
    : []),
  ...(item.fulfilment_status === "unfulfilled"
    ? [
        {
          label: "Fulfill Order",
          icon: "money-add",
          action: () => {
            selectedOrder.value = item
            openFulfil.value = true
          },
        },
      ]
    : []),
  { divider: true },
  ...((item.fulfilment_status === "fulfilled" || item.payment_status !== "unpaid") &&
  !item.source?.includes("storefront")
    ? [
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
      ]
    : []),
  ...(item.fulfilment_status !== "fulfilled" &&
  item.payment_status === "unpaid" &&
  !item.source?.includes("storefront")
    ? [
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
    : []),
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
          handleRefresh()
        },
        onError: displayError,
      },
    )
  } else if (action === "delete") {
    deleteOrder(selectedOrder.value?.uid || "", {
      onSuccess: () => {
        toast.success("Order deleted successfully")
        onCloseVoidDel()
        handleRefresh()
      },
      onError: displayError,
    })
  }
}

const route = useRoute()

// Watch for route query to open create modal/drawer
watch(
  () => route.query.create,
  (newVal) => {
    if (newVal === "true") {
      handleOpenCreate()
    }
  },
  { immediate: true },
)

const handleAction = (action: string, order: TOrder) => {
  selectedOrder.value = order
  switch (action) {
    case "click":
      openDetails.value = true
      break
    case "view-memos":
      openMemo.value = true
      break
    case "share-invoice":
      openShare.value = true
      break
    case "update-payment":
      openPayment.value = true
      break
    case "fulfill":
      openFulfil.value = true
      break
    case "void-order":
      openVoid.value = true
      break
    case "delete-order":
      openDelete.value = true
      break
  }
}
</script>

<template>
  <PageHeader title="Orders" :count="orders?.count" count-label="orders" />

  <div class="flex flex-col gap-6 p-6">
    <div class="hidden lg:block">
      <SectionHeader
        title="Orders"
        subtitle="Track, manage, and fulfil every order in one place."
      />
    </div>

    <EmptyState
      v-if="!orders?.results?.length && status === 'all' && !debouncedSearch && !isPending"
      title="No Orders Yet"
      description="You haven't received any orders. Once you start receiving orders, they will appear here."
      action-label="Add an order"
      action-icon="add"
      :loading="isPending"
      @action="handleOpenCreate"
    />

    <section v-else>
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard v-for="item in orderMetrics" :key="item.label" :stat="item" />
      </div>

      <div class="mt-8 mb-4">
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
              @click="handleOpenCreate"
            />
          </div>
        </div>

        <DataTable
          :key="status"
          :data="orders?.results ?? []"
          :columns="
            ORDER_COLUMNS.filter((v) => (status === 'voided' ? v.accessor !== 'actions' : true))
          "
          fix-last-column
          :loading="isFetching"
          :enable-row-selection="false"
          :empty-state="{
            title: 'No Order Found',
            description:
              searchQuery || status !== 'all'
                ? 'Try adjusting your filters or search query'
                : `You haven't received any orders. Once you start receiving orders, they will appear here.`,
          }"
          :show-pagination="true"
          :items-per-page="itemsPerPage"
          :total-items-count="orders?.count || 0"
          :total-page-count="Math.ceil((orders?.count || 0) / itemsPerPage) || 1"
          :server-pagination="true"
          @pagination-change="(d) => (page = d.currentPage)"
          @row-click="
            (row) => {
              selectedOrder = row
              openDetails = true
            }
          "
        >
          <template #cell:items="{ item }">
            <ProductAvatar
              :name="item.items?.[0].product_name"
              :url="undefined"
              :variants-count="item.items.length > 1 ? item.items.length : undefined"
              :variants-count-text="`+ ${item.items.length - 1}`"
              shape="rounded"
              class="!gap-2"
              max-width="100px"
            />
          </template>
          <template #cell:fulfilment_status="{ item }">
            <Chip
              :color="item.fulfilment_status === 'fulfilled' ? 'success' : 'primary'"
              :label="item.fulfilment_status === 'fulfilled' ? 'Yes' : 'No'"
            />
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
            <span>
              {{ item.customer_name || anonymousCustomer.full_name }}
            </span>
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
            <OrderCard
              :order="item"
              @click="handleAction('click', item)"
              @view-memos="handleAction('view-memos', item)"
              @share-invoice="handleAction('share-invoice', item)"
              @update-payment="handleAction('update-payment', item)"
              @fulfill="handleAction('fulfill', item)"
              @void-order="handleAction('void-order', item)"
              @delete-order="handleAction('delete-order', item)"
            />
          </template>
        </DataTable>
      </div>
    </section>

    <!--  -->
    <VoidDeleteOrder
      v-if="selectedOrder"
      :open="openVoid || openDelete"
      :action="openVoid ? 'void' : 'delete'"
      :loading="isVoiding || isDeleting"
      :order="selectedOrder"
      @close="onCloseVoidDel"
      @action="handleVoidDelete"
    />

    <CreateOrderDrawer
      :open="openCreate"
      @close="
        () => {
          openCreate = false
          $router.replace({ name: 'Orders', query: {} })
        }
      "
      @refresh="handleRefresh"
    />
    <FulfilOrderModal
      v-if="selectedOrder"
      :open="openFulfil"
      @close="openFulfil = false"
      :order-id="selectedOrder?.uid"
      :items="selectedOrder?.items || []"
      @refresh="handleRefresh"
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
      @refresh="handleRefresh"
    />

    <OrderDetailsDrawer
      v-if="selectedOrder"
      :open="openDetails"
      @close="openDetails = false"
      :order="selectedOrder"
    />
  </div>
</template>
