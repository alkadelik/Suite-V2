<template>
  <section>
    <div class="mb-4 flex items-center gap-6 border-b border-gray-200 pb-4">
      <SectionHeader title="Landing Page" size="sm" subtitle="Configure your landing page" />
      <AppButton icon="clock-rewind" color="alt" size="sm" class="ml-auto" />
      <AppButton
        :loading="isPending"
        label="Publish Page"
        class="!hidden md:!inline-flex"
        @click="publishPage"
      />
    </div>
    <!-- mobile -->
    <div class="fixed bottom-0 left-0 z-10 w-full border-t border-gray-200 bg-white p-4 md:hidden">
      <AppButton :loading="isPending" label="Publish Page" class="w-full" @click="publishPage" />
    </div>

    <div class="flex flex-col gap-6 md:flex-row">
      <!-- Left Sidebar - Desktop -->
      <aside class="hidden w-2/5 flex-shrink-0 md:block">
        <draggable
          v-model="designItems"
          item-key="id"
          :animation="200"
          ghost-class="ghost-item"
          drag-class="drag-item"
          chosen-class="chosen-item"
          handle=".drag-handle"
          @end="onDragEnd"
          class="space-y-2"
        >
          <template #item="{ element: item }">
            <button
              type="button"
              :class="[
                'flex h-14 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border text-sm font-medium transition-colors',
                {
                  'border-primary-700': activeSection === item.id,
                  'text-core-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50':
                    activeSection !== item.id,
                },
                item.id === 'hero' ? 'px-4' : 'pr-4',
              ]"
              @click="activeSection = item.id"
            >
              <div
                v-if="item.id !== 'hero'"
                class="drag-handle flex h-full w-6 cursor-grab items-center justify-center rounded-l-lg active:cursor-grabbing"
                :class="activeSection === item.id ? 'bg-primary-100' : 'bg-gray-200'"
              >
                <Icon name="six-dots" />
              </div>
              <div class="flex flex-1 items-center gap-3">
                <Icon :name="item.icon" size="20" />
                <span>{{ item.label }}</span>
              </div>
              <Icon name="eye" size="18" />
              <Icon name="arrow-right" size="18" />
            </button>
          </template>
        </draggable>
      </aside>

      <!-- Mobile Collapsibles -->
      <div class="flex flex-col gap-3 pb-20 md:hidden">
        <draggable
          v-model="designItems"
          item-key="id"
          :animation="200"
          ghost-class="ghost-item"
          drag-class="drag-item"
          chosen-class="chosen-item"
          handle=".mobile-drag-handle"
          @end="onDragEnd"
          class="flex flex-col gap-3"
        >
          <template #item="{ element: item, index }">
            <div :class="{ 'mb-10': index === designItems.length - 1 }">
              <button
                type="button"
                :class="[
                  'flex h-14 w-full items-center gap-3 rounded-lg border border-gray-200 text-sm font-medium transition-colors',
                  { 'rounded-b-none': expandedSection === item.id },
                  item.id === 'hero' ? 'px-4' : 'pr-4',
                ]"
                @click="toggleSection(item.id)"
              >
                <div
                  v-if="item.id !== 'hero'"
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
                <Icon name="eye" size="18" />
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
                <HeroSettings
                  v-if="item.id === 'hero'"
                  :hero-section="heroSection"
                  @change-section="changeSection"
                  @refetch="refetch"
                />
                <FeaturedProducts
                  v-else-if="item.id === 'featured_products'"
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
          v-if="activeSection === 'hero'"
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
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"
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

const { mutate: updateLandingPageItemsOrder, isPending } = useUpdateStorefrontSectionsOrder()
const { data: landingPageData, refetch } = useGetStorefrontSections()

// Get all sections from landing page data
const heroSection = computed(() => {
  if (!landingPageData.value?.results) return null
  return landingPageData.value.results.find((section) => section.section_type === "hero")
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

// Icon mapping for different section types
const sectionIconMap: Record<string, string> = {
  hero: "star",
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

const designItems = ref<DesignItem[]>([])

const activeSection = ref<string>("hero")
const expandedSection = ref<string | null>(null)

// Watch for API data and sync to local state
watch(
  () => landingPageData.value,
  (newData) => {
    if (newData && newData.results.length > 0) {
      // Map API data to the format needed for the UI
      designItems.value = newData.results
        .filter((x) => x.section_type !== "highlight_banner")
        .map((section) => ({
          id: section.section_type,
          uid: section.uid,
          label: section.section_type_display,
          icon: sectionIconMap[section.section_type] || "information",
          order: section.position,
          is_visible: true,
        }))
        .sort((a, b) => a.order - b.order)
    }
  },
  { immediate: true },
)

const onDragEnd = () => {
  // Update order based on new positions
  designItems.value.forEach((item, index) => {
    item.order = index + 1
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
  const payload = {
    updates: designItems.value.map((item, index) => ({
      uid: item.uid,
      position: index + 1,
    })),
  }
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
