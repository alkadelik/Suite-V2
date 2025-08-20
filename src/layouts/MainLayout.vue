<template>
  <div class="min-h-screen w-full bg-gray-50 text-gray-800">
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
          <button
            type="button"
            :class="[
              'bg-core-100 text-core-800 hover:bg-core-200 mt-6 w-full rounded-xl px-2 py-1.5',
              'flex items-center gap-2 text-sm font-medium',
            ]"
          >
            <Avatar name="S" size="sm" />
            Smile Socks (HQ)
            <Icon name="arrow-down-double" size="20" class="mr-2 ml-auto" />
          </button>
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
            <AppButton label="Go Premium" class="w-full" />
          </div>
        </section>
      </aside>

      <!-- Main column -->
      <div
        :class="['flex min-h-screen flex-1 flex-col transition-all duration-200', sidebarPadding]"
      >
        <!-- Topbar -->
        <header
          class="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        >
          <div class="flex h-16 items-center justify-end gap-3 px-4">
            <!-- Actions -->
            <div class="ml-auto flex items-center gap-2 sm:ml-3">
              <!-- Notifications -->
              <button class="rounded-xl p-2 hover:bg-gray-100">
                <Icon name="bell" size="20" />
              </button>

              <button class="rounded-xl p-2 hover:bg-gray-100">
                <Icon name="setting" size="20" />
              </button>

              <!-- User -->
              <AppButton
                size="md"
                class="!ring-primary-200 !rounded-full !ring-4"
                icon="add-circle"
              />
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 pb-20 sm:p-6 lg:pb-6">
          <router-view />
        </main>

        <!-- Bottom navigation for mobile -->
        <nav
          v-if="isMobile"
          class="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80"
        >
          <div class="flex items-center justify-around px-2 py-2">
            <!-- Home -->
            <router-link
              to="/dashboard"
              class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-100"
              :class="$route.path === '/dashboard' ? 'text-primary-600' : 'text-gray-600'"
            >
              <Icon name="house" size="20" />
              <span>Home</span>
            </router-link>

            <!-- Orders -->
            <router-link
              to="/orders"
              class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-100"
              :class="$route.path.startsWith('/orders') ? 'text-primary-600' : 'text-gray-600'"
            >
              <Icon name="box" size="20" />
              <span>Orders</span>
            </router-link>

            <!-- Inventory -->
            <router-link
              to="/inventory"
              class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-100"
              :class="$route.path.startsWith('/inventory') ? 'text-primary-600' : 'text-gray-600'"
            >
              <Icon name="folder" size="20" />
              <span>Inventory</span>
            </router-link>

            <!-- Customers -->
            <router-link
              to="/customers"
              class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-100"
              :class="$route.path.startsWith('/customers') ? 'text-primary-600' : 'text-gray-600'"
            >
              <Icon name="people" size="20" />
              <span>Customers</span>
            </router-link>

            <!-- More/Menu -->
            <button
              @click="mobileSidebarOpen = true"
              class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              <Icon name="setting" size="20" />
              <span>More</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import AppButton from "@components/AppButton.vue"
import SidebarLink from "./parts/SidebarLink.vue"
import Avatar from "@components/Avatar.vue"
import Icon from "@components/common/icon.vue"
import { useMediaQuery } from "@vueuse/core"

const mobileSidebarOpen = ref(false)
const isMobile = useMediaQuery("(max-width: 1024px)")

const sidebarPadding = computed(() => (isMobile.value ? "lg:pl-72" : "pl-72"))

const SALES_SUITES = [
  { icon: "box", label: "Orders", to: "/orders" },
  { icon: "folder", label: "Inventory", to: "/inventory" },
  { icon: "calendar-tick", label: "Popups", to: "/popups" },
  { icon: "people", label: "Customers", to: "/customers" },
]

onMounted(() => {
  const onResize = () => {
    if (!isMobile.value) mobileSidebarOpen.value = false
  }
  window.addEventListener("resize", onResize)
})
</script>
