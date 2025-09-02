<template>
  <div class="pt-16">
    <AppHeader />

    <main class="flex min-h-screen flex-col rounded-xl bg-white p-4 pb-0 2xl:px-20">
      <header class="hidden border-b border-gray-200 pb-4 md:block md:text-left">
        <BackButton to="/dashboard" />
        <h2 class="mt-3 text-2xl font-bold">Settings</h2>
        <p>shop.leyyow.com</p>
      </header>

      <BackButton v-if="route.path !== '/settings'" label="Back" to="/settings" class="md:hidden" />

      <div class="flex h-full flex-1 gap-2">
        <aside class="hidden h-full w-1/4 py-3 md:block">
          <nav>
            <ul class="space-y-1">
              <li v-for="link in LINKS" :key="link.path">
                <router-link
                  :to="link.path"
                  :class="[
                    'hover:text-primary-700 block px-3.5 py-2.5 font-medium',
                    { 'text-primary-700 border-primary-700 border-l-2': $route.path === link.path },
                  ]"
                >
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </nav>
        </aside>
        <main class="h-full w-full px-3 py-3 md:w-3/4">
          <router-view />
        </main>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/layouts/parts/AppHeader.vue"
import BackButton from "@components/BackButton.vue"
import { useRoute } from "vue-router"

const route = useRoute()

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
