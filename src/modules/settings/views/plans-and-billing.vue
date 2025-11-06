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
            <Chip :color="getPlanColor(currentPlan)" :label="currentPlan" />

            <p class="text-core-800 text-xs md:text-sm">
              {{
                currentSubscription?.plan_price
                  ? `${formatCurrency(Number(currentSubscription.plan_price))} / ${currentSubscription.plan_frequency}`
                  : "Free"
              }}
            </p>
          </div>
          <AppButton
            v-if="currentPlan === 'Bud'"
            label="Upgrade Plan"
            icon="arrow-right"
            icon-placement="right"
            @click="showPlansModal = true"
          />
          <AppButton
            v-else
            label="Manage Plan"
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
          <p class="text-core-700 text-lg font-semibold">
            {{ nextPaymentDate || "N/A" }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-6 space-y-4 rounded-xl border-gray-200 bg-white pt-3 md:border">
      <div class="flex flex-col justify-between md:flex-row md:items-center md:px-4">
        <h3 class="mb-2 flex items-center gap-1 text-lg font-semibold md:mb-0">
          Subscription History <Chip :label="String(subscriptions.length)" />
        </h3>
      </div>

      <DataTable
        :data="subscriptions"
        :columns="SUBSCRIPTION_COLUMN"
        :loading="isGettingSubscriptions"
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
              @click="handleAction('download', item)"
              class="text-core-600 hover:text-core-700 hidden cursor-pointer md:inline-block"
            />
          </div>
        </template>

        <!-- Mobile view cell templates -->
        <template #mobile="{ item }">
          <div class="space-y-2">
            <div class="flex justify-between">
              <div class="space-y-2">
                <p class="text-core-800 text-sm font-medium">{{ item.user_name }}</p>
                <div class="flex items-center gap-2">
                  <p class="text-core-600 text-xs">{{ item.user_name }}</p>
                  <div class="bg-core-600 h-1 w-1 rounded-full"></div>
                  <p class="text-core-600 text-xs">{{ item.date_paid || "Pending" }}</p>
                </div>
                <Chip
                  :label="String(item.status)"
                  variant="outlined"
                  :color="getStatusColor(item.status)"
                  size="sm"
                />
              </div>
              <p class="font-medium">{{ formatCurrency(Number(item.amount)) }}</p>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- modals -->
    <PlansModal v-model="showPlansModal" @close="showPlansModal = false" />
  </div>
</template>

<script setup lang="ts">
import SectionHeader from "@/components/SectionHeader.vue"
import { ref, computed } from "vue"
import Chip from "@components/Chip.vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import { formatCurrency } from "@/utils/format-currency"
import DataTable from "@components/DataTable.vue"
import type { TSubscription } from "../types"
import { SUBSCRIPTION_COLUMN } from "../constants"
import PlansModal from "../components/PlansModal.vue"
import { getPlanColor } from "../utils"
import { TChipColor } from "@modules/shared/types"
import { useGetSubscriptionHistory } from "../api"
import { useAuthStore } from "@modules/auth/store"

const showPlansModal = ref(false)
const authStore = useAuthStore()

// Get current subscription from user store
const currentSubscription = computed(() => authStore.user?.subscription)

// Get current plan name
const currentPlan = computed(() => {
  if (!currentSubscription.value || !currentSubscription.value.is_active) {
    return "Bud"
  }
  return currentSubscription.value.plan_name
})

// Calculate next payment date
const nextPaymentDate = computed(() => {
  if (!currentSubscription.value?.active_until || currentPlan.value === "Bud") {
    return null
  }

  const activeUntil = new Date(currentSubscription.value.active_until)
  return activeUntil.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
})

const { data: subscriptionData, isPending: isGettingSubscriptions } = useGetSubscriptionHistory()

// Transform API data to match table structure
const subscriptions = computed(() => {
  if (!subscriptionData.value?.data?.results) return []

  return subscriptionData.value.data.results.map((item: TSubscription) => ({
    uid: item.uid,
    date: item.date_paid
      ? new Date(item.date_paid).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A",
    planName: item.is_payment_for === "subscription" ? "Premium" : item.is_payment_for,
    amount: Number(item.amount),
    billingPeriod: "Monthly", // Since this info isn't in API, you might want to add it or derive it
    status:
      item.status === "completed"
        ? "Success"
        : item.status === "failed"
          ? "Failed"
          : item.status === "pending"
            ? "Pending"
            : item.status,
  }))
})

const getStatusColor = (status: string): TChipColor => {
  const statusColors: Record<string, TChipColor> = {
    Success: "success",
    Failed: "error",
    Pending: "warning",
    completed: "success",
    failed: "error",
    pending: "warning",
  }
  return statusColors[status] || "primary"
}

const handleAction = (action: string, item: TSubscription) => {
  console.log(`${action} action for subscription:`, item)
  // Add your action handling logic here
  if (action === "view") {
    // Handle view action
  } else if (action === "download") {
    // Handle download action
  }
}
</script>
