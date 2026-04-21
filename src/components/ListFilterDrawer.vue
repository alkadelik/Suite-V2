<template>
  <Drawer
    :open="modelValue"
    title="Filters"
    :position="drawerPosition"
    @close="emit('update:modelValue', false)"
  >
    <div class="space-y-6">
      <template v-for="(group, index) in filterGroups" :key="group.key">
        <div v-if="index > 0" class="border-b border-gray-200" />

        <!-- Date range filter -->
        <div v-if="group.type === 'date-range'">
          <h3 class="text-core-700 mb-4 text-sm font-semibold">{{ group.label }}</h3>
          <div class="flex items-center gap-2">
            <input
              type="date"
              :value="localFilters[group.startKey!] || ''"
              class="focus:border-primary-500 focus:ring-primary-500 text-core-700 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              @input="
                localFilters[group.startKey!] = ($event.target as HTMLInputElement).value || null
              "
            />
            <span class="text-core-600 text-sm">to</span>
            <input
              type="date"
              :value="localFilters[group.endKey!] || ''"
              class="focus:border-primary-500 focus:ring-primary-500 text-core-700 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              @input="
                localFilters[group.endKey!] = ($event.target as HTMLInputElement).value || null
              "
            />
          </div>
        </div>

        <!-- Radio select filter -->
        <div v-else>
          <h3 class="text-core-700 mb-4 text-sm font-semibold">{{ group.label }}</h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="option in group.options"
              :key="option.value"
              class="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-gray-50"
              @click="toggleOption(group, option.value)"
            >
              <input
                type="radio"
                :value="option.value"
                :checked="localFilters[group.key] === option.value"
                class="border-primary-300 text-primary-500 focus:ring-primary-400 h-4 w-4"
                :style="{ accentColor: '#b65702' }"
                @click.stop
                @change="toggleOption(group, option.value)"
              />
              <Chip
                v-if="option.color"
                :label="option.label"
                :color="option.color"
                :icon="option.icon"
                :show-dot="option.showDot"
                size="sm"
              />
              <span v-else class="text-sm text-gray-700">{{ option.label }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <AppButton label="Clear filter(s)" color="alt" class="flex-1" @click="clearFilters" />
        <AppButton label="Apply filter(s)" class="flex-1" @click="applyFilters" />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import Drawer from "./Drawer.vue"
import Chip from "./Chip.vue"
import AppButton from "./AppButton.vue"
import type { TChipColor } from "@modules/shared/types"

export interface FilterOption {
  value: string
  label: string
  color?: TChipColor
  icon?: string
  showDot?: boolean
}

export interface FilterGroup {
  key: string
  label: string
  type?: "radio" | "date-range"
  options?: FilterOption[]
  /** Key for start date (used when type is 'date-range') */
  startKey?: string
  /** Key for end date (used when type is 'date-range') */
  endKey?: string
}

interface Props {
  modelValue: boolean
  filterGroups: FilterGroup[]
}

interface Emits {
  (e: "update:modelValue", value: boolean): void
  (e: "apply", filters: Record<string, string | null>): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const localFilters = ref<Record<string, string | null>>({})

const isMobile = ref(typeof window !== "undefined" ? window.innerWidth < 768 : false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener("resize", checkMobile)
})

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile)
})

const drawerPosition = computed(() => (isMobile.value ? "bottom" : "right"))

const toggleOption = (group: FilterGroup, value: string) => {
  localFilters.value[group.key] = localFilters.value[group.key] === value ? null : value
}

const clearFilters = () => {
  localFilters.value = {}
}

const applyFilters = () => {
  emit("apply", { ...localFilters.value })
  emit("update:modelValue", false)
}
</script>
