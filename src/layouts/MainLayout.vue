<template>
  <div class="min-h-screen w-full bg-gray-50">
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
        @logout="logout = true"
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
        <AppHeader />

        <!-- Content -->
        <main>
          <router-view />
        </main>

        <!-- Bottom navigation for mobile -->
        <nav
          v-if="isMobile"
          class="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white"
        >
          <div class="flex items-center justify-around px-2 py-2">
            <SidebarLink v-for="link in SALES_SUITES.slice(0, 2)" :key="link.label" v-bind="link" />
            <AppButton
              size="sm"
              class="!ring-primary-200 !rounded-full !ring-4"
              icon="add-circle"
            />
            <SidebarLink v-for="link in SALES_SUITES.slice(2)" :key="link.label" v-bind="link" />
          </div>
        </nav>
      </div>
    </div>

    <!--  -->
    <LogoutModal :open="logout" @close="logout = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import AppButton from "@components/AppButton.vue"
import SidebarLink from "./parts/SidebarLink.vue"
import { useMediaQuery } from "@vueuse/core"
import LogoutModal from "@components/core/LogoutModal.vue"
import AppHeader from "./parts/AppHeader.vue"
import AppSidebar from "./parts/AppSidebar.vue"
import { useGetLocations } from "@modules/settings/api"
import { useSettingsStore } from "@modules/settings/store"
import { useGetCategories } from "@modules/inventory/api"
import { updateProductCategoryOptions } from "@modules/inventory/constants"
import { ICategoriesApiResponse } from "@modules/inventory/types"

const isMobile = useMediaQuery("(max-width: 1024px)")

const mobileSidebarOpen = ref(false)
const logout = ref(false)

const sidebarPadding = computed(() => (isMobile.value ? "lg:pl-72" : "pl-72"))

const SALES_SUITES = [
  { icon: "box", label: "Orders", to: "/orders" },
  { icon: "folder", label: "Inventory", to: "/inventory" },
  { icon: "calendar-tick", label: "Popups", to: "/popups" },
  { icon: "people", label: "Customers", to: "/customers" },
]

const { data: locations } = useGetLocations()
const { setLocations, setActiveLocation } = useSettingsStore()
const { data: categories } = useGetCategories()

watch(
  locations,
  (newLocations) => {
    if (newLocations) {
      const locs = newLocations.data.results ?? []
      setLocations(locs)
      setActiveLocation(locs[0] ?? null)
    }
  },
  { immediate: true },
)

watch<ICategoriesApiResponse | undefined>(
  () => categories.value,
  (newData) => {
    console.log(newData)

    if (newData?.data?.results) {
      updateProductCategoryOptions(newData.data.results)
    }
  },
)
</script>
