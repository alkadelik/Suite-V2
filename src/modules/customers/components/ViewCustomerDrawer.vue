<template>
  <Drawer
    :open="modelValue"
    title="Customer Details"
    :position="drawerPosition"
    max-width="xl"
    @close="emit('update:modelValue', false)"
  >
    <CustomerCard v-if="customer" :customer="customer" class="mb-5" />

    <!-- Summary Cards -->
    <SummaryCard :items="summaryStats" class="mb-5" />

    <!-- Tabs for Recent Orders and More Info -->
    <Tabs v-model="activeStatus" :tabs="tabOptions" />

    <template v-for="order in ORDERS" :key="order.id">
      <OrderCard
        v-if="!(order.order_ref.startsWith('2') && !order.payment_status)"
        :key="'order-' + order.id"
        :order="order"
        @open:dropdown="selectedOrder = order"
      />
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import Drawer from "@components/Drawer.vue"
import type { TCustomer, TCustomerFormMode, ICustomerFormPayload } from "../types"
import CustomerCard from "./CustomerCard.vue"
import Tabs from "@/components/Tabs.vue"
// import { pluralize } from "@/utils/pluralize"
import { formatCurrency } from "@/utils/format-currency"
import SummaryCard from "@/components/SummaryCards.vue"
import { ORDERS } from "@modules/orders/constants"
import OrderCard from "@modules/orders/components/OrderCard.vue"
import { TOrder } from "@modules/orders/types"

interface Props {
  /** Whether the drawer is open/visible */
  modelValue: boolean
  /** Form mode - add new customer or edit existing */
  mode?: TCustomerFormMode
  /** Customer data for editing (required when mode is 'edit') */
  customer?: TCustomer | null
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
]

const summaryStats = ref([
  {
    label: "Total Orders",
    value: 3,
    icon: "bag-2",
  },
  {
    label: "Total Spend",
    value: formatCurrency(15000),
    icon: "money-add",
  },
  {
    label: "Total Credit",
    value: formatCurrency(10000),
    icon: "coin",
  },
  {
    label: "Total Returns",
    value: 5,
    icon: "refresh-2",
  },
])
</script>
