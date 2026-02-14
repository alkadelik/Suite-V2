<template>
  <div class="flex h-[100dvh] flex-col pt-16">
    <AppHeader show-logo :is-live="isLive" @logout="logout = true" />

    <Container>
      <div class="flex min-h-0 flex-1 rounded-xl bg-white p-4 pb-0 2xl:px-20">
        <!-- Fixed Header Section -->
        <div class="flex min-h-0 flex-1 flex-col">
          <header
            class="mb-4 hidden flex-shrink-0 border-b border-gray-200 pb-4 md:block md:text-left"
          >
            <BackButton to="/dashboard" />
            <h2 class="mt-3 text-2xl font-bold">Settings</h2>
            <div class="flex min-w-0 items-center gap-2 text-sm text-gray-600">
              <p class="truncate">{{ storefrontUrl }}</p>
              <Icon
                name="copy"
                size="24"
                class="text-primary-600 shrink-0 cursor-pointer"
                @click="clipboardCopy('https://' + storefrontUrl)"
              />
            </div>
          </header>

          <BackButton
            v-if="route.path !== '/settings'"
            label="Back"
            to="/settings"
            class="mb-4 flex-shrink-0 md:hidden"
          />

          <!-- Main content area with sidebar and scrollable content -->
          <div class="flex min-h-0 flex-1 gap-12">
            <!-- Fixed Sidebar -->
            <aside class="hidden w-40 flex-shrink-0 py-3 md:block">
              <nav>
                <ul class="space-y-1">
                  <li v-for="link in LINKS" :key="link.path">
                    <router-link
                      :to="link.path"
                      :class="[
                        'hover:text-primary-700 block px-3.5 py-2.5 font-medium',
                        {
                          'text-primary-700 border-primary-700 border-l-2': $route.path.includes(
                            link.path,
                          ),
                        },
                      ]"
                    >
                      {{ link.label }}
                    </router-link>
                  </li>
                </ul>
              </nav>
            </aside>

            <!-- Scrollable main content -->
            <main class="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <router-view />
            </main>
          </div>
        </div>
      </div>
    </Container>

    <!--  -->
    <PlansModal :model-value="showPlans" @update:model-value="(val) => setPlanUpgradeModal(val)" />

    <AddLocationModal
      :open="showAddLocationModal"
      :location="locationForEdit"
      @close="setAddLocationModal(false)"
      @refresh="handleLocationRefresh"
    />

    <LogoutModal :open="logout" @close="logout = false" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/layouts/parts/AppHeader.vue"
import Container from "@components/Container.vue"
import BackButton from "@components/BackButton.vue"
import { useRoute } from "vue-router"
import { useSettingsStore } from "../store"
import { computed, ref, watch } from "vue"
import PlansModal from "../components/PlansModal.vue"
import AddLocationModal from "../components/AddLocationModal.vue"
import { useGetLiveStatus, useGetRoles } from "@modules/shared/api"
import { updateStoreRoleOptions } from "@modules/shared/constants"
import { clipboardCopy } from "@/utils/others"
import Icon from "@components/Icon.vue"
import { useAuthStore } from "@modules/auth/store"
import LogoutModal from "@components/core/LogoutModal.vue"

const route = useRoute()
const { data: rolesData } = useGetRoles()

const logout = ref(false)

const storeSlug = useAuthStore().user?.store_slug || ""
const { data: liveStatusData } = useGetLiveStatus(storeSlug)
const isLive = computed(() => liveStatusData.value?.data?.is_live || false)

// Update ROLE_OPTIONS when roles data is fetched
watch(
  () => rolesData.value,
  (data) => {
    if (data?.data) {
      updateStoreRoleOptions(data.data)
    }
  },
  { immediate: true },
)

const LINKS = computed(() =>
  [
    { label: "Profile", path: "/settings/profile" },
    { label: "Store Details", path: "/settings/store-details" },
    { label: "Password", path: "/settings/password" },
    { label: "Teams", path: "/settings/teams" },
    { label: "Plans & Billing", path: "/settings/billing" },
    { label: "Locations", path: "/settings/locations" },
    { label: "Taxes", path: "/settings/taxes" },
    { label: "Storefront Design", path: "/settings/design" },
    { label: "Delivery Options", path: "/settings/delivery-options" },
    { label: "Production", path: "/settings/production" },
  ].filter((link) => {
    const { activeLocation } = useSettingsStore()
    if (!activeLocation?.is_hq) {
      return ["Profile", "Password"].includes(link.label)
    }
    return true
  }),
)

const { setPlanUpgradeModal, setAddLocationModal, setLocationForEdit } = useSettingsStore()
const showPlans = computed(() => useSettingsStore().showPlanUpgradeModal)
const showAddLocationModal = computed(() => useSettingsStore().showAddLocationModal)
const locationForEdit = computed(() => useSettingsStore().locationForEdit)
const storefrontUrl = computed(() => useSettingsStore().storefrontUrl)

// Handle location refresh after adding/updating location
const handleLocationRefresh = () => {
  setAddLocationModal(false)
  setLocationForEdit(null)
}
</script>
