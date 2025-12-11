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
      <img src="/LYW.svg?url" alt="Leyyow" class="h-8 w-auto" />
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
      <SidebarLink v-if="!isLive" icon="candle" label="Get Started" to="/onboarding" />
      <SidebarLink icon="house" label="Home" to="/dashboard" />
    </div>

    <!-- Navigation -->
    <section class="space-y-1 px-4 py-2">
      <SidebarLink v-for="link in salesSuites" :key="link.label" v-bind="link" />
    </section>

    <section class="mt-auto px-4 pb-4">
      <SidebarLink icon="life-buoy" label="Support" to="/support" />

      <div class="relative mt-20">
        <div
          :class="['relative isolate flex flex-col gap-1 rounded-3xl p-3 pt-12 text-white']"
          style="
            background: linear-gradient(136.41deg, #1a2a6c -3.7%, #b21f1f 53.98%, #fdbb2d 99.39%);
          "
        >
          <template v-if="!user?.subscription?.trial_mode && !user?.subscription?.is_active">
            <h3 class="mb-1 text-sm font-bold">Your trial has ended!</h3>
            <p class="mb-4 text-sm">Upgrade to regain full access.</p>
          </template>

          <template v-else>
            <h3 v-if="user?.subscription?.trial_mode" class="mb-1 text-sm font-bold">
              You are on trial mode
            </h3>
            <h3 v-if="user?.subscription?.is_active" class="mb-1 text-sm font-semibold">
              Active: <b>{{ user?.subscription?.plan_name + " Plan" }}</b>
            </h3>
            <p class="mb-4 text-sm">
              Ends:
              {{
                new Date(user?.subscription?.active_until).toLocaleString("en-US", {
                  dateStyle: "medium",
                })
              }}
            </p>
          </template>

          <AppButton
            color="alt"
            label="Upgrade"
            class="w-full flex-row-reverse"
            icon="star"
            @click="$emit('upgrade')"
          />
        </div>

        <img src="@/assets/images/gift.png" class="absolute -top-8 left-4 h-16" />
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
import LocationDropdown from "./LocationDropdown.vue"
import { clipboardCopy } from "@/utils/others"
import { useSettingsStore } from "@modules/settings/store"

defineProps<{
  mobileSidebarOpen: boolean
  salesSuites: Array<{ icon: string; label: string; to: string }>
  isLive: boolean
}>()

defineEmits<{ logout: [value: boolean]; upgrade: [] }>()

const user = computed(() => useAuthStore().user)

const isMobile = useMediaQuery("(max-width: 1024px)")

const storefrontUrl = computed(() => useSettingsStore().storefrontUrl)

const storeDetails = computed(() => useSettingsStore().storeDetails)
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
