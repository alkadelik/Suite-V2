<template>
  <div class="flex h-screen flex-col pt-16">
    <AppHeader />

    <div class="flex min-h-0 flex-1 rounded-xl bg-white p-4 pb-0 2xl:px-20">
      <!-- Fixed Header Section -->
      <div class="flex min-h-0 flex-1 flex-col">
        <header
          class="mb-4 hidden flex-shrink-0 border-b border-gray-200 pb-4 md:block md:text-left"
        >
          <BackButton to="/dashboard" />
          <h2 class="mt-3 text-2xl font-bold">Settings</h2>
          <p>shop.leyyow.com</p>
        </header>

        <BackButton
          v-if="route.path !== '/settings'"
          label="Back"
          to="/settings"
          class="mb-4 flex-shrink-0 md:hidden"
        />

        <!-- Main content area with sidebar and scrollable content -->
        <div class="flex min-h-0 flex-1 gap-2">
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
                        'text-primary-700 border-primary-700 border-l-2': $route.path === link.path,
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
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/layouts/parts/AppHeader.vue"
import BackButton from "@components/BackButton.vue"
import { useRoute } from "vue-router"
import { useGetRoles } from "@modules/shared/api"
import { updateStoreRoleOptions } from "@modules/shared/constants"
import { IRolesApiResponse } from "@modules/shared/types"
import { watch } from "vue"

const route = useRoute()
const { data: rolesData } = useGetRoles()
watch<IRolesApiResponse | undefined>(
  () => rolesData.value,
  (newData) => {
    console.log(newData?.data)

    if (newData?.data) {
      updateStoreRoleOptions(newData?.data)
    }
  },
)

const LINKS = [
  { label: "Profile", path: "/settings/profile" },
  { label: "Store Details", path: "/settings/store-details" },
  { label: "Password", path: "/settings/password" },
  { label: "Teams", path: "/settings/teams" },
  { label: "Plans & Billing", path: "/settings/billing" },
  { label: "Locations", path: "/settings/locations" },
  { label: "Design", path: "/settings/design" },
  { label: "Delivery Options", path: "/settings/delivery-options" },
]
</script>
