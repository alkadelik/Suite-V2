<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import Icon from "@components/Icon.vue"
import BackButton from "@components/BackButton.vue"
import LogoutModal from "@components/core/LogoutModal.vue"
import { clipboardCopy } from "@/utils/others"
import { useSettingsStore } from "../store"

const router = useRouter()

onMounted(() => {
  const isMobile = window.innerWidth < 768

  if (!isMobile) {
    router.replace({ name: "Profile" })
  }
})

interface SettingsLink {
  label: string
  path: string
  icon: string
  subLinks?: SettingsLink[]
}

const settingsLinks: SettingsLink[] = [
  { label: "Profile", path: "/settings/profile", icon: "profile-circle" },
  { label: "Store Details", path: "/settings/store-details", icon: "shop-outline" },
  { label: "Password", path: "/settings/password", icon: "key" },
  { label: "Teams", path: "/settings/teams", icon: "people" },
  { label: "Plans & Billing", path: "/settings/billing", icon: "star-fast" },
  { label: "Locations", path: "/settings/locations", icon: "map" },
  {
    label: "Design",
    path: "/settings/design",
    icon: "designtools",
    subLinks: [
      { label: "Themes", path: "/settings/design/themes", icon: "shapes-02" },
      { label: "Theme Settings", path: "/settings/design/theme-settings", icon: "shapes-01" },
      { label: "Landing Page", path: "/settings/design/landing-page", icon: "message-text" },
      { label: "Pop Up", path: "/settings/design/popup", icon: "information" },
    ],
  },
  { label: "Delivery Options", path: "/settings/delivery-options", icon: "truck-fast-outline" },
]

const expandedLink = ref<string | null>(null)

const toggleExpand = (label: string): void => {
  expandedLink.value = expandedLink.value === label ? null : label
}

const openLogout = ref(false)

const storefrontUrl = computed(() => useSettingsStore().storefrontUrl)
</script>

<template>
  <div>
    <header
      class="flex flex-col justify-center border-b border-gray-200 pb-4 text-center md:block md:text-left"
    >
      <BackButton to="/dashboard" :center-on-mobile="true" />
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
    <div class="flex flex-col">
      <template v-for="link in settingsLinks" :key="link.path">
        <div v-if="link.subLinks">
          <button
            type="button"
            class="hover:bg-primary-100 flex w-full items-center justify-between gap-2 border-b border-gray-200 py-5 pe-3 text-sm font-medium"
            @click="toggleExpand(link.label)"
          >
            <div class="flex items-center gap-2">
              <Icon :name="link.icon" size="20" />
              <p>{{ link.label }}</p>
            </div>
            <Icon
              name="chevron-right"
              size="18"
              :class="{ 'rotate-90': expandedLink === link.label }"
            />
          </button>
          <div v-if="expandedLink === link.label" class="bg-gray-50">
            <router-link
              v-for="subLink in link.subLinks"
              :key="subLink.path"
              :to="subLink.path"
              class="hover:bg-primary-100 flex items-center justify-between gap-2 py-5 pe-3 pl-8 text-sm font-medium last:border-0"
            >
              <div class="flex items-center gap-2">
                <Icon :name="subLink.icon" size="20" />
                <p>{{ subLink.label }}</p>
              </div>
              <Icon name="chevron-right" size="18" />
            </router-link>
          </div>
        </div>
        <router-link
          v-else
          :to="link.path"
          class="hover:bg-primary-100 flex items-center justify-between gap-2 border-b border-gray-200 py-5 pe-3 text-sm font-medium"
        >
          <div class="flex items-center gap-2">
            <Icon :name="link.icon" size="20" />
            <p>{{ link.label }}</p>
          </div>
          <Icon name="chevron-right" size="18" />
        </router-link>
      </template>

      <button
        type="button"
        class="hover:bg-primary-100 text-error-600 flex items-center justify-between gap-2 border-b border-gray-200 py-5 pe-3 text-sm font-medium"
        @click="openLogout = true"
      >
        <div class="flex items-center gap-2">
          <Icon name="signout" size="20" />
          <p>Logout</p>
        </div>
        <Icon name="chevron-right" size="18" />
      </button>
    </div>

    <LogoutModal :open="openLogout" @close="openLogout = false" />
  </div>
</template>
