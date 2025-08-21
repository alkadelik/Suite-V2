<script setup>
import { computed } from "vue"

const props = defineProps({
  tabs: Array, // Can be ["Tab1", "Tab2"] OR [{ title: "Tab 1", key: "tab-1" }] OR [{ label: "Tab 1", value: "tab-1" }]
  modelValue: [String, Number], // Default active tab
  equal: { type: Boolean, default: true },
  class: String || Array,
})

const emit = defineEmits(["update:modelValue"])

const processedTabs = computed(() =>
  props.tabs.map((tab) => {
    if (typeof tab === "string") return { title: tab, key: tab.replace(/\s+/g, "-").toLowerCase() }
    if ("title" in tab)
      return { title: tab.title, key: tab.key || tab.title.replace(/\s+/g, "-").toLowerCase() }
    if ("label" in tab)
      return { title: tab.label, key: tab.value || tab.label.replace(/\s+/g, "-").toLowerCase() }
    return tab
  }),
)

const activeTab = computed({
  get: () => props.modelValue || processedTabs.value[0]?.key,
  set: (value) => emit("update:modelValue", value), // Fix: Emit `update:modelValue`
})

const changeTab = (tabKey) => {
  activeTab.value = tabKey
}
</script>

<template>
  <div :class="props.class">
    <!-- Tabs Header -->
    <div ref="tabContainer" class="tabheader border-primary-200 flex overflow-x-auto border-b">
      <button
        v-for="tab in processedTabs"
        :key="tab.key"
        class="px-3 py-1.5 text-sm font-medium transition-colors"
        :class="[
          tab.key === activeTab
            ? 'border-primary-500 text-primary-500 bg-primary-500/5 border-b-2'
            : 'text-primary-300 hover:text-primary-400',
          equal && 'flex-1',
        ]"
        @click="changeTab(tab.key)"
      >
        {{ tab.title }}
      </button>
    </div>

    <!-- Tabs Content with Transition -->
    <Transition name="fade-slide" mode="out-in">
      <div :key="activeTab" class="py-3">
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
    opacity 0.3s,
    transform 0.3s;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.tabheader::-webkit-scrollbar {
  display: none !important;
}
.tabheader {
  -ms-overflow-style: none !important; /* IE and Edge */
  scrollbar-width: none !important; /* Firefox */
}
</style>
