<template>
  <section>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <SectionHeader title="Theme Settings" size="sm" subtitle="Customize your theme settings" />
      <AppButton icon="clock-rewind" color="alt" size="sm" class="ml-auto" />
      <AppButton label="Publish Settings" class="!hidden md:!inline-flex" />
    </div>
    <!-- mobile -->
    <div class="fixed bottom-0 left-0 z-10 w-full border-t border-gray-200 bg-white p-4 md:hidden">
      <AppButton label="Publish Settings" class="w-full" />
    </div>

    <div class="mt-6 flex flex-col gap-6 md:flex-row">
      <!-- Left Sidebar - Desktop -->
      <aside class="hidden w-2/5 flex-shrink-0 md:block">
        <div class="w-full rounded-t-lg border border-b-0 border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900">DESIGN</h3>
        </div>
        <button
          type="button"
          :class="[
            'flex w-full items-center justify-between gap-3 rounded-b-lg border p-4 text-sm font-medium transition-colors',
            {
              'border-primary-700': activeSection === 'logo-favicon',
              'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50':
                activeSection !== 'logo-favicon',
            },
          ]"
          @click="activeSection = 'logo-favicon'"
        >
          <div class="flex items-center gap-3">
            <Icon name="palette" size="20" />
            <span>Logo & Favicon</span>
          </div>
          <Icon name="arrow-right" size="18" />
        </button>
        <div class="mt-2 space-y-2">
          <button
            v-for="item in designItems.slice(1)"
            :key="item.id"
            type="button"
            :class="[
              'flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-sm font-medium transition-colors',
              {
                'border-primary-700': activeSection === item.id,
                'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50':
                  activeSection !== item.id,
              },
            ]"
            @click="activeSection = item.id"
          >
            <div class="flex items-center gap-3">
              <Icon :name="item.icon" size="20" />
              <span>{{ item.label }}</span>
            </div>
            <Icon name="arrow-right" size="18" />
          </button>
        </div>
      </aside>

      <!-- Mobile Collapsibles -->
      <div class="flex flex-col gap-2 md:hidden">
        <div
          v-for="(item, index) in designItems"
          :key="item.id"
          :class="{ 'mb-10': index === designItems.length - 1 }"
        >
          <button
            type="button"
            :class="[
              'flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 p-4 text-sm font-medium transition-colors',
              {
                'rounded-b-none': expandedSection === item.id,
              },
            ]"
            @click="toggleSection(item.id)"
          >
            <div class="flex items-center gap-3">
              <Icon :name="item.icon" size="20" />
              <span>{{ item.label }}</span>
            </div>
            <Icon
              name="chevron-down"
              size="18"
              :class="{ 'rotate-180': expandedSection === item.id }"
            />
          </button>
          <div
            v-if="expandedSection === item.id"
            class="rounded-b-lg border border-t-0 border-gray-200 p-4"
          >
            <component :is="getSectionComponent(item.id)" @change-section="changeSection" />
          </div>
        </div>
      </div>

      <!-- Right Content - Desktop -->
      <div class="hidden flex-1 md:block">
        <component :is="getSectionComponent(activeSection)" @change-section="changeSection" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, type Component } from "vue"
// import AppButton from "@components/AppButton.vue"
// import SectionHeader from "@components/SectionHeader.vue"
import Icon from "@components/Icon.vue"
import LogoFaviconSettings from "@modules/settings/components/design/theme-settings/LogoFaviconSettings.vue"
import ColorSettings from "@modules/settings/components/design/theme-settings/ColorSettings.vue"
import TypographySettings from "@modules/settings/components/design/theme-settings/TypographySettings.vue"
import ButtonSettings from "@modules/settings/components/design/theme-settings/ButtonSettings.vue"
import FooterSettings from "@modules/settings/components/design/theme-settings/FooterSettings.vue"
import LinksSettings from "@modules/settings/components/design/theme-settings/LinksSettings.vue"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"

interface DesignItem {
  id: string
  label: string
  icon: string
}

const designItems: DesignItem[] = [
  { id: "logo-favicon", label: "Logo & Favicon", icon: "palette" },
  { id: "color", label: "Color", icon: "paint-pour" },
  { id: "typography", label: "Typography", icon: "bold-square" },
  { id: "button", label: "Button", icon: "cursor-click-01" },
  { id: "footer", label: "Footer", icon: "layout-top" },
  { id: "links", label: "Links", icon: "link-01" },
]

const activeSection = ref<string>("logo-favicon")
const expandedSection = ref<string | null>(null)

const toggleSection = (id: string): void => {
  expandedSection.value = expandedSection.value === id ? null : id
}

const changeSection = (section: string): void => {
  activeSection.value = section
  expandedSection.value = section
}

const getSectionComponent = (id: string): Component => {
  const components: Record<string, Component> = {
    "logo-favicon": LogoFaviconSettings,
    color: ColorSettings,
    typography: TypographySettings,
    button: ButtonSettings,
    footer: FooterSettings,
    links: LinksSettings,
  }
  return components[id] || LogoFaviconSettings
}
</script>
