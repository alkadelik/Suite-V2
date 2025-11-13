<template>
  <div class="p-4">
    <div class="hidden lg:block">
      <SectionHeader
        title="Customers"
        subtitle="View, manage, and keep track of all your customers in one place."
        class="mb-4"
      />
    </div>

    <MetricsGrid :items="customerMetrics" />

    <EmptyState
      v-if="!isLoading && customers.length === 0"
      title="No customers found"
      description="Add your first customer to start managing them."
      action-label="Add Customer"
      action-icon="add"
      @action="openAddCustomerDrawer"
      class="mt-6"
    />
    <div v-else class="mt-4 space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:border">
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          Customers List <Chip :label="String(customers.length)" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="md"
            class="flex-1"
            placeholder="Search by customer name or email"
            v-model="searchQuery"
          />
          <AppButton
            icon="download-cloud-02"
            variant="outlined"
            size="sm"
            color="alt"
            label="Export"
            class="bg-primary-50 text-primary-600 hover:bg-primary-100 border-primary-200 !hidden border md:!inline-flex"
            @click="showExportCustomerModal = true"
          />
          <AppButton
            icon="download-cloud-02"
            variant="outlined"
            size="sm"
            color="alt"
            label=""
            class="bg-primary-50 text-primary-600 hover:bg-primary-100 border-primary-200 border md:hidden"
            @click="showExportCustomerModal = true"
          />
          <AppButton
            icon="add"
            size="sm"
            label="Add Customer"
            @click="openAddCustomerDrawer"
            class="!hidden md:!inline-flex"
          />
          <AppButton
            icon="add"
            size="sm"
            label=""
            @click="openAddCustomerDrawer"
            class="md:hidden"
          />
        </div>
      </div>

      <DataTable
        :data="filteredCustomers"
        :columns="CUSTOMER_COLUMNS"
        :loading="isLoading"
        :show-pagination="false"
        :enable-row-selection="true"
        @row-click="handleRowClick"
      >
        <template #cell:name="{ item }">
          <Avatar v-if="item.full_name" :name="item?.full_name" :extra-text="true" />
        </template>

        <template #cell:lastOrderDate="{ value }">
          <span class="text-gray-600">
            {{
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean" ||
              value instanceof Date ||
              value === null ||
              value === undefined
                ? formatDate(value)
                : ""
            }}
          </span>
        </template>

        <template #cell:phone="{ value }">
          <span class="text-sm">{{ value }}</span>
        </template>

        <template #cell:email="{ value }">
          <span class="text-sm">{{ value }}</span>
        </template>

        <template #cell:totalOrders="{ value }">
          <span>{{ value }}</span>
        </template>

        <template #cell:action="{ item }">
          <div class="flex items-center gap-2">
            <Icon
              name="trash-01"
              @click.stop="handleAction('delete', item)"
              class="hidden md:inline-block"
            />
            <Icon
              name="edit"
              @click.stop="handleAction('edit', item)"
              class="hidden md:inline-block"
            />
            <DropdownMenu
              :items="getActionItems(item)"
              placement="bottom-end"
              :show-chevron="false"
              size="sm"
              trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0 md:hidden"
              @click.stop
            >
              <template #trigger>
                <Icon name="dots-vertical" />
              </template>
            </DropdownMenu>
          </div>
        </template>

        <!-- mobile view cell templates -->
        <template #mobile="{ item }">
          <div class="space-y-2">
            <div class="flex items-start gap-2">
              <Avatar :name="String(item.full_name)" class="items-start" />
              <Chip
                :label="`${String(item.total_orders)} orders`"
                variant="outlined"
                size="sm"
                showDot
              />
            </div>
            <div class="ms-13 -mt-5">
              <div class="text-core-600 flex items-center gap-1">
                <!-- Email dropdown -->
                <DropdownMenu
                  :items="getEmailDropdownItems(item)"
                  placement="bottom-start"
                  :show-chevron="false"
                  size="sm"
                  trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
                  @click.stop
                >
                  <template #trigger>
                    <Icon name="sms" size="16" />
                  </template>
                </DropdownMenu>

                <!-- Phone dropdown -->
                <DropdownMenu
                  :items="getPhoneDropdownItems(item)"
                  placement="bottom-start"
                  :show-chevron="false"
                  size="sm"
                  trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
                  @click.stop
                >
                  <template #trigger>
                    <Icon name="call" size="16" />
                  </template>
                </DropdownMenu>

                <span class="text-xs">{{ formatDateLong(item.last_active as string) }}</span>
              </div>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- modals -->
    <ConfirmationModal
      v-model="showDeleteConfirmationModal"
      @close="showDeleteConfirmationModal = false"
      header="Delete Customer"
      paragraph="Are you sure you want to delete this customer?"
      variant="error"
      @confirm="handleDeleteCustomer"
      :loading="isDeleting"
    />
    <ExportCustomerModal
      v-model="showExportCustomerModal"
      @close="showExportCustomerModal = false"
    />

    <!-- drawers  -->
    <CustomerFormDrawer
      v-model="showCustomerFormDrawer"
      :mode="formMode"
      :customer="formMode === 'edit' && customerData?.data ? customerData.data : customer"
      @close="showCustomerFormDrawer = false"
      @refresh="refetch()"
    />
    <ViewCustomerDrawer
      v-model="showViewCustomerDrawer"
      :mode="formMode"
      :customer-data="customerData?.data || null"
      :loading="!!customerUid && !customerData"
      @close="showViewCustomerDrawer = false"
    />
  </div>
</template>

<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import Avatar from "@components/Avatar.vue"
import { ICustomer, TCustomerFormMode } from "../types"
import { CUSTOMER_COLUMNS } from "../constants"
import { ref, computed, watch, onMounted } from "vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import { formatDate, formatDateLong } from "../utils/dateFormatter"
import { toast } from "@/composables/useToast"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import CustomerFormDrawer from "../components/CustomerFormDrawer.vue"
import ExportCustomerModal from "../components/ExportCustomerModal.vue"
import ViewCustomerDrawer from "../components/ViewCustomerDrawer.vue"
import MetricsGrid from "@components/MetricsGrid.vue"
import SectionHeader from "@components/SectionHeader.vue"
import { useGetCustomers, useDeleteCustomer, useGetCustomer } from "../api"
import { displayError } from "@/utils/error-handler"
import EmptyState from "@components/EmptyState.vue"
import { useRoute, useRouter } from "vue-router"

// Router
const route = useRoute()
const router = useRouter()

// API calls
const { data: customersData, isLoading, refetch } = useGetCustomers()
const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer()

// Get individual customer data when customerUid is set
const customerUid = ref<string>("")
const { data: customerData } = useGetCustomer(customerUid, true)

// Component state
const formMode = ref<TCustomerFormMode>("add")
const showDeleteConfirmationModal = ref(false)
const showCustomerFormDrawer = ref(false)
const showViewCustomerDrawer = ref(false)
const showExportCustomerModal = ref(false)
const customer = ref<ICustomer | null>(null)
const searchQuery = ref("")

// Computed properties
const customers = computed(() => {
  if (!customersData.value?.data?.results) return []

  return customersData.value.data.results
})

const filteredCustomers = computed<ICustomer[]>(() => {
  if (!searchQuery.value) return customers.value

  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(
    (customer: ICustomer) =>
      customer.full_name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query),
  )
})

const customerMetrics = computed(() => {
  const stats = customersData.value?.data?.stats
  if (!stats) {
    return [
      {
        label: "Total Customers",
        value: "0",
        prev_value: "0",
        icon: "user-octagon",
        chartData: [10, 12, 8, 14, 15, 9, 0],
        chartColor: "#D0F8AA",
        iconClass: "md:text-green-700",
      },
      {
        label: "Active Customers",
        value: "0",
        prev_value: "0",
        icon: "user-circle-add",
        chartData: [10, 12, 8, 14, 15, 9, 0],
        chartColor: "#FECCD6",
        iconClass: "md:text-bloom-700",
      },
    ]
  }

  return [
    {
      label: "Total Customers",
      value: String(stats.total_customers),
      prev_value: String(Math.max(0, stats.total_customers - 5)), // Mock previous value
      icon: "user-octagon",
      chartData: [10, 12, 8, 14, 15, 9, stats.total_customers],
      chartColor: "#D0F8AA",
      iconClass: "md:text-green-700",
    },
    {
      label: "Active Customers",
      value: String(stats.active_customers),
      prev_value: String(Math.max(0, stats.active_customers - 2)), // Mock previous value
      icon: "user-circle-add",
      chartData: [5, 6, 5, 7, 8, 6, stats.active_customers],
      chartColor: "#FECCD6",
      iconClass: "md:text-bloom-700",
    },
  ]
})

// Row click handler
const handleRowClick = (clickedCustomer: ICustomer) => {
  customer.value = { ...clickedCustomer }
  formMode.value = "view"
  customerUid.value = clickedCustomer.uid
  router.replace({ query: { uid: clickedCustomer.uid } })
  showViewCustomerDrawer.value = true
}

// Email dropdown items
const getEmailDropdownItems = (item: ICustomer) => [
  {
    id: "copy-email",
    label: item.email || "No email available",
    icon: "copy-01",
    action: () => copyToClipboard(item.email, "Email copied to clipboard!"),
  },
]

// Phone dropdown items
const getPhoneDropdownItems = (item: ICustomer) => [
  {
    id: "copy-phone",
    label: item.phone || "No phone available",
    icon: "copy-01",
    action: () => copyToClipboard(item.phone, "Phone number copied to clipboard!"),
  },
]

// Copy to clipboard function
const copyToClipboard = async (text: string | null | undefined, successMessage: string) => {
  if (!text) {
    toast.error("No information available to copy")
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    toast.success(successMessage)
  } catch (err) {
    console.error("Failed to copy to clipboard:", err)
    toast.error("Failed to copy to clipboard")
  }
}

// Action items for dropdown
const getActionItems = (item: ICustomer) => [
  {
    id: "view",
    label: "View Customer",
    icon: "eye-outline",
    action: () => handleAction("view", item),
  },
  {
    id: "edit",
    label: "Edit Customer",
    icon: "edit",
    action: () => handleAction("edit", item),
  },
  {
    divider: true,
  },
  {
    id: "delete",
    label: "Delete Customer",
    icon: "trash",
    class: "text-red-600 hover:bg-red-50",
    iconClass: "text-red-600",
    action: () => handleAction("delete", item),
  },
]

// Handle various actions
const handleAction = (action: "archive" | "edit" | "view" | "delete", item: ICustomer) => {
  console.log(action, item)

  if (action === "edit") {
    customer.value = { ...item }
    formMode.value = "edit"
    customerUid.value = item.uid
    router.replace({ query: { uid: item.uid } })
    setTimeout(() => {
      showCustomerFormDrawer.value = true
    }, 0)
  } else if (action === "delete") {
    customer.value = item
    showDeleteConfirmationModal.value = true
  } else if (action === "view") {
    customer.value = item
    formMode.value = "view"
    customerUid.value = item.uid
    router.replace({ query: { uid: item.uid } })
    showViewCustomerDrawer.value = true
  }
}

// Handle customer deletion
const handleDeleteCustomer = () => {
  if (!customer.value) return

  deleteCustomer(customer.value?.uid, {
    onSuccess: () => {
      toast.success("Customer deleted successfully")
      showDeleteConfirmationModal.value = false
      customer.value = null
      refetch()
    },
    onError: displayError,
  })
}

// Function to handle opening add customer drawer
const openAddCustomerDrawer = () => {
  customer.value = null
  formMode.value = "add"
  showCustomerFormDrawer.value = true
}

// Watch for data changes and log them
watch(
  () => customersData.value,
  (newData) => {
    if (newData) {
      console.log("Fetched customers:", newData.data.results)
    }
  },
  { immediate: true },
)

watch(showViewCustomerDrawer, (isOpen) => {
  if (!isOpen && route.query.uid) {
    router.replace({ query: {} })
    customerUid.value = ""
  }
})

// Watch for edit drawer state changes to sync query params
watch(showCustomerFormDrawer, (isOpen) => {
  if (!isOpen && route.query.uid) {
    router.replace({ query: {} })
    customerUid.value = ""
  }
})

onMounted(() => {
  if (route.query.create === "true") {
    openAddCustomerDrawer()
  } else if (route.query.uid && typeof route.query.uid === "string") {
    customerUid.value = route.query.uid
    formMode.value = "view"
    showViewCustomerDrawer.value = true
  }
})
</script>
