<script setup lang="ts">
import { computed } from "vue"

/**
 * Tab item interface
 */
interface TabItem {
  /** Display title for the tab */
  title: string
  /** Unique key for the tab (used for slot names and identification) */
  key: string
}

/**
 * Component props interface
 */
interface Props {
  /** Array of tabs - can be strings or objects with title/key */
  tabs?: (string | TabItem)[]
  /** Currently active tab key */
  modelValue?: string | number
  /** Whether tabs should have equal width */
  equal?: boolean
  /** Visual variant of the tabs */
  variant?: "default" | "tonal" | "pills"
  /** Custom CSS classes for the container */
  class?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [],
  equal: true,
  variant: "default",
})

const emit = defineEmits<{ "update:modelValue": [value: string] }>()

const processedTabs = computed((): TabItem[] =>
  (props.tabs || []).map((tab) => {
    if (typeof tab === "string") return { title: tab, key: tab.replace(/\s+/g, "_").toLowerCase() }
    return { title: tab.title, key: tab.key || tab.title.replace(/\s+/g, "_").toLowerCase() }
  }),
)

const activeTab = computed({
  get: () => props.modelValue || processedTabs.value[0]?.key || "",
  set: (value: string) => emit("update:modelValue", value),
})

const headerClasses = computed(() => {
  const variants = {
    default: "",
    tonal: "bg-core-50 rounded-lg p-1",
    pills: "bg-transparent rounded-full p-0.5 gap-1",
  }
  return variants[props.variant]
})

const getTabClasses = (tab: TabItem) => {
  const isActive = tab.key === activeTab.value

  const variants = {
    default: {
      base: "border-b border-core-200",
      active: "border-primary-700 text-primary-700 bg-primary-50 border-b-2 border-primary-700",
      inactive: "text-gray-500 hover:text-primary-700",
    },
    tonal: {
      base: "rounded-md border-b-2 border-transparent",
      active: "bg-primary-100 text-primary-700 border-primary-500",
      inactive: "text-gray-500 hover:text-primary-700",
    },
    pills: {
      base: "rounded-full",
      active: "bg-primary-500 text-white shadow-sm",
      inactive: "text-core-600 hover:bg-white hover:text-primary-600 hover:shadow-sm",
    },
  }

  const variant = variants[props.variant]
  return [variant.base, isActive ? variant.active : variant.inactive].join(" ")
}

const changeTab = (tabKey: string) => {
  activeTab.value = tabKey
}
</script>

<template>
  <div :class="props.class">
    <!-- Tabs Header -->
    <div
      ref="tabContainer"
      :class="[
        'tabheader flex overflow-x-auto',
        headerClasses,
        variant === 'pills' && 'border border-gray-200',
      ]"
    >
      <button
        v-for="tab in processedTabs"
        :key="tab.key"
        :class="[
          'text-sm font-medium transition-all duration-200',
          getTabClasses(tab),
          equal && 'flex-1',
          variant !== 'pills' ? 'px-4 py-3' : 'px-5 py-2 md:px-10',
        ]"
        @click="changeTab(tab.key)"
      >
        {{ tab.title }}
      </button>
    </div>

    <!-- Tabs Content with Transition -->
    <Transition v-if="$slots[activeTab]" name="fade-slide" mode="out-in">
      <div :key="activeTab" class="pb-2 md:py-4">
        <slot :name="activeTab"></slot>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Fade & Slide Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Hide scrollbar */
.tabheader::-webkit-scrollbar {
  display: none;
}

.tabheader {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
