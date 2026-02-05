<template>
  <ThemeSettingsSkeleton v-if="isLoading" />
  <section v-else>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <SectionHeader title="Theme Settings" size="sm" subtitle="Customize your theme settings" />
      <AppButton
        icon="clock-rewind"
        color="alt"
        size="sm"
        class="ml-auto"
        @click="openVersionHistory?.()"
      />
      <AppButton
        label="Publish Settings"
        class="!hidden md:!inline-flex"
        :loading="isPublishing"
        @click="publishSettings"
      />
    </div>
    <!-- mobile -->
    <div class="fixed bottom-0 left-0 z-10 w-full border-t border-gray-200 bg-white p-4 md:hidden">
      <AppButton
        label="Publish Settings"
        class="w-full"
        :loading="isPublishing"
        @click="publishSettings"
      />
    </div>

    <div class="mt-6 flex flex-col gap-6 md:flex-row">
      <!-- Left Sidebar - Desktop -->
      <aside class="hidden w-2/5 flex-shrink-0 md:block">
        <div class="space-y-2">
          <button
            v-for="item in designItems"
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
            <LogoFaviconSettings
              v-if="item.id === 'logo-favicon'"
              v-model:logo="formState.logo"
              v-model:favicon="formState.favicon"
              @change-section="changeSection"
            />
            <ColorSettings
              v-else-if="item.id === 'color'"
              v-model:palette="formState.selectedPalette"
              v-model:custom-colors="formState.customColors"
              @change-section="changeSection"
            />
            <TypographySettings
              v-else-if="item.id === 'typography'"
              v-model:font="formState.typography"
              @change-section="changeSection"
            />
            <ButtonSettings
              v-else-if="item.id === 'button'"
              v-model:style="formState.button"
              @change-section="changeSection"
            />
            <FooterSettings
              v-else-if="item.id === 'footer'"
              v-model:support-email="formState.footer_email"
              v-model:support-phone="formState.footer_phone"
              @change-section="changeSection"
            />
            <LinksSettings
              v-else-if="item.id === 'links'"
              v-model:terms-link="formState.terms_and_conditions_url"
              v-model:instagram-link="formState.instagram_url"
              v-model:facebook-link="formState.facebook_url"
              v-model:twitter-link="formState.x_url"
              v-model:tiktok-link="formState.tiktok_url"
              v-model:size-chart-link="formState.size_chart_url"
              @change-section="changeSection"
            />
          </div>
        </div>
      </div>

      <!-- Right Content - Desktop -->
      <div class="hidden flex-1 md:block">
        <LogoFaviconSettings
          v-if="activeSection === 'logo-favicon'"
          v-model:logo="formState.logo"
          v-model:favicon="formState.favicon"
          @change-section="changeSection"
        />
        <ColorSettings
          v-else-if="activeSection === 'color'"
          v-model:palette="formState.selectedPalette"
          v-model:custom-colors="formState.customColors"
          @change-section="changeSection"
        />
        <TypographySettings
          v-else-if="activeSection === 'typography'"
          v-model:font="formState.typography"
          @change-section="changeSection"
        />
        <ButtonSettings
          v-else-if="activeSection === 'button'"
          v-model:style="formState.button"
          @change-section="changeSection"
        />
        <FooterSettings
          v-else-if="activeSection === 'footer'"
          v-model:support-email="formState.footer_email"
          v-model:support-phone="formState.footer_phone"
          @change-section="changeSection"
        />
        <LinksSettings
          v-else-if="activeSection === 'links'"
          v-model:terms-link="formState.terms_and_conditions_url"
          v-model:instagram-link="formState.instagram_url"
          v-model:facebook-link="formState.facebook_url"
          v-model:twitter-link="formState.x_url"
          v-model:tiktok-link="formState.tiktok_url"
          v-model:size-chart-link="formState.size_chart_url"
          @change-section="changeSection"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, inject } from "vue"
import Icon from "@components/Icon.vue"
import LogoFaviconSettings from "@modules/settings/components/design/theme-settings/LogoFaviconSettings.vue"
import ColorSettings from "@modules/settings/components/design/theme-settings/ColorSettings.vue"
import TypographySettings from "@modules/settings/components/design/theme-settings/TypographySettings.vue"
import ButtonSettings from "@modules/settings/components/design/theme-settings/ButtonSettings.vue"
import FooterSettings from "@modules/settings/components/design/theme-settings/FooterSettings.vue"
import LinksSettings from "@modules/settings/components/design/theme-settings/LinksSettings.vue"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"
import { toast } from "@/composables/useToast"
import { useGetThemeSettings, useUpdateThemeSettings } from "@modules/settings/api"
import type { IThemeSettings } from "@modules/settings/types"
import { displayError } from "@/utils/error-handler"
import ThemeSettingsSkeleton from "../../components/skeletons/ThemeSettingsSkeleton.vue"

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
const openVersionHistory = inject<() => void>("openVersionHistory")

// Reactive form state
const formState = ref({
  logo: null as File | string | null,
  favicon: null as File | string | null,
  selectedPalette: "modern",
  customColors: {
    primary: "#98A2B3",
    secondary: "#D0D5DD",
    tertiary: "#EAECF0",
  },
  typography: "modern",
  button: "rounded",
  footer_email: "",
  footer_phone: "",
  terms_and_conditions_url: "",
  instagram_url: "",
  facebook_url: "",
  x_url: "",
  tiktok_url: "",
  size_chart_url: "",
})

// Color palette configurations
const colorPalettes = [
  { id: "modern", colors: ["#1A2A3A", "#4A6072", "#F7F3EE"] },
  { id: "minimal", colors: ["#D94600", "#B03A00", "#8C5A3A"] },
  { id: "bold", colors: ["#3E2F24", "#85684E", "#FAF7F2"] },
  { id: "nature", colors: ["#2F3A56", "#7B5F4C", "#FAF8F7"] },
  { id: "rainbow", colors: ["#D7266A", "#D86A00", "#FFFFFF"] },
]

const getColorScheme = () => {
  if (formState.value.selectedPalette === "custom") return formState.value.customColors
  const palette = colorPalettes.find((p) => p.id === formState.value.selectedPalette)
  const [primary, secondary, tertiary] = palette ? palette.colors : []
  return { primary, secondary, tertiary }
}

// Helper: Set palette from color scheme
const setPaletteFromColorScheme = (colorScheme: {
  primary: string
  secondary: string
  tertiary: string
}) => {
  const matchingPalette = colorPalettes.find(
    (p) =>
      p.colors[0] === colorScheme.primary &&
      p.colors[1] === colorScheme.secondary &&
      p.colors[2] === colorScheme.tertiary,
  )

  if (matchingPalette) {
    formState.value.selectedPalette = matchingPalette.id
  } else {
    formState.value.selectedPalette = "custom"
    formState.value.customColors = colorScheme
  }
}

// API hooks
const { data: themeSettings, refetch, isPending: isLoading } = useGetThemeSettings()
const { mutate: updateThemeSettings, isPending: isPublishing } = useUpdateThemeSettings()

const toggleSection = (id: string): void => {
  expandedSection.value = expandedSection.value === id ? null : id
}

const changeSection = (section: string): void => {
  activeSection.value = section
  expandedSection.value = section
}

watch(
  () => themeSettings.value,
  (settings) => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      const data = settings[0]

      formState.value.logo = data.logo || null
      formState.value.favicon = data.favicon || null
      formState.value.typography = data.typography || "modern"
      formState.value.button = data.button || "rounded"
      formState.value.footer_email = data.footer_email || ""
      formState.value.footer_phone = data.footer_phone || ""
      formState.value.terms_and_conditions_url = data.terms_and_conditions_url || ""
      formState.value.instagram_url = data.instagram_url || ""
      formState.value.facebook_url = data.facebook_url || ""
      formState.value.x_url = data.x_url || ""
      formState.value.tiktok_url = data.tiktok_url || ""
      formState.value.size_chart_url = data.size_chart_url || ""

      if (data.color_scheme) setPaletteFromColorScheme(data.color_scheme)
    }
  },
  { immediate: true },
)

const publishSettings = () => {
  const settingsData = themeSettings.value?.[0]
  const formData = new FormData()

  formData.append("typography", formState.value.typography)
  formData.append("button", formState.value.button)
  formData.append("footer_email", formState.value.footer_email)
  formData.append("footer_phone", formState.value.footer_phone)
  formData.append("terms_and_conditions_url", formState.value.terms_and_conditions_url)
  formData.append("instagram_url", formState.value.instagram_url)
  formData.append("facebook_url", formState.value.facebook_url)
  formData.append("x_url", formState.value.x_url)
  formData.append("tiktok_url", formState.value.tiktok_url)
  formData.append("size_chart_url", formState.value.size_chart_url)
  formData.append("color_scheme", JSON.stringify(getColorScheme()))
  if (formState.value.logo instanceof File) {
    formData.append("logo", formState.value.logo)
  }
  if (formState.value.favicon instanceof File) {
    formData.append("favicon", formState.value.favicon)
  }

  formData.append("is_published", "true")

  updateThemeSettings(
    { id: settingsData?.uid || "", body: formData as unknown as Partial<IThemeSettings> },
    {
      onSuccess: () => {
        toast.success("Theme settings published successfully")
        refetch()
      },
      onError: displayError,
    },
  )
}
</script>
