<template>
  <Modal
    :open="modelValue"
    title="Upgrade Plan"
    max-width="6xl"
    @close="emit('update:modelValue', false)"
    :variant="isMobile ? 'fullscreen' : 'centered'"
  >
    <IconHeader
      icon-name="shop-add"
      subtext="Choose a plan that fits your business needs and budget."
      class="mb-6"
    />

    <div class="mb-6 flex justify-center">
      <Tabs variant="pills" :tabs="tabs" v-model="activeTab" class="w-full md:w-1/2" />
    </div>

    <!-- Loading Skeleton -->
    <div
      v-if="isPending"
      class="flex w-full flex-col space-y-6 rounded-2xl border border-gray-200 bg-white p-4 lg:flex-row lg:space-y-0 lg:space-x-6"
    >
      <!-- Left side skeleton -->
      <div
        class="flex flex-1 flex-col justify-between gap-10 rounded-2xl border border-gray-200 bg-gray-50 p-5"
      >
        <div>
          <div class="mb-3 flex flex-col items-start gap-4">
            <!-- Icon skeleton -->
            <div class="size-12 animate-pulse rounded-full bg-gray-200"></div>
            <!-- Chip skeleton -->
            <div class="h-6 w-20 animate-pulse rounded-full bg-gray-200"></div>
          </div>
          <!-- Description skeleton -->
          <div class="mt-4 space-y-2">
            <div class="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        <div class="flex flex-col gap-8">
          <!-- Price skeleton -->
          <div class="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
          <!-- Button skeleton -->
          <div class="h-12 w-full animate-pulse rounded-lg bg-gray-200"></div>
        </div>
      </div>

      <!-- Right side skeleton (features) -->
      <div class="flex h-full flex-1 flex-col justify-center p-6">
        <!-- Features title skeleton -->
        <div class="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
        <!-- Feature items skeleton -->
        <ul class="mt-4 space-y-3">
          <li v-for="i in 6" :key="i" class="flex items-center gap-3">
            <div class="size-5 flex-shrink-0 animate-pulse rounded bg-gray-200"></div>
            <div
              class="h-4 animate-pulse rounded bg-gray-200"
              :style="{ width: `${60 + Math.random() * 30}%` }"
            ></div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Plans Display -->
    <div
      v-else-if="bloomPlan"
      class="flex w-full flex-col space-y-6 rounded-2xl border border-gray-200 bg-white p-4 lg:flex-row lg:space-y-0 lg:space-x-6"
    >
      <div
        class="flex flex-1 flex-col justify-between gap-10 rounded-2xl border border-gray-200 bg-gray-50 p-5"
      >
        <div>
          <div class="mb-3 flex flex-col items-start gap-4">
            <div class="bg-primary-50 flex size-12 items-center justify-center rounded-full">
              <div class="bg-primary-100 flex size-9 items-center justify-center rounded-full">
                <Icon name="layers-three-01" size="16" class="text-primary-600" />
              </div>
            </div>

            <Chip color="success" label="🪴 Bloom" />
          </div>

          <p class="text-core-700 mt-4">{{ bloomPlan.description }}</p>
        </div>

        <div class="flex flex-col gap-8">
          <h2 class="text-2xl font-semibold text-gray-900">
            {{ formatCurrency(bloomPlan.currentPrice, { kobo: false }) }}
            <span class="text-sm font-normal text-gray-500"
              >/{{ activeTab === "monthly" ? "month" : "year" }}</span
            >
          </h2>
          <AppButton
            :label="isSubscribedToBloom ? 'Subscribed' : 'Upgrade'"
            size="lg"
            :disabled="isSubscribedToBloom || isInitializing"
            :loading="loadingPlanId === bloomPlan.uid"
            @click="handlePlanAction(bloomPlan)"
          />
        </div>
      </div>

      <div class="flex h-full flex-1 flex-col justify-center p-6">
        <h4 class="!font-outfit text-lg font-semibold text-gray-900">Features</h4>
        <ul class="mt-4 space-y-3">
          <li v-for="feature in planFeatures.Bloom" :key="feature" class="flex items-start gap-3">
            <Icon name="check" size="20" class="mt-1 flex-shrink-0 text-gray-400" />
            <span class="text-gray-700">{{ feature }}</span>
          </li>
        </ul>
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
import { formatCurrency } from "@/utils/format-currency"
import Icon from "@/components/Icon.vue"
import AppButton from "@/components/AppButton.vue"
import { useGetPlans, useInitializeSubscription } from "../api"
import { displayError } from "@/utils/error-handler"
import { useAuthStore } from "@modules/auth/store"
import { useMediaQuery } from "@vueuse/core"

const props = defineProps<{ modelValue: boolean; hideBud?: boolean }>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  refresh: []
}>()

const activeTab = ref("monthly")
const { data: plansData, isPending } = useGetPlans()
const { mutate: initializeSubscription, isPending: isInitializing } = useInitializeSubscription()
const authStore = useAuthStore()

// Track which plan is currently loading
const loadingPlanId = ref<string | null>(null)

const user = computed(() => authStore.user)

// Check if user is already subscribed to Bloom
const isSubscribedToBloom = computed(() => {
  const subscription = user.value?.subscription
  if (!subscription || !subscription.is_active) return false
  if (subscription.trial_mode) return false
  return subscription.plan_name?.toLowerCase() === "bloom"
})

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

const isMobile = useMediaQuery("(max-width: 1024px)")

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
      active:
        user.value?.subscription?.plan_name === planGroup.name &&
        !user.value?.subscription?.trial_mode,
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

// Get only the Bloom plan
const bloomPlan = computed((): ProcessedPlan | null => {
  return processedPlans.value.find((plan) => plan.name === "Bloom") || null
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
