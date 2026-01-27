<template>
  <aside
    :class="[
      'fixed z-40 h-full w-72 border-r border-gray-200 bg-white transition-all duration-200',
      'flex h-full flex-col divide-y divide-gray-200 overflow-y-auto',
      isMobile ? (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
    ]"
  >
    <!-- Brand -->
    <div
      class="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-4"
    >
      <img
        src="/LYW.svg?url"
        alt="Leyyow"
        class="h-8 w-auto cursor-pointer"
        @click="router.push('/dashboard')"
      />
    </div>

    <!-- Store Info -->
    <div class="bg-gray-50 px-4 py-4">
      <div class="mb-3 flex items-center gap-2">
        <div class="bg-core-200 flex size-10 items-center justify-center rounded-xl">
          <Icon name="shop" class="text-primary-800" size="24" />
        </div>
        <div class="min-w-0">
          <div class="flex min-w-0 items-end gap-2">
            <p class="min-w-0 truncate font-medium capitalize">
              {{ storeDetails?.name }}
            </p>
          </div>
          <div class="flex min-w-0 items-center gap-2 text-sm text-gray-600">
            <p class="min-w-0 truncate">{{ storefrontUrl }}</p>
            <Icon
              name="copy"
              size="20"
              class="text-primary-600 flex-shrink-0 cursor-pointer"
              @click="clipboardCopy('https://' + storefrontUrl)"
            />
          </div>
        </div>
      </div>
      <!-- Select Location -->
      <LocationDropdown />
    </div>

    <!-- Home & Get Started -->
    <div class="space-y-1 px-4 py-2">
      <SidebarLink
        v-if="!setupComplete && activeLocation?.is_hq"
        icon="candle"
        label="Get Started"
        to="/onboarding"
      />
      <SidebarLink icon="house" label="Home" to="/dashboard" />
    </div>

    <!-- Navigation -->
    <section class="space-y-1 px-4 py-2">
      <SidebarGroup
        icon="shopping-cart"
        label="Sales Suite"
        :children="salesSuiteItems"
        :default-expanded="true"
      />

      <!-- <SidebarGroup icon="trend-up" label="Marketing" :children="[]" /> -->

      <SidebarGroup
        v-if="isStaging"
        icon="building"
        label="Production"
        :children="productionItems"
      />

      <SidebarLink icon="receipt-text" label="Expenses" to="/expenses" />
    </section>

    <section class="mt-auto px-4 pb-4">
      <SidebarLink
        icon="life-buoy"
        label="Support"
        @click="
          () => {
            console.log('opening support modal')
            useSharedStore().openSupportModal()
          }
        "
      />

      <!-- Subscription view -->
      <div class="relative mt-20">
        <div
          :class="['relative isolate flex flex-col gap-1 rounded-3xl p-3 pt-12 text-white']"
          style="
            background: linear-gradient(136.41deg, #1a2a6c -3.7%, #b21f1f 53.98%, #fdbb2d 99.39%);
          "
        >
          <template v-if="subscription && !isActive && !isTrial">
            <h3 class="mb-1 text-sm font-bold">Your trial has ended!</h3>
            <p class="mb-4 text-sm">Upgrade to regain full access.</p>
          </template>

          <template v-else-if="isTrial">
            <h3 class="mb-1 text-sm font-bold">{{ trialTitle }}</h3>
            <p class="mb-2 text-sm">{{ trialSubtitle }}</p>
          </template>

          <template v-else-if="isActive">
            <h3 class="mb-1 text-sm font-semibold">
              Active: <b>{{ planName }} plan</b>
            </h3>
            <p class="mb-4 text-sm">Ends: {{ formattedEnds }}</p>
          </template>

          <template v-else>
            <h3 class="mb-1 text-sm font-bold">Do more with Premium!</h3>
            <p class="mb-4 text-sm">Get advanced tools to manage every aspect of your business.</p>
          </template>

          <AppButton
            v-if="isTrial || planNameLower !== 'bloom'"
            color="alt"
            label="Upgrade"
            class="w-full flex-row-reverse"
            icon="star"
            @click="$emit('upgrade')"
          />
        </div>

        <!-- Decorative images based on state -->
        <img v-if="isTrial" src="@/assets/images/gift.png" class="absolute -top-8 left-4 h-16" />

        <img
          v-else-if="subscription && !isActive && !isTrial"
          src="@/assets/images/gift-timer.png"
          class="absolute -top-8 left-4 h-16"
        />

        <img
          v-else-if="(isActive && planNameLower === 'bud') || !isActive"
          src="@/assets/images/bud-plant.png"
          class="absolute -top-8 left-4 h-16"
        />

        <img
          v-else-if="isActive && planNameLower === 'bloom'"
          src="@/assets/images/bloom-plant.png"
          class="absolute -top-8 left-4 h-16"
        />

        <!-- Active plan pill -->
        <!-- <div
          v-if="isActive && !isTrial"
          class="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs text-white"
        >
          <img
            v-if="planNameLower === 'bloom'"
            src="@/assets/images/bloom-plant.png"
            class="h-6 w-6 rounded-md"
          />
          <img
            v-else-if="planNameLower === 'bud'"
            src="@/assets/images/bud-plant.png"
            class="h-6 w-6 rounded-md"
          />
          <span>{{ planName }} Plan Active</span>
        </div> -->
      </div>
    </section>

    <!--  -->
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from "@modules/auth/store"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"
import Icon from "@components/Icon.vue"
import AppButton from "@components/AppButton.vue"
import SidebarLink from "./SidebarLink.vue"
import SidebarGroup from "./SidebarGroup.vue"
import LocationDropdown from "./LocationDropdown.vue"
import { clipboardCopy, isStaging } from "@/utils/others"
import { useSettingsStore } from "@modules/settings/store"
import { useRouter } from "vue-router"
import { useProductionStore } from "@modules/production/store"
import { useSharedStore } from "@modules/shared/store"

defineProps<{
  mobileSidebarOpen: boolean
}>()

defineEmits<{ logout: [value: boolean]; upgrade: [] }>()

const router = useRouter()
const isMobile = useMediaQuery("(max-width: 1024px)")

const storefrontUrl = computed(() => useSettingsStore().storefrontUrl)

// Sales Suite items
const salesSuiteItems = computed(() => [
  { icon: "box", label: "Orders", to: "/orders" },
  { icon: "folder", label: "Inventory", to: "/inventory" },
  { icon: "calendar-tick", label: "Popups", to: "/popups" },
  { icon: "people", label: "Customers", to: "/customers" },
])

// Production items
const productionItems = computed(() => {
  const componentLabel = useProductionStore().componentLabel || "Raw Materials"
  return [
    { icon: "box", label: componentLabel, to: "/raw-materials" },
    // Add production-related items here when needed
  ]
})

const storeDetails = computed(() => useSettingsStore().storeDetails)

const activeLocation = computed(() => useSettingsStore().activeLocation)

// Check if setup requirements are complete (regardless of subscription status)
const setupComplete = computed(() => useSettingsStore().liveStatus?.completion_percentage === 100)

// Subscription derived state
const subscription = computed(() => useAuthStore().user?.subscription)

const isTrial = computed(() => !!subscription.value?.trial_mode)
const isActive = computed(() => !!subscription.value?.is_active)

const planName = computed(() => subscription.value?.plan_name ?? "")
const planNameLower = computed(() => planName.value.toLowerCase())

const formattedEnds = computed(() => {
  const until = subscription.value?.active_until
  if (!until) return ""
  try {
    return new Date(until).toLocaleString("en-US", { dateStyle: "medium" })
  } catch {
    return ""
  }
})

const daysLeft = computed(() => {
  const until = subscription.value?.active_until
  if (!until) return null
  const diff = new Date(until).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const trialTitle = computed(() => {
  if (!isTrial.value) return ""
  const d = daysLeft.value
  if (d === null) return "Your trial is active"
  if (d <= 0) return "Your trial ends today!"
  if (d === 1) return "Your trial ends tomorrow!"
  return `Your trial ends in ${d} days!`
})

const trialSubtitle = computed(() => {
  if (!isTrial.value) return ""
  const d = daysLeft.value
  if (d === null) return ""
  if (d <= 0) return "Your trial ends today — upgrade now to avoid any interruption."
  if (d === 1) return "1 day left in your trial! Upgrade to keep your store live."
  if (d <= 7) return `${d} days left in your trial! Upgrade to keep your store live.`
  return "Subscribe to any plan before your trial ends to keep your store live."
})
</script>

<style scoped>
aside {
  /* Hide scrollbar for Chrome, Safari and Opera */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

aside::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
