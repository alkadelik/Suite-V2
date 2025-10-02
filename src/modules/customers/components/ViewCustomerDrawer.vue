<template>
  <Drawer
    :open="modelValue"
    title="Customer Details"
    :position="drawerPosition"
    max-width="xl"
    @close="emit('update:modelValue', false)"
  >
    <template class="flex flex-col gap-5">
      <CustomerCard v-if="customer" :customer="customer" />

      <!-- Summary Cards -->
      <SummaryCard :items="summaryStats" />

      <div class="flex flex-col">
        <!-- Tabs for Recent Orders and More Info -->
        <Tabs v-model="activeStatus" :tabs="tabOptions" />

        <div v-if="activeStatus === 'recent_orders'">
          <template v-for="order in ORDERS" :key="order.id">
            <OrderCard
              v-if="!(order.order_ref.startsWith('2') && !order.payment_status)"
              :key="'order-' + order.id"
              :order="order"
              @open:dropdown="selectedOrder = order"
            />
          </template>
        </div>
        <div
          v-else-if="activeStatus === 'more_info'"
          class="text-core-800 flex-1 rounded-xl bg-white p-4 md:min-h-[20rem]"
        >
          <h5 class="font-outfit mb-4 text-sm font-bold md:text-lg">Other Information</h5>

          <div class="space-y-5">
            <!-- Address -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Address</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                customer?.default_address
              }}</span>
            </div>

            <!-- City/State -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">City/State</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                customer?.default_city
              }}</span>
            </div>

            <!-- Date of Birth -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Date of Birth</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                formatDate(customer?.date_of_birth)
              }}</span>
            </div>

            <!-- Instagram Handle -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Instagram handle</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                customer?.instagram_handle
              }}</span>
            </div>

            <!-- Divider -->
            <hr class="my-4 border-gray-200" />

            <!-- Date Joined -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Date joined</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                formatDate(customer?.created_at)
              }}</span>
            </div>

            <!-- Last Order Date -->
            <div class="flex">
              <span class="text-core-600 w-2/5 text-xs md:text-sm">Last order date</span>
              <span class="flex-1 text-xs font-semibold md:text-sm">{{
                customer?.last_order_date
              }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="activeStatus === 'addresses'">
          <div
            v-for="value in addresses"
            :key="value.id"
            class="border-core-300 bg-core-25 mb-4 rounded-lg border p-4"
          >
            <div class="mb-2 flex items-start justify-between">
              <div>
                <h5 class="font-outfit text-sm font-bold md:text-lg">{{ customer?.full_name }}</h5>
                <p class="text-core-600 text-xs md:text-sm">{{ value.address }}</p>
                <p class="text-core-600 text-xs md:text-sm">{{ value.city_state }}</p>
                <p class="text-core-600 text-xs md:text-sm">{{ value.country }}</p>
                <p class="text-core-600 text-xs md:text-sm">{{ value.phone }}</p>
              </div>
              <Chip v-if="value.is_default" label="Default" showDot />
            </div>
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import Drawer from "@components/Drawer.vue"
import type { ICustomer, TCustomerFormMode, ICustomerFormPayload } from "../types"
import CustomerCard from "./CustomerCard.vue"
import Tabs from "@/components/Tabs.vue"
// import { pluralize } from "@/utils/pluralize"
import { formatCurrency } from "@/utils/format-currency"
import SummaryCard from "@/components/SummaryCards.vue"
import { ORDERS } from "@modules/orders/constants"
import OrderCard from "@modules/orders/components/OrderCard.vue"
import { TOrder } from "@modules/orders/types"
import Chip from "@components/Chip.vue"
import { formatDate } from "../utils/dateFormatter"

interface Props {
  /** Whether the drawer is open/visible */
  modelValue: boolean
  /** Form mode - add new customer or edit existing */
  mode?: TCustomerFormMode
  /** Customer data for editing (required when mode is 'edit') */
  customer: ICustomer | null
  /** Loading state for async operations */
  loading?: boolean
}

interface Emits {
  /** Update the modelValue */
  "update:modelValue": [value: boolean]
  /** Emitted when form is submitted successfully */
  submit: [payload: ICustomerFormPayload, mode: TCustomerFormMode]
  /** Emitted when drawer should refresh parent data */
  refresh: []
}

const props = withDefaults(defineProps<Props>(), {
  mode: "add",
  customer: null,
  loading: false,
})

const emit = defineEmits<Emits>()

// Reactive state
const isMobile = ref(false)
const formKey = ref(0) // Force form re-render when switching modes

// Watch for changes in customer or mode to force form re-render
watch([() => props.customer, () => props.mode, () => props.modelValue], () => {
  formKey.value += 1
})

// Check if mobile on mount and window resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
}

onMounted(() => {
  checkMobile()
  window.addEventListener("resize", checkMobile)
})

// Computed drawer position based on screen size
const drawerPosition = computed(() => {
  return isMobile.value ? "bottom" : "right"
})

const activeStatus = ref("recent_orders")
const selectedOrder = ref<TOrder | null>(null)

const tabOptions = [
  { title: "Recent Orders", key: "recent_orders" },
  { title: "More Info", key: "more_info" },
  { title: "Addresses", key: "addresses" },
]

const summaryStats = ref([
  {
    label: "Total Orders",
    value: props.customer?.total_orders || 0,
    icon: "bag-2",
  },
  {
    label: "Total Spend",
    value: formatCurrency(0),
    icon: "money-add",
  },
  {
    label: "Total Credit",
    value: formatCurrency(0),
    icon: "coin",
  },
  {
    label: "Total Returns",
    value: props.customer?.total_returns || 0,
    icon: "refresh-2",
  },
])

const addresses = ref([
  {
    id: 1,
    label: "Home",
    address: "123 Main St, Springfield, IL 62701",
    city_state: "Springfield, IL",
    country: "USA",
    phone: "(555) 123-4567",
    is_default: true,
  },
  {
    id: 2,
    label: "Work",
    address: "456 Corporate Blvd, Springfield, IL 62703",
    city_state: "Springfield, IL",
    country: "USA",
    phone: "(555) 987-6543",
    is_default: false,
  },
])
</script>
