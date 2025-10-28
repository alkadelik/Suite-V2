<template>
  <section>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <SectionHeader title="Theme Settings" size="sm" subtitle="Customize your theme settings" />
      <AppButton icon="clock-rewind" color="alt" size="sm" class="ml-auto" />
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
            <LogoFaviconSettings
              v-if="item.id === 'logo-favicon'"
              ref="logoFaviconRef"
              @change-section="changeSection"
            />
            <ColorSettings
              v-else-if="item.id === 'color'"
              ref="colorRef"
              @change-section="changeSection"
            />
            <TypographySettings
              v-else-if="item.id === 'typography'"
              ref="typographyRef"
              @change-section="changeSection"
            />
            <ButtonSettings
              v-else-if="item.id === 'button'"
              ref="buttonRef"
              @change-section="changeSection"
            />
            <FooterSettings
              v-else-if="item.id === 'footer'"
              ref="footerRef"
              @change-section="changeSection"
            />
            <LinksSettings
              v-else-if="item.id === 'links'"
              ref="linksRef"
              @change-section="changeSection"
            />
          </div>
        </div>
      </div>

      <!-- Right Content - Desktop -->
      <div class="hidden flex-1 md:block">
        <LogoFaviconSettings
          v-if="activeSection === 'logo-favicon'"
          ref="logoFaviconRef"
          @change-section="changeSection"
        />
        <ColorSettings
          v-else-if="activeSection === 'color'"
          ref="colorRef"
          @change-section="changeSection"
        />
        <TypographySettings
          v-else-if="activeSection === 'typography'"
          ref="typographyRef"
          @change-section="changeSection"
        />
        <ButtonSettings
          v-else-if="activeSection === 'button'"
          ref="buttonRef"
          @change-section="changeSection"
        />
        <FooterSettings
          v-else-if="activeSection === 'footer'"
          ref="footerRef"
          @change-section="changeSection"
        />
        <LinksSettings
          v-else-if="activeSection === 'links'"
          ref="linksRef"
          @change-section="changeSection"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
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

// Refs to child components
const logoFaviconRef = ref<InstanceType<typeof LogoFaviconSettings> | null>(null)
const colorRef = ref<InstanceType<typeof ColorSettings> | null>(null)
const typographyRef = ref<InstanceType<typeof TypographySettings> | null>(null)
const buttonRef = ref<InstanceType<typeof ButtonSettings> | null>(null)
const footerRef = ref<InstanceType<typeof FooterSettings> | null>(null)
const linksRef = ref<InstanceType<typeof LinksSettings> | null>(null)

// API hooks
const { data: themeSettings, refetch } = useGetThemeSettings()
const { mutate: updateThemeSettings, isPending: isPublishing } = useUpdateThemeSettings()

const toggleSection = (id: string): void => {
  expandedSection.value = expandedSection.value === id ? null : id
}

const changeSection = (section: string): void => {
  activeSection.value = section
  expandedSection.value = section
}

// Load existing settings into child components when data is fetched
watch(
  () => themeSettings.value,
  (settings) => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      // The child components will handle loading their own values
      // through props or expose methods if needed
      console.log("Theme settings loaded:", settings[0])
    }
  },
  { immediate: true },
)

const publishSettings = () => {
  const settingsData = themeSettings.value?.[0]

  const logoValue = logoFaviconRef.value?.getValues()?.logo
  const faviconValue = logoFaviconRef.value?.getValues()?.favicon

  // Create FormData for file uploads and other data
  const formData = new FormData()

  // Add text fields - ensure they're strings
  const colorPalette = String(colorRef.value?.getValues()?.palette || "modern")
  const fontPairing = String(typographyRef.value?.getValues()?.font || "modern")
  const buttonStyle = String(buttonRef.value?.getValues()?.style || "round")
  const supportEmail = String(footerRef.value?.getValues()?.supportEmail || "")
  const supportPhone = String(footerRef.value?.getValues()?.supportPhone || "")
  const termsLink = String(linksRef.value?.getValues()?.termsLink || "")
  const instagramLink = String(linksRef.value?.getValues()?.instagramLink || "")
  const facebookLink = String(linksRef.value?.getValues()?.facebookLink || "")
  const twitterLink = String(linksRef.value?.getValues()?.twitterLink || "")
  const tiktokLink = String(linksRef.value?.getValues()?.tiktokLink || "")

  formData.append("color_palette", colorPalette)
  formData.append("font_pairing", fontPairing)
  formData.append("button_style", buttonStyle)
  formData.append("support_email", supportEmail)
  formData.append("support_phone", supportPhone)
  formData.append("terms_conditions_link", termsLink)
  formData.append("instagram_link", instagramLink)
  formData.append("facebook_link", facebookLink)
  formData.append("twitter_link", twitterLink)
  formData.append("tiktok_link", tiktokLink)

  // Handle custom colors
  const customColors = colorRef.value?.getValues()?.customColors
  if (customColors) {
    formData.append("custom_colors", JSON.stringify(customColors))
  }

  // Handle file uploads for logo and favicon
  if (logoValue instanceof File) {
    formData.append("logo", logoValue)
  }
  if (faviconValue instanceof File) {
    formData.append("favicon", faviconValue)
  }

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
