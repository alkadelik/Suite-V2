<template>
  <LandingPageSkeleton v-if="isLoading" />
  <section v-else>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <SectionHeader title="Landing Page" size="sm" subtitle="Configure your landing page" />
      <AppButton
        icon="clock-rewind"
        color="alt"
        size="sm"
        class="ml-auto"
        @click="openVersionHistory?.()"
      />
      <!-- <AppButton
        :loading="isPending"
        label="Publish Page"
        class="!hidden md:!inline-flex"
        @click="publishPage"
      /> -->
    </div>
    <!-- mobile -->
    <div class="fixed bottom-0 left-0 z-10 w-full border-t border-gray-200 bg-white p-4 md:hidden">
      <AppButton :loading="isPending" label="Publish Page" class="w-full" @click="publishPage" />
    </div>

    <!-- Skeleton Loader -->
    <div v-if="isLoading" class="flex flex-col gap-6 md:flex-row">
      <!-- Left Sidebar Skeleton -->
      <aside class="hidden w-2/5 flex-shrink-0 md:block">
        <div class="space-y-2">
          <div v-for="i in 6" :key="i" class="h-14 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
      </aside>
      <!-- Right Content Skeleton -->
      <div class="flex-1 space-y-4">
        <div class="h-64 animate-pulse rounded-lg bg-gray-200"></div>
        <div class="h-48 animate-pulse rounded-lg bg-gray-200"></div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-6 md:flex-row">
      <!-- Left Sidebar - Desktop -->
      <aside class="hidden w-2/5 flex-shrink-0 md:block">
        <div class="space-y-2">
          <!-- Hero Section - Fixed at top, not draggable -->
          <button
            v-if="heroItem"
            type="button"
            :class="[
              'flex h-14 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border px-4 text-sm font-medium transition-colors',
              {
                'border-primary-700': activeSection === heroItem.id,
                'text-core-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50':
                  activeSection !== heroItem.id,
              },
            ]"
            @click="activeSection = heroItem.id"
          >
            <div class="flex flex-1 items-center gap-3">
              <Icon :name="heroItem.icon" size="20" />
              <span>{{ heroItem.label }}</span>
            </div>
            <Icon name="arrow-right" size="18" />
          </button>

          <!-- Other Sections - Draggable -->
          <draggable
            v-model="draggableItems"
            item-key="id"
            :animation="200"
            ghost-class="ghost-item"
            drag-class="drag-item"
            chosen-class="chosen-item"
            handle=".drag-handle"
            @end="onDragEnd"
            class="space-y-2"
            :disabled="!REORDERING_ENABLED"
          >
            <template #item="{ element: item }">
              <button
                type="button"
                :class="[
                  'flex h-14 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border pr-4 text-sm font-medium transition-colors',
                  {
                    'border-primary-700': activeSection === item.id,
                    'text-core-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50':
                      activeSection !== item.id,
                  },
                  REORDERING_ENABLED ? 'pr-4' : 'px-4',
                ]"
                @click="activeSection = item.id"
              >
                <div
                  v-if="REORDERING_ENABLED"
                  class="drag-handle flex h-full w-6 cursor-grab items-center justify-center rounded-l-lg active:cursor-grabbing"
                  :class="activeSection === item.id ? 'bg-primary-100' : 'bg-gray-200'"
                >
                  <Icon name="six-dots" />
                </div>
                <div class="flex flex-1 items-center gap-3">
                  <Icon :name="item.icon" size="20" />
                  <span>{{ item.label }}</span>
                </div>
                <Icon
                  :name="item.is_visible ? 'eye' : 'eye-slash'"
                  size="18"
                  @click.stop="hideSection(item.id)"
                />
                <Icon name="arrow-right" size="18" />
              </button>
            </template>
          </draggable>
        </div>
      </aside>

      <!-- Mobile Collapsibles -->
      <div class="flex flex-col gap-3 pb-20 md:hidden">
        <!-- Hero Section - Fixed at top, not draggable -->
        <div v-if="heroItem">
          <button
            type="button"
            class="flex h-14 w-full items-center gap-3 rounded-lg border border-gray-200 px-4 text-sm font-medium transition-colors"
            :class="{ 'rounded-b-none': expandedSection === heroItem.id }"
            @click="toggleSection(heroItem.id)"
          >
            <div class="flex flex-1 items-center gap-3">
              <Icon :name="heroItem.icon" size="20" />
              <span>{{ heroItem.label }}</span>
            </div>
            <Icon
              name="chevron-down"
              size="18"
              :class="{ 'rotate-180': expandedSection === heroItem.id }"
            />
          </button>
          <div
            v-if="expandedSection === heroItem.id"
            class="rounded-b-lg border border-t-0 border-gray-200 p-4"
          >
            <HeroSettings
              :hero-section="heroSection"
              @change-section="changeSection"
              @refetch="refetch"
            />
          </div>
        </div>

        <!-- Other Sections - Draggable -->
        <draggable
          v-model="draggableItems"
          item-key="id"
          :animation="200"
          ghost-class="ghost-item"
          drag-class="drag-item"
          chosen-class="chosen-item"
          handle=".mobile-drag-handle"
          @end="onDragEnd"
          class="flex flex-col gap-3"
          :disabled="!REORDERING_ENABLED"
        >
          <template #item="{ element: item, index }">
            <div :class="{ 'mb-10': index === draggableItems.length - 1 }">
              <button
                type="button"
                :class="[
                  'flex h-14 w-full items-center gap-3 rounded-lg border border-gray-200 text-sm font-medium transition-colors',
                  { 'rounded-b-none': expandedSection === item.id },
                  REORDERING_ENABLED ? 'pr-4' : 'px-4',
                ]"
                @click="toggleSection(item.id)"
              >
                <div
                  v-if="REORDERING_ENABLED"
                  class="mobile-drag-handle flex h-full w-6 cursor-grab items-center justify-center rounded-l-lg active:cursor-grabbing"
                  :class="[
                    activeSection === item.id ? 'bg-primary-100' : 'bg-gray-200',
                    { 'rounded-b-none': expandedSection === item.id },
                  ]"
                >
                  <Icon name="six-dots" />
                </div>
                <div class="flex flex-1 items-center gap-3">
                  <Icon :name="item.icon" size="20" />
                  <span>{{ item.label }}</span>
                </div>
                <Icon
                  :name="item.is_visible ? 'eye' : 'eye-slash'"
                  size="18"
                  @click.stop="hideSection(item.id)"
                />
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
                <FeaturedProducts
                  v-if="item.id === 'featured_products'"
                  :featured-products-section="featuredProductsSection"
                  @change-section="changeSection"
                  @refetch="refetch"
                />
                <AboutSettings
                  v-else-if="item.id === 'about'"
                  :about-section="aboutSection"
                  @change-section="changeSection"
                  @refetch="refetch"
                />
                <CTABlock1
                  v-else-if="item.id === 'cta_block_1'"
                  :cta-block1-section="ctaBlock1Section"
                  @change-section="changeSection"
                  @refetch="refetch"
                />
                <CTABlock2
                  v-else-if="item.id === 'cta_block_2'"
                  :cta-block2-section="ctaBlock2Section"
                  @change-section="changeSection"
                  @refetch="refetch"
                />
                <CTABlock3
                  v-else-if="item.id === 'cta_block_3'"
                  :cta-block3-section="ctaBlock3Section"
                  @change-section="changeSection"
                  @refetch="refetch"
                />
                <TestimonialsSettings
                  v-else-if="item.id === 'testimonials'"
                  :testimonials-section="testimonialsSection"
                  @change-section="changeSection"
                  @refetch="refetch"
                />
                <!-- <HighlightBanner
                  v-else-if="item.id === 'highlight_banner'"
                  @change-section="changeSection"
                /> -->
                <NewsletterSignup
                  v-else-if="item.id === 'newsletter_signup'"
                  :newsletter-signup-section="newsletterSignupSection"
                  @change-section="changeSection"
                  @refetch="refetch"
                />
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Right Content - Desktop -->
      <div class="hidden flex-1 md:block">
        <HeroSettings
          v-if="activeSection === 'hero' || activeSection === 'hero_carousel'"
          :hero-section="heroSection"
          @change-section="changeSection"
          @refetch="refetch"
        />
        <FeaturedProducts
          v-else-if="activeSection === 'featured_products'"
          :featured-products-section="featuredProductsSection"
          @change-section="changeSection"
          @refetch="refetch"
        />
        <AboutSettings
          v-else-if="activeSection === 'about'"
          :about-section="aboutSection"
          @change-section="changeSection"
          @refetch="refetch"
        />
        <CTABlock1
          v-else-if="activeSection === 'cta_block_1'"
          :cta-block1-section="ctaBlock1Section"
          @change-section="changeSection"
          @refetch="refetch"
        />
        <CTABlock2
          v-else-if="activeSection === 'cta_block_2'"
          :cta-block2-section="ctaBlock2Section"
          @change-section="changeSection"
          @refetch="refetch"
        />
        <CTABlock3
          v-else-if="activeSection === 'cta_block_3'"
          :cta-block3-section="ctaBlock3Section"
          @change-section="changeSection"
          @refetch="refetch"
        />
        <TestimonialsSettings
          v-else-if="activeSection === 'testimonials'"
          :testimonials-section="testimonialsSection"
          @change-section="changeSection"
          @refetch="refetch"
        />
        <!-- <HighlightBanner
          v-else-if="activeSection === 'highlight_banner'"
          @change-section="changeSection"
        /> -->
        <NewsletterSignup
          v-else-if="activeSection === 'newsletter_signup'"
          :newsletter-signup-section="newsletterSignupSection"
          @change-section="changeSection"
          @refetch="refetch"
        />
      </div>
    </div>

    <!--  -->
    <ConfirmationModal
      v-model="showHideConfirmation"
      variant="warning"
      :header="`${sectionToHideVisibility ? 'Hide' : 'Unhide'} ${sectionToHideLabel} Section`"
      :paragraph="`Are you sure you want to ${sectionToHideVisibility ? 'hide' : 'unhide'} the '${sectionToHideLabel}' section on your landing page?.`"
      :info-message="`You can ${sectionToHideVisibility ? 'unhide' : 'hide'} this section later from the settings.`"
      :action-label="sectionToHideVisibility ? 'Hide Section' : 'Unhide Section'"
      :loading="isHiding"
      @confirm="confirmHideSection"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed, inject } from "vue"
import draggable from "vuedraggable"
import Icon from "@components/Icon.vue"
import HeroSettings from "@modules/settings/components/design/landing-page/HeroSettings.vue"
import FeaturedProducts from "@modules/settings/components/design/landing-page/FeaturedProducts.vue"
import AboutSettings from "@modules/settings/components/design/landing-page/AboutSettings.vue"
import CTABlock1 from "@modules/settings/components/design/landing-page/CTABlock1.vue"
import CTABlock2 from "@modules/settings/components/design/landing-page/CTABlock2.vue"
import CTABlock3 from "@modules/settings/components/design/landing-page/CTABlock3.vue"
import NewsletterSignup from "@modules/settings/components/design/landing-page/NewsletterSignup.vue"
import TestimonialsSettings from "@modules/settings/components/design/landing-page/TestimonialsSettings.vue"
// import HighlightBanner from "@modules/settings/components/design/landing-page/HighlightBanner.vue"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"
import { useGetStorefrontSections, useUpdateStorefrontSectionsOrder } from "@modules/settings/api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"
import ConfirmationModal from "@components/ConfirmationModal.vue"
import LandingPageSkeleton from "../../components/skeletons/LandingPageSkeleton.vue"

const REORDERING_ENABLED = false

const { mutate: updateLandingPageItemsOrder, isPending } = useUpdateStorefrontSectionsOrder()
const { data: landingPageData, refetch, isPending: isLoading } = useGetStorefrontSections()

const openVersionHistory = inject<() => void>("openVersionHistory")

// Confirmation modal state
const showHideConfirmation = ref(false)
const sectionToHideId = ref<string | null>(null)
const isHiding = ref(false)

// Get all sections from landing page data
const heroSection = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find((section) => section.section_type === "hero_carousel")
})

const aboutSection = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find((section) => section.section_type === "about")
})

const featuredProductsSection = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find(
    (section) => section.section_type === "featured_products",
  )
})

const ctaBlock1Section = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find((section) => section.section_type === "cta_block_1")
})

const ctaBlock2Section = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find((section) => section.section_type === "cta_block_2")
})

const ctaBlock3Section = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find((section) => section.section_type === "cta_block_3")
})

const testimonialsSection = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find((section) => section.section_type === "testimonials")
})

const newsletterSignupSection = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find(
    (section) => section.section_type === "newsletter_signup",
  )
})

// Validation function to check if a section has required properties
const validateSectionRequiredFields = (
  sectionId: string,
): { isValid: boolean; missing: string[] } => {
  const missing: string[] = []

  switch (sectionId) {
    case "hero":
    case "hero_carousel":
      // Hero has fallbacks for title and image, so it's always valid
      return { isValid: true, missing: [] }

    case "featured_products":
      // Featured products section doesn't have specific required fields in the section data
      // It depends on products being available which is handled in the template
      return { isValid: true, missing: [] }

    case "about":
      if (!aboutSection.value) return { isValid: false, missing: ["section data"] }
      if (!aboutSection.value.title) missing.push("Headline")
      if (!aboutSection.value.content) missing.push("Description")
      if (!aboutSection.value.image) missing.push("Image")
      return { isValid: missing.length === 0, missing }

    case "cta_block_1":
      if (!ctaBlock1Section.value) return { isValid: false, missing: ["section data"] }
      if (!ctaBlock1Section.value.title) missing.push("Headline")
      if (!ctaBlock1Section.value.content) missing.push("Body Text")
      if (!ctaBlock1Section.value.image) missing.push("Image")
      return { isValid: missing.length === 0, missing }

    case "cta_block_2":
      if (!ctaBlock2Section.value) return { isValid: false, missing: ["section data"] }
      if (!ctaBlock2Section.value.title) missing.push("Headline")
      if (!ctaBlock2Section.value.content) missing.push("Body Text")
      if (!ctaBlock2Section.value.image) missing.push("Image")
      return { isValid: missing.length === 0, missing }

    case "cta_block_3":
      if (!ctaBlock3Section.value) return { isValid: false, missing: ["section data"] }
      if (!ctaBlock3Section.value.title) missing.push("Headline")
      if (!ctaBlock3Section.value.content) missing.push("Body Text")
      if (!ctaBlock3Section.value.image) missing.push("Image")
      return { isValid: missing.length === 0, missing }

    case "testimonials":
      if (!testimonialsSection.value) return { isValid: false, missing: ["section data"] }
      if (
        !testimonialsSection.value.testimonials ||
        testimonialsSection.value.testimonials.length === 0
      ) {
        missing.push("At least one testimonial")
      }
      return { isValid: missing.length === 0, missing }

    case "newsletter_signup":
      if (!newsletterSignupSection.value) return { isValid: false, missing: ["section data"] }
      if (!newsletterSignupSection.value.title) missing.push("Headline")
      if (!newsletterSignupSection.value.subtitle) missing.push("Email Capture Field")
      if (!newsletterSignupSection.value.content) missing.push("Body Text")
      return { isValid: missing.length === 0, missing }

    default:
      return { isValid: true, missing: [] }
  }
}

const hideSection = (id: string): void => {
  const sectionToHide = draggableItems.value.find((item) => item.id === id)
  if (!sectionToHide) return

  // If trying to unhide (make visible), validate required fields
  if (!sectionToHide.is_visible) {
    const validation = validateSectionRequiredFields(id)
    if (!validation.isValid) {
      const missingFields = validation.missing.join(", ")
      toast.error(
        `Cannot unhide section. Missing required fields: ${missingFields}. Please add these fields before making the section visible.`,
        { duration: 5000 },
      )
      return
    }
  }

  sectionToHideId.value = id
  showHideConfirmation.value = true
}

const confirmHideSection = (): void => {
  if (!sectionToHideId.value) return

  const sectionToHide = draggableItems.value.find((item) => item.id === sectionToHideId.value)
  if (!sectionToHide) return

  isHiding.value = true

  const payload = {
    updates: [
      {
        uid: sectionToHide.uid,
        position: sectionToHide.order,
        is_hidden: sectionToHide.is_visible ? true : false,
      },
    ],
  }

  updateLandingPageItemsOrder(payload, {
    onSuccess: () => {
      toast.success("Section hidden successfully")
      showHideConfirmation.value = false
      sectionToHideId.value = null
      isHiding.value = false
      refetch()
    },
    onError: (error) => {
      displayError(error)
      isHiding.value = false
    },
  })
}

// Icon mapping for different section types
const sectionIconMap: Record<string, string> = {
  hero: "star",
  hero_carousel: "star",
  featured_products: "bag-2",
  about: "information",
  cta_block_1: "announcements",
  cta_block_2: "announcements",
  cta_block_3: "announcements",
  testimonials: "message-favorite",
  highlight_banner: "tag",
  newsletter_signup: "sms",
}

interface DesignItem {
  id: string
  uid: string
  label: string
  icon: string
  order: number
  is_visible: boolean
}

const allDesignItems = ref<DesignItem[]>([])

// Separate hero from other items
const heroItem = computed(() => {
  return (
    allDesignItems.value.find((item) => item.id === "hero_carousel" || item.id === "hero") || null
  )
})

const draggableItems = ref<DesignItem[]>([])

const activeSection = ref<string>("hero")
const expandedSection = ref<string | null>(null)

// Get the label of the section being hidden
const sectionToHideLabel = computed(() => {
  if (!sectionToHideId.value) return ""
  const section = draggableItems.value.find((item) => item.id === sectionToHideId.value)
  return section?.label || ""
})

const sectionToHideVisibility = computed(() => {
  if (!sectionToHideId.value) return true
  const section = draggableItems.value.find((item) => item.id === sectionToHideId.value)
  return section?.is_visible || false
})

// Watch for API data and sync to local state
watch(
  () => landingPageData.value,
  (newData) => {
    if (newData && newData.results.length > 0) {
      // Map API data to the format needed for the UI
      allDesignItems.value = newData.results
        .filter((x) => x.section_type !== "highlight_banner")
        .map((section) => ({
          id: section.section_type,
          uid: section.uid,
          label: section.section_type_display,
          icon: sectionIconMap[section.section_type] || "information",
          order: section.position,
          is_visible: !section.is_hidden,
        }))
        .sort((a, b) => a.order - b.order)

      // Separate hero from draggable items
      let filteredItems = allDesignItems.value.filter(
        (item) => item.id !== "hero" && item.id !== "hero_carousel",
      )

      // If reordering is disabled, enforce a fixed display order for backward compatibility
      if (!REORDERING_ENABLED) {
        const fixedOrder = [
          "featured_products",
          "about",
          "cta_block_1",
          "cta_block_2",
          "cta_block_3",
          "testimonials",
          "newsletter_signup",
        ]

        filteredItems = fixedOrder
          .map((sectionId) => filteredItems.find((item) => item.id === sectionId))
          .filter((item): item is DesignItem => item !== undefined)
      }

      draggableItems.value = filteredItems
    }
  },
  { immediate: true },
)

const onDragEnd = () => {
  // Update order based on new positions
  // Hero is always at position 1, so draggable items start at position 2
  draggableItems.value.forEach((item, index) => {
    item.order = index + 2
  })
}

const toggleSection = (id: string): void => {
  expandedSection.value = expandedSection.value === id ? null : id
}

const changeSection = (section: string): void => {
  activeSection.value = section
  expandedSection.value = section
}

const publishPage = () => {
  const updates = []

  // Always set hero at position 1
  if (heroItem.value) {
    updates.push({
      uid: heroItem.value.uid,
      position: 1,
    })
  }

  // Add other items starting from position 2
  draggableItems.value.forEach((item, index) => {
    updates.push({
      uid: item.uid,
      position: index + 2,
    })
  })

  const payload = { updates }

  updateLandingPageItemsOrder(payload, {
    onSuccess: () => {
      toast.success("Landing page published successfully")
      refetch()
    },
    onError: displayError,
  })
}
</script>

<style scoped>
.ghost-item {
  opacity: 0.5;
  background-color: var(--color-gray-100);
  border: 2px dashed var(--color-gray-300);
}

.drag-item {
  transform: rotate(5deg);
  z-index: 1000;
}

.chosen-item {
  cursor: grabbing !important;
}

.chosen-item * {
  cursor: grabbing !important;
}

.sortable-chosen {
  opacity: 0.8;
}

.sortable-ghost {
  opacity: 0.4;
  background-color: var(--color-blue-50);
  border: 2px dashed var(--color-blue-500);
}
</style>
