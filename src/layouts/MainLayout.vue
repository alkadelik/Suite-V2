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
      <aside
        :class="[
          'fixed z-40 h-screen w-72 border-r border-gray-200 bg-white transition-all duration-200',
          'flex h-full flex-col divide-y divide-gray-200',
          isMobile ? (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
        ]"
      >
        <!-- Brand -->
        <div class="flex items-center gap-3 px-4 py-4">
          <img src="/images/logos/leyyow-logo-4.svg?url" alt="Leyyow" class="h-8 w-auto" />
        </div>

        <!-- User Info -->
        <div class="bg-gray-50 px-4 py-6">
          <Avatar name="John Doe" extraText="john.doe@example.com" clickable />
          <!-- Select Location -->
          <DropdownMenu
            trigger-class="w-full"
            :items="
              ['HQ', 'Lekki', 'Surulere', 'Abuja'].map((el, i) => ({
                label: `Smile Socks (${el})`,
                id: i + 1,
              }))
            "
            @select="({ id }) => $router.push('/settings/locations?id=' + id)"
            placement="right-start"
          >
            <template #trigger="{ open }">
              <button
                type="button"
                :class="[
                  'bg-core-100 text-core-800 hover:bg-core-200 mt-6 w-full rounded-xl px-2 py-1.5',
                  'flex items-center gap-2 text-sm font-medium',
                ]"
              >
                <Avatar name="S" size="sm" />
                Smile Socks (HQ)
                <Icon
                  name="arrow-down-double"
                  size="20"
                  :class="['ml-auto', 'transition-transform', open ? 'rotate-180' : '']"
                />
              </button>
            </template>
            <template #append>
              <div class="border-core-100 mt-1 border-t pt-1">
                <button
                  class="hover:bg-primary-50 text-primary-700 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                >
                  Add New Location
                  <Icon name="add" class="h-4 w-4" />
                </button>
              </div>
            </template>
          </DropdownMenu>
        </div>

        <!-- Home & Get Started -->
        <div class="space-y-1 px-4 py-2">
          <SidebarLink icon="candle" label="Get Started" to="/onboarding" />
          <SidebarLink icon="house" label="Home" to="/dashboard" />
        </div>

        <!-- Navigation -->
        <section class="px-4 py-2">
          <h4 class="mb-4 text-sm font-medium">Sales Suite</h4>
          <div class="space-y-1">
            <SidebarLink v-for="link in SALES_SUITES" :key="link.label" v-bind="link" />
          </div>
        </section>

        <section class="mt-auto px-4 pb-8">
          <SidebarLink icon="life-buoy" label="Support" to="/support" />

          <div class="mt-3 w-full rounded-lg bg-gray-50 px-4 py-5 text-center">
            <h3 class="mb-1 text-sm font-semibold text-gray-900">Unlock More with Premium!</h3>
            <p class="mb-4 text-sm text-gray-600">
              Get advanced tools to manage every aspect of your business.
            </p>
            <AppButton label="Go Premium" class="w-full flex-row-reverse" icon="star" />
          </div>
        </section>
      </aside>

      <!-- Main column -->
      <div
        :class="[
          'flex min-h-screen flex-1 flex-col overflow-x-hidden transition-all duration-200',
          'pt-16 pb-16 lg:pb-0', // height of header
          sidebarPadding,
        ]"
      >
        <!-- Topbar -->
        <header class="fixed top-0 right-0 left-0 z-20 border-b border-gray-200 bg-white">
          <div class="flex h-16 items-center justify-end gap-1.5 px-4">
            <!-- Storefront status -->
            <Chip color="alt" label="Storefront" class="!pr-1">
              <template #append>
                <Chip size="sm" showDot label="Not live" color="error" />
              </template>
            </Chip>
            <!-- Notifications -->
            <button class="rounded-xl p-2 hover:bg-gray-100">
              <Icon name="bell" size="20" />
            </button>
            <!-- Settings -->
            <button class="rounded-xl p-2 hover:bg-gray-100">
              <Icon name="setting" size="20" />
            </button>
            <!-- User or CTA -->
            <Avatar v-if="isMobile" name="John Doe" clickable />
            <AppButton
              v-else
              size="md"
              class="!ring-primary-200 !rounded-full !ring-4"
              icon="add-circle"
            />
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 sm:p-6">
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import AppButton from "@components/AppButton.vue"
import SidebarLink from "./parts/SidebarLink.vue"
import Avatar from "@components/Avatar.vue"
import Icon from "@components/common/icon.vue"
import { useMediaQuery } from "@vueuse/core"
import DropdownMenu from "@components/DropdownMenu.vue"
import Chip from "@components/Chip.vue"

const mobileSidebarOpen = ref(false)
const isMobile = useMediaQuery("(max-width: 1024px)")

const sidebarPadding = computed(() => (isMobile.value ? "lg:pl-72" : "pl-72"))

const SALES_SUITES = [
  { icon: "box", label: "Orders", to: "/orders" },
  { icon: "folder", label: "Inventory", to: "/inventory" },
  { icon: "calendar-tick", label: "Popups", to: "/popups" },
  { icon: "people", label: "Customers", to: "/customers" },
]
</script>
