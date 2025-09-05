<template>
  <div class="p-4">
    <div class="page-header">
      <h1>Customers</h1>
      <p class="page-description">Manage your customer database and relationships</p>
    </div>

    <div class="mt-4 space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:border">
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          Customers List <Chip :label="String(CUSTOMERS.length)" />
        </h3>
        <div class="flex items-center gap-2">
          <TextField
            left-icon="search-lg"
            size="md"
            class="flex-1"
            placeholder="Search by customer name or email"
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
        :data="CUSTOMERS"
        :columns="CUSTOMER_COLUMNS"
        :loading="false"
        :show-pagination="false"
        :enable-row-selection="true"
      >
        <template #cell:name="{ item }">
          <div>
            <Avatar :name="`${item.firstName} ${item.lastName}`" />
          </div>
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
              @click="handleAction('delete', item)"
              class="hidden md:inline-block"
            />
            <Icon name="edit" @click="handleAction('edit', item)" class="hidden md:inline-block" />
            <DropdownMenu
              :items="getActionItems(item)"
              placement="bottom-end"
              :show-chevron="false"
              size="sm"
              trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0 md:hidden"
            >
              <template #trigger>
                <Icon name="dots-vertical" />
              </template>
            </DropdownMenu>
          </div>
        </template>

        <!-- mobile view cell templates -->
        <template #mobile-content="{ item }">
          <div class="space-y-2">
            <div class="flex items-start gap-2">
              <Avatar :name="`${item.firstName} ${item.lastName}`" class="items-start" />
              <Chip
                :label="`${String(item.totalOrders)} orders`"
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
                >
                  <template #trigger>
                    <Icon name="call" size="16" />
                  </template>
                </DropdownMenu>

                <span class="text-xs">{{ formatDateLong(item.lastOrderDate) }}</span>
              </div>
            </div>
          </div>
        </template>

        <template #mobile-actions="{ item }">
          <div class="flex items-center gap-2">
            <DropdownMenu
              :items="getActionItems(item)"
              placement="bottom-end"
              :show-chevron="false"
              size="sm"
              trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
            >
              <template #trigger>
                <Icon name="dots-vertical" />
              </template>
            </DropdownMenu>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- modals -->
    <DeleteConfirmationModal
      v-model="showDeleteConfirmationModal"
      @close="showDeleteConfirmationModal = false"
      header="Delete Customer"
      paragraph="Are you sure you want to delete this customer?"
      @delete="
        () => {
          console.log(customer)
          showDeleteConfirmationModal = false
        }
      "
    />
    <ExportCustomerModal
      v-model="showExportCustomerModal"
      @close="showExportCustomerModal = false"
    />

    <!-- drawers  -->
    <CustomerFormDrawer
      v-model="showCustomerFormDrawer"
      :mode="formMode"
      :customer="customer"
      @submit="handleCustomerSubmit"
    />
  </div>
</template>

<!-- Key changes to the script section only -->
<script setup lang="ts">
import DataTable from "@components/DataTable.vue"
import Avatar from "@components/Avatar.vue"
import { TCustomer, TCustomerFormMode, ICustomerFormPayload } from "../types"
import { CUSTOMER_COLUMNS, CUSTOMERS } from "../constants"
import { ref } from "vue"
import Icon from "@components/Icon.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"
import TextField from "@components/form/TextField.vue"
import AppButton from "@components/AppButton.vue"
import { formatDate, formatDateLong } from "../utils/dateFormatter"
import { toast } from "@/composables/useToast"
import DeleteConfirmationModal from "@components/DeleteConfirmationModal.vue"
import CustomerFormDrawer from "../components/CustomerFormDrawer.vue"
import ExportCustomerModal from "../components/ExportCustomerModal.vue"

const formMode = ref<TCustomerFormMode>("add")
const showDeleteConfirmationModal = ref(false)
const showCustomerFormDrawer = ref(false)
const showViewCustomerDrawer = ref(false)
const showExportCustomerModal = ref(false)
const customer = ref<TCustomer | null>(null)

// Email dropdown items
const getEmailDropdownItems = (item: TCustomer) => [
  {
    id: "copy-email",
    label: item.email || "No email available",
    icon: "copy-01",
    action: () => copyToClipboard(item.email, "Email copied to clipboard!"),
  },
]

// Phone dropdown items
const getPhoneDropdownItems = (item: TCustomer) => [
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

const getActionItems = (item: TCustomer) => [
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

const handleAction = (action: "archive" | "edit" | "view" | "delete", item: TCustomer) => {
  console.log(action, item)

  if (action === "edit") {
    // Set customer data BEFORE opening the drawer
    customer.value = { ...item } // Create a copy to avoid reference issues
    formMode.value = "edit"
    // Use nextTick to ensure reactive updates are processed
    setTimeout(() => {
      showCustomerFormDrawer.value = true
    }, 0)
  } else if (action === "delete") {
    customer.value = item
    showDeleteConfirmationModal.value = true
  } else if (action === "view") {
    customer.value = item
    showViewCustomerDrawer.value = true
  }
}

const handleCustomerSubmit = (payload: ICustomerFormPayload, mode: TCustomerFormMode) => {
  console.log("Customer form submitted:", payload, mode)

  if (mode === "edit" && customer.value) {
    // Update logic here - you might want to call an API or update your data store
    console.log("Updating customer:", customer.value.id, payload)
  } else if (mode === "add") {
    // Add logic here
    console.log("Adding new customer:", payload)
  }

  showCustomerFormDrawer.value = false
  customer.value = null // Clear selected customer
  // Refresh customer list or update state as needed
}

// Function to handle opening add customer drawer
const openAddCustomerDrawer = () => {
  customer.value = null // Clear any existing customer data
  formMode.value = "add"
  showCustomerFormDrawer.value = true
}
</script>
