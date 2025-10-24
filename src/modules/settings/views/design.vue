<script setup lang="ts">
import Tabs from "@components/Tabs.vue"
import { useMediaQuery } from "@vueuse/core"
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { THEME_OPTIONS } from "../constants"

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

const isMobile = useMediaQuery("(max-width: 768px)")
</script>

<template>
  <div>
    <div class="hidden md:block">
      <Tabs v-model="activeTab" :tabs="THEME_OPTIONS" :equal="!isMobile" />
    </div>

    <!-- child route views -->
    <div class="py-4">
      <router-view />
    </div>
  </div>
</template>
