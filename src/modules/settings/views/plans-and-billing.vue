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
    <div class="rounded-2xl border border-gray-200">
      <header class="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3">
        <div class="flex items-center gap-2 md:gap-3">
          <div
            class="bg-primary-100 flex size-10 items-center justify-center rounded-full md:size-12"
          >
            <div class="bg-primary-200 flex size-8 items-center justify-center rounded-full">
              <Icon name="layers-three-01" size="16" class="text-primary-600" />
            </div>
          </div>

          <h4 class="text-core-800 text-sm font-medium md:text-lg">Current Plan</h4>

          <Chip color="indigo" :label="currentPlanChipLabel" size="sm" />
        </div>

        <Chip
          showDot
          :color="currentSubscription?.is_cancelled ? 'cancelled' : 'blue'"
          :label="currentSubscription?.is_cancelled ? 'Cancelled' : 'Active'"
          size="sm"
        />
      </header>

      <hr class="border-gray-200" />

      <div class="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-core-800 text-base">
            <span class="text-xl font-bold">{{ planPriceDisplay }}</span>
            <span v-if="planFrequencyDisplay" class="text-core-500 font-normal"
              >/{{ planFrequencyDisplay }}</span
            >
          </p>
          <p v-if="nextPaymentDate" class="text-core-500 mt-1 text-xs md:text-sm">
            Next Payment: {{ nextPaymentDate }}
          </p>
        </div>

        <AppButton
          v-if="nextPaymentDate && currentPlan !== 'N/A' && !currentSubscription?.is_cancelled"
          label="Cancel Subscription"
          variant="outlined"
          class="!border-gray-300 bg-transparent !text-gray-700 hover:!bg-gray-50"
          @click="showCancelModal = true"
        />
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
    <CancelSubscriptionModal
      v-model="showCancelModal"
      :next-payment-date="nextPaymentDate || ''"
      :current-plan="currentPlan"
      :loading="isCancelling"
      @confirm="handleCancelSubscription"
      @view-plans="handleViewPlans"
    />

    <!-- Cancellation Success Modal -->
    <SuccessModal
      v-model="showSuccessModal"
      title="Subscription cancelled!"
      subtitle="Your subscription has been cancelled successfully!"
      button-text="Awesome!"
    />
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
import CancelSubscriptionModal from "../components/CancelSubscriptionModal.vue"
import SuccessModal from "@/components/SuccessModal.vue"
import { getPlanColor } from "../utils"
import { TChipColor } from "@modules/shared/types"
import { useGetSubscriptionHistory, useGetPlans, useCancelSubscription } from "../api"
import { useAuthStore } from "@modules/auth/store"
import { displayError } from "@/utils/error-handler"

const showPlansModal = ref(false)
const showCancelModal = ref(false)
const showSuccessModal = ref(false)
const authStore = useAuthStore()

// Get current subscription from user store
const currentSubscription = computed(() => authStore.user?.subscription)

// Get plans data to fetch Bud plan price
const { data: plansData } = useGetPlans()

// Get Bud plan price based on subscription frequency
const budPlanPrice = computed(() => {
  if (!plansData.value?.data?.results) return null

  const frequency = currentSubscription.value?.plan_frequency || "monthly"
  const budPlan = plansData.value.data.results.find(
    (plan) => plan.name === "Bud" && plan.frequency === frequency,
  )

  return budPlan ? parseFloat(budPlan.price) : null
})

// Get current plan name
const currentPlan = computed(() => {
  if (!currentSubscription.value || !currentSubscription.value.is_active) {
    return "N/A"
  }
  const planName = currentSubscription.value.plan_name || "N/A"
  const isTrial = currentSubscription.value.trial_mode || false
  return isTrial ? `${planName} trial` : planName
})

// Get base plan name without trial suffix for comparisons
const basePlanName = computed(() => {
  return currentSubscription.value?.plan_name || "N/A"
})

// Format frequency for display: "monthly" -> "month", "annually" -> "year"
const frequencyDisplayMap: Record<string, string> = {
  monthly: "month",
  annually: "year",
  yearly: "year",
}

// Chip label showing plan name + frequency (e.g. "Bloom - Yearly")
const currentPlanChipLabel = computed(() => {
  if (currentPlan.value === "N/A") return "N/A"
  const freq = currentSubscription.value?.plan_frequency
  if (!freq) return currentPlan.value
  const freqLabel = freq.charAt(0).toUpperCase() + freq.slice(1)
  return `${currentPlan.value} - ${freqLabel}`
})

// Price amount only (bold part)
const planPriceDisplay = computed(() => {
  if (basePlanName.value === "Bud" && budPlanPrice.value !== null) {
    return formatCurrency(budPlanPrice.value)
  }
  if (currentSubscription.value?.plan_price) {
    return formatCurrency(Number(currentSubscription.value.plan_price))
  }
  return "N/A"
})

// Frequency label (non-bold part)
const planFrequencyDisplay = computed(() => {
  if (planPriceDisplay.value === "N/A") return ""
  const freq = currentSubscription.value?.plan_frequency || "month"
  return frequencyDisplayMap[freq] || freq
})

// Calculate next payment date
const nextPaymentDate = computed(() => {
  if (!currentSubscription.value?.active_until || currentPlan.value === "N/A") {
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

// Cancel subscription mutation
const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription()

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

const handleCancelSubscription = () => {
  cancelSubscription(undefined, {
    onSuccess: () => {
      showCancelModal.value = false
      showSuccessModal.value = true
    },
    onError: displayError,
  })
}

const handleViewPlans = () => {
  showCancelModal.value = false
  showPlansModal.value = true
}
</script>
