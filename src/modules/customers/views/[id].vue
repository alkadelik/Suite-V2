<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import CustomerCard from "../components/CustomerCard.vue"
import Tabs from "@/components/Tabs.vue"
import { formatCurrency } from "@/utils/format-currency"
import SummaryCard from "@/components/SummaryCards.vue"
import Chip from "@components/Chip.vue"
import { formatDate } from "../utils/dateFormatter"
import OrderCard from "@/modules/orders/components/OrderCard.vue"
import { useGetSingleCustomer } from "../api"
import { useRoute, useRouter } from "vue-router"
import EmptyState from "@components/EmptyState.vue"
import PageHeader from "@components/PageHeader.vue"
import BackButton from "@components/BackButton.vue"
import DataTable, { TableColumn } from "@components/DataTable.vue"
import { anonymousCustomer } from "@modules/orders/constants"
import { startCase } from "@/utils/format-strings"
import ProductAvatar from "@components/ProductAvatar.vue"
import { getSmartDateLabel } from "@/utils/formatDate"
import { TOrder } from "@modules/orders/types"

const route = useRoute()
const router = useRouter()

const customerId = computed(() => route.params.id as string)

onMounted(() => {
  if (!customerId.value || customerId.value.trim() === "") {
    router.push("/customers")
  }
})

const { data: customerData, isPending, isFetching } = useGetSingleCustomer(customerId)

const customer = computed(() => customerData.value)

const activeStatus = ref("recent_orders")

const tabOptions = [
  { title: "Recent Orders", key: "recent_orders" },
  { title: "More Info", key: "more_info" },
  { title: "Addresses", key: "addresses" },
]

// Computed summary stats using API data
const summaryStats = computed(() => [
  {
    label: "Total Orders",
    value: customer.value?.total_orders || 0,
    icon: "bag-2",
  },
  {
    label: "Total Spend",
    value: formatCurrency(Number(customer.value?.total_spent) || 0),
    icon: "money-add",
  },
  {
    label: "Total Credit",
    value: formatCurrency(Number(customer.value?.total_credits) || 0),
    icon: "coin",
  },
  {
    label: "Total Returns",
    value: customer.value?.total_returns || 0,
    icon: "refresh-2",
  },
])

// Computed default address
const defaultAddress = computed(() => {
  if (!customer.value?.recent_addresses) return null
  return customer.value.recent_addresses.find((addr) => addr.is_default) || null
})

// Enrich orders with customer name and other required fields for OrderCard
const enrichedOrders = computed(() => {
  if (!customer.value?.recent_orders) return []
  return customer.value.recent_orders.map((order) => ({
    ...order,
    user_name: customer.value?.full_name || "Guest",
    customer_name: customer.value?.full_name,
    fulfilment_method: "pickup" as const, // Default to pickup if not specified
    subtotal: order.total_amount, // Use total_amount as subtotal if not provided
    source: order.source === "internal" ? "internal" : "external", // Map source values
  }))
})

const ORDER_COLUMNS: TableColumn<(typeof enrichedOrders.value)[number]>[] = [
  { header: "Order ID", accessor: "order_number" },
  { header: "Items", accessor: "items" },
  {
    header: "Amount",
    accessor: "total_amount",
    cell: ({ value }) => formatCurrency(Number(value)),
  },
  { header: "Status", accessor: "payment_status" },
  { header: "Fulfilled", accessor: "fulfilment_status" },
  {
    header: "Order Date",
    accessor: "order_date",
    cell: ({ item }) => getSmartDateLabel(String(item.order_date || item.created_at || "")),
  },
]
</script>

<template>
  <div class="flex flex-col gap-5 p-6">
    <div class="hidden md:inline-block">
      <BackButton label="Back to Customers" />
    </div>

    <PageHeader title="Customer Details" />

    <EmptyState
      v-if="isFetching || isPending"
      title="No customer found"
      description="We couldn't find a customer with the provided ID."
      :loading="isFetching"
    />

    <div v-else class="flex flex-col gap-5 pt-4 md:pt-0">
      <CustomerCard
        v-if="customer"
        :customer="{
          uid: customer.uid,
          full_name: customer.full_name,
          email: customer.email || '',
          phone: customer.phone,
        }"
      />

      <SummaryCard :items="summaryStats" class="lg:grid-cols-4" />

      <div class="flex flex-col">
        <Tabs v-model="activeStatus" :tabs="tabOptions" />

        <div class="mt-6" v-if="activeStatus === 'recent_orders'">
          <div
            v-if="customer?.recent_orders && customer.recent_orders.length > 0"
            class="space-y-4 overflow-hidden rounded-xl border-gray-200 pt-3 md:border md:bg-white md:pt-0"
          >
            <DataTable
              :data="enrichedOrders ?? []"
              :columns="ORDER_COLUMNS"
              :show-pagination="false"
            >
              <template #mobile="{ item }">
                <OrderCard :order="item as unknown as TOrder" :show-actions="false" />
              </template>
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
            </DataTable>

            <!-- <OrderCard
              v-for="order in enrichedOrders"
              :key="order.uid"
              :order="order"
              :show-actions="false"
            /> -->
          </div>
          <div v-else class="text-core-600 py-8 text-center text-sm">No recent orders</div>
        </div>
        <div
          v-else-if="activeStatus === 'more_info'"
          class="text-core-800 mt-6 flex-1 rounded-xl bg-white p-4 md:min-h-[20rem]"
        >
          <h5 class="font-outfit mb-4 text-sm font-bold md:text-lg">Other Information</h5>

          <div class="space-y-5">
            <!-- Address -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Address</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                defaultAddress?.address || customer?.default_address || "N/A"
              }}</span>
            </div>

            <!-- City/State -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">City/State</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">
                {{
                  defaultAddress
                    ? `${defaultAddress.city || ""}${defaultAddress.city && defaultAddress.state ? ", " : ""}${defaultAddress.state || ""}`
                    : customer?.default_city || "N/A"
                }}
              </span>
            </div>

            <!-- Date of Birth -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Date of Birth</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                customer?.date_of_birth ? formatDate(customer.date_of_birth) : "N/A"
              }}</span>
            </div>

            <!-- Instagram Handle -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Instagram handle</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                customer?.instagram_handle || "N/A"
              }}</span>
            </div>

            <!-- Divider -->
            <hr class="my-4 border-gray-200" />

            <!-- Date Joined -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Date joined</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                customer?.created_at ? formatDate(customer.created_at) : "N/A"
              }}</span>
            </div>

            <!-- Last Order Date -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Last order date</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                customer?.recent_orders?.[0]?.created_at
                  ? formatDate(customer.recent_orders[0].created_at)
                  : "N/A"
              }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6" v-else-if="activeStatus === 'addresses'">
          <template v-if="customer?.recent_addresses && customer.recent_addresses.length > 0">
            <div
              v-for="address in customer.recent_addresses"
              :key="address.uid"
              class="border-core-300 bg-core-25 mb-4 rounded-lg border p-4"
            >
              <div class="mb-2 flex items-start justify-between">
                <div>
                  <h5 class="font-outfit text-sm font-bold md:text-lg">
                    {{ address.name || customer?.full_name }}
                  </h5>
                  <p class="text-core-600 text-xs md:text-sm">{{ address.address || "N/A" }}</p>
                  <p class="text-core-600 text-xs md:text-sm">
                    {{ address.city }}{{ address.city && address.state ? ", " : ""
                    }}{{ address.state }}
                  </p>
                  <p class="text-core-600 text-xs md:text-sm">{{ address.phone || "N/A" }}</p>
                </div>
                <Chip v-if="address.is_default" label="Default" showDot />
              </div>
            </div>
          </template>
          <div v-else class="text-core-600 py-8 text-center text-sm">No addresses found</div>
        </div>
      </div>
    </div>
  </div>
</template>
