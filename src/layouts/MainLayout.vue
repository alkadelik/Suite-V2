<template>
  <div class="min-h-screen w-full bg-white md:bg-gray-50">
    <!-- Mobile overlay -->
    <div
      v-if="isMobile && mobileSidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      @click="mobileSidebarOpen = false"
    />

    <div class="flex">
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
          'flex min-h-screen flex-1 flex-col overflow-x-hidden transition-all duration-200',
          'pt-16 pb-16 lg:pb-0', // height of header
          sidebarPadding,
        ]"
      >
        <!-- Topbar -->
        <AppHeader :show-logo="isMobile" :isLive="isLive" />

        <!-- Content -->
        <main>
          <div
            v-if="!isLive"
            class="bg-primary-25 text-warning-700 border-warning-300 flex flex-col items-start gap-3 border-b px-6 py-3 md:flex-row md:items-center"
          >
            <span
              class="border-primary-200 ring-primary-100 hidden size-8 items-center justify-center rounded-full border-2 p-0.5 ring-2 ring-offset-2 md:flex"
            >
              <Icon name="info-circle" size="20" />
            </span>
            <div class="flex flex-1 flex-col gap-1 text-sm md:flex-row">
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
          class="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white"
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
      </div>
    </div>

    <!--  -->
    <LogoutModal :open="logout" @close="logout = false" />

    <PlansModal
      :model-value="showPlans"
      :hide-bud="true"
      @update:model-value="(val) => setPlanUpgradeModal(val)"
    />

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
  </div>
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

const isMobile = useMediaQuery("(max-width: 1024px)")

const mobileSidebarOpen = ref(false)
const logout = ref(false)
const openMore = ref(false)
const openActions = ref(false)

const { confirmSwitch, pendingLocation, confirmLocationSwitch, cancelLocationSwitch } =
  useLocationSwitch()

const sidebarPadding = computed(() => (isMobile.value ? "lg:pl-72" : "pl-72"))

const SALES_SUITES = [
  { icon: "box", label: "Orders", to: "/orders" },
  { icon: "folder", label: "Inventory", to: "/inventory" },
  { icon: "calendar-tick", label: "Popups", to: "/popups" },
  { icon: "people", label: "Customers", to: "/customers" },
]

const { setPlanUpgradeModal } = useSettingsStore()
const { updateAuthUser } = useAuthStore()

const { data: categories } = useGetCategories()
const { data: attributes } = useGetAttributes()
const { data: profile } = useGetProfile()

const showPlans = computed(() => useSettingsStore().showPlanUpgradeModal)

const storeSlug = useAuthStore().user?.store_slug || ""
const { data: liveStatusData } = useGetLiveStatus(storeSlug)
const isLive = computed(() => liveStatusData.value?.data?.is_live || false)

const openTrial = ref(false)

watch(
  profile,
  (val) => {
    if (val) {
      updateAuthUser(val)
      // Show trial modal on first load if in trial mode and not yet dismissed
      if (val.subscription?.trial_mode && !localStorage.getItem("trial_dismissed")) {
        openTrial.value = true
      }
      // Clean up if no longer in trial mode
      if (!val.subscription?.trial_mode) {
        localStorage.removeItem("trial_dismissed")
        openTrial.value = false
      }
    }
  },
  { immediate: true },
)

const closeTrialModal = () => {
  openTrial.value = false
  localStorage.setItem("trial_dismissed", "true")
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
