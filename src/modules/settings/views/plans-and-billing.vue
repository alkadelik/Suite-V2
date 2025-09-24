<template>
  <div>
    <div class="flex flex-col items-center justify-between md:mb-4 md:flex-row">
      <SectionHeader
        title="Plans & Billing"
        subtitle="Manage your plan, payments, and invoices in one place."
        class="mb-4"
      />
    </div>

    <!-- plan details  -->
    <div class="flex flex-col gap-3 md:flex-row">
      <!-- current plan  -->
      <div class="cursor-no-allowed flex-1 rounded-2xl border-2 border-gray-200">
        <header
          class="flex items-center justify-between rounded-t-2xl border-b-2 border-gray-200 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <div class="bg-primary-100 rounded-full p-1.5">
              <div class="bg-primary-200 rounded-full p-2">
                <Icon name="layers-three-01" size="16" class="text-primary-600" />
              </div>
            </div>

            <h4 class="text-primary-800 text-lg font-medium md:text-xl">Current Plan</h4>
          </div>

          <Chip showDot color="blue" label="Active" />
        </header>
        <div class="flex items-center justify-between p-4">
          <div class="flex flex-col items-start gap-5">
            <Chip color="success" label="Bud" />

            <p class="text-core-800 text-xs md:text-sm">Free</p>
          </div>
          <AppButton
            label="Upgrade Plan"
            icon="arrow-right"
            icon-placement="right"
            @click="showPlansModal = true"
          />
        </div>
      </div>

      <!-- next payment -->
      <div class="cursor-no-allowed flex flex-1 flex-col rounded-2xl border-2 border-gray-200">
        <header
          class="flex items-center justify-between rounded-t-2xl border-b-2 border-gray-200 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <div class="bg-primary-100 rounded-full p-1.5">
              <div class="bg-primary-200 rounded-full p-2">
                <Icon name="layers-three-01" size="16" class="text-primary-600" />
              </div>
            </div>

            <h4 class="text-primary-800 text-lg font-medium md:text-xl">Next Payment</h4>
          </div>
        </header>
        <div class="flex flex-1 items-center p-4">
          <p class="text-core-700 text-lg font-semibold">23rd August, 2025</p>
        </div>
      </div>
    </div>

    <div class="mt-6 space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:border">
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          Subscription History <Chip :label="String(SUBSCRIPTIONS.length)" />
        </h3>
      </div>

      <DataTable
        :data="SUBSCRIPTIONS"
        :columns="SUBSCRIPTION_COLUMN"
        :loading="false"
        :show-pagination="false"
      >
        <!-- Desktop cell templates -->
        <template #cell:planName="{ value }">
          <Chip :label="String(value)" variant="outlined" :color="getPlanColor(String(value))" />
        </template>

        <template #cell:status="{ value }">
          <Chip :label="String(value)" variant="outlined" :color="getStatusColor(String(value))" />
        </template>

        <template #cell:amount="{ value }">
          <span class="font-medium">{{
            formatCurrency(typeof value === "number" ? value : Number(value) || undefined)
          }}</span>
        </template>

        <template #cell:action="{ item }">
          <div class="flex items-center gap-2">
            <Icon
              name="eye-outline"
              @click="handleAction('view', item)"
              class="text-core-600 hover:text-core-700 hidden cursor-pointer md:inline-block"
            />
            <Icon
              name="import"
              @click="handleAction('view', item)"
              class="text-core-600 hover:text-core-700 hidden cursor-pointer md:inline-block"
            />
            <!-- <DropdownMenu
              :items="getActionItems(item)"
              placement="bottom-end"
              :show-chevron="false"
              size="sm"
              trigger-class="!p-1 !min-h-6 !w-6 hover:bg-gray-100 !border-0"
            >
              <template #trigger>
                <Icon name="dots-vertical" />
              </template>
            </DropdownMenu> -->
          </div>
        </template>

        <!-- Mobile view cell templates -->
        <template #mobile-content="{ item }">
          <div class="space-y-2">
            <div class="flex justify-between">
              <div class="space-y-2">
                <p class="text-core-800 text-sm font-medium">{{ item.planName }}</p>
                <div class="flex items-center gap-2">
                  <p class="text-core-600 text-xs">{{ item.billingPeriod }}</p>
                  <div class="bg-core-600 h-1 w-1 rounded-full"></div>
                  <p class="text-core-600 text-xs">{{ item.date }}</p>
                </div>
                <Chip
                  :label="String(item.status)"
                  variant="outlined"
                  :color="getStatusColor(item.status)"
                  size="sm"
                />
              </div>
              <p class="font-medium">{{ formatCurrency(item.amount) }}</p>
            </div>
          </div>
        </template>

        <!-- <template #mobile-actions="{ item }">
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
        </template> -->
      </DataTable>
    </div>

    <!-- modals -->
    <PlansModal v-model="showPlansModal" @close="showPlansModal = false" />
  </div>
</template>

<script setup lang="ts">
import SectionHeader from "@/components/SectionHeader.vue"
import { ref } from "vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { formatCurrency } from "@/utils/format-currency"
import DataTable from "@components/DataTable.vue"
// import DropdownMenu from "@components/DropdownMenu.vue"
import type { TSubscription } from "../types"
import { SUBSCRIPTION_COLUMN, SUBSCRIPTIONS } from "../constants"
import PlansModal from "../components/PlansModal.vue"
import { getPlanColor } from "../utils"
import { TChipColor } from "@modules/shared/types"

const showPlansModal = ref(false)

const getStatusColor = (status: string): TChipColor => {
  const statusColors: Record<string, TChipColor> = {
    Success: "success",
    Failed: "error",
    Pending: "warning",
  }
  return statusColors[status] || "primary"
}

const handleAction = (action: string, item: TSubscription) => {
  console.log(`${action} action for subscription:`, item)
}

// const getActionItems = (item: TSubscription) => [
//   {
//     label: "View Details",
//     icon: "eye-outline",
//     action: () => handleAction("view", item),
//   },
//   {
//     label: "Download Invoice",
//     icon: "import",
//     action: () => handleAction("download", item),
//   },
//   ...(item.status === "Failed"
//     ? [
//         {
//           label: "Retry Payment",
//           icon: "refresh-cw",
//           action: () => handleAction("retry", item),
//         },
//       ]
//     : []),
// ]
</script>
