<script setup lang="ts">
import Tabs from "@components/Tabs.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed, provide, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { THEME_OPTIONS } from "../constants"
import VersionHistoryDrawer from "../components/design/VersionHistoryDrawer.vue"
import { useGetThemeSettings } from "../api"

const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => {
    const pathSegments = route.path.split("/")
    const lastSegment = pathSegments[pathSegments.length - 1]
    return lastSegment === "design" ? "themes" : lastSegment
  },
  set: (value: string) => {
    router.push(`/settings/design/${value}`)
  },
})

const isMobile = useMediaQuery("(max-width: 768px)")

const { data: themeSettings } = useGetThemeSettings()

const storefrontUid = computed(() => {
  return themeSettings.value?.[0]?.uid || ""
})

const showVersionHistory = ref(false)
const openVersionHistory = () => {
  showVersionHistory.value = true
}

provide("openVersionHistory", openVersionHistory)
</script>

<template>
  <div>
    <div class="hidden md:block">
      <Tabs v-model="activeTab" :tabs="THEME_OPTIONS" :equal="!isMobile" />
    </div>

    <div class="py-4">
      <router-view />
    </div>

    <VersionHistoryDrawer v-model="showVersionHistory" :storefront-uid="storefrontUid" />
  </div>
</template>
