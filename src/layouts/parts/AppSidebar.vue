<template>
  <aside
    :class="[
      'fixed z-40 h-screen w-72 border-r border-gray-200 bg-white transition-all duration-200',
      'flex h-full flex-col divide-y divide-gray-200',
      isMobile ? (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
    ]"
  >
    <!-- Brand -->
    <div class="flex items-center gap-3 px-4 py-4">
      <img src="/LYW.svg?url" alt="Leyyow" class="h-8 w-auto" />
    </div>

    <!-- User Info -->
    <div class="bg-gray-50 px-4 py-4">
      <div class="flex items-center gap-4">
        <Avatar
          :name="getFullName(user as TNameObj)"
          :extraText="user?.email"
          clickable
          class="flex-1 truncate"
        />
        <Icon
          name="signout"
          class="flex-shrink-0 cursor-pointer text-red-600"
          @click="$emit('logout', true)"
        />
      </div>
      <!-- Select Location -->
      <DropdownMenu
        trigger-class="w-full"
        :items="storedLocations?.map((item) => ({ id: item.uid, label: item.name }))"
        menuClass="!w-[248px]"
        @select="({ id }) => $router.push('/settings/locations?id=' + id)"
      >
        <template #trigger="{ open }">
          <button
            type="button"
            :class="[
              'bg-core-100 text-core-800 hover:bg-core-200 mt-4 w-full rounded-xl px-2 py-1.5',
              'flex items-center gap-2 text-sm font-medium',
            ]"
          >
            <Avatar name="S" size="sm" />
            {{ currentLocation?.name }}
            <Icon
              name="arrow-down-double"
              size="20"
              :class="['ml-auto', 'transition-transform', open ? 'rotate-180' : '']"
            />
          </button>
        </template>

        <template #prepend>
          <div class="bg-primary-50 border-primary-300 mb-1 rounded-t-lg border-b px-2.5 py-3">
            <Avatar name="Smiles HQ" backgroundColor="var(--color-core-950)" />
            <div class="mt-2 flex items-end gap-2">
              <p class="truncate font-medium">Smiles Socks...</p>
              <Chip label="HQ" />
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <p class="truncate">{{ storefrontUrl }}</p>
              <Icon
                name="copy"
                size="24"
                class="text-primary-600 cursor-pointer"
                @click="clipboardCopy('https://' + storefrontUrl)"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <AppButton
            variant="text"
            label="Add New Location"
            size="sm"
            icon="add"
            class="!w-full flex-row-reverse !justify-between !px-2.5"
          />
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
      <h4 class="mb-3 text-sm font-medium">Sales Suite</h4>
      <div class="space-y-1">
        <SidebarLink v-for="link in salesSuites" :key="link.label" v-bind="link" />
      </div>
    </section>

    <section class="mt-auto px-4 pb-4">
      <SidebarLink icon="life-buoy" label="Support" to="/support" />

      <div class="relative mt-20">
        <div
          :class="['relative isolate flex flex-col gap-2 rounded-3xl p-6 pt-20 text-white']"
          style="
            background: linear-gradient(136.41deg, #1a2a6c -3.7%, #b21f1f 53.98%, #fdbb2d 99.39%);
          "
        >
          <h3 class="mb-1 text-sm font-bold">Your trial has ended!</h3>
          <p class="mb-4 text-sm">Upgrade to regain full access.</p>
          <AppButton color="alt" label="Upgrade" class="w-full flex-row-reverse" icon="star" />
        </div>

        <img src="@/assets/images/gift.png" class="absolute -top-16 left-4" />
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from "@modules/auth/store"
import { getFullName, TNameObj } from "@/utils/format-strings"
import { clipboardCopy } from "@/utils/others"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"
import DropdownMenu from "@components/DropdownMenu.vue"
import Avatar from "@components/Avatar.vue"
import Icon from "@components/Icon.vue"
import Chip from "@components/Chip.vue"
import AppButton from "@components/AppButton.vue"
import SidebarLink from "./SidebarLink.vue"
import { useSettingsStore } from "@modules/settings/store"

defineProps<{
  mobileSidebarOpen: boolean
  salesSuites: Array<{ icon: string; label: string; to: string }>
}>()

defineEmits<{ logout: [value: boolean] }>()

const { locations, activeLocation } = useSettingsStore()

const storedLocations = computed(() => locations?.map((loc) => ({ ...loc })))
const currentLocation = computed(() => activeLocation)

const { user } = useAuthStore()
const isMobile = useMediaQuery("(max-width: 1024px)")
const storefrontUrl = computed(() => {
  return `shop.leyyow.com/smiles-socks-headquarters`
})
</script>
