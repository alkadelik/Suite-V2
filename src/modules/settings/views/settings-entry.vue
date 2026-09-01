<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import Icon from "@components/Icon.vue"
import BackButton from "@components/BackButton.vue"
import LogoutModal from "@components/core/LogoutModal.vue"
import { clipboardCopy } from "@/utils/others"
import { useSettingsStore } from "../store"
import { getSettingsNavigationLinks } from "../navigation"
import { useUserRoles } from "@/composables/useUserRoles"

const router = useRouter()

onMounted(() => {
  const isMobile = window.innerWidth < 768

  if (!isMobile) {
    router.replace({ name: "Profile" })
  }
})

const isInternational = computed(() => useSettingsStore().isInternational)

const { isOwner } = useUserRoles()

const settingsLinks = computed(() =>
  getSettingsNavigationLinks({
    isHq: Boolean(useSettingsStore().activeLocation?.is_hq),
    isInternational: isInternational.value,
    isOwner: isOwner.value,
    surface: "mobile",
  }),
)

const expandedLink = ref<string | null>(null)

const toggleExpand = (label: string): void => {
  expandedLink.value = expandedLink.value === label ? null : label
}

const openLogout = ref(false)

// Prefer the connected custom domain when one is active (LYW-2618).
const storefrontUrl = computed(() => useSettingsStore().displayDomain)
</script>

<template>
  <div>
    <header
      class="flex flex-col justify-center border-b border-gray-200 pb-4 text-center md:block md:text-left"
    >
      <BackButton to="/dashboard" :center-on-mobile="true" />
      <h2 class="mt-3 text-2xl font-bold">Settings</h2>
      <div
        v-if="!isInternational"
        class="mx-auto flex min-w-0 items-center gap-2 text-sm text-gray-600 lg:mx-0"
      >
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
