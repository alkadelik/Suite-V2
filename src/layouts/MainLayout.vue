<template>
  <div class="bg-white lg:bg-gray-50">
    <!-- Mobile overlay -->
    <!-- <div
        v-if="isMobile && mobileSidebarOpen"
        class="fixed inset-0 z-30 bg-black/40 lg:hidden"
        @click="mobileSidebarOpen = false"
      /> -->

    <div class="flex h-[100dvh] overflow-hidden lg:h-screen">
      <!-- Sidebar -->
      <AppSidebar
        :sales-suites="SALES_SUITES"
        :mobile-sidebar-open="mobileSidebarOpen"
        :isLive="isLive"
        @logout="logout = true"
        @upgrade="setPlanUpgradeModal(true)"
      />

      <!-- Main column -->
      <div
        :class="[
          'flex h-full flex-1 flex-col overflow-hidden transition-all duration-200',
          'pb-16',
          showAppHeader ? 'pt-16' : 'pt-24',
          sidebarPadding,
        ]"
      >
        <!-- Topbar -->
        <AppHeader
          v-if="showAppHeader"
          :show-logo="isMobile"
          :isLive="isLive"
          @logout="logout = true"
        />

        <!-- Content -->
        <main class="h-[calc(100dvh-4rem)] overflow-y-auto lg:h-[calc(100vh-4rem)]">
          <div
            v-if="!isLive && !isLoadingLiveStatus"
            class="bg-primary-25 text-warning-700 border-warning-300 flex flex-col items-start gap-3 border-b px-6 py-3 lg:flex-row lg:items-center"
          >
            <span
              class="border-primary-200 ring-primary-100 hidden size-8 items-center justify-center rounded-full border-2 p-0.5 ring-2 ring-offset-2 lg:flex"
            >
              <Icon name="info-circle" size="20" />
            </span>
            <div class="flex flex-1 flex-col gap-1 text-sm lg:flex-row">
              <span class="font-medium">Your storefront isn't live yet! </span> Complete your bank
              details, delivery options, and KYC to start selling online.
            </div>
            <AppButton
              variant="text"
              label="Complete Setup"
              icon="arrow-right"
              size="sm"
              class="flex-row-reverse underline underline-offset-4"
              @click="$router.push('/onboarding')"
            />
          </div>
          <router-view />
        </main>

        <!-- Bottom navigation for mobile -->
        <nav
          v-if="isMobile"
          class="fixed right-0 bottom-0 left-0 max-h-16 border-t border-gray-200 bg-white"
          :class="openMore || openActions ? 'z-[1500]' : 'z-30'"
        >
          <div class="flex items-center justify-around px-2 py-2">
            <SidebarLink icon="house" label="Home" to="/dashboard" @click="openMore = false" />
            <SidebarLink
              v-for="link in SALES_SUITES.slice(0, 1)"
              :key="link.label"
              v-bind="link"
              @click="openMore = false"
            />
            <AppButton
              size="sm"
              class="!ring-primary-200 !rounded-full !ring-4"
              icon="add-circle"
              @click="
                () => {
                  openMore = false
                  openActions = !openActions
                }
              "
            />
            <SidebarLink
              v-for="link in SALES_SUITES.slice(1, 2)"
              :key="link.label"
              v-bind="link"
              @click="openMore = false"
            />
            <SidebarLink
              label="More"
              icon="more"
              :class="openMore ? '!text-primary-700' : ''"
              @click="openMore = !openMore"
            />
          </div>
        </nav>

        <!-- FAB -->
        <div v-if="!isMobile" class="fixed right-4 bottom-4 z-[50] hidden lg:inline-block">
          <DropdownMenu :items="actionMenuItems">
            <template #trigger="{ open }">
              <AppButton
                size="md"
                :class="['!ring-primary-200 !rounded-full !ring-4']"
                :icon="open ? 'x-close' : 'add-circle'"
                :label="!open ? 'Add New' : ''"
              />
            </template>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </div>
  <!--  -->
  <LogoutModal :open="logout" @close="logout = false" />

  <PlansModal :model-value="showPlans" @update:model-value="(val) => setPlanUpgradeModal(val)" />

  <TrialActivationModal
    :open="openTrial"
    :subscription="profile?.subscription || null"
    @close="closeTrialModal"
  />

  <MobileMenuDrawer :open="openMore" @close="openMore = false" />

  <MobileQuickActionsModal :open="openActions" @close="openActions = false" />

  <!-- Location switch confirmation -->
  <ConfirmationModal
    v-model="confirmSwitch"
    header="Switch Location?"
    :paragraph="`Are you sure you want to switch to ${pendingLocation?.name?.toUpperCase()}? This will reload the page.`"
    info-message="You can reverse this action later by switching to another location."
    action-label="Switch Location"
    :loading="false"
    @confirm="confirmLocationSwitch"
    @cancel="cancelLocationSwitch"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import AppButton from "@components/AppButton.vue"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import SidebarLink from "./parts/SidebarLink.vue"
import { useMediaQuery } from "@vueuse/core"
import LogoutModal from "@components/core/LogoutModal.vue"
import AppHeader from "./parts/AppHeader.vue"
import AppSidebar from "./parts/AppSidebar.vue"
import { useGetProfile } from "@modules/settings/api"
import { useSettingsStore } from "@modules/settings/store"
import { useAuthStore } from "@modules/auth/store"
import { useGetCategories, useGetAttributes } from "@modules/inventory/api"
import {
  updateProductCategoryOptions,
  updateProductAttributeOptions,
} from "@modules/inventory/constants"
import { ICategoriesApiResponse, IProductAttributesApiResponse } from "@modules/inventory/types"
import PlansModal from "@modules/settings/components/PlansModal.vue"
import TrialActivationModal from "@modules/shared/components/TrialActivationModal.vue"
import MobileMenuDrawer from "./parts/MobileMenuDrawer.vue"
import Icon from "@components/Icon.vue"
import { useGetLiveStatus } from "@modules/shared/api"
import { useLocationSwitch } from "@/composables/useLocationSwitch"
import MobileQuickActionsModal from "./parts/MobileQuickActionsModal.vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import { toast } from "@/composables/useToast"
import { useRouter, useRoute } from "vue-router"

const isMobile = useMediaQuery("(max-width: 1024px)")

const mobileSidebarOpen = ref(false)
const logout = ref(false)
const openMore = ref(false)
const openActions = ref(false)

const { confirmSwitch, pendingLocation, confirmLocationSwitch, cancelLocationSwitch } =
  useLocationSwitch()

const sidebarPadding = computed(() => (isMobile.value ? "lg:pl-72" : "pl-72"))

const isHQ = computed(() => useSettingsStore().activeLocation?.is_hq ?? true)
const router = useRouter()
const route = useRoute()

const showAppHeader = computed(() => {
  const hide = Boolean((route.meta || {})["hideAppHeader"])
  return !hide || !isMobile.value
})

const SALES_SUITES = computed(() => {
  const allSuites = [
    { icon: "box", label: "Orders", to: "/orders" },
    { icon: "folder", label: "Inventory", to: "/inventory" },
    { icon: "calendar-tick", label: "Popups", to: "/popups", hqOnly: true },
    { icon: "people", label: "Customers", to: "/customers" },
  ]

  return allSuites.filter((suite) => !suite.hqOnly || isHQ.value)
})

const actionMenuItems = computed(() => {
  const allActions = [
    {
      label: "Add a product",
      icon: "box",
      class: "!bg-blue-50 !text-blue-700 mb-1",
      iconClass: "!text-blue-700",
      action: () => router.push("/inventory?create=true"),
      hqOnly: true,
    },
    {
      label: "Record a sale",
      icon: "bag",
      class: "!bg-green-50 !text-green-700 mb-1",
      iconClass: "!text-green-700",
      action: () => router.push("/orders?create=true"),
    },
    {
      label: "Create popup",
      icon: "calendar-tick",
      class: "!bg-purple-50 !text-purple-700 mb-1",
      iconClass: "!text-purple-700",
      action: () => router.push("/popups?create=true"),
      hqOnly: true,
    },
    {
      label: "Add a customer",
      icon: "profile-add",
      class: "!bg-primary-50 !text-primary-700 mb-1",
      iconClass: "!text-primary-700",
      action: () => router.push("/customers?create=true"),
    },
    {
      label: "Record expense",
      icon: "receipt-add",
      class: "!bg-pink-50 !text-pink-700",
      iconClass: "!text-primary-700",
      action: () => {
        toast.info("Expense module is coming soon!")
      },
    },
  ]

  return allActions.filter((action) => !action.hqOnly || isHQ.value)
})

const { setPlanUpgradeModal } = useSettingsStore()
const { updateAuthUser } = useAuthStore()

const { data: categories } = useGetCategories()
const { data: attributes } = useGetAttributes()
const { data: profile } = useGetProfile()

const showPlans = computed(() => useSettingsStore().showPlanUpgradeModal)

const storeSlug = useAuthStore().user?.store_slug || ""
const storeUid = computed(() => useAuthStore().user?.store_uid || "")
const { data: liveStatusData, isPending: isLoadingLiveStatus } = useGetLiveStatus(storeSlug)
const isLive = computed(() => liveStatusData.value?.data?.is_live || false)

const openTrial = ref(false)

const getDaysRemaining = (endDate: string | null | undefined): number => {
  if (!endDate) return 0
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getTrialDismissalKey = (uid: string) => `trial_dismissed_${uid}`

watch(
  profile,
  (val) => {
    if (val) {
      updateAuthUser(val)

      // Check if in trial mode
      if (val.subscription?.trial_mode && storeUid.value) {
        const daysRemaining = getDaysRemaining(val.subscription?.active_until)
        const dismissalKey = getTrialDismissalKey(storeUid.value)

        // Only show modal if trial has 14 or more days remaining and not dismissed for this store
        if (daysRemaining >= 14 && !localStorage.getItem(dismissalKey)) {
          openTrial.value = true
        } else {
          // Don't show modal if less than 14 days remaining
          openTrial.value = false
        }
      }

      // Clean up if no longer in trial mode
      if (!val.subscription?.trial_mode && storeUid.value) {
        const dismissalKey = getTrialDismissalKey(storeUid.value)
        localStorage.removeItem(dismissalKey)
        openTrial.value = false
      }
    }
  },
  { immediate: true },
)

const closeTrialModal = () => {
  openTrial.value = false
  if (storeUid.value) {
    const dismissalKey = getTrialDismissalKey(storeUid.value)
    localStorage.setItem(dismissalKey, "true")
  }
}

watch<ICategoriesApiResponse | undefined>(
  () => categories.value,
  (newData) => {
    if (newData?.data?.results) {
      updateProductCategoryOptions(newData.data.results)
    }
  },
)

watch<IProductAttributesApiResponse | undefined>(
  () => attributes.value,
  (newData) => {
    if (newData?.data?.results) {
      updateProductAttributeOptions(newData.data.results)
    }
  },
)
</script>
