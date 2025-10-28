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
                <component :is="getSectionComponent(item.id)" @change-section="changeSection" />
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Right Content - Desktop -->
      <div class="hidden flex-1 md:block">
        <component :is="getSectionComponent(activeSection)" @change-section="changeSection" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, type Component } from "vue"
import draggable from "vuedraggable"
import Icon from "@components/Icon.vue"
import HeroSettings from "@modules/settings/components/design/landing-page/HeroSettings.vue"
import FeaturedProducts from "@modules/settings/components/design/landing-page/FeaturedProducts.vue"
import AboutSettings from "@modules/settings/components/design/landing-page/AboutSettings.vue"
import CTABlock1 from "@modules/settings/components/design/landing-page/CTABlock1.vue"
import CTABlock2 from "@modules/settings/components/design/landing-page/CTABlock2.vue"
import CTABlock3 from "@modules/settings/components/design/landing-page/CTABlock3.vue"
import HighlightBanner from "@modules/settings/components/design/landing-page/HighlightBanner.vue"
import NewsletterSignup from "@modules/settings/components/design/landing-page/NewsletterSignup.vue"
import TestimonialsSettings from "@modules/settings/components/design/landing-page/TestimonialsSettings.vue"
import SectionHeader from "@components/SectionHeader.vue"
import AppButton from "@components/AppButton.vue"
import { useGetStorefrontSections, useUpdateStorefrontSectionsOrder } from "@modules/settings/api"
import { toast } from "@/composables/useToast"
import { displayError } from "@/utils/error-handler"

const { mutate: updateLandingPageItemsOrder, isPending } = useUpdateStorefrontSectionsOrder()
const { data: landingPageData, refetch } = useGetStorefrontSections()

const designItems = ref([
  { id: "hero", label: "Hero", icon: "star", order: 0, is_visible: true },
  {
    id: "featured-products",
    label: "Featured Products",
    icon: "bag-2",
    order: 1,
    is_visible: true,
  },
  { id: "about", label: "About", icon: "information", order: 2, is_visible: true },
  { id: "cta-block-1", label: "CTA Block 1", icon: "announcements", order: 3, is_visible: true },
  { id: "cta-block-2", label: "CTA Block 2", icon: "announcements", order: 4, is_visible: true },
  { id: "cta-block-3", label: "CTA Block 3", icon: "announcements", order: 5, is_visible: true },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: "message-favorite",
    order: 6,
    is_visible: true,
  },
  //   { id: "highlight-banner", label: "Highlight Banner", icon: "tag", order: 7, is_visible: true },
  {
    id: "newsletter-signup",
    label: "Newsletter Signup",
    icon: "sms",
    order: 7,
    is_visible: true,
  },
])

const activeSection = ref<string>("logo-favicon")
const expandedSection = ref<string | null>(null)

// Watch for API data and sync to local state
watch(
  () => landingPageData.value,
  (newData) => {
    if (newData && newData.length > 0 && newData[0]?.items) {
      designItems.value = newData[0].items
    }
  },
  { immediate: true },
)

const onDragEnd = () => {}

const toggleSection = (id: string): void => {
  expandedSection.value = expandedSection.value === id ? null : id
}

const changeSection = (section: string): void => {
  activeSection.value = section
  expandedSection.value = section
}

const getSectionComponent = (id: string): Component => {
  const components: Record<string, Component> = {
    hero: HeroSettings,
    "featured-products": FeaturedProducts,
    about: AboutSettings,
    "cta-block-1": CTABlock1,
    "cta-block-2": CTABlock2,
    "cta-block-3": CTABlock3,
    testimonials: TestimonialsSettings,
    "highlight-banner": HighlightBanner,
    "newsletter-signup": NewsletterSignup,
  }
  return components[id] || HeroSettings
}

const publishPage = () => {
  const items = designItems.value.map((item) => ({
    uid: item.id,
    order: item.order,
  }))

  updateLandingPageItemsOrder(
    { items },
    {
      onSuccess: () => {
        toast.success("Landing page published successfully")
        refetch()
      },
      onError: displayError,
    },
  )
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
