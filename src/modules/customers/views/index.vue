<template>
  <PageHeader title="Customers" :count="customers.length" count-label="customers" />

  <div class="p-4">
    <div class="hidden lg:block">
      <SectionHeader
        title="Customers"
        subtitle="View, manage, and keep track of all your customers in one place."
        class="mb-4"
      />
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard v-for="item in customerMetrics" :key="item.label" :stat="item" />
    </div>

    <EmptyState
      v-if="!isLoading && customers.length === 0 && !debouncedSearch"
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
            size="sm"
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
        :data="customers ?? []"
        :columns="CUSTOMER_COLUMNS"
        :loading="isLoading"
        :show-pagination="true"
        :items-per-page="itemsPerPage"
        :total-items-count="customersData?.data?.count || 0"
        :total-page-count="Math.ceil((customersData?.data?.count || 0) / itemsPerPage) || 1"
        :server-pagination="true"
        @pagination-change="(d) => (page = d.currentPage)"
        @row-click="handleRowClick"
      >
        <template #cell:name="{ item }">
          <Avatar v-if="item.full_name" :name="item?.full_name" :extra-text="true" />
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
          <div
            class="border-core-300 bg-core-25 text-core-600 flex w-full cursor-pointer gap-2 rounded-xl border p-4"
            @click="handleRowClick(item)"
          >
            <Avatar :name="String(item.full_name)" />

            <div class="w-full">
              <div class="flex w-full items-center gap-2">
                <h3 class="text-base font-semibold text-gray-700">{{ item.full_name }}</h3>
                <Chip
                  :label="`${String(item.total_orders)} orders`"
                  variant="outlined"
                  size="sm"
                  showDot
                />

                <div class="ml-auto">
                  <DropdownMenu :items="getActionItems(item)" />
                </div>
              </div>

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
import { ref, computed, watch } from "vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import { formatDateLong } from "../utils/dateFormatter"
import { toast } from "@/composables/useToast"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import CustomerFormDrawer from "../components/CustomerFormDrawer.vue"
import ExportCustomerModal from "../components/ExportCustomerModal.vue"
import ViewCustomerDrawer from "../components/ViewCustomerDrawer.vue"
import SectionHeader from "@components/SectionHeader.vue"
import PageHeader from "@components/PageHeader.vue"
import { useGetCustomers, useDeleteCustomer, useGetCustomer } from "../api"
import { displayError } from "@/utils/error-handler"
import EmptyState from "@components/EmptyState.vue"
import { useRoute, useRouter } from "vue-router"
import { usePremiumAccess } from "@/composables/usePremiumAccess"
import StatCard from "@components/StatCard.vue"
import { useDebouncedRef } from "@/composables/useDebouncedRef"

// Router
const route = useRoute()
const router = useRouter()

// Component state
const formMode = ref<TCustomerFormMode>("add")
const showDeleteConfirmationModal = ref(false)
const showCustomerFormDrawer = ref(false)
const showViewCustomerDrawer = ref(false)
const showExportCustomerModal = ref(false)
const customer = ref<ICustomer | null>(null)
const searchQuery = ref("")
const debouncedSearch = useDebouncedRef(searchQuery, 750)
const page = ref(1)
const itemsPerPage = ref(20)
const computedParams = computed(() => {
  const params: Record<string, string> = {}
  if (debouncedSearch.value) params.search = debouncedSearch.value
  params.offset = ((page.value - 1) * itemsPerPage.value).toString()
  params.limit = itemsPerPage.value.toString()
  return params
})
// API calls
const { data: customersData, isLoading, refetch } = useGetCustomers(computedParams)
const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer()
const { checkPremiumAccess } = usePremiumAccess()

// Get individual customer data when customerUid is set
const customerUid = ref<string>("")
const { data: customerData } = useGetCustomer(customerUid, true)

// Computed properties
const customers = computed(() => {
  if (!customersData.value?.data?.results) return []

  return customersData.value.data.results
})

const customerMetrics = computed(() => {
  const stats = customersData.value?.data?.stats
  if (!stats) {
    return [
      {
        label: "Total Customers",
        value: 0,
        icon: "user-octagon",
        iconClass: "md:text-green-700",
      },
      {
        label: "Active Customers",
        value: 0,
        icon: "user-circle-add",
        iconClass: "md:text-bloom-700",
      },
    ]
  }

  return [
    {
      label: "Total Customers",
      value: String(stats.total_customers),
      icon: "user-octagon",
      iconClass: "md:text-green-700",
    },
    {
      label: "Active Customers",
      value: String(stats.active_customers),
      icon: "user-circle-add",
      iconClass: "md:text-bloom-700",
    },
  ]
})

// Row click handler
const handleRowClick = (clickedCustomer: ICustomer) => {
  // customer.value = { ...clickedCustomer }
  // formMode.value = "view"
  // customerUid.value = clickedCustomer.uid
  // router.replace({ query: { uid: clickedCustomer.uid } })
  // showViewCustomerDrawer.value = true
  router.push(`/customers/${clickedCustomer.uid}`)
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
    // customer.value = item
    // formMode.value = "view"
    // customerUid.value = item.uid
    // router.replace({ query: { uid: item.uid } })
    // showViewCustomerDrawer.value = true
    router.push(`/customers/${item.uid}`)
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
  // Check premium access before opening drawer
  if (!checkPremiumAccess()) return

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
  if (!isOpen) {
    if (route.query.uid) {
      customerUid.value = ""
    }
    router.replace({ query: {} })
  }
})

// Watch for route query to open create modal/drawer
watch(
  () => route.query.create,
  (newVal) => {
    if (newVal === "true") {
      openAddCustomerDrawer()
    }
  },
  { immediate: true },
)

// Watch for route query to open view drawer
watch(
  () => route.query.uid,
  (newVal) => {
    if (newVal && typeof newVal === "string" && !route.query.create) {
      customerUid.value = newVal
      formMode.value = "view"
      showViewCustomerDrawer.value = true
    }
  },
  { immediate: true },
)
</script>
