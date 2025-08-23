<template>
  <div class="flex min-h-screen flex-col rounded-xl bg-white p-4 pb-0">
    <header class="border-b border-gray-200 pb-4">
      <BackButton />
      <h2 class="mt-3 text-2xl font-bold">Settings</h2>
      <p>shop.leyyow.com</p>
    </header>

    <div class="flex h-full flex-1 gap-2">
      <aside class="h-full w-1/4 py-3">
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
      <main class="h-full w-3/4 px-3 py-3">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import BackButton from "@components/BackButton.vue"

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
