<script setup lang="ts">
import AppButton from "@components/AppButton.vue"
import SectionHeader from "@components/SectionHeader.vue"
import Tabs from "@components/Tabs.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const TAB_OPTIONS = [
  {
    title: "Themes",
    key: "themes",
    desc: " Pick a theme that reflects your brand. You can always change it later.",
  },
  { title: "Theme Settings", key: "theme-settings", desc: "Customize your theme settings" },
  { title: "Landing Page", key: "landing-page", desc: "Configure your landing page" },
  { title: "Pop Up", key: "popup", desc: "Set up your pop-up preferences" },
]

const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => {
    // Get the last segment of the route path which represents the active child route
    const pathSegments = route.path.split("/")
    const lastSegment = pathSegments[pathSegments.length - 1]
    // If we're at the base design path, default to themes
    return lastSegment === "design" ? "themes" : lastSegment
  },
  set: (value: string) => {
    router.push(`/settings/design/${value}`)
  },
})

const fullTab = computed(() => {
  return TAB_OPTIONS.find((tab) => tab.key === activeTab.value) || { title: "", desc: "" }
})

const isMobile = useMediaQuery("(max-width: 768px)")
</script>

<template>
  <div>
    <Tabs v-model="activeTab" :tabs="TAB_OPTIONS" :equal="!isMobile" />

    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <SectionHeader class="flex-1" :title="fullTab.title" size="sm" :subtitle="fullTab?.desc" />
      <AppButton icon="clock-rewind" color="alt" size="sm" />
      <AppButton label="Publish" class="!hidden w-32 md:!inline-flex" />
    </div>

    <!-- child route views -->
    <div class="py-4">
      <router-view />
    </div>
  </div>
</template>
