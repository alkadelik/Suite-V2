<template>
  <Modal
    :open="modelValue"
    title="Upgrade Plan"
    max-width="6xl"
    @close="emit('update:modelValue', false)"
    variant="bottom-nav"
  >
    <IconHeader
      icon-name="shop-add"
      subtext="Choose a plan that fits your business needs and budget."
      class="mb-6"
    />

    <div class="mb-6 flex justify-center">
      <Tabs variant="pills" :tabs="tabs" v-model="activeTab" class="w-full md:w-1/2" />
    </div>

    <!-- Loading State -->
    <div v-if="isPending" class="flex items-center justify-center py-20">
      <LoadingIcon size="lg" />
    </div>

    <!-- Plans Display -->
    <div v-else class="text-core-700 mb-4 flex flex-col gap-3 md:flex-row">
      <div
        v-for="plan in processedPlans"
        :key="plan.uid"
        class="flex flex-1 flex-col rounded-xl border border-gray-200"
        :class="{
          'bg-primary-50 border-primary-600': plan.highlighted,
          'border-gray-400': plan.active && !plan.highlighted,
        }"
      >
        <!-- Header Section - Fixed Height -->
        <div class="mb-3 flex min-h-[40px] items-center justify-between p-4 pb-0">
          <div class="bg-primary-100 rounded-full p-1.5">
            <div class="bg-primary-200 rounded-full p-2">
              <Icon name="layers-three-01" size="16" class="text-primary-600" />
            </div>
          </div>

          <Chip v-if="plan.chipText" :label="plan.chipText" />
        </div>

        <!-- Plan Info Section - Fixed Height -->
        <div class="mb-4 min-h-[80px] px-4">
          <Chip
            :label="plan.name"
            :color="getPlanColor(plan.name)"
            class="mb-2 text-sm font-medium"
          />
          <p class="text-xs md:text-sm">{{ plan.description }}</p>
        </div>

        <!-- Price Section - Fixed Height -->
        <div
          class="mb-4 flex min-h-[80px] items-end border-b border-gray-200 px-4 pb-4"
          :class="{
            'border-primary-600': plan.highlighted,
            'border-gray-400': plan.active && !plan.highlighted,
          }"
        >
          <h4 class="text-2xl font-bold">
            {{ formatCurrency(plan.currentPrice) }}
            <span class="text-xs font-normal md:text-sm">
              /{{ activeTab === "monthly" ? "month" : "year" }}
            </span>
          </h4>
        </div>

        <!-- Features Section - Flexible Height -->
        <div
          class="flex flex-grow flex-col gap-2 border-b border-gray-200 px-4 pb-3"
          :class="{
            'border-primary-600': plan.highlighted,
            'border-gray-400': plan.active && !plan.highlighted,
          }"
        >
          <div
            v-for="(feature, index) in plan.features"
            :key="feature"
            class="flex gap-1"
            :class="{ hidden: !expandPlans && index >= 4 }"
          >
            <Icon name="check" class="text-core-600 mt-0.5 flex-shrink-0" />
            <p class="text-xs md:text-sm">{{ feature }}</p>
          </div>

          <!-- See More Button - Centered -->
          <div v-if="plan.features.length > 4 && !expandPlans" class="mt-1 flex justify-center">
            <button
              @click="expandPlans = true"
              class="text-primary-700 hover:text-primary-800 flex items-center gap-1 text-xs font-semibold transition-colors md:text-sm"
            >
              <span>See more</span>
              <Icon name="arrow-down" size="20" class="text-primary-700" />
            </button>
          </div>
        </div>

        <!-- Button Section - Fixed Height -->
        <div class="flex min-h-[60px] items-center px-4 pt-4 pb-4">
          <AppButton
            :label="
              plan.active
                ? 'Current Plan'
                : plan.planOrder < (processedPlans.find((p) => p.active)?.planOrder ?? 0)
                  ? 'Downgrade'
                  : 'Upgrade'
            "
            :disabled="plan.active || loadingPlanId === plan.uid"
            :loading="loadingPlanId === plan.uid && isInitializing"
            class="w-full"
            @click="handlePlanAction(plan)"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "@/components/Modal.vue"
import Chip from "@components/Chip.vue"
import IconHeader from "@components/IconHeader.vue"
import Tabs from "@components/Tabs.vue"
import { ref, computed, watch } from "vue"
import { getPlanColor } from "../utils"
import { formatCurrency } from "@/utils/format-currency"
import Icon from "@/components/Icon.vue"
import AppButton from "@/components/AppButton.vue"
import { useGetPlans, useInitializeSubscription } from "../api"
import LoadingIcon from "@components/LoadingIcon.vue"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "@modules/auth/store"

const props = defineProps<{ modelValue: boolean; hideBud?: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const activeTab = ref("monthly")
const { data: plansData, isPending } = useGetPlans()
const { mutate: initializeSubscription, isPending: isInitializing } = useInitializeSubscription()
const authStore = useAuthStore()

// Get current subscription plan name
const currentPlanName = computed(() => {
  const subscription = authStore.user?.subscription
  if (!subscription || !subscription.is_active) {
    return null // No active plan
  }
  // If user is on trial, don't mark any plan as active (allow upgrading to any plan)
  if (subscription.trial_mode) {
    return null
  }
  return subscription.plan_name
})

// Track which plan is currently loading
const loadingPlanId = ref<string | null>(null)

// Track expanded state for each plan
const expandPlans = ref<boolean>(false)

const tabs = ref([
  {
    title: "Monthly",
    key: "monthly",
  },
  {
    title: "Yearly (-20%)",
    key: "yearly",
  },
])

// Static features for each plan type
const planFeatures = computed(() => ({
  ...(props.hideBud
    ? {}
    : {
        Bud: [
          "Up to 100 products",
          "Basic analytics",
          "Email support",
          "Single staff account",
          "Basic inventory tracking",
          "Standard templates",
        ],
      }),
  Bloom: [
    "Up to 1,000 products",
    "Advanced analytics",
    "Priority email support",
    "Up to 5 staff accounts",
    "Discounts and promotions",
    "Advanced inventory management",
  ],
  Burst: [
    "Unlimited products",
    "Comprehensive analytics",
    "24/7 phone & email support",
    "Unlimited staff accounts",
    "Advanced marketing tools",
    "Custom reporting",
  ],
}))

// Define interfaces for type safety
interface PlanGroup {
  name: string
  description: string
  monthly: { price: number; uid: string } | null
  yearly: { price: number; uid: string } | null
}

interface ProcessedPlan {
  uid: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  features: string[]
  active: boolean
  highlighted: boolean
  chipText: string | null
  planOrder: number
  currentPrice: number
}

interface SubscriptionResponse {
  data: { data: { payment_link: string } }
}

// Process the API data to create the plans structure
const processedPlans = computed((): ProcessedPlan[] => {
  if (!plansData.value?.data?.results) return []

  // Group plans by name to get monthly and yearly prices with UIDs
  const planGroups = plansData.value.data.results.reduce(
    (acc: Record<string, PlanGroup>, plan) => {
      if (!acc[plan.name]) {
        acc[plan.name] = {
          name: plan.name,
          description: plan.description,
          monthly: null,
          yearly: null,
        }
      }

      if (plan.frequency === "monthly") {
        acc[plan.name].monthly = {
          price: parseFloat(plan.price),
          uid: plan.uid,
        }
      } else if (plan.frequency === "annually") {
        acc[plan.name].yearly = {
          price: parseFloat(plan.price),
          uid: plan.uid,
        }
      }

      return acc
    },
    {} as Record<string, PlanGroup>,
  )

  // Convert to array and add additional properties
  let plans: ProcessedPlan[] = Object.values(planGroups).map((planGroup: PlanGroup) => {
    const planOrder = planGroup.name === "Bud" ? 1 : planGroup.name === "Bloom" ? 2 : 3

    // Get the appropriate UID based on active tab
    const currentPlanData = activeTab.value === "monthly" ? planGroup.monthly : planGroup.yearly

    // Fallback to the other frequency if current one is not available
    const fallbackPlanData = activeTab.value === "monthly" ? planGroup.yearly : planGroup.monthly

    const activePlanData = currentPlanData || fallbackPlanData

    return {
      uid: activePlanData?.uid || `${planGroup.name}-fallback`,
      name: planGroup.name,
      description: planGroup.description,
      priceMonthly: planGroup.monthly?.price || 0,
      priceYearly: planGroup.yearly?.price || 0,
      features: planFeatures.value[planGroup.name as keyof typeof planFeatures.value] || [],
      active: planGroup.name === currentPlanName.value,
      highlighted: planGroup.name === "Bloom",
      chipText: planGroup.name === "Bloom" ? "Leyyow's Choice" : null,
      planOrder,
      currentPrice: activePlanData?.price || 0,
    }
  })

  // Filter out Bud plan if hideBud is true
  if (props.hideBud) {
    plans = plans.filter((plan) => plan.name !== "Bud")
  }

  // Filter out Burst plan - only show Bud and Bloom
  plans = plans.filter((plan) => plan.name !== "Burst")

  // Sort by plan order
  return plans.sort((a, b) => a.planOrder - b.planOrder)
})

// Handle plan upgrade/downgrade action
const handlePlanAction = (plan: ProcessedPlan): void => {
  if (plan.active) return

  // Set loading state for this specific plan
  loadingPlanId.value = plan.uid

  initializeSubscription(plan.uid, {
    onSuccess: (response: SubscriptionResponse) => {
      // Clear loading state
      loadingPlanId.value = null

      // Close the modal
      emit("update:modelValue", false)

      // Redirect to payment link
      if (response.data.data.payment_link) {
        window.location.href = response.data.data.payment_link
      }
    },
    onError: displayError,
  })
}

// Watch activeTab to update current prices
watch(
  activeTab,
  () => {
    // Clear loading state when switching tabs
    loadingPlanId.value = null
  },
  { immediate: true },
)
</script>
