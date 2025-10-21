<template>
  <div class="flex h-full flex-col">
    <Tabs :tabs="tabsConfig" v-model="activeTab" class="mb-6">
      <template #themes>
        <ThemesTab />
      </template>
      <template #theme_settings>
        <ThemeSettingsTab />
      </template>
      <template #landing_page>
        <LandingPageTab />
      </template>
      <template #pop_up>
        <PopUpTab />
      </template>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Tabs from "@components/Tabs.vue"
import ThemesTab from "../components/design/ThemesTab.vue"
import ThemeSettingsTab from "../components/design/ThemeSettingsTab.vue"
import LandingPageTab from "../components/design/LandingPageTab.vue"
import PopUpTab from "../components/design/PopUpTab.vue"

interface DesignTabConfig {
  title: string
  key: string
  icon: string
}

const route = useRoute()
const router = useRouter()

const tabsConfig: DesignTabConfig[] = [
  { title: "Themes", key: "themes", icon: "shapes-02" },
  { title: "Theme Settings", key: "theme_settings", icon: "shapes" },
  { title: "Landing Page", key: "landing_page", icon: "message-text" },
  { title: "Pop Up", key: "pop_up", icon: "information" },
]

const activeTab = ref<string>((route.query.tab as string) || "themes")

watch(activeTab, (newTab) => {
  router.replace({
    query: {
      ...route.query,
      tab: newTab,
    },
  })
})
</script>
