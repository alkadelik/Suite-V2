<template>
  <Drawer
    :open="modelValue"
    title="Filters"
    :position="drawerPosition"
    @close="emit('update:modelValue', false)"
  >
    <div class="space-y-6">
      <!-- Category Filter -->
      <div>
        <h3 class="text-core-700 mb-4 text-sm font-semibold">Category</h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="category in categories?.data?.results || []"
            :key="category.uid"
            class="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-gray-50"
            @click="selectedCategories[category.uid] = !selectedCategories[category.uid]"
          >
            <Checkbox v-model="selectedCategories[category.uid]" dense />
            <div class="min-w-0 flex-1 overflow-hidden">
              <Chip :label="category.name" icon="tag" color="purple" size="sm">
                <template #default>
                  <span class="truncate">{{ category.name }}</span>
                </template>
              </Chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-b border-gray-200"></div>

      <!-- Status Filter -->
      <div>
        <h3 class="text-core-700 mb-4 text-sm font-semibold">Status</h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="status in statusOptions"
            :key="status.value"
            class="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-gray-50"
            @click="selectedStatus = selectedStatus === status.value ? null : status.value"
          >
            <input
              type="radio"
              :value="status.value"
              v-model="selectedStatus"
              class="border-primary-300 text-primary-500 focus:ring-primary-400 h-4 w-4"
              :style="{ accentColor: '#b65702' }"
            />
            <Chip showDot :label="status.label" :color="status.color" size="sm" />
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-b border-gray-200"></div>

      <!-- Sub-category Filter -->
      <div>
        <h3 class="text-core-700 mb-4 text-sm font-semibold">Sub-category</h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="subCategory in subCategoryOptions"
            :key="subCategory.value"
            class="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-3 transition-colors hover:bg-gray-50"
            @click="
              selectedSubCategory =
                selectedSubCategory === subCategory.value ? null : subCategory.value
            "
          >
            <input
              type="radio"
              :value="subCategory.value"
              v-model="selectedSubCategory"
              class="border-primary-300 text-primary-500 focus:ring-primary-400 h-4 w-4"
              :style="{ accentColor: '#b65702' }"
            />
            <span class="text-sm text-gray-700">{{ subCategory.label }}</span>
          </div>
        </div>
      </div>
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
import Drawer from "@components/Drawer.vue"
import Checkbox from "@components/form/Checkbox.vue"
import Chip from "@components/Chip.vue"
import AppButton from "@components/AppButton.vue"
import { useGetCategories } from "../api"

interface Props {
  modelValue: boolean
}

interface FilterData {
  categories: string[]
  status: string | null
  subCategory: string | null
}

interface Emits {
  (e: "update:modelValue", value: boolean): void
  (e: "apply", filters: FilterData): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Fetch categories
const { data: categories } = useGetCategories()

// Selected categories state
const selectedCategories = ref<Record<string, boolean>>({})

// Status options
const statusOptions = [
  { value: "in_stock", label: "In Stock", color: "success" as const },
  { value: "out_of_stock", label: "Out of Stock", color: "error" as const },
]

// Selected status state
const selectedStatus = ref<string | null>(null)

// Sub-category options
const subCategoryOptions = [
  { value: "simple", label: "Simple (no variants)" },
  { value: "complex", label: "Complex (has variants)" },
]

// Selected sub-category state
const selectedSubCategory = ref<string | null>(null)

// Initialize isMobile with actual window width to prevent flash on mount
const isMobile = ref(typeof window !== "undefined" ? window.innerWidth < 768 : false)

// Check if mobile on mount and window resize
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

const drawerPosition = computed(() => {
  return isMobile.value ? "bottom" : "right"
})

// Clear all filters
const clearFilters = () => {
  selectedCategories.value = {}
  selectedStatus.value = null
  selectedSubCategory.value = null
}

// Apply filters and close drawer
const applyFilters = () => {
  // Get selected category UIDs
  const selectedCategoryUids = Object.keys(selectedCategories.value).filter(
    (uid) => selectedCategories.value[uid],
  )

  // Emit filter data
  emit("apply", {
    categories: selectedCategoryUids,
    status: selectedStatus.value,
    subCategory: selectedSubCategory.value,
  })

  // Close drawer
  emit("update:modelValue", false)
}
</script>
